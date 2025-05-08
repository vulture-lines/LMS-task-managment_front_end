import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { CourseProgressGet, GetCourseEnrollment } from "../../service/api";

function CourseProgressReport() {
  const [filterText, setFilterText] = useState("");
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [purchasedCoursesProgress, setPurchasedCoursesProgress] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const userData = JSON.parse(localStorage.getItem("loginData"));

      try {
        const data = await GetCourseEnrollment({ userId: userData.user._id });

        const enrolledCourses = data.enrolledCourses || [];
        const courseIds = enrolledCourses.map((item) => item.courseId._id);

        setPurchasedCourses(courseIds);

        const courseProgressArray = [];

        for (const course of enrolledCourses) {
          const res = await CourseProgressGet({
            userId: userData.user._id,
            courseId: course.courseId._id,
          });

          courseProgressArray.push({
            id: course.courseId._id,
            title: course.courseId.title,
            enrolledDate: course.courseId.enrolledAt,
            thumbnail: course.courseId.thumbnail,
            percentage: res.progress?.percentage || 0,
          });
        }

        setPurchasedCoursesProgress(courseProgressArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  console.log("purchasedCoursesProgress", purchasedCoursesProgress);
  console.log("purchasedCourses", purchasedCourses);

  const filteredCourses = purchasedCoursesProgress.filter((course) =>
    course.title.toLowerCase().includes(filterText)
  );

  return (
    <>
      <PageHeader title={"Course Progress"} />
      <div className="px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between lg:items-center mb-4 gap-4">
          <h3 className="text-bases font-medium">Report</h3>
          <input
            type="text"
            placeholder="Search course"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value.toLowerCase())}
            className="bg-white px-3 py-1 text-black shadow rounded-md"
          />
        </div>
        <ProgressReportTable progressReport={filteredCourses} />
      </div>
    </>
  );
}

export default CourseProgressReport;

const ProgressReportTable = ({ progressReport }) => {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full rounded-md">
          <thead>
            <tr className="bg-green-600 text-white text-sm font-medium h-10 text-left divide-x divide-gray-200">
              <th className="px-2">COURSE</th>
              <th className="px-2 w-24">PROGRESS</th>
              <th className="px-2 w-24">SCORE</th>
              <th className="px-2 w-56">EXPIRY OF THE COURSE</th>
              <th className="px-2 w-24">PERCENTILE</th>
              {/* <th className="px-2 w-32">TIME SPENT</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-x divide-gray-200">
            {progressReport.map((report) => (
              <tr
                key={report.id}
                className="bg-white text-black font-base h-10 divide-x divide-gray-200"
              >
                <td className="px-2">{report.title}</td>
                <td className="px-2">{report.percentage}%</td>
                <td className="px-2">85%</td>{" "}
                {/* Replace with dynamic value if available */}
                <td className="px-2">2024-12-31</td>{" "}
                {/* Replace if actual expiry is available */}
                <td className="px-2">90%</td>
                {/* <td className="px-2">10 hours</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-4">
        {progressReport.map((report) => (
          <div
            key={report.id}
            className="grid grid-cols-2 shadow rounded-md p-4 gap-2 text-sm w-full bg-white"
          >
            <label className="font-semibold">Course</label>
            <p>{report.title}</p>

            <label className="font-semibold">Progress</label>
            <p>{report.percentage}%</p>

            <label className="font-semibold">Score</label>
            <p>85%</p>

            <label className="font-semibold">Expiry of the course</label>
            <p>2024-12-31</p>

            <label className="font-semibold">Percentile</label>
            <p>90%</p>

            <label className="font-semibold">Time Spent</label>
            <p>10 hours</p>
          </div>
        ))}
      </div>
    </>
  );
};
