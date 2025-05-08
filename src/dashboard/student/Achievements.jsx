import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { GetCourseAchievementsByUserId } from '../../service/api'; // Import the new API function

// Utility function to format date
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

// Badge color mapping
const getBadgeColor = (badge) => {
  switch (badge?.toLowerCase()) {
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'silver':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'bronze':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-green-100 text-green-800 border-green-200';
  }
};

// Download achievement as JSON
const handleDownload = (achievement) => {
  const achievementData = {
    Title: achievement.title,
    Description: achievement.description,
    Badge: achievement.badge,
    'Assigned To': achievement.username,
    'Assigned By': achievement.assignedByUsername,
    'Assigned At': formatDate(achievement.assignedAt),
  };
  const blob = new Blob([JSON.stringify(achievementData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${achievement.title.replace(/\s+/g, '_')}_achievement.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Mock current user ID and token (replace with actual values from auth context)
  const currentUserId = '680373b6c9e849266316e9da'; // Example: ajit1's ID
  const authToken = 'your-jwt-token-here'; // Replace with actual token from auth context

  useEffect(() => {
    const fetchAchievements = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await GetCourseAchievementsByUserId(currentUserId, authToken);
        setAchievements(data); // API already filters by userId, no client-side filtering needed
      } catch (err) {
        setError(err.message || 'Failed to load course achievements');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAchievements();
  }, [currentUserId, authToken]);

  return (
    <>
      <PageHeader title="Tasks Achievements" />
      <div className="container mx-auto px-6 py-8">
        {isLoading && <div className="text-center text-gray-500">Loading...</div>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
            {error}
          </div>
        )}

        {achievements.length === 0 && !isLoading ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            No Task achievements yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-1">
                  <div
                    className={`${getBadgeColor(achievement.badge)} text-xs font-medium px-2.5 py-0.5 rounded-full inline-block ml-2 mt-2 border`}
                  >
                    {achievement.badge.charAt(0).toUpperCase() + achievement.badge.slice(1)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                    {achievement.title}
                  </h3>
                  <div className="h-24 overflow-hidden">
                    <p className="text-gray-600 text-sm">{achievement.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Award className="w-4 h-4 mr-1 text-green-500" />
                      <span className="truncate">{achievement.username || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
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
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="truncate">{formatDate(achievement.assignedAt)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleDownload(achievement)}
                      className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors duration-200"
                      title="Download"
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
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
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