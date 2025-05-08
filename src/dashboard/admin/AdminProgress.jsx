import React, { useState, useEffect } from 'react';
import { GetAllCourseProgress } from '../../service/api';

// Simple PageHeader component
const PageHeader = ({ title }) => (
  <div className="bg-gray-100 py-6 px-4 lg:px-8">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
  </div>
);

// Component to display individual lesson details (for potential expansion)
const LessonDetails = ({ lesson }) => {
  return (
    <div className="ml-4 mt-2">
      <p className="text-sm text-gray-600">Lesson {lesson.lessonIndex + 1}</p>
      <p className="text-sm">Completion: {lesson.percentage}%</p>
      <p className="text-sm">Status: {lesson.isLessonCompleted ? "Completed" : "In Progress"}</p>
      <div className="ml-4">
        <p className="text-sm font-semibold">Sublessons:</p>
        {lesson.sublessons.map((sublesson) => (
          <p key={sublesson.sublessonIndex} className="text-sm">
            Sublesson {sublesson.sublessonIndex + 1}: {sublesson.isCompleted ? "Completed" : "Not Completed"}
          </p>
        ))}
      </div>
    </div>
  );
};

// ProgressReportTable component
const ProgressReportTable = ({ progressData, isLoading, error }) => {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="w-full rounded-md">
          <thead>
            <tr className="bg-green-600 text-white text-sm font-medium h-10 text-left divide-x divide-gray-200">
              <th className="px-2">COURSE</th>
              <th className="px-2 w-24">PROGRESS</th>
              <th className="px-2 w-24">COMPLETED LESSONS</th>
              <th className="px-2 w-56">USERNAME</th>
              <th className="px-2 w-24">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-x divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-4">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center text-red-700 py-4">
                  {error}
                </td>
              </tr>
            ) : progressData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-4">
                  No progress data available.
                </td>
              </tr>
            ) : (
              progressData.map(({ userId, username, progress }) => (
                <tr key={`${userId}-${progress.courseId}`} className="bg-white text-black font-base h-10 divide-x divide-gray-200">
                  <td className="px-2" data-cell="course">
                    {progress.courseTitle}
                  </td>
                  <td className="px-2" data-cell="progress">
                    {progress.percentage}%
                  </td>
                  <td className="px-2" data-cell="completedLessons">
                    {progress.completedLessonCount}
                  </td>
                  <td className="px-2" data-cell="username">
                    {username}
                  </td>
                  <td className="px-2" data-cell="status">
                    {progress.isCompleted ? "Completed" : "In Progress"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid View */}
      <div className="md:hidden flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-700 py-4">{error}</div>
        ) : progressData.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No progress data available.</div>
        ) : (
          progressData.map(({ userId, username, progress }) => (
            <div key={`${userId}-${progress.courseId}`} className="grid grid-cols-2 shadow rounded-md p-4 gap-2 text-sm w-full bg-white">
              <label className="font-semibold">Course</label>
              <p>{progress.courseTitle}</p>
              <label className="font-semibold">Progress</label>
              <p>{progress.percentage}%</p>
              <label className="font-semibold">Completed Lessons</label>
              <p>{progress.completedLessonCount}</p>
              <label className="font-semibold">Username</label>
              <p>{username}</p>
              <label className="font-semibold">Status</label>
              <p>{progress.isCompleted ? "Completed" : "In Progress"}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
};

// Main AdminProgress component
const AdminProgress = () => {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState(''); // 'users' or 'courses'
  const [selectedFilter, setSelectedFilter] = useState(''); // username or courseTitle
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  // Fetch all course progress
  useEffect(() => {
    const fetchProgressData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await GetAllCourseProgress();
        // Flatten the response to [{ userId, username, progress }, ...]
        const flattenedData = response.flatMap(user =>
          user.courseProgress.map(progress => ({
            userId: user._id,
            username: user.username,
            progress
          }))
        );
        setProgressData(flattenedData);
        setFilteredData(flattenedData);

        // Extract unique users and courses
        const uniqueUsers = [...new Set(response.map(user => user.username))].sort();
        const uniqueCourses = [...new Set(flattenedData.map(item => item.progress.courseTitle))].sort();
        setUsers(uniqueUsers);
        setCourses(uniqueCourses);
      } catch (err) {
        setError(err.message || "Failed to load progress data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgressData();
  }, []);

  // Handle filter type change
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setSelectedFilter('');
    setFilteredData(progressData); // Reset to all data
  };

  // Handle filter selection change
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedFilter(value);

    if (!value || value === 'All') {
      setFilteredData(progressData);
    } else if (filterType === 'users') {
      setFilteredData(progressData.filter(item => item.username === value));
    } else if (filterType === 'courses') {
      setFilteredData(progressData.filter(item => item.progress.courseTitle === value));
    }
  };

  // Calculate statistics
  const getStats = () => {
    if (!filterType || !selectedFilter || selectedFilter === 'All') {
      return null;
    }

    if (filterType === 'users') {
      const userCourses = progressData.filter(item => item.username === selectedFilter);
      const completedCourses = userCourses.filter(item => item.progress.isCompleted).length;
      return (
        <div className="mb-4 p-4 bg-white shadow rounded-md">
          <h3 className="text-lg font-semibold">User Statistics</h3>
          <p>Completed Courses: {completedCourses}</p>
          <p>Total Courses: {userCourses.length}</p>
        </div>
      );
    } else if (filterType === 'courses') {
      const courseUsers = progressData.filter(item => item.progress.courseTitle === selectedFilter);
      const completedUsers = courseUsers.filter(item => item.progress.isCompleted).length;
      const inProgressUsers = courseUsers.filter(item => !item.progress.isCompleted).length;
      return (
        <div className="mb-4 p-4 bg-white shadow rounded-md">
          <h3 className="text-lg font-semibold">Course Statistics</h3>
          <p>Completed by: {completedUsers} users</p>
          <p>In Progress: {inProgressUsers} users</p>
          <p>Total Users: {courseUsers.length}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <PageHeader title="Course Progress" />
      <div className="px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between lg:items-center mb-4 gap-4">
          <h3 className="text-base font-medium">Report</h3>
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={handleFilterTypeChange}
              className="bg-white px-3 py-2 text-black shadow rounded-md"
            >
              <option value="">Select Filter Type</option>
              <option value="users">Users</option>
              <option value="courses">Courses</option>
            </select>
            {filterType && (
              <select
                value={selectedFilter}
                onChange={handleFilterChange}
                className="bg-white px-3 py-2 text-black shadow rounded-md"
              >
                <option value="All">All</option>
                {(filterType === 'users' ? users : courses).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {getStats()}

        <ProgressReportTable
          progressData={filteredData}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </>
  );
};

export default AdminProgress;