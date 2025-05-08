import { useNavigate } from "react-router";
import CourseCard from "./CourseCard";
import { useEffect, useState } from "react";
import { GetCourseEnrollment } from "../service/api";
const UserInfo = JSON.parse(localStorage.getItem("loginData"));
function CourseList({ courses }) {
  const navigate = useNavigate();
  const [purchasedCoursesIds, setPurchasedCoursesIds] = useState([]);
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const data = await GetCourseEnrollment({ userId: UserInfo.user._id });
        const courseIds = data.enrolledCourses.map((item) => item.courseId._id);
        setPurchasedCoursesIds(courseIds);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      }
    };
    fetchEnrolledCourses();
  }, []);

  if (!Array.isArray(courses)) {
    return <div>No courses available</div>;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      {courses.map((course) => {
        const isPurchased = purchasedCoursesIds.includes(course._id);
        return (
          <div
            key={course._id}
            onClick={() => {
              navigate(
                isPurchased ? `${course._id}/content` : `${course._id}/detail`,
                { state: { course } }
              );
            }}
            className="cursor-pointer"
          >
            <CourseCard course={course} isPurchased={isPurchased} />
          </div>
        );
      })}
    </div>
  );
}

export default CourseList;
