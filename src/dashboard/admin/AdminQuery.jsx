import React, { useState, useEffect } from 'react';
import { GetAllQueries, UpdateQuery, DeleteQuery } from '../../service/api';

const AdminQueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentQuery, setCurrentQuery] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    meetingLink: '',
    meetingTime: '',
    expiresAt: '',
    responseMessage: '',
    notes: ''
  });

  // Fetch all queries using GetAllQueries API
  useEffect(() => {
    const fetchQueries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await GetAllQueries();
        setQueries(data);
      } catch (err) {
        setError(err.message || "Failed to load queries");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (currentQuery) {
        // Update existing query
        const updateData = {
          meetingLink: formData.meetingLink,
          meetingTime: formData.meetingTime,
          expiresAt: formData.expiresAt,
          responseMessage: formData.responseMessage,
          notes: formData.notes
        };
        const updatedQuery = await UpdateQuery(currentQuery._id, updateData);
        setQueries(queries.map(query =>
          query._id === updatedQuery.ticket._id ? updatedQuery.ticket : query
        ));
      }
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to update query");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      meetingLink: '',
      meetingTime: '',
      expiresAt: '',
      responseMessage: '',
      notes: ''
    });
    setShowForm(false);
    setCurrentQuery(null);
  };

  const handleEdit = (query) => {
    setCurrentQuery(query);
    setFormData({
      meetingLink: query.meetingLink || '',
      meetingTime: query.meetingTime || '',
      expiresAt: query.expiresAt || '',
      responseMessage: query.responseMessage || '',
      notes: query.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await DeleteQuery(id);
      setQueries(queries.filter(query => query._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete query");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Queries Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 sm:mb-6 text-sm sm:text-base">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-500 py-4 text-sm sm:text-base">Loading...</div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Update Query</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Link
                </label>
                <input
                  type="text"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  placeholder="e.g., https://meet.google.com/rdj-fmkb-huk"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Time (Unix timestamp)
                </label>
                <input
                  type="number"
                  name="meetingTime"
                  value={formData.meetingTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  placeholder="e.g., 12"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Unix timestamp)
                </label>
                <input
                  type="number"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  placeholder="e.g., 9"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Message
                </label>
                <input
                  type="text"
                  name="responseMessage"
                  value={formData.responseMessage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  placeholder="e.g., attend the meeting"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  placeholder="e.g., none"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base"
                disabled={isLoading}
              >
                Update
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm sm:text-base"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-green-500 text-white uppercase text-xs sm:text-sm">
              <th className="px-4 sm:px-6 py-3 text-left">Student Name</th>
              <th className="px-4 sm:px-6 py-3 text-left">Title</th>
              <th className="px-4 sm:px-6 py-3 text-left">Issue</th>
              <th className="px-4 sm:px-6 py-3 text-left">Course ID</th>
              <th className="px-4 sm:px-6 py-3 text-left">Course Title</th>
              <th className="px-4 sm:px-6 py-3 text-left">Status</th>
              <th className="px-4 sm:px-6 py-3 text-left">Mentor</th>
              <th className="px-4 sm:px-6 py-3 text-left">Meeting Link</th>
              <th className="px-4 sm:px-6 py-3 text-left">Response Message</th>
              <th className="px-4 sm:px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {queries.length === 0 && !isLoading ? (
              <tr>
                <td colSpan="10" className="px-4 sm:px-6 py-4 text-center text-gray-500 text-sm">
                  No queries found.
                </td>
              </tr>
            ) : (
              queries.map(query => (
                <tr key={query._id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 text-sm">{query.studentName}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{query.title}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{query.issue}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{query.course}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{query.courseTitle || 'N/A'}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${
                      query.status === 'Accepted' 
                        ? 'text-green-800 bg-green-100' 
                        : 'text-yellow-800 bg-yellow-100'
                    } rounded-full`}>
                      {query.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{query.mentorName || query.acceptedBy || 'Not Assigned'}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">
                    {query.meetingLink ? (
                      <a href={query.meetingLink} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">
                        Open Link
                      </a>
                    ) : (
                      'No Link'
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{query.responseMessage || '-'}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleEdit(query)}
                        className="px-3 sm:px-4 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 text-xs sm:text-sm"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(query._id)}
                        className="px-3 sm:px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {queries.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 py-4 text-sm">
            No queries found.
          </div>
        ) : (
          queries.map(query => (
            <div key={query._id} className="bg-white rounded-lg shadow-md p-4">
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-sm">Student Name:</span> {query.studentName}
                </div>
                <div>
                  <span className="font-medium text-sm">Title:</span> {query.title}
                </div>
                <div>
                  <span className="font-medium text-sm">Issue:</span> {query.issue}
                </div>
                <div>
                  <span className="font-medium text-sm">Course ID:</span> {query.course}
                </div>
                <div>
                  <span className="font-medium text-sm">Course Title:</span> {query.courseTitle || 'N/A'}
                </div>
                <div>
                  <span className="font-medium text-sm">Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs ${
                    query.status === 'Accepted' 
                      ? 'text-green-800 bg-green-100' 
                      : 'text-yellow-800 bg-yellow-100'
                  } rounded-full`}>
                    {query.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-sm">Mentor:</span> {query.mentorName || query.acceptedBy || 'Not Assigned'}
                </div>
                <div>
                  <span className="font-medium text-sm">Meeting Link:</span>{' '}
                  {query.meetingLink ? (
                    <a href={query.meetingLink} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-sm">
                      Open Link
                    </a>
                  ) : (
                    'No Link'
                  )}
                </div>
                <div>
                  <span className="font-medium text-sm">Response Message:</span> {query.responseMessage || '-'}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleEdit(query)}
                    className="flex-1 px-3 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 text-sm"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(query._id)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminQueriesPage;