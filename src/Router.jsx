import { createBrowserRouter, Outlet } from "react-router";
// Landing
import Navbar from "./components/Navbar";
import Home from "./Home/Home";
// Authentication
import Login from "./authentication/Login";
import ForgotPassword from "./authentication/FogotPassword";
import ResetPassword from "./authentication/ResetPassword";

// Admin
import AdminLayout from "./dashboard/admin/AdminLayout";
import AdminDashboard from "./dashboard/admin/AdminDashboard";
import UserManagement from "./dashboard/admin/UserManagement";
import AdminCoursePage from "./dashboard/admin/AdminCoursePage";
import AddNewCourse from "./dashboard/admin/AddNewCourse";
import EditCourse from "./dashboard/admin/EditCourse";
import AdminAnnouncement from "./dashboard/admin/AdminAnnouncement";
import AdminNotification from "./dashboard/admin/AdminNotification";
import AdminCalendar from "./dashboard/admin/AdminCalendar";
import AdminAchievements from "./dashboard/admin/AdminAchievements";
import AdminProgress from "./dashboard/admin/AdminProgress";
import AdminQuery from "./dashboard/admin/AdminQuery";``
import AdminForumPage from "./dashboard/admin/AdminForumPage";
import AdminTask from "./dashboard/admin/AdminTask";
import AdminProfile from "./dashboard/admin/AdminProfile"

// Student
import StudentLayout from "./dashboard/student/StudentLayout";
import StudentDashboard from "./dashboard/student/StudentDashboard";
import CoursePage from "./dashboard/student/CoursePage";
import CourseDetail from "./dashboard/student/CourseDetail";
import CourseContent from "./dashboard/student/CourseContent";
import AnnouncementPage from "./dashboard/student/AnnouncementPage";
import Achievements from "./dashboard/student/Achievements";
import BigCalendar from "./dashboard/student/BigCalendar";
// import ExamPage from "./dashboard/student/ExamPage";
import TaskProgressReport from "./dashboard/student/TaskProgressReport";
import ForumPage from "./dashboard/student/StudentForumPage";
import { GetAllCourses, GetAllUsers } from "./service/api";
import Profile from "./dashboard/student/Profile";
import Query from "./dashboard/student/Query";
import Notification from "./dashboard/student/Notification";
import { Suspense } from "react";
import UserTask from "./dashboard/student/UserTask";

export const Router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <div className="flex flex-col h-screen bg-gray-100 relative">
          <Navbar />
          <Outlet />
        </div>
      </>
    ),
    children: [{ index: true, element: <Home /> }],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path:"forgotpassword",
    element:<ForgotPassword/>,
  
  },
  {
    path:"reset-password/:token",
    element:<ResetPassword/>
  },
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      { path: "", element: <AdminDashboard /> },
      {
        path: "users",
        element: <UserManagement />,
        loader: GetAllUsers,
        errorElement: <>Error</>,
      },
      {
        path: "courses",
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <AdminCoursePage />,
            loader: GetAllCourses,
            errorElement: <>Error</>,
          },
          {
            path: "new",
            element: <AddNewCourse />,
          },
          {
            path: "edit/:id",
            element: <EditCourse />,
          },
        ],
      },
      {
        path: "announcement",
        element: <AdminAnnouncement />,
      },
       {
        path: "notification",
        element: <AdminNotification />,
      },
      {
        path: "calendar",
        element: <AdminCalendar />,
      },
      {
        path: "achievement",
        element: <AdminAchievements />,
      },
      {
        path: "progress",
        element: <AdminProgress />,
      },
      {
        path: "query",
        element: <AdminQuery />,
      },
      {
        path: "forum",
        element: <AdminForumPage />,
      },
      {
        path: "task",
        element: <AdminTask />,
      },
      {
        path: "adminProfile",
        element: <AdminProfile />,
      },
    ],
  },
  {
    path: "student",
    element: <StudentLayout />,
    children: [
      {
        index: true,
        element: <StudentDashboard />,
      },
      {
        path: "course",
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <CoursePage />,
          },
          {
            path: ":id/detail",
            element: <CourseDetail />,
          },
          {
            path: ":id/content",
            element: <CourseContent />,
          },
          {
            path: ":id/test",
            element: <div className="">test</div>,
          },
        ],
      },
      {
        path: "announcement",
        element: <AnnouncementPage />,
      },
      {
        path: "achievements",
        element: <Achievements />,
      },
      {
        path: "calender",
        element: <BigCalendar />,
      },
      // {
      //   path: "exam",
      //   element: <ExamPage />,
      // },
      {
        path: "progressReport",
        element: <TaskProgressReport />,
      },
      {
        path: "forum",
        element: <ForumPage />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "Query",
        element: <Query />,
      },
      {
        path: "notification",
        element: <Notification />,
      },
      {
        path: "task",
        element: <UserTask />,
      },
    ],
  },
]);
