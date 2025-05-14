import React, { useState, useEffect } from 'react';
import { GetUserTasksById, SubmitTask } from '../../service/api'; // Adjust path as needed

const UserTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionUrls, setSubmissionUrls] = useState({});
  const [sortBy, setSortBy] = useState('dueDateAsc');
  const [searchQuery, setSearchQuery] = useState('');
  const [specificDate, setSpecificDate] = useState('');

  const loginData = JSON.parse(localStorage.getItem('loginData'));
  const currentUserId = loginData?.userId || '680373b6c9e849266316e9da';
  const token = loginData?.token;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!token) throw new Error('Please log in to view tasks');
        if (!currentUserId) throw new Error('User ID is missing');

        const response = await GetUserTasksById(currentUserId);
        if (!Array.isArray(response)) throw new Error('Invalid response format from server');

        setTasks(response);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUserId, token]);

  const handleInputChange = (taskId, value) => {
    setSubmissionUrls((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  const handleSubmit = async (taskId) => {
    try {
      const url = submissionUrls[taskId] || '';
      if (!url) {
        alert('Please provide a submission URL.');
        return;
      }

      const payload = {
        file: url,
        driveLink: '',
      };

      await SubmitTask(taskId, payload, token);
      const response = await GetUserTasksById(currentUserId);
      if (Array.isArray(response)) setTasks(response);

      setSubmissionUrls((prev) => ({
        ...prev,
        [taskId]: '',
      }));

      alert('Task submitted successfully!');
    } catch (err) {
      console.error('Error submitting task:', err);
      alert(err.message || 'Failed to submit task');
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

  const handleRetry = () => {
    setError(null);
    setLoading(true);
  };

  const filterTasks = (tasks) => {
    let filteredTasks = [...tasks];

    if (searchQuery) {
      filteredTasks = filteredTasks.filter((task) =>
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
      'Done': [],
    };
    const filteredTasks = filterTasks(tasks);
    filteredTasks.forEach((task) => {
      if (task.mySubmission?.status === 'approved') categories['Done'].push(task);
      else if (task.mySubmission?.status === 'resubmit') categories['Need Review'].push(task);
      else if (task.mySubmission) categories['In Progress'].push(task);
      else categories['To-do'].push(task);
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

  const categories = categorizeTasks();

  const sortedCategories = Object.keys(categories).reduce((acc, category) => {
    acc[category] = sortTasks(categories[category]);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 font-jakarta">User Tasks</h1>
        <p className="text-gray-600 mb-6 font-poppins">Welcome to the tasks</p>
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
        {loading ? (
          <p className="text-gray-500 text-center font-poppins">Loading tasks...</p>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500 font-poppins">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-poppins"
            >
              Retry
            </button>
          </div>
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
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800 text-base truncate max-w-[80%] font-jakarta">
                            {task.title || 'Untitled'}
                          </h3>
                          <span className="text-xs text-gray-500 font-poppins">{formatDate(task.dueDate)}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 font-poppins">
                          {task.description || 'No description'}
                        </p>
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
                        {task.mySubmission && task.mySubmission.status !== 'resubmit' ? (
                          <div className="mt-2">
                            <div className="flex items-center mb-1">
                              <p className="text-gray-600 text-sm font-poppins">Status:</p>
                              <span
                                className={`ml-2 text-sm font-poppins ${
                                  task.mySubmission.status.toLowerCase() === 'approved'
                                    ? 'text-green-600'
                                    : 'text-gray-500'
                                }`}
                              >
                                {task.mySubmission.status}
                              </span>
                              {task.mySubmission.status.toLowerCase() === 'approved' && (
                                <svg
                                  className="ml-2 w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            {task.mySubmission.file && (
                              <a
                                href={task.mySubmission.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 text-sm hover:underline flex items-center font-poppins"
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
                                View Submission
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3">
                            <p className="text-gray-600 text-sm mb-2 font-poppins">
                              {task.mySubmission ? 'Resubmit Your Task:' : 'Submit Your Task:'}
                            </p>
                            <div className="flex items-center space-x-2">
                              <input
                                type="url"
                                placeholder="Submission URL (e.g., https://example.com)"
                                value={submissionUrls[task._id] || ''}
                                onChange={(e) => handleInputChange(task._id, e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-3/4 font-poppins"
                              />
                              <button
                                onClick={() => handleSubmit(task._id)}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm whitespace-nowrap font-poppins"
                              >
                                {task.mySubmission ? 'Resubmit' : 'Submit'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserTask;