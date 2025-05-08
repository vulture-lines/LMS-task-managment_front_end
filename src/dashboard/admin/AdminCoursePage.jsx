import { BookOpen, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import course from "../../api/course.json";
function AdminCoursePage() {
  const data = useLoaderData();
  console.log("Courses", data);

  const navigate = useNavigate();
  const [courses, SetCourses] = useState(data);
  useEffect(() => {
    const FetchCourses = async () => {
      try {
        if (courses === null) {
          const data = course;
          SetCourses(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    FetchCourses();
  }, [course]);

  console.log(courses);

  return (
    <>
      <div className="p-4 flex flex-col gap-4">
        <div className="header flex justify-between items-center">
          <h3 className="text-2xl tracking-tighter">Courses</h3>
          <button
            className="flex items-center bg-green-600 text-white p-2 rounded-full"
            onClick={() => navigate("/admin/courses/new")}
          >
            <Plus className="h-5" />
            <span className="text-base hidden md:block cursor-pointer">
              Add Course
            </span>
          </button>
        </div>
        {/* list of Courses */}
        <div className="">
          <CourseList courses={courses} />
        </div>
      </div>
    </>
  );
}

export default AdminCoursePage;

const CourseList = ({ courses }) => {
  return (
    <>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {courses?.length > 0 ? (
          <>
            {courses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </>
        ) : (
          <>Courses unavailable</>
        )}
      </div>
    </>
  );
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className=" rounded-lg shadow-sm p-4 flex flex-col gap-4 items-start hover:shadow-2xl group bg-white">
        <div className="w-full h-40 relative overflow-hidden rounded-md">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="bg-green-50 object-cover object-center w-full h-full rounded-md overflow-hidden group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/vite.svg";
            }}
          />
          <span className="absolute top-3 left-3 text-xs font-semibold bg-green-600 text-white px-2 py-1 tracking-wider rounded-md">
            Course
          </span>
        </div>
        <div className="flex justify-between w-full">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium leading-6">{course.title}</h3>
            <p className="flex items-center text-sm font-medium gap-1">
              <BookOpen className="h-5 mb-0" />
              Lessons {course?.lessons?.length || 0}
            </p>
          </div>
        </div>
        <button
          className="bg-green-600 text-white px-3 py-1 font-medium rounded-lg"
          onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
        >
          Edit
        </button>
      </div>
    </>
  );
};
