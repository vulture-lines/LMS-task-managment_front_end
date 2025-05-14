import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CreateTaskAchievement, GetAllTaskAchievements, UpdateTaskAchievement, DeleteTaskAchievement, GetAllUsers } from '../../service/api';

// Get badge emoji based on type
const getBadgeEmoji = (badge) => {
  switch (badge?.toLowerCase()) {
    case 'gold':
      return '🥇';
    case 'silver':
      return '🥈';
    case 'bronze':
      return '🥉';
    default:
      return '🏅';
  }
};

const AdminAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Fetch all achievements and users
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const achievementData = await GetAllTaskAchievements();
      const userData = await GetAllUsers();
      setUsers(userData);

      // Map achievements with corresponding usernames from userData
      const updatedAchievements = achievementData.map((achievement) => {
        const user = userData.find((u) => u._id === achievement.user);
        return {
          ...achievement,
          username: user ? user.username : 'Unknown', // Ensure username is populated
        };
      });
      setAchievements(updatedAchievements);
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
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditing && currentAchievement) {
        await UpdateTaskAchievement(currentAchievement._id, {
          title: data.title,
          description: data.description,
          badge: data.badge,
          userId: data.userId,
        });
      } else {
        await CreateTaskAchievement({
          title: data.title,
          description: data.description,
          badge: data.badge,
          userId: data.userId,
        });
      }
      await fetchData(); // Refresh data after create/update
      reset();
      setShowForm(false);
      setShowEditModal(false);
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
    setShowEditModal(true);
    // Reset form and set initial values
    reset({
      title: achievement.title,
      description: achievement.description,
      badge: achievement.badge,
      userId: achievement.user,
    });
    setValue('userId', achievement.user);
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

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setShowEditModal(false);
    setIsEditing(false);
    setCurrentAchievement(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Import Fonts via Inline Style (or add to your CSS file) */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&family=Poppins:wght@400;500&display=swap');

          h1, h2 {
            font-family: 'Plus Jakarta Sans', sans-serif;
          }

          body, p, label, button, select, textarea, input, div {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manage Certificates</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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

      {/* Create Form */}
      {showForm && !showEditModal && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-yellow-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Certificate</h2>
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

            <div>
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
            </div>

            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                User *
              </label>
              <select
                id="userId"
                {...register('userId', { required: 'User is required' })}
                className={`w-full px-3 py-2 border rounded-md border-gray-300 ${errors.userId ? 'border-red-500' : ''}`}
                disabled={isLoading}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                Create Certificate
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-100 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Certificate</h2>
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

              <div>
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
              </div>

              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  User *
                </label>
                <select
                  id="userId"
                  {...register('userId', { required: 'User is required' })}
                  className={`w-full px-3 py-2 border rounded-md border-gray-300 ${errors.userId ? 'border-red-500' : ''}`}
                  disabled={true} // Disable user change in edit mode
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  Update Certificate
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {achievements.length === 0 && !isLoading ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          No Certificates yet. Click "Create Certificate" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement._id}
              id={`achievement-card-${achievement._id}`}
              className="rounded-lg overflow-hidden shadow-md bg-yellow-50 border border-yellow-100 relative"
            >
              <div className="p-4">
                <div className="flex items-start mb-3">
                  <div className="mr-3">
                    <span className="text-2xl">{getBadgeEmoji(achievement.badge)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{achievement.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {achievement.description || `Completed ${achievement.title}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-yellow-200">
                  <div className="text-sm text-gray-500">
                    🏆 Awarded to: {achievement.username || 'Unknown'} on {formatDate(achievement.assignedAt)}
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(achievement)}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-5.657-5.657a2 2 0 112.828-2.828l2.829 2.829" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(achievement._id)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors duration-200"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAchievements;