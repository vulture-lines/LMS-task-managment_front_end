import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { GetTaskAchievementsByUserId } from '../../service/api';

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'; // Fallback for missing date
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

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

// Extract category from title or use default
const getCategory = (title) => {
  const titleWords = title.split(' ');
  return 'Assignments';
};

function Achievements() {
  // Retrieve user info from localStorage
  let userInfo = {};
  try {
    userInfo = JSON.parse(localStorage.getItem('loginData')) || {};
  } catch (e) {
    console.error('Failed to parse loginData:', e);
  }
  const authToken = userInfo.token;
  const currentUserId = userInfo.user?._id;

  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!currentUserId || !authToken) {
        setError('Please log in to view achievements');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await GetTaskAchievementsByUserId(currentUserId, authToken);
        const validAchievements = Array.isArray(data)
          ? data.filter((achievement) => achievement && achievement._id && achievement.title)
          : [];
        setAchievements(validAchievements);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError(err.message || 'Failed to load task achievements');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAchievements();
  }, [currentUserId, authToken]);

  return (
    <>
      <PageHeader title="Task Achievements" />
      <div className="container mx-auto px-6 py-8 font-poppins" >
        {/* Loading state */}
        {isLoading && (
          <div className="text-center text-gray-500">Loading...</div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
            {error}
          </div>
        )}

        {/* Achievements list */}
        {achievements.length === 0 && !isLoading ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            No task achievements yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement._id}
                className="rounded-lg overflow-hidden shadow-md bg-yellow-50 border border-yellow-100 relative"
              >
                <div className="p-4">
                  <div className="flex items-start mb-3">
                    <div className="mr-3">
                      <span className="text-2xl">{getBadgeEmoji(achievement.badge)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 font-poppins">{achievement.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {achievement.description || `Completed ${achievement.title}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-yellow-200 font-poppins">
                    <div className="text-sm text-gray-500">
                      🏆 Earned on {formatDate(achievement.createdAt)}
                    </div>
                    <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-600 text-xs font-medium font-poppins">
                      {getCategory(achievement.title)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Achievements;