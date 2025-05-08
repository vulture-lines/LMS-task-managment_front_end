import React, { useState, useEffect } from 'react';
import { GetAllAnnouncements } from '../../service/api';

// Utility function to format date (reused from AdminAnnouncement)
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

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await GetAllAnnouncements();
        // Filter out expired announcements and sort
        const filteredData = data
          .filter(
            (announcement) =>
              !announcement.expiresAt || new Date(announcement.expiresAt) > new Date()
          )
          .sort((a, b) => {
            // Pinned first, then newest
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        setAnnouncements(filteredData);
      } catch (err) {
        setError(err.message || 'Failed to load announcements');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="text-center text-gray-500">Loading...</div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {announcements.length === 0 && !isLoading ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          No announcements available.
        </div>
      ) : (
        announcements.map((announcement) => (
          <div
            key={announcement._id}
            className="bg-white rounded-lg shadow-md overflow-hidden relative"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {announcement.title}
                  {announcement.isPinned && (
                    <span className="ml-2 text-sm text-green-600 font-semibold">
                      [Pinned]
                    </span>
                  )}
                </h2>
              </div>
              <p className="text-gray-600 mb-4">{announcement.message}</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 border-t pt-3 mt-3">
                <div className="mb-2 sm:mb-0">
                  <span>Posted by: {announcement.creator?.username || 'Unknown'}</span>
                </div>
                <div>
                  <span>Posted on {formatDate(announcement.createdAt)}</span>
                  {announcement.expiresAt && (
                    <span className="ml-4">
                      Expires on {formatDate(announcement.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnnouncementList;