import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { CreateTaskAchievement, GetAllTaskAchievements, UpdateTaskAchievement, DeleteTaskAchievement, GetAllUsers } from '../../service/api';

const AdminAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const canvasRefs = useRef({});

  // Fetch all achievements and users
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const achievementData = await GetAllTaskAchievements();
      setAchievements(achievementData);
      const userData = await GetAllUsers();
      setUsers(userData);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Draw certificate on canvas
  const drawCertificate = (canvas, achievement) => {
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Certificate Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Achievement', canvas.width / 2, 100);

    // Badge
    // ctx.font = 'bold 36px Arial';
    // ctx.fillStyle = achievement.badge.toLowerCase() === '#000000';
    // ctx.fillText(achievement.badge.charAt(0).toUpperCase() + achievement.badge.slice(1), canvas.width / 2, 180);

    // Title
    ctx.font = '30px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(achievement.title, canvas.width / 2, 250);

    // Description
    ctx.font = '24px Arial';
    ctx.fillText(achievement.description, canvas.width / 2, 320);

    // Username
    ctx.font = '28px Arial';
    ctx.fillText(`Awarded to: ${achievement.username || 'Unknown'}`, canvas.width / 2, 400);

    // Date
    ctx.font = '24px Arial';
    ctx.fillText(`Date: ${formatDate(achievement.assignedAt)}`, canvas.width / 2, 460);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditing && currentAchievement) {
        await UpdateTaskAchievement(currentAchievement._id, {
          title: data.title,
          description: data.description,
          // badge: data.badge
        });
      } else {
        await CreateTaskAchievement({
          title: data.title,
          description: data.description,
          // badge: data.badge,
          userId: data.userId
        });
      }
      await fetchData(); // Refresh data after create/update
      reset();
      setShowForm(false);
      setIsEditing(false);
      setCurrentAchievement(null);
    } catch (err) {
      setError(err.message || "Failed to save achievement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (achievement) => {
    setCurrentAchievement(achievement);
    setIsEditing(true);
    setShowForm(true);
    reset({
      title: achievement.title,
      description: achievement.description,
      // badge: achievement.badge,
      userId: achievement.user
    });
  };

  const handleDelete = async (achievementId) => {
    setIsLoading(true);
    setError(null);
    try {
      await DeleteTaskAchievement(achievementId);
      await fetchData(); // Refresh data after delete
    } catch (err) {
      setError(err.message || "Failed to delete achievement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (achievement) => {
    const canvas = canvasRefs.current[achievement._id];
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${achievement.title.replace(/\s+/g, '_')}_certificate.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setIsEditing(false);
    setCurrentAchievement(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manage Certificates</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={isLoading}
          >
            Create Certificate
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-center text-gray-500">Loading...</div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Certificate' : 'Create New Certificate'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Title is required' })}
                className={`w-full px-3 py-2 border rounded-md border-gray-300 ${errors.title ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description', { required: 'Description is required' })}
                className={`w-full px-3 py-2 border rounded-md border-gray-300 ${errors.description ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            {/* <div>
              <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-1">
                Badge *
              </label>
              <select
                id="badge"
                {...register('badge', { required: 'Badge is required' })}
                className={`w-full px-3 py-2 border rounded-md border-gray-300 ${errors.badge ? 'border-red-500' : ''}`}
                disabled={isLoading}
              >
                <option value="">Select Badge</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
              {errors.badge && <p className="text-red-500 text-sm mt-1">{errors.badge.message}</p>}
            </div> */}

            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                User *
              </label>
              <select
                id="userId"
                {...register('userId', { required: 'User is required' })}
                className={`w-full px-3 py-2 border rounded-md border-gray-300 ${errors.userId ? 'border-red-500' : ''}`}
                disabled={isLoading || isEditing}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username || 'Unknown'}
                  </option>
                ))}
              </select>
              {errors.userId && <p className="text-red-500 text-sm mt-1">{errors.userId.message}</p>}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
              >
                {isEditing ? 'Update' : 'Create'} Certificate
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {achievements.length === 0 && !isLoading ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          No Certificates yet. Click "Create Certificate" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div key={achievement._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <canvas
                ref={(el) => (canvasRefs.current[achievement._id] = el)}
                className="w-full"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <div className="p-5">
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(achievement)}
                    className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors duration-200"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-5.657-5.657a2 2 0 112.828-2.828l2.829 2.829" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(achievement._id)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors duration-200"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDownload(achievement)}
                    className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors duration-200"
                    title="Download"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
              {canvasRefs.current[achievement._id] && drawCertificate(canvasRefs.current[achievement._id], achievement)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAchievements;