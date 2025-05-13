import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CreateAnnouncement, GetAllAnnouncements, UpdateAnnouncement, DeleteAnnouncement } from '../../service/api';

const AdminAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to fetch announcements
  const refreshAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await GetAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || "Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all announcements on mount
  useEffect(() => {
    refreshAnnouncements();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditing && currentAnnouncement) {
        // Update existing announcement
        await UpdateAnnouncement(currentAnnouncement._id, {
          ...data,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new announcement
        await CreateAnnouncement({
          ...data,
          creator: "68033770c2c0584a3b4af07e", // Replace with actual logged-in user ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: []
        });
      }
      // Refresh announcements
      await refreshAnnouncements();
      reset();
      setShowForm(false);
      setIsEditing(false);
      setCurrentAnnouncement(null);
    } catch (err) {
      setError(err.message || "Failed to save announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setCurrentAnnouncement(announcement);
    setIsEditing(true);
    setShowForm(true);
    reset({
      title: announcement.title,
      message: announcement.message,
      isPinned: announcement.isPinned,
      expiresAt: announcement.expiresAt?.split('T')[0]
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    setIsLoading(true);
    setError(null);
    try {
      await DeleteAnnouncement(id);
      // Refresh announcements
      await refreshAnnouncements();
    } catch (err) {
      console.error("Delete announcement error:", err);
      setError(err.message || "Failed to delete announcement. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setIsEditing(false);
    setCurrentAnnouncement(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manage Announcements</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={isLoading}
          >
            Create Announcement
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
            {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                {...register("title", { required: "Title is required" })}
                className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                rows={4}
                {...register("message", { required: "Message is required" })}
                className={`w-full px-3 py-2 border rounded-md ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="isPinned"
                type="checkbox"
                {...register("isPinned")}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
                Pin this announcement
              </label>
            </div>
            
            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date (optional)
              </label>
              <input
                id="expiresAt"
                type="date"
                {...register("expiresAt")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
              >
                {isEditing ? 'Update' : 'Create'} Announcement
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

      <div className="space-y-6">
        {announcements.length === 0 && !isLoading ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            No announcements yet. Click "Create Announcement" to add one.
          </div>
        ) : (
          announcements.map(announcement => (
            <div key={announcement._id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{announcement.title}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-gray-500 hover:text-green-600"
                      title="Edit"
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="p-2 text-gray-500 hover:text-red-600"
                      title="Delete"
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{announcement.message}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 border-t pt-3 mt-3">
                  <div className="mb-2 sm:mb-0">
                    <span>Posted by: {announcement.creator?.username || 'Unknown'}</span>
                  </div>
                  <div>
                    <span>Posted on {formatDate(announcement.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncement;