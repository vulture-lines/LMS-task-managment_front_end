import React, { useState, useEffect } from 'react';
import { CreateTask, UploadFileTask, GetAllTasks, GetAllUsers, ReviewSubmission, GetTaskSubmissions, UpdateTask } from '../../service/api'; // Removed CancelSubmission
import { useNavigate } from 'react-router-dom';

const AdminTask = () => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    selectedUser: [],
    pdfFile: null,
  });

  const [editTaskData, setEditTaskData] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState('admin');
  const [editUserType, setEditUserType] = useState('admin');
  const [users, setUsers] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [validationMessages, setValidationMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [reviewData, setReviewData] = useState({});
  const [reviewingTask, setReviewingTask] = useState(null);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const navigate = useNavigate();

  // Utility to validate ObjectId
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTasks(true);
      try {
        const token = JSON.parse(localStorage.getItem("loginData"))?.token;
        if (!token) {
          setValidationMessages((prev) => [...prev, { text: 'Please log in to continue.', type: 'error' }]);
          navigate('/login');
          return;
        }

        const tasks = await GetAllTasks();
        console.log('GetAllTasks response:', tasks);

        const tasksWithSubmissions = await Promise.all(
          tasks.map(async (task) => {
            try {
              const submissions = await GetTaskSubmissions(task._id);
              console.log(`Task ${task.title} submissions:`, submissions);
              return {
                ...task,
                submissions: submissions.map((sub) => ({
                  ...sub,
                  user: typeof sub.user === 'object' ? sub.user._id || sub.user : sub.user,
                })),
              };
            } catch (error) {
              if (error.message === 'Session expired. Please log in again.') {
                navigate('/login');
              }
              throw error;
            }
          })
        );

        const normalizedTasks = (Array.isArray(tasksWithSubmissions) ? tasksWithSubmissions : []).map((task) => ({
          ...task,
          assignedTo: Array.isArray(task.assignedTo)
            ? task.assignedTo.map((user) => (typeof user === 'object' ? user._id || user : user)).filter(isValidObjectId)
            : [],
          file: task.file || null,
          maxMarks: task.maxMarks || 100,
        }));
        setAssignedTasks(normalizedTasks);

        const userData = await GetAllUsers();
        console.log('Processed users:', userData);
        setUsers(Array.isArray(userData) ? userData : []);
      } catch (error) {
        console.error('Fetch data error:', error);
        setValidationMessages((prev) => [
          ...prev,
          { text: error.message || 'Failed to fetch tasks or users', type: 'error' },
        ]);
        if (error.message === 'Session expired. Please log in again.') {
          navigate('/login');
        }
      } finally {
        setIsLoadingTasks(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'selectedUser') {
      setTaskData((prev) => {
        const selectedUsers = checked
          ? [...prev.selectedUser, value]
          : prev.selectedUser.filter((userId) => userId !== value);
        return { ...prev, selectedUser: selectedUsers };
      });
    } else {
      setTaskData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'selectedUser') {
      setEditTaskData((prev) => {
        const selectedUsers = checked
          ? [...prev.selectedUser, value]
          : prev.selectedUser.filter((userId) => userId !== value);
        return { ...prev, selectedUser: selectedUsers };
      });
    } else {
      setEditTaskData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['application/pdf', 'application/zip'].includes(file.type)) {
        setValidationMessages((prev) => [
          ...prev,
          { text: 'Invalid file type. Please upload a PDF or ZIP file.', type: 'error' },
        ]);
        setTaskData((prev) => ({ ...prev, pdfFile: null }));
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setValidationMessages((prev) => [
          ...prev,
          { text: 'File size exceeds 5MB. Please upload a smaller file.', type: 'error' },
        ]);
        setTaskData((prev) => ({ ...prev, pdfFile: null }));
        return;
      }
      setTaskData((prev) => ({ ...prev, pdfFile: file }));
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['application/pdf', 'application/zip'].includes(file.type)) {
        setValidationMessages((prev) => [
          ...prev,
          { text: 'Invalid file type. Please upload a PDF or ZIP file.', type: 'error' },
        ]);
        setEditTaskData((prev) => ({ ...prev, pdfFile: null }));
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setValidationMessages((prev) => [
          ...prev,
          { text: 'File size exceeds 5MB. Please upload a smaller file.', type: 'error' },
        ]);
        setEditTaskData((prev) => ({ ...prev, pdfFile: null }));
        return;
      }
      setEditTaskData((prev) => ({ ...prev, pdfFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = [];

    if (!taskData.title) errors.push({ text: 'Task Title is required.', type: 'error' });
    if (!taskData.description) errors.push({ text: 'Description is required.', type: 'error' });
    if (!taskData.dueDate) errors.push({ text: 'Due Date is required.', type: 'error' });
    if (selectedUserType === 'user' && taskData.selectedUser.length === 0) {
      errors.push({ text: 'Please select at least one user.', type: 'error' });
    }
    if (taskData.selectedUser.some((id) => !isValidObjectId(id))) {
      errors.push({ text: 'Invalid user ID selected.', type: 'error' });
    }

    if (errors.length > 0) {
      setValidationMessages((prev) => [...prev, ...errors]);
      return;
    }

    try {
      setIsUploading(true);
      let fileData = null;

      if (taskData.pdfFile) {
        try {
          const formData = new FormData();
          formData.append('file', taskData.pdfFile);
          const uploadResponse = await UploadFileTask(formData);
          console.log('UploadFileTask response:', uploadResponse);

          if (typeof uploadResponse === 'string') {
            throw new Error(uploadResponse || 'File upload failed');
          }

          fileData = uploadResponse.data?.fileUrl;
          if (!fileData) {
            console.warn('No fileUrl in upload response:', uploadResponse.data);
            setValidationMessages((prev) => [
              ...prev,
              { text: 'File uploaded but no file URL returned. Task will be created without a file.', type: 'error' },
            ]);
          }
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          setValidationMessages((prev) => [
            ...prev,
            { text: uploadError.message || 'Failed to upload file. Task will be created without a file.', type: 'error' },
          ]);
          fileData = null;
        }
      }

      const apiTaskData = {
        title: taskData.title,
        description: taskData.description,
        dueDate: new Date(taskData.dueDate).toISOString(),
        assignedTo: selectedUserType === 'user' ? taskData.selectedUser : [],
        file: fileData,
        maxMarks: 100,
      };

      const newTask = await CreateTask(apiTaskData);
      console.log('CreateTask response:', newTask);
      const normalizedTask = {
        ...newTask,
        assignedTo: Array.isArray(newTask.assignedTo) ? newTask.assignedTo : [],
        file: newTask.file || null,
        maxMarks: newTask.maxMarks || 100,
        submissions: [],
      };
      setAssignedTasks((prev) => [...prev, normalizedTask]);

      setTaskData({
        title: '',
        description: '',
        dueDate: '',
        selectedUser: [],
        pdfFile: null,
      });
      setSelectedUserType('admin');
      setValidationMessages([]);
    } catch (error) {
      console.error('Task creation failed:', error);
      setValidationMessages((prev) => [
        ...prev,
        { text: error.message || 'Failed to create task', type: 'error' },
      ]);
      if (error.message === 'Session expired. Please log in again.') {
        navigate('/login');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditSubmit = async (e, taskId) => {
    e.preventDefault();
    let errors = [];

    if (!editTaskData.title) errors.push({ text: 'Task Title is required.', type: 'error' });
    if (!editTaskData.description) errors.push({ text: 'Description is required.', type: 'error' });
    if (!editTaskData.dueDate) errors.push({ text: 'Due Date is required.', type: 'error' });
    if (editUserType === 'user' && editTaskData.selectedUser.length === 0) {
      errors.push({ text: 'Please select at least one user.', type: 'error' });
    }
    if (editTaskData.selectedUser.some((id) => !isValidObjectId(id))) {
      errors.push({ text: 'Invalid user ID selected.', type: 'error' });
    }

    if (errors.length > 0) {
      setValidationMessages((prev) => [...prev, ...errors]);
      return;
    }

    try {
      setIsUploading(true);
      let fileData = editTaskData.file;

      if (editTaskData.pdfFile) {
        try {
          const formData = new FormData();
          formData.append('file', editTaskData.pdfFile);
          const uploadResponse = await UploadFileTask(formData);
          console.log('UploadFileTask response:', uploadResponse);

          if (typeof uploadResponse === 'string') {
            throw new Error(uploadResponse || 'File upload failed');
          }

          fileData = uploadResponse.data?.fileUrl;
          if (!fileData) {
            console.warn('No fileUrl in upload response:', uploadResponse.data);
            setValidationMessages((prev) => [
              ...prev,
              { text: 'File uploaded but no file URL returned. Task will be updated without a file.', type: 'error' },
            ]);
          }
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          setValidationMessages((prev) => [
            ...prev,
            { text: uploadError.message || 'Failed to upload file. Task will be updated without a file.', type: 'error' },
          ]);
          fileData = editTaskData.file;
        }
      }

      const apiTaskData = {
        title: editTaskData.title,
        description: editTaskData.description,
        dueDate: new Date(editTaskData.dueDate).toISOString(),
        assignedTo: editUserType === 'user' ? editTaskData.selectedUser : [],
        file: fileData,
        maxMarks: editTaskData.maxMarks || 100,
      };

      console.log('Sending UpdateTask request:', { taskId, apiTaskData });

      const token = JSON.parse(localStorage.getItem("loginData"))?.token;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const updatedTask = await UpdateTask(taskId, apiTaskData, token);
      console.log('UpdateTask response:', updatedTask);

      setAssignedTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? {
                ...task,
                ...updatedTask,
                assignedTo: Array.isArray(updatedTask.assignedTo) ? updatedTask.assignedTo : [],
                file: updatedTask.file || null,
                maxMarks: updatedTask.maxMarks || 100,
              }
            : task
        )
      );

      setEditTaskData(null);
      setEditUserType('admin');
      setValidationMessages((prev) => [
        ...prev,
        { text: 'Task updated successfully.', type: 'success' },
      ]);
    } catch (error) {
      console.error('Task update failed:', error);
      setValidationMessages((prev) => [
        ...prev,
        { text: error.message || 'Failed to update task', type: 'error' },
      ]);
      if (error.message === 'Session expired. Please log in again.') {
        navigate('/login');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReviewChange = (taskId, userId, field, value) => {
    setReviewData((prev) => ({
      ...prev,
      [`${taskId}_${userId}`]: {
        ...prev[`${taskId}_${userId}`],
        [field]: value,
      },
    }));
  };

  const handleReviewSubmit = async (taskId, userId) => {
    const review = reviewData[`${taskId}_${userId}`];
    if (!review || !review.reviewNote || !review.status) {
      setValidationMessages((prev) => [
        ...prev,
        { text: 'Please provide review note and select a status.', type: 'error' },
      ]);
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("loginData"))?.token;
      if (!token) {
        setValidationMessages((prev) => [
          ...prev,
          { text: 'Please log in to continue.', type: 'error' },
        ]);
        navigate('/login');
        return;
      }

      console.log('Processing review for:', { taskId, userId, status: review.status, token });

      // Update the submission with review details
      const reviewPayload = {
        status: review.status,
        markGiven: review.markGiven || 0,
        reviewNote: review.reviewNote,
      };
      await ReviewSubmission(taskId, userId, reviewPayload, token);
      setValidationMessages((prev) => [
        ...prev,
        { text: 'Review updated successfully.', type: 'success' },
      ]);

      // Fetch updated submissions to reflect changes
      const updatedSubmissions = await GetTaskSubmissions(taskId);
      setAssignedTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? {
                ...task,
                submissions: updatedSubmissions.map((sub) => ({
                  ...sub,
                  user: typeof sub.user === 'object' ? sub.user._id || sub.user : sub.user,
                })),
              }
            : task
        )
      );

      setReviewData((prev) => {
        const newReviewData = { ...prev };
        delete newReviewData[`${taskId}_${userId}`];
        return newReviewData;
      });
      setReviewingTask(null);
    } catch (error) {
      console.error('Review submission failed:', error);
      setValidationMessages((prev) => [
        ...prev,
        { text: error.message || 'Failed to process submission', type: 'error' },
      ]);
      if (error.message === 'Session expired. Please log in again.') {
        navigate('/login');
      }
    }
  };

  const closeValidationMessage = (index) => {
    setValidationMessages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const timers = validationMessages.map((_, index) =>
      setTimeout(() => closeValidationMessage(index), 3000)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [validationMessages]);

  const toggleSubmission = (taskId, userId) => {
    const key = `${taskId}_${userId}`;
    setExpandedSubmission(expandedSubmission === key ? null : key);
  };

  const startEditing = (task) => {
    console.log('Editing task:', task);
    const assignedToIds = Array.isArray(task.assignedTo)
      ? task.assignedTo.map((user) => (typeof user === 'object' ? user._id || user : user)).filter(isValidObjectId)
      : [];
    setEditTaskData({
      _id: task._id,
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      selectedUser: assignedToIds,
      pdfFile: null,
      file: task.file,
      maxMarks: task.maxMarks,
    });
    setEditUserType(assignedToIds.length > 0 ? 'user' : 'admin');
    console.log('editTaskData set to:', {
      _id: task._id,
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      selectedUser: assignedToIds,
      pdfFile: null,
      file: task.file,
      maxMarks: task.maxMarks,
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 p-6">
      {validationMessages.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {validationMessages.map((message, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded shadow-md flex justify-between items-center ${
                message.type === 'success'
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-red-100 border-red-500 text-red-700'
              }`}
            >
              <p>{message.text}</p>
              <button
                onClick={() => closeValidationMessage(index)}
                className={`${
                  message.type === 'success' ? 'text-green-700 hover:text-green-900' : 'text-red-700 hover:text-red-900'
                }`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="w-1/3 mr-6">
        <div className="bg-white p-6 rounded-lg shadow-md h-full sticky top-0 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Add Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="title">
                Task Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={taskData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Assign New Task"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={taskData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Description"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="dueDate">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={taskData.dueDate}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Assign To</label>
              <div className="flex space-x-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="admin"
                    checked={selectedUserType === 'admin'}
                    onChange={() => setSelectedUserType('admin')}
                    className="mr-2 focus:ring-green-500"
                  />
                  Admin
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="user"
                    checked={selectedUserType === 'user'}
                    onChange={() => setSelectedUserType('user')}
                    className="mr-2 focus:ring-green-500"
                  />
                  User
                </label>
              </div>
              {selectedUserType === 'user' && (
                <div className="mt-2">
                  <label className="block text-gray-700 mb-2">Select Users</label>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <label key={user._id} className="flex items-center">
                        <input
                          type="checkbox"
                          name="selectedUser"
                          value={user._id}
                          checked={taskData.selectedUser.includes(user._id)}
                          onChange={handleChange}
                          className="mr-2 focus:ring-green-500"
                        />
                        {user.username || user.name || user._id}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="pdfUpload">
                Upload File (PDF or ZIP)
              </label>
              <input
                type="file"
                id="pdfUpload"
                accept="application/pdf,application/zip"
                onChange={handleFileChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isUploading}
              />
              {taskData.pdfFile && (
                <div className="mt-2">
                  <p className="text-green-600">Selected: {taskData.pdfFile.name}</p>
                  {taskData.pdfFile.type === 'application/pdf' ? (
                    <div className="mt-2 border rounded p-2">
                      <iframe
                        src={URL.createObjectURL(taskData.pdfFile)}
                        title="File Preview"
                        className="w-full h-64"
                        style={{ border: 'none' }}
                      ></iframe>
                      <p className="text-gray-500 text-sm mt-1">
                        Note: File preview may not be supported in all browsers.
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mt-1">
                      Preview not available for ZIP files.
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Add Task'}
            </button>
          </form>
        </div>
      </div>

      <div className="w-2/3">
        <div className="bg-white p-6 rounded-lg shadow-md h-full sticky top-0 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Tasks</h2>
          {isLoadingTasks ? (
            <p className="text-gray-500 text-center">Loading tasks...</p>
          ) : assignedTasks.length === 0 ? (
            <p className="text-gray-500 text-center">No tasks have been created yet</p>
          ) : (
            <div className="space-y-4">
              {assignedTasks.map((task, index) => (
                <div key={index} className="p-4 border rounded-lg shadow-sm">
                  {editTaskData && editTaskData._id === task._id ? (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2 text-green-800">Edit Task</h3>
                      <form onSubmit={(e) => handleEditSubmit(e, task._id)} className="space-y-4">
                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2" htmlFor="editTitle">
                            Task Title
                          </label>
                          <input
                            type="text"
                            id="editTitle"
                            name="title"
                            value={editTaskData.title}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Assign New Task"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2" htmlFor="editDescription">
                            Description
                          </label>
                          <textarea
                            id="editDescription"
                            name="description"
                            value={editTaskData.description}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows="4"
                            placeholder="Description"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2" htmlFor="editDueDate">
                            Due Date
                          </label>
                          <input
                            type="date"
                            id="editDueDate"
                            name="dueDate"
                            value={editTaskData.dueDate}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2">Assign To</label>
                          <div className="flex space-x-4 mb-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="editUserType"
                                value="admin"
                                checked={editUserType === 'admin'}
                                onChange={() => setEditUserType('admin')}
                                className="mr-2 focus:ring-green-500"
                              />
                              Admin
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="editUserType"
                                value="user"
                                checked={editUserType === 'user'}
                                onChange={() => setEditUserType('user')}
                                className="mr-2 focus:ring-green-500"
                              />
                              User
                            </label>
                          </div>
                          {editUserType === 'user' && (
                            <div className="mt-2">
                              <label className="block text-gray-700 mb-2">Select Users</label>
                              <div className="space-y-2">
                                {users.map((user) => (
                                  <label key={user._id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      name="selectedUser"
                                      value={user._id}
                                      checked={editTaskData.selectedUser.includes(user._id)}
                                      onChange={handleEditChange}
                                      className="mr-2 focus:ring-green-500"
                                    />
                                    {user.username || user.name || user._id}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2" htmlFor="editPdfUpload">
                            Upload File (PDF or ZIP)
                          </label>
                          <input
                            type="file"
                            id="editPdfUpload"
                            accept="application/pdf,application/zip"
                            onChange={handleEditFileChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isUploading}
                          />
                          {editTaskData.pdfFile && (
                            <div className="mt-2">
                              <p className="text-green-600">Selected: {editTaskData.pdfFile.name}</p>
                              {editTaskData.pdfFile.type === 'application/pdf' ? (
                                <div className="mt-2 border rounded p-2">
                                  <iframe
                                    src={URL.createObjectURL(editTaskData.pdfFile)}
                                    title="File Preview"
                                    className="w-full h-64"
                                    style={{ border: 'none' }}
                                  ></iframe>
                                  <p className="text-gray-500 text-sm mt-1">
                                    Note: File preview may not be supported in all browsers.
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm mt-1">
                                  Preview not available for ZIP files.
                                </p>
                              )}
                            </div>
                          )}
                          {editTaskData.file && !editTaskData.pdfFile && (
                            <div className="mt-2">
                              <p className="text-gray-600">
                                Current File:{' '}
                                <a
                                  href={editTaskData.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  View Current File
                                </a>
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className={`bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition ${
                              isUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isUploading}
                          >
                            {isUploading ? 'Uploading...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditTaskData(null)}
                            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-green-800">{task.title}</h3>
                        <button
                          onClick={() => startEditing(task)}
                          className="text-gray-600 hover:text-green-600 focus:outline-none"
                          aria-label="Edit task"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-600">{task.description || 'No description'}</p>
                      <p className="text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700">
                        Assigned to:{' '}
                        {Array.isArray(task.assignedTo) && task.assignedTo.length > 0
                          ? task.assignedTo
                              .map((userId) => {
                                const user = users.find((u) => u._id === userId);
                                return user ? user.username || user.name || user._id : 'Unknown User';
                              })
                              .join(', ')
                          : 'Admin'}
                      </p>
                      {task.file && (
                        <div className="mt-2">
                          <h4 className="text-green-600 font-semibold">Attached File:</h4>
                          {task.file.endsWith('.pdf') ? (
                            <div className="mt-2 border rounded p-2">
                              <iframe
                                src={task.file}
                                title={`File for ${task.title}`}
                                className="w-full h-64"
                                style={{ border: 'none' }}
                              ></iframe>
                              <p className="text-gray-500 text-sm mt-1">
                                Note: File preview may not be supported in all browsers.
                              </p>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <a
                                href={task.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                View File
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      {task.submissions && task.submissions.length > 0 ? (
                        <div className="mt-4">
                          <h4 className="text-green-600 font-semibold">Submissions:</h4>
                          {task.submissions.map((submission) => {
                            const user = users.find((u) => u._id === submission.user) || {};
                            const submissionKey = `${task._id}_${submission.user}`;
                            const isExpanded = expandedSubmission === submissionKey;
                            const status = submission.status ? submission.status.toLowerCase() : 'pending';
                            console.log(`Submission for user ${submission.user} in task ${task.title}:`, submission);
                            return (
                              <div key={submission.user} className="mt-4">
                                <div
                                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                                  onClick={() => toggleSubmission(task._id, submission.user)}
                                >
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-semibold">
                                      {(submission.username || user.username || user.name || submission.user || 'U')
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <p className="font-semibold text-gray-800">
                                        {submission.username || user.username || user.name || submission.user || 'Unknown'}
                                      </p>
                                      <span
                                        className={`text-sm ${
                                          status === 'approved'
                                            ? 'text-green-600'
                                            : status === 'resubmit'
                                            ? 'text-red-600'
                                            : 'text-gray-500'
                                        }`}
                                      >
                                        •{' '}
                                        {submission.status
                                          ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1)
                                          : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReviewingTask({ taskId: task._id, userId: submission.user });
                                      if (
                                        submission.status.toLowerCase() !== 'pending' &&
                                        submission.status.toLowerCase() !== 'for_review'
                                      ) {
                                        setReviewData((prev) => ({
                                          ...prev,
                                          [`${task._id}_${submission.user}`]: {
                                            reviewNote: submission.reviewNote || '',
                                            status: submission.status.toLowerCase() || '',
                                            markGiven: submission.markGiven || 0,
                                          },
                                        }));
                                      }
                                    }}
                                    className="text-gray-600 hover:text-green-600 focus:outline-none"
                                    aria-label="Review or edit submission"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7"
                                      />
                                    </svg>
                                  </button>
                                </div>
                                {isExpanded && (
                                  <div className="mt-2 p-3 bg-white border rounded-lg shadow-sm transition-all duration-300">
                                    {(submission.file || submission.driveLink) && (
                                      <div className="text-gray-600 text-sm">
                                        {submission.file && (
                                          <a
                                            href={submission.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline mr-2"
                                          >
                                            View File
                                          </a>
                                        )}
                                        {submission.driveLink && (
                                          <a
                                            href={submission.driveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                          >
                                            View Drive Link
                                          </a>
                                        )}
                                      </div>
                                    )}
                                    {submission.reviewNote && (
                                      <p className="mt-1 text-gray-600 text-sm">Feedback: {submission.reviewNote}</p>
                                    )}
                                    <div className="mt-2">
                                      <button
                                        onClick={() => {
                                          setReviewingTask({ taskId: task._id, userId: submission.user });
                                          if (
                                            submission.status.toLowerCase() !== 'pending' &&
                                            submission.status.toLowerCase() !== 'for_review'
                                          ) {
                                            setReviewData((prev) => ({
                                              ...prev,
                                              [`${task._id}_${submission.user}`]: {
                                                reviewNote: submission.reviewNote || '',
                                                status: submission.status.toLowerCase() || '',
                                                markGiven: submission.markGiven || 0,
                                              },
                                            }));
                                          }
                                        }}
                                        className="text-gray-600 hover:text-green-600 focus:outline-none"
                                        aria-label="Review or edit submission"
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 mt-2">No submissions yet.</p>
                      )}
                      {reviewingTask && (
                        <div className="mt-4 p-4 border rounded bg-white">
                          <h5 className="font-semibold text-gray-800">Review Submission</h5>
                          {task.submissions.map(
                            (submission) =>
                              reviewingTask.taskId === task._id &&
                              reviewingTask.userId === submission.user && (
                                <div key={submission.user}>
                                  <div className="mb-4">
                                    <h6 className="text-gray-706 font-semibold">Submitted Files</h6>
                                    {(submission.file || submission.driveLink) ? (
                                      <div className="text-gray-600 text-sm">
                                        {submission.file && (
                                          <a
                                            href={submission.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline mr-2"
                                          >
                                            View Submitted File
                                          </a>
                                        )}
                                        {submission.driveLink && (
                                          <a
                                            href={submission.driveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                          >
                                            View Drive Link
                                          </a>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 text-sm">No files submitted</p>
                                    )}
                                  </div>
                                  <div className="mb-4">
                                    <label
                                      className="block text-gray-700 mb-2"
                                      htmlFor={`reviewNote_${task._id}_${submission.user}`}
                                    >
                                      Feedback
                                    </label>
                                    <textarea
                                      id={`reviewNote_${task._id}_${submission.user}`}
                                      value={
                                        reviewData[`${task._id}_${submission.user}`]?.reviewNote ||
                                        submission.reviewNote || ''
                                      }
                                      onChange={(e) =>
                                        handleReviewChange(task._id, submission.user, 'reviewNote', e.target.value)
                                      }
                                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                      rows="3"
                                      placeholder="Enter feedback"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Status</label>
                                    <select
                                      value={
                                        reviewData[`${task._id}_${submission.user}`]?.status ||
                                        submission.status.toLowerCase() || ''
                                      }
                                      onChange={(e) =>
                                        handleReviewChange(task._id, submission.user, 'status', e.target.value)
                                      }
                                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                      <option value="">Select status</option>
                                      <option value="approved">Approved</option>
                                      <option value="resubmit">Resubmit</option>
                                    </select>
                                  </div>
                                  <div className="mb-4">
                                    <label
                                      className="block text-gray-700 mb-2"
                                      htmlFor={`markGiven_${task._id}_${submission.user}`}
                                    >
                                      Marks Given
                                    </label>
                                    <input
                                      type="number"
                                      id={`markGiven_${task._id}_${submission.user}`}
                                      value={
                                        reviewData[`${task._id}_${submission.user}`]?.markGiven !== undefined
                                          ? reviewData[`${task._id}_${submission.user}`].markGiven
                                          : submission.markGiven || 0
                                      }
                                      onChange={(e) =>
                                        handleReviewChange(task._id, submission.user, 'markGiven', e.target.value)
                                      }
                                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                      placeholder="Enter marks"
                                      min="0"
                                      max={task.maxMarks || 100}
                                    />
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleReviewSubmit(task._id, submission.user)}
                                      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                                    >
                                      Submit Review
                                    </button>
                                    <button
                                      onClick={() => setReviewingTask(null)}
                                      className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTask;