import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { GetUserTestResults, GetCourseEnrollment } from "../../service/api";
import { useNavigate } from "react-router-dom";

const UserInfo = JSON.parse(localStorage.getItem("loginData"));

function ExamPage() {
  const navigate = useNavigate();
  const [marksData, setMarksData] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!UserInfo?.user?._id) {
          throw new Error("User not logged in");
        }

        // Fetch purchased courses
        const enrollmentData = await GetCourseEnrollment({ userId: UserInfo.user._id });
        const enrolledCourses = enrollmentData.enrolledCourses || [];
        const courseData = enrolledCourses.map((item) => ({
          id: item.courseId._id,
          title: item.courseId.title,
          thumbnail: item.courseId.thumbnail,
        }));
        setPurchasedCourses(courseData);

        // Fetch test results
        const results = await GetUserTestResults(UserInfo.user._id);
        const formattedResults = results.flatMap((result) =>
          result.attempts.map((attempt) => ({
            courseId: result.courseId,
            courseTitle: result.courseTitle,
            sublessonTitle: result.sublessonTitle,
            marks: attempt.score,
            totalMarks: result.totalMarks,
            percentage: attempt.percentage,
            bestPercentage: result.bestPercentage,
            rank: result.rank,
            timestamp: attempt.submittedAt,
          }))
        );
        setMarksData(formattedResults);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate best marks per course
  const bestMarksByCourse = purchasedCourses.map((course) => {
    const courseResults = marksData.filter((result) => result.courseId === course.id);
    const bestPercentage = courseResults.length > 0
      ? Math.max(...courseResults.map((result) => result.bestPercentage))
      : 0;
    return {
      courseId: course.id,
      courseTitle: course.title,
      bestPercentage,
    };
  });

  const clearResults = () => {
    setMarksData([]);
    setSelectedCourseId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={"Exam Results"} />
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Purchased Courses Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Purchased Courses</h2>
          {purchasedCourses.length === 0 ? (
            <p className="text-gray-600">No courses purchased.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {purchasedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  bestPercentage={bestMarksByCourse.find((c) => c.courseId === course.id)?.bestPercentage || 0}
                  setSelectedCourseId={setSelectedCourseId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detailed Results Section */}
        {selectedCourseId && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                Test Results for {bestMarksByCourse.find((c) => c.courseId === selectedCourseId)?.courseTitle}
              </h2>
              <div className="flex gap-4">
                {marksData.length > 0 && (
                  <button
                    onClick={clearResults}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Clear All Results
                  </button>
                )}
                <button
                  onClick={() => setSelectedCourseId(null)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close Details
                </button>
              </div>
            </div>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Best Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempt Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marksData
                    .filter((result) => result.courseId === selectedCourseId)
                    .map((result, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.sublessonTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.marks} / {result.totalMarks} ({result.percentage}%)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.bestPercentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(result.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// CourseCard component
const CourseCard = ({ course, bestPercentage, setSelectedCourseId }) => {
  return (
    <div className="p-6 bg-white flex flex-col items-start gap-2 w-full shadow max-w-[350px] rounded-md">
      <p className="text-xs font-semibold bg-green-200 px-2 py-1 inline rounded-full">
        Course
      </p>
      <div className="bg-green-200 w-full h-20 rounded-md mt-2">
        <img
          src={course.thumbnail}
          alt="course thumbnail"
          className="h-full w-full object-center object-cover rounded-md"
        />
      </div>
      <p className="font-semibold">{course.title}</p>
      <p className="text-sm text-gray-600">Best Score: {bestPercentage}%</p>
      <button
        className="bg-blue-500 text-white px-2 py-1 flex items-center gap-2 rounded-md cursor-pointer"
        onClick={() => setSelectedCourseId(course.id)}
      >
        <span className="text-sm">View Details</span>
      </button>
    </div>
  );
};

export default ExamPage;