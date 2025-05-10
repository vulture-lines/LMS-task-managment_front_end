import { ArrowRightCircle, Check } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import TodoWidget from "../../components/TodoWedget";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
// import { GetCourseProgress, GetCourseEnrollment } from "../../service/api";

function StudentDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [purchasedCoursesProgress, setPurchasedCoursesProgress] = useState([]);
  console.log(userInfo);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const userData = JSON.parse(localStorage.getItem("loginData"));

  //     try {
  //       const data = await GetCourseEnrollment({ userId: userData.user._id });

  //       const enrolledCourses = data.enrolledCourses || [];
  //       const courseIds = enrolledCourses.map((item) => item.courseId._id);

  //       setPurchasedCourses(courseIds);

        // const courseProgressArray = [];

        // for (const course of enrolledCourses) {
        //   const res = await GetCourseProgress(userData.user._id, course.courseId._id);

          // const res = await GetCourseProgress({
          //   userId: userData.user._id,
          //   courseId: course.courseId._id,
          // });

      //     courseProgressArray.push({
      //       id: course.courseId._id,
      //       title: course.courseId.title,
      //       thumbnail: course.courseId.thumbnail,
      //       percentage: res.progress?.percentage || 0,
      //     });
      //   }

      //   setPurchasedCoursesProgress(courseProgressArray);
      // } catch (error) {
      //   console.error("Error fetching data:", error);
      // }
    // };

    // fetchData();
  // }, []);

  console.log("purchasedCoursesProgress", purchasedCoursesProgress);
  console.log("purchasedCourses", purchasedCourses);

  // Fetch user data from localStorage or API
  useEffect(() => {
    const storedData = localStorage.getItem("loginData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUserInfo(
          parsedData.user || {
            username: "Guest",
            id: "N/A",
            name: "Guest User",
            email: "N/A",
          }
        );
      } catch (error) {
        console.error("Error parsing loginData:", error);
        setUserInfo({
          username: "Guest",
          id: "N/A",
          name: "Guest User",
          email: "N/A",
        });
      }
    } else {
      setUserInfo({
        username: "Guest",
        id: "N/A",
        name: "Guest User",
        email: "N/A",
      });
    }
  }, []);

  console.log(purchasedCourses);

  // Get current timestamp
  const currentDate = new Date();
  const timestamp = `${currentDate.toLocaleDateString(
    "en-GB"
  )}, ${currentDate.toLocaleTimeString("en-GB", { hour12: false })}`;

  return (
    <div className="flex flex-col w-full relative">
      {/* Welcome Banner */}
      <div className="bg-teal-900 text-white p-4 rounded-lg flex justify-between items-center mb-4 mx-4 lg:mx-8">
        <div>
          <h2 className="text-lg font-semibold">
            Welcome to Trending, {userInfo?.username || "Guest"} 👋
          </h2>
          <p className="text-sm"> check your priority learning.</p>
        </div>
        <div className="bg-white text-black px-3 py-1 rounded-md text-sm">
          {timestamp}
        </div>
      </div>

      {/* Header and Banner Row */}
      <div className="px-4 lg:px-8 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"></div>
      <div className="px-4 lg:px-8 flex lg:flex-row flex-col gap-4 w-full">
        <div className="w-full flex-1 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="mb-4 font-semibold">Task in Progress</h3>
            {/* <button
              className="text-base rounded-md px-3 py-1 bg-green-500 text-white hover:bg-green-600 hover:text-green-50"
              onClick={() => navigate("/student/course")}
            >
              View
            </button> */}
          </div>
          <div className="flex gap-4">
            {purchasedCoursesProgress.map((course) => (
              <CourseProgressCard course={course} />
            ))}
          </div>
        </div>
        <TodoWidget />
      </div>
    </div>
  );
}

export default StudentDashboard;

const CourseProgressCard = ({ course }) => {
  const navigate = useNavigate();
  return (
    <div className="p-6 bg-white flex flex-col items-start gap-2 w-full shadow max-w-[350px] rounded-md">
      <p className="text-xs font-semibold bg-green-200 px-2 py-1 inline rounded-full">
        Course
      </p>
      <div className="bg-green-200 w-full h-20 rounded-md mt-2">
        <img
          src={course.thumbnail}
          alt="logo"
          className="h-full w-full object-center object-cover rounded-md"
        />
      </div>
      <p>{course.title}</p>
      <div className="flex flex-col lg:flex-row items-start gap-4 w-full">
        <div className="flex flex-col gap-2 items-end w-full">
          <p className="text-xs">{course.percentage}%</p>
          <div className="h-3 bg-green-300 relative w-full rounded-full overflow-hidden">
            <div
              className="absolute bg-green-700 left-0 h-full"
              style={{ width: `${course.percentage}%` }}
            ></div>
          </div>
        </div>
        <button
          className={`${
            course.percentage === 100 ? "bg-green-500" : "bg-blue-500"
          } text-white px-2 py-1 flex items-center gap-2 rounded-md cursor-pointer`}
          onClick={() => navigate(`/student/course/${course.id}/content`)}
        >
          <span className="text-sm">
            {course.percentage === 100 ? "Completed" : "Continue"}
          </span>
          {course.percentage === 100 ? <Check /> : <ArrowRightCircle />}
        </button>
      </div>
    </div>
  );
};
