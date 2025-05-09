import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { GetUserTasksById } from '../../service/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function TaskProgressReport() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get login data from localStorage
  const loginData = JSON.parse(localStorage.getItem('loginData'));
  const currentUserId = loginData?.userId || '680373b6c9e849266316e9da'; // Fallback userId
  const token = loginData?.token;

  // Fetch user tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('All localStorage content:');
        Object.entries(localStorage).forEach(([key, value]) => 
          console.log(`Key: ${key}, Value: ${value}`)
        );
        console.log('loginData:', localStorage.getItem('loginData'));
        console.log('currentUserId:', currentUserId);
        console.log('token:', token);

        setLoading(true);
        setError(null);

        if (!token) throw new Error('Please log in to view your task progress');
        if (!currentUserId) throw new Error('User ID is missing');

        const response = await GetUserTasksById(currentUserId);
        console.log('API response:', response);

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

  // Calculate task counts
  const approvedTasks = tasks.filter(task => task.status?.toLowerCase() === 'approved').length;
  const inReviewTasks = tasks.filter(task => task.status?.toLowerCase() === 'in review').length;
  const resubmitTasks = tasks.filter(task => task.status?.toLowerCase() === 'resubmit').length;
  const notSubmittedTasks = tasks.filter(task => !task.mySubmission).length;

  // Pie chart data
  const pieData = {
    labels: ['Approved', 'In Review', 'Resubmit', 'Not Submitted'],
    datasets: [
      {
        data: [approvedTasks, inReviewTasks, resubmitTasks, notSubmittedTasks],
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0'],
        hoverBackgroundColor: ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0'],
      },
    ],
  };

  // Pie chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} tasks`,
        },
      },
    },
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p className="text-lg">{error}</p>
        <p className="text-sm mt-2">Please ensure you are logged in and try again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Your Task Progress</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white shadow-lg rounded-lg p-6 h-[400px]">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Task Status Overview</h2>
          <div className="w-full h-[320px]">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        {/* Cards Container (2x2 grid) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1: Approved Tasks */}
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center h-40">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Approved</h2>
            <p className="text-2xl font-bold text-blue-600">{approvedTasks}</p>
          </div>

          {/* Card 2: In Review Tasks */}
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center h-40">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">In Review</h2>
            <p className="text-2xl font-bold text-yellow-600">{inReviewTasks}</p>
          </div>

          {/* Card 3: Resubmit Tasks */}
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center h-40">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Resubmit</h2>
            <p className="text-2xl font-bold text-red-600">{resubmitTasks}</p>
          </div>

          {/* Card 4: Not Submitted Tasks */}
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center h-40">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Not Submitted</h2>
            <p className="text-2xl font-bold text-teal-600">{notSubmittedTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskProgressReport;