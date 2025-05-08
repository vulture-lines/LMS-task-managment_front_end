// import { useEffect, useState } from "react";
// import PageHeader from "../../components/PageHeader";
// import TemplateCourses from "../../api/course.json";
// import CourseList from "../../components/CourseList";
// import { GetAllCourses, GetCourseEnrollment } from "../../service/api";
// const UserInfo = JSON.parse(localStorage.getItem("loginData"));
// function CoursePage() {
//   const [courses, setCourses] = useState([]);
//   const [purchasedCoursesIds, setPurchasedCoursesIds] = useState([]);
//   useEffect(() => {
//     const fetchCourse = async () => {
//       try {
//         const data = await GetAllCourses();
//         setCourses(data);
//       } catch (error) {
//         console.error();
//         error;
//       }
//     };
//     const fetchEnrolledCourses = async () => {
//       try {
//         const data = await GetCourseEnrollment({ userId: UserInfo.user._id });
//         const courseIds = data.enrolledCourses.map((item) => item.courseId._id);
//         // JSON.parse(localStorage.getItem("purchasedCourses") || "[]");
//         setPurchasedCoursesIds(courseIds);
//       } catch (error) {
//         console.error("Error fetching enrolled courses:", error);
//       }
//     };
//     fetchCourse();
//     fetchEnrolledCourses();
//   }, []);

//   const purchasedCourses = courses.filter((course) =>
//     purchasedCoursesIds.includes(course._id)
//   );

//   const unPurchasedCourses = courses.filter(
//     (course) => !purchasedCoursesIds.includes(course._id)
//   );

//   return (
//     <>
//       <PageHeader title={"Course"} />
//       {purchasedCourses.length > 0 && (
//         <div className="px-4 lg:px-8 py-4 rounded-md mb-4">
//           <h2 className="text-lg font-semibold text-green-800">
//             Purchased Courses
//           </h2>
//           <div className="mt-4">
//             <CourseList courses={purchasedCourses} />
//           </div>
//         </div>
//       )}
//       <div className="px-4 lg:px-8 py-4 rounded-md mb-4">
//         <h2 className="text-lg font-semibold text-green-800">
//           Recommended Courses
//         </h2>
//         <div className="mt-4">
//           <CourseList courses={unPurchasedCourses} />
//         </div>
//       </div>
//     </>
//   );
// }

// export default CoursePage;

import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import CourseList from "../../components/CourseList";
import { GetAllCourses, GetCourseEnrollment } from "../../service/api";

// TODO: Replace this with context or props in future
const UserInfo = JSON.parse(localStorage.getItem("loginData"));

function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [purchasedCoursesIds, setPurchasedCoursesIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const allCourses = await GetAllCourses();
        setCourses(allCourses);

        const enrollment = await GetCourseEnrollment({
          userId: UserInfo.user._id,
        });
        const courseIds = enrollment.enrolledCourses.map(
          (item) => item.courseId._id
        );
        setPurchasedCoursesIds(courseIds);
      } catch (error) {
        console.error("Error fetching courses or enrollments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const purchasedCourses = courses.filter((course) =>
    purchasedCoursesIds.includes(course._id)
  );

  const unPurchasedCourses = courses.filter(
    (course) => !purchasedCoursesIds.includes(course._id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={"Course"} />
      {purchasedCourses.length > 0 && (
        <div className="px-4 lg:px-8 py-4 rounded-md mb-4">
          <h2 className="text-lg font-semibold text-green-800">
            Purchased Courses
          </h2>
          <div className="mt-4">
            <CourseList courses={purchasedCourses} />
          </div>
        </div>
      )}
      <div className="px-4 lg:px-8 py-4 rounded-md mb-4">
        <h2 className="text-lg font-semibold text-green-800">
          Recommended Courses
        </h2>
        <div className="mt-4">
          <CourseList courses={unPurchasedCourses} />
        </div>
      </div>
    </>
  );
}

export default CoursePage;
