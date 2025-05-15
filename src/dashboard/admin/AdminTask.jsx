import React, { useState, useEffect } from 'react';
import {
  CreateTask,
  UploadFileTask,
  GetAllTasks,
  GetAllUsers,
  ReviewSubmission,
  GetTaskSubmissions,
  UpdateTask,
  GetTaskById,
} from '../../service/api';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const AdminTask = () => {
  // Dynamically load Google Fonts
  useEffect(() => {
    const fonts = [
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap',
    ];

    fonts.forEach((font) => {
      const existingLink = document.querySelector(`link[href="${font}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = font;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    });
  }, []); // Empty dependency array to run once on mount

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
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [specificDate, setSpecificDate] = useState('');
  const [sortBy, setSortBy] = useState('dueDateAsc');

  const navigate = useNavigate();
  const taskCache = new Map();
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTasks(true);
      try {
        const token = JSON.parse(localStorage.getItem('loginData'))?.token;
        if (!token) {
          setValidationMessages((prev) => [...prev, { text: 'Please log in to continue.', type: 'error' }]);
          navigate('/login');
          return;
        }

        const tasks = await GetAllTasks();
        console.log('GetAllTasks response:', tasks);
        const tasksMissingDescription = tasks.filter(
          (task) => task.description === undefined || task.description === null
        );
        let updatedTasks = [...tasks];
        if (tasksMissingDescription.length > 0) {
          const missingTaskPromises = tasksMissingDescription.map(async (task) => {
            if (taskCache.has(task._id)) return taskCache.get(task._id);
            try {
              const fetchedTask = await GetTaskById(task._id);
              console.log(`GetTaskById response for ${task._id}:`, fetchedTask);
              taskCache.set(task._id, fetchedTask);
              return fetchedTask;
            } catch (error) {
              console.error(`Failed to fetch task ${task._id} with GetTaskById:`, error);
              return task;
            }
          });
          const missingTasks = await Promise.all(missingTaskPromises);
          updatedTasks = tasks.map((task) => {
            const fetchedTask = missingTasks.find((mt) => mt._id === task._id);
            return fetchedTask && fetchedTask.description !== undefined
              ? { ...task, description: fetchedTask.description || '', file: fetchedTask.file || task.file || null }
              : task;
          });
        }

        const tasksWithSubmissions = await Promise.all(
          updatedTasks.map(async (task) => {
            try {
              const submissions = await GetTaskSubmissions(task._id);
              return {
                ...task,
                submissions: submissions.map((sub) => ({
                  ...sub,
                  user: typeof sub.user === 'object' ? sub.user._id || sub.user : sub.user,
                })),
              };
            } catch (error) {
              console.error(`Failed to fetch submissions for task ${task._id}:`, error);
              if (error.message === 'Session expired. Please log in again.') navigate('/login');
              return { ...task, submissions: [] };
            }
          })
        );

        const normalizedTasks = tasksWithSubmissions.map((task) => {
          const normalizedTask = {
            ...task,
            assignedTo: Array.isArray(task.assignedTo)
              ? task.assignedTo
                  .map((user) => (typeof user === 'object' ? user.user || user._id || user : user))
                  .filter(isValidObjectId)
              : [],
            file: task.file || null,
            maxMarks: task.maxMarks || 100,
            description: task.description || '',
            submissions: task.submissions || [],
          };
          console.log('Normalized task:', normalizedTask);
          return normalizedTask;
        });
        setAssignedTasks(normalizedTasks);

        const userData = await GetAllUsers();
        setUsers(Array.isArray(userData) ? userData : []);
      } catch (error) {
        console.error('Fetch data error:', error);
        setValidationMessages((prev) => [
          ...prev,
          { text: error.message || 'Failed to fetch tasks or users', type: 'error' },
        ]);
        if (error.message === 'Session expired. Please log in again.') navigate('/login');
      } finally {
        setIsLoadingTasks(false);
      }
    };
    fetchData();
  }, [navigate]);

  const filterTasks = (tasks) => {
    let filteredTasks = [...tasks];

    if (searchQuery) {
      filteredTasks = filteredTasks.filter(
        (task) =>
          (task.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (specificDate) {
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        const selectedDate = new Date(specificDate);
        return (
          taskDate.getDate() === selectedDate.getDate() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    }

    return filteredTasks;
  };

  const categorizeTasks = () => {
    const categories = {
      'To-do': [],
      'In Progress': [],
      'Need Review': [],
      Done: [],
    };
    const filteredTasks = filterTasks(assignedTasks);
    filteredTasks.forEach((task) => {
      const hasSubmission = task.submissions && task.submissions.length > 0;
      const latestSubmission = hasSubmission ? task.submissions[task.submissions.length - 1] : null;
      if (hasSubmission && latestSubmission.status === 'approved') {
        categories.Done.push(task);
      } else if (hasSubmission && latestSubmission.status === 'resubmit') {
        categories['Need Review'].push(task);
      } else if (hasSubmission) {
        categories['In Progress'].push(task);
      } else {
        categories['To-do'].push(task);
      }
    });
    return categories;
  };

  const sortTasks = (tasks) => {
    const sortedTasks = [...tasks];
    switch (sortBy) {
      case 'dueDateAsc':
        return sortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'dueDateDesc':
        return sortedTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
      case 'nameAsc':
        return sortedTasks.sort((a, b) => (a.title || 'Untitled').localeCompare(b.title || 'Untitled'));
      case 'nameDesc':
        return sortedTasks.sort((a, b) => (b.title || 'Untitled').localeCompare(a.title || 'Untitled'));
      default:
        return sortedTasks;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleChange = (e) => {
  const { name, value, checked, type } = e.target;

  if (name === 'selectedUser' && type === 'checkbox') {
    setTaskData((prev) => ({
      ...prev,
      selectedUser: checked
        ? [...prev.selectedUser, value]
        : prev.selectedUser.filter((userId) => userId !== value),
    }));
  } else {
    setTaskData((prev) => ({ ...prev, [name]: value }));
  }
};
  // const handleChange = (e) => {
  //   const { name, value, checkboxes } = e.target;
  //   if (name === 'selectedUser'&& type === 'checkboxes') {
  //     setTaskData((prev) => ({
  //       ...prev,
  //       selectedUser: checked
  //         ? [...prev.selectedUser, value]
  //         : prev.selectedUser.filter((userId) => userId !== value),
  //     }));
  //   } else {
  //     setTaskData((prev) => ({ ...prev, [name]: value }));
  //   }
  // };

  const handleEditChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'selectedUser') {
      setEditTaskData((prev) => ({
        ...prev,
        selectedUser: checked
          ? [...prev.selectedUser, value]
          : prev.selectedUser.filter((userId) => userId !== value),
      }));
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
          if (typeof uploadResponse === 'string') throw new Error(uploadResponse || 'File upload failed');
          fileData = uploadResponse.data?.fileUrl;
          if (!fileData) {
            setValidationMessages((prev) => [
              ...prev,
              { text: 'File uploaded but no file URL returned. Task will be created without a file.', type: 'error' },
            ]);
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
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
      console.log('CreateTask payload:', apiTaskData);

      const newTask = await CreateTask(apiTaskData);
      console.log('CreateTask response:', newTask);
      const normalizedTask = {
        ...newTask,
        assignedTo: Array.isArray(newTask.assignedTo)
          ? newTask.assignedTo.map((user) => (typeof user === 'object' ? user.user || user._id || user : user))
          : [],
        file: newTask.file || null,
        maxMarks: newTask.maxMarks || 100,
        description: newTask.description || '',
        submissions: [],
      };
      setAssignedTasks((prev) => [...prev, normalizedTask]);

      setTaskData({ title: '', description: '', dueDate: '', selectedUser: [], pdfFile: null });
      setSelectedUserType('admin');
      setValidationMessages([]);
      setShowAddTaskForm(false);
    } catch (error) {
      console.error('Create task error:', error);
      setValidationMessages((prev) => [
        ...prev,
        { text: error.message || 'Failed to create task', type: 'error' },
      ]);
      if (error.message === 'Session expired. Please log in again.') navigate('/login');
    } finally {
      setIsUploading(false);
    }
    window.location.reload();
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
          console.log('UploadFileTask response (edit):', uploadResponse);
          if (typeof uploadResponse === 'string') throw new Error(uploadResponse || 'File upload failed');
          fileData = uploadResponse.data?.fileUrl;
          if (!fileData) {
            setValidationMessages((prev) => [
              ...prev,
              { text: 'File uploaded but no file URL returned. Task will be updated without a file.', type: 'error' },
            ]);
          }
        } catch (uploadError) {
          console.error('File upload error (edit):', uploadError);
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
      console.log('UpdateTask payload:', apiTaskData);

      await UpdateTask(taskId, apiTaskData);
      const updatedTask = await GetTaskById(taskId);
      console.log('GetTaskById response (after update):', updatedTask);
      const submissions = await GetTaskSubmissions(taskId);
      const updatedTaskWithSubmissions = {
        ...updatedTask,
        submissions: submissions.map((sub) => ({
          ...sub,
          user: typeof sub.user === 'object' ? sub.user._id || sub.user : sub.user,
        })),
      };

      const normalizedUpdatedTask = {
        ...updatedTaskWithSubmissions,
        assignedTo: Array.isArray(updatedTaskWithSubmissions.assignedTo)
          ? updatedTaskWithSubmissions.assignedTo
              .map((user) => (typeof user === 'object' ? user.user || user._id || user : user))
              .filter(isValidObjectId)
          : [],
        file: updatedTaskWithSubmissions.file || null,
        maxMarks: updatedTaskWithSubmissions.maxMarks || 100,
        description: updatedTaskWithSubmissions.description || '',
      };
      setAssignedTasks((prev) => {
        const updatedTasks = prev.map((task) =>
          task._id === taskId ? normalizedUpdatedTask : task
        );
        return [...updatedTasks];
      });

      setEditTaskData(null);
      setEditUserType('admin');
      setValidationMessages((prev) => [
        ...prev,
        { text: 'Task updated successfully.', type: 'success' },
      ]);
    } catch (error) {
      console.error('Update task error:', error);
      setValidationMessages((prev) => [
        ...prev,
        { text: error.message || 'Failed to update task', type: 'error' },
      ]);
      if (error.message === 'Session expired. Please log in again.') navigate('/login');
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
      const token = JSON.parse(localStorage.getItem('loginData'))?.token;
      if (!token) {
        setValidationMessages((prev) => [
          ...prev,
          { text: 'Please log in to continue.', type: 'error' },
        ]);
        navigate('/login');
        return;
      }

      const reviewPayload = {
        status: review.status,
        markGiven: review.markGiven || 0,
        reviewNote: review.reviewNote,
      };
      await ReviewSubmission(taskId, userId, reviewPayload);
      setValidationMessages((prev) => [
        ...prev,
        { text: 'Review updated successfully.', type: 'success' },
      ]);

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
      console.error('Review submission error:', error);
      setValidationMessages((prev) => [
        ...prev,
        { text: error.message || 'Failed to process submission', type: 'error' },
      ]);
      if (error.message === 'Session expired. Please log in again.') navigate('/login');
    }
  };

  const closeValidationMessage = (index) => {
    setValidationMessages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const timers = validationMessages.map((_, index) =>
      setTimeout(() => closeValidationMessage(index), 5000)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [validationMessages]);

  const toggleSubmission = (taskId, section) => {
    const key = `${taskId}_${section}`;
    console.log('Toggling section:', key);
    setExpandedSubmission(expandedSubmission === key ? null : key);
  };

  const startEditing = (task) => {
    const assignedToIds = Array.isArray(task.assignedTo)
      ? task.assignedTo
          .map((user) => (typeof user === 'object' ? user.user || user._id || user : user))
          .filter(isValidObjectId)
      : [];
    setEditTaskData({
      _id: task._id,
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      selectedUser: assignedToIds,
      pdfFile: null,
      file: task.file || null,
      maxMarks: task.maxMarks || 100,
    });
    setEditUserType(assignedToIds.length > 0 ? 'user' : 'admin');
  };

  const categories = categorizeTasks();
  const sortedCategories = Object.keys(categories).reduce((acc, category) => {
    acc[category] = sortTasks(categories[category]);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-poppins">
      {validationMessages.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {validationMessages.map((message, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded shadow-md flex justify-between items-center font-poppins ${
                message.type === 'success'
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-red-100 border-red-500 text-red-700'
              }`}
            >
              <p>{message.text}</p>
              <button
                onClick={() => closeValidationMessage(index)}
                className={`font-poppins ${
                  message.type === 'success' ? 'text-green-700 hover:text-green-900' : 'text-red-700 hover:text-red-900'
                }`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <main className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 font-jakarta">Assigned Tasks</h1>
          <button
            onClick={() => setShowAddTaskForm(!showAddTaskForm)}
            className="inline-flex items-center p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-poppins"
            aria-label={showAddTaskForm ? 'Hide add task form' : 'Show add task form'}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-6 font-poppins">Manage and review your tasks</p>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64 font-poppins"
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
            >
              <option value="dueDateAsc">Due Date (Earliest First)</option>
              <option value="dueDateDesc">Due Date (Latest First)</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
            </select>
          </div>
        </div>
        {showAddTaskForm && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-purple-800 font-jakarta">Add Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4 font-poppins">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1 font-poppins" htmlFor="title">
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={taskData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                  placeholder="Assign New Task"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1 font-poppins" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={taskData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                  rows="4"
                  placeholder="Description"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1 font-poppins" htmlFor="dueDate">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={taskData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                />
              </div>
              <div className="mb-4">
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-600 mb-1 font-poppins">Assign To</legend>
                  <div className="flex space-x-4 mb-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="userTypeAdmin"
                        name="userType"
                        value="admin"
                        checked={selectedUserType === 'admin'}
                        onChange={() => setSelectedUserType('admin')}
                        className="mr-2 focus:ring-purple-500"
                      />
                      interrupts
                      <label htmlFor="userTypeAdmin" className="text-gray-700 font-poppins">
                        Admin
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="userTypeUser"
                        name="userType"
                        value="user"
                        checked={selectedUserType === 'user'}
                        onChange={() => setSelectedUserType('user')}
                        className="mr-2 focus:ring-purple-500"
                      />
                      <label htmlFor="userTypeUser" className="text-gray-700 font-poppins">
                        User
                      </label>
                    </div>
                  </div>
                </fieldset>
                {selectedUserType === 'user' && (
                  <div className="mt-2">
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-600 mb-1 font-poppins">Select Users</legend>
                      <div className="space-y-2">
                        {users.map((user) => (
                          <div key={user._id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`user-${user._id}`}
                              name="selectedUser"
                              value={user._id}
                              checked={taskData.selectedUser.includes(user._id)}
                              onChange={handleChange}
                              className="mr-2 focus:ring-purple-500"
                            />
                            <label htmlFor={`user-${user._id}`} className="text-gray-700 font-poppins">
                              {user.username || user.name || user._id}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1 font-poppins" htmlFor="pdfUpload">
                  Upload File (PDF or ZIP)
                </label>
                <input
                  type="file"
                  id="pdfUpload"
                  name="pdfUpload"
                  accept="application/pdf,application/zip"
                  onChange={handleFileChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                  disabled={isUploading}
                />
                {taskData.pdfFile && (
                  <div className="mt-2">
                    <p className="text-purple-600 font-poppins">Selected: {taskData.pdfFile.name}</p>
                    {taskData.pdfFile.type === 'application/pdf' ? (
                      <div className="mt-2 border rounded p-2">
                        <iframe
                          src={URL.createObjectURL(taskData.pdfFile)}
                          title="File Preview"
                          className="w-full h-64"
                          style={{ border: 'none' }}
                        ></iframe>
                        <p className="text-gray-500 text-sm mt-1 font-poppins">
                          Note: File preview may not be supported in all browsers.
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1 font-poppins">
                        Preview not available for ZIP files.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className={`bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition font-poppins ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTaskForm(false)}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-poppins"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        {isLoadingTasks ? (
          <p className="text-gray-500 text-center font-poppins">Loading tasks...</p>
        ) : assignedTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-10 font-poppins">No tasks have been created yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(sortedCategories).map(([category, tasks]) => (
              <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center font-jakarta">
                  {category}
                  <span className="ml-2 bg-purple-100 text-purple-700 text-sm px-2 py-1 rounded-full font-poppins">
                    {tasks.length}
                  </span>
                </h2>
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-sm font-poppins">No tasks in this category.</p>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div
                        key={task._id}
                        className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                      >
                        {editTaskData && editTaskData._id === task._id ? (
                          <div>
                            <h3 className="text-lg font-semibold mb-4 text-purple-800 font-jakarta">Edit Task</h3>
                            <form onSubmit={(e) => handleEditSubmit(e, task._id)} className="space-y-4 font-poppins">
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-600 mb-1 font-poppins" htmlFor="editTitle">
                                  Task Title
                                </label>
                                <input
                                  type="text"
                                  id="editTitle"
                                  name="title"
                                  value={editTaskData.title}
                                  onChange={handleEditChange}
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                                  placeholder="Assign New Task"
                                />
                              </div>
                              <div className="mb-4">
                                <label
                                  className="block text-sm font-medium text-gray-600 mb-1 font-poppins"
                                  htmlFor="editDescription"
                                >
                                  Description
                                </label>
                                <textarea
                                  id="editDescription"
                                  name="description"
                                  value={editTaskData.description}
                                  onChange={handleEditChange}
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                                  rows="4"
                                  placeholder="Description"
                                />
                              </div>
                              <div className="mb-4">
                                <label
                                  className="block text-sm font-medium text-gray-600 mb-1 font-poppins"
                                  htmlFor="editDueDate"
                                >
                                  Due Date
                                </label>
                                <input
                                  type="date"
                                  id="editDueDate"
                                  name="dueDate"
                                  value={editTaskData.dueDate}
                                  onChange={handleEditChange}
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                                />
                              </div>
                              <div className="mb-4">
                                <fieldset>
                                  <legend className="block text-sm font-medium text-gray-600 mb-1 font-poppins">Assign To</legend>
                                  <div className="flex space-x-4 mb-2">
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id="editUserTypeAdmin"
                                        name="editUserType"
                                        value="admin"
                                        checked={editUserType === 'admin'}
                                        onChange={() => setEditUserType('admin')}
                                        className="mr-2 focus:ring-purple-500"
                                      />
                                      <label htmlFor="editUserTypeAdmin" className="text-gray-700 font-poppins">
                                        Admin
                                      </label>
                                    </div>
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        id="editUserTypeUser"
                                        name="editUserType"
                                        value="user"
                                        checked={editUserType === 'user'}
                                        onChange={() => setEditUserType('user')}
                                        className="mr-2 focus:ring-purple-500"
                                      />
                                      <label htmlFor="editUserTypeUser" className="text-gray-700 font-poppins">
                                        User
                                      </label>
                                    </div>
                                  </div>
                                </fieldset>
                                {editUserType === 'user' && (
                                  <div className="mt-2">
                                    <fieldset>
                                      <legend className="block text-sm font-medium text-gray-600 mb-1 font-poppins">
                                        Select Users
                                      </legend>
                                      <div className="space-y-2">
                                        {users.map((user) => (
                                          <div key={user._id} className="flex items-center">
                                            <input
                                              type="checkbox"
                                              id={`edit-user-${user._id}`}
                                              name="selectedUser"
                                              value={user._id}
                                              checked={editTaskData.selectedUser.includes(user._id)}
                                              onChange={handleEditChange}
                                              className="mr-2 focus:ring-purple-500"
                                            />
                                            <label htmlFor={`edit-user-${user._id}`} className="text-gray-700 font-poppins">
                                              {user.username || user.name || user._id}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </fieldset>
                                  </div>
                                )}
                              </div>
                              <div className="mb-4">
                                <label
                                  className="block text-sm font-medium text-gray-600 mb-1 font-poppins"
                                  htmlFor="editPdfUpload"
                                >
                                  Upload File (PDF or ZIP)
                                </label>
                                <input
                                  type="file"
                                  id="editPdfUpload"
                                  name="editPdfUpload"
                                  accept="application/pdf,application/zip"
                                  onChange={handleEditFileChange}
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                                  disabled={isUploading}
                                />
                                {editTaskData.pdfFile && (
                                  <div className="mt-2">
                                    <p className="text-purple-600 font-poppins">Selected: {editTaskData.pdfFile.name}</p>
                                    {editTaskData.pdfFile.type === 'application/pdf' ? (
                                      <div className="mt-2 border rounded p-2">
                                        <iframe
                                          src={URL.createObjectURL(editTaskData.pdfFile)}
                                          title="File Preview"
                                          className="w-full h-64"
                                          style={{ border: 'none' }}
                                        ></iframe>
                                        <p className="text-gray-500 text-sm mt-1 font-poppins">
                                          Note: File preview may not be supported in all browsers.
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 text-sm mt-1 font-poppins">
                                        Preview not available for ZIP files.
                                      </p>
                                    )}
                                  </div>
                                )}
                                {editTaskData.file && !editTaskData.pdfFile && (
                                  <div className="mt-2">
                                    <p className="text-gray-600 font-poppins">
                                      Current File:{' '}
                                      <a
                                        href={editTaskData.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 underline font-poppins"
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
                                  className={`bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition font-poppins ${
                                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                  disabled={isUploading}
                                >
                                  {isUploading ? 'Uploading...' : 'Save Changes'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditTaskData(null)}
                                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-poppins"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-800 text-base truncate max-w-[80%] font-jakarta">
                                {task.title || 'Untitled'}
                              </h3>
                              <span className="text-xs text-gray-500 font-poppins">{formatDate(task.dueDate)}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 font-poppins">{task.description || 'No description'}</p>
                            {task.file && (
                              <a
                                href={task.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 text-sm hover:underline flex items-center mb-2 font-poppins"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 12h2m0 0h-2m0 0v-2m0 2v2M12 15H9m3-6V6m-3 3h6M5 12H3m0 0h2m0 0v-2m0 2v2m4-9V3m0 0h2m0 0v2m0-2H9m12 9h-2m0 0h2m0 0v-2m0 2v2m-4 9v-2m0 0h-2m0 0v2m0 0h2m-6-3H9m0 0h6"
                                  />
                                </svg>
                                View Task File
                              </a>
                            )}
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-600 flex items-center font-poppins">
                                <UserIcon className="w-4 h-4 mr-1.5" />
                                Assigned To
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
                                  task.assignedTo.map((userId) => {
                                    const user = users.find((u) => u._id === userId);
                                    return (
                                      <span
                                        key={userId}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-gray-200 text-gray-800 font-poppins"
                                      >
                                        {user ? user.username || user.name || user._id : 'Unknown User'}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-gray-700 font-poppins">Admin</span>
                                )}
                              </div>
                            </div>
                            {task.submissions && task.submissions.length > 0 && (
                              <div className="mt-2">
                                <button
                                  onClick={() => toggleSubmission(task._id, 'submissions')}
                                  className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 focus:outline-none font-poppins"
                                  aria-expanded={expandedSubmission === `${task._id}_submissions`}
                                  aria-controls={`submissions-${task._id}`}
                                  tabIndex={0}
                                  onKeyDown={(e) => e.key === 'Enter' && toggleSubmission(task._id, 'submissions')}
                                >
                                  <UserIcon className="w-4 h-4 mr-1.5" />
                                  Submissions ({task.submissions.length})
                                  {expandedSubmission === `${task._id}_submissions` ? (
                                    <ChevronUpIcon className="w-4 h-4 ml-1" />
                                  ) : (
                                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                                  )}
                                </button>
                                {expandedSubmission === `${task._id}_submissions` && (
                                  <div
                                    id={`submissions-${task._id}`}
                                    className="mt-4 space-y-4 transition-all duration-300"
                                  >
                                    {task.submissions.map((submission) => {
                                      const user = users.find((u) => u._id === submission.user) || {};
                                      const status = submission.status ? submission.status.toLowerCase() : 'pending';
                                      return (
                                        <div
                                          key={submission.user}
                                          className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-semibold font-jakarta">
                                                {(submission.username ||
                                                  user.username ||
                                                  user.name ||
                                                  submission.user ||
                                                  'U')
                                                  .charAt(0)
                                                  .toUpperCase()}
                                              </div>
                                              <div>
                                                <p className="font-semibold text-gray-800 font-poppins">
                                                  {submission.username ||
                                                    user.username ||
                                                    user.name ||
                                                    submission.user ||
                                                    'Unknown'}
                                                </p>
                                                <span
                                                  className={`text-xs font-medium font-poppins ${
                                                    status === 'approved'
                                                      ? 'text-green-600'
                                                      : status === 'resubmit'
                                                      ? 'text-red-600'
                                                      : 'text-gray-500'
                                                  }`}
                                                >
                                                  {submission.status
                                                    ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1)
                                                    : 'Pending'}
                                                </span>
                                              </div>
                                            </div>
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
                                              className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-poppins"
                                              aria-label={`Review submission for ${
                                                user.username || user.name || submission.user
                                              }`}
                                            >
                                              Review
                                            </button>
                                          </div>
                                          {(submission.file || submission.driveLink) && (
                                            <div className="mt-2 text-sm text-gray-600 font-poppins">
                                              {submission.file && (
                                                <a
                                                  href={submission.file}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-purple-600 hover:underline mr-2 font-poppins"
                                                >
                                                  View File
                                                </a>
                                              )}
                                              {submission.driveLink && (
                                                <a
                                                  href={submission.driveLink}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-purple-600 hover:underline font-poppins"
                                                >
                                                  View Drive Link
                                                </a>
                                              )}
                                            </div>
                                          )}
                                          {submission.reviewNote && (
                                            <p className="mt-2 text-sm text-gray-600 font-poppins">
                                              Feedback: {submission.reviewNote}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                            <button
                              onClick={() => startEditing(task)}
                              className="mt-3 inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-poppins"
                              aria-label={`Edit task ${task.title}`}
                            >
                              Edit Task
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {reviewingTask && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <h5 className="text-lg font-semibold text-gray-900 mb-4 font-jakarta">Review Submission</h5>
              {assignedTasks
                .find((task) => task._id === reviewingTask.taskId)
                ?.submissions.map(
                  (submission) =>
                    reviewingTask.userId === submission.user && (
                      <div key={submission.user} className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 font-poppins">Submitted Files</p>
                          {(submission.file || submission.driveLink) ? (
                            <div className="text-sm text-gray-600 font-poppins">
                              {submission.file && (
                                <a
                                  href={submission.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline mr-2 font-poppins"
                                >
                                  View Submitted File
                                </a>
                              )}
                              {submission.driveLink && (
                                <a
                                  href={submission.driveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline font-poppins"
                                >
                                  View Drive Link
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm font-poppins">No files submitted</p>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-600 mb-1 font-poppins"
                            htmlFor={`reviewNote_${reviewingTask.taskId}_${submission.user}`}
                          >
                            Feedback
                          </label>
                          <textarea
                            id={`reviewNote_${reviewingTask.taskId}_${submission.user}`}
                            name={`reviewNote_${reviewingTask.taskId}_${submission.user}`}
                            value={
                              reviewData[`${reviewingTask.taskId}_${submission.user}`]?.reviewNote ||
                              submission.reviewNote || ''
                            }
                            onChange={(e) =>
                              handleReviewChange(reviewingTask.taskId, submission.user, 'reviewNote', e.target.value)
                            }
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                            rows="4"
                            placeholder="Enter feedback"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-600 mb-1 font-poppins"
                            htmlFor={`status_${reviewingTask.taskId}_${submission.user}`}
                          >
                            Status
                          </label>
                          <select
                            id={`status_${reviewingTask.taskId}_${submission.user}`}
                            name={`status_${reviewingTask.taskId}_${submission.user}`}
                            value={
                              reviewData[`${reviewingTask.taskId}_${submission.user}`]?.status ||
                              submission.status.toLowerCase() || ''
                            }
                            onChange={(e) =>
                              handleReviewChange(reviewingTask.taskId, submission.user, 'status', e.target.value)
                            }
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                          >
                            <option value="">Select status</option>
                            <option value="approved">Approved</option>
                            <option value="resubmit">Resubmit</option>
                          </select>
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-600 mb-1 font-poppins"
                            htmlFor={`markGiven_${reviewingTask.taskId}_${submission.user}`}
                          >
                            Marks Given
                          </label>
                          <input
                            type="number"
                            id={`markGiven_${reviewingTask.taskId}_${submission.user}`}
                            name={`markGiven_${reviewingTask.taskId}_${submission.user}`}
                            value={
                              reviewData[`${reviewingTask.taskId}_${submission.user}`]?.markGiven !== undefined
                                ? reviewData[`${reviewingTask.taskId}_${submission.user}`].markGiven
                                : submission.markGiven || 0
                            }
                            onChange={(e) =>
                              handleReviewChange(reviewingTask.taskId, submission.user, 'markGiven', e.target.value)
                            }
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                            placeholder="Enter marks"
                            min="0"
                            max={
                              assignedTasks.find((task) => task._id === reviewingTask.taskId)?.maxMarks || 100
                            }
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleReviewSubmit(reviewingTask.taskId, submission.user)}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-poppins"
                          >
                            Submit Review
                          </button>
                          <button
                            onClick={() => setReviewingTask(null)}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition font-poppins"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTask;