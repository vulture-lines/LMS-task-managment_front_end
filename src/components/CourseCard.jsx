import { BookOpen } from "lucide-react";
function CourseCard({ course, isPurchased }) {
  return (
    <>
      <div className="rounded-lg shadow-sm p-4 flex flex-col gap-4 items-start hover:shadow-2xl group bg-white">
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
          {/* <div className="bg-gradient-to-t from-10% from-green-700/80 to-green-50/10 to-80% absolute w-full h-full top-0 rounded-md"></div> */}
          <span className="absolute top-3 left-3 text-xs font-semibold bg-green-600 text-white px-2 py-1 tracking-wider rounded-md">
            Course
          </span>
        </div>
        <div className="flex justify-between w-full">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium leading-6">{course.title}</h3>
            <p className="flex items-center text-sm font-medium gap-1">
              <BookOpen className="h-5 mb-0" />
              Lessons {course.lessons.length}
            </p>
          </div>
        </div>
        {isPurchased ? (
          <button className="bg-green-600 text-white px-3 py-1 font-medium rounded-lg">
            Continue
          </button>
        ) : (
          <button className="bg-green-600 text-white px-3 py-1 font-medium rounded-lg">
            View
          </button>
        )}
      </div>
    </>
  );
}

export default CourseCard;
