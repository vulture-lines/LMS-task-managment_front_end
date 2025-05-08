import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell, Legend, Tooltip as PieTooltip } from "recharts";
import { GetAllCourses, GetAllUsers } from "../../service/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await GetAllUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchCourse = async () => {
      try {
        const data = await GetAllCourses();
        setCourses(data);
      } catch (error) {
        console.error();
        error;
      }
    };
    fetchUsers();
    fetchCourse();
  }, []);

  // Data for the charts
  const courseData = [
    { name: "Jan", purchased: 100 },
    { name: "Feb", purchased: 120 },
    { name: "Mar", purchased: 150 },
    { name: "Apr", purchased: 170 },
    { name: "May", purchased: 200 },
  ];

  const buyers = users.filter((user) => user.role === "Student").length;
  const totalCourses = courses.length;

  const pieData = [
    { name: "Courses", value: totalCourses },
    { name: "Buyers", value: buyers },
  ];

  const COLORS = ["#00C49F", "#FFBB28"];

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>
      </div>

      {/* Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Students Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <h2 className="text-sm md:text-lg font-semibold text-gray-700">
              Total Students
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">
              {buyers || 0}
            </p>
          </div>
          <div className="bg-blue-100 p-2 md:p-4 rounded-full">
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>

        {/* Courses Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <h2 className="text-sm md:text-lg font-semibold text-gray-700">
              Total Courses
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-yellow-600">
              {courses.length}
            </p>
          </div>
          <div className="bg-yellow-100 p-2 md:p-4 rounded-full">
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-yellow-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Line Chart: Course Purchases */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
            Courses Purchased
          </h2>
          <div className="h-64 sm:h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="purchased"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Courses vs Buyers */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
            Courses vs Buyers
          </h2>
          <div className="h-64 sm:h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <PieTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;