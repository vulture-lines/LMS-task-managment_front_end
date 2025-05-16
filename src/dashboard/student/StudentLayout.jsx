import { Outlet } from "react-router";
import DashboardSidebar from "../../components/DashboardSidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import {
  Award,
  BookOpen,
  Calendar,
  ClipboardCheck,
  ClipboardPenLine,
  Home,
  User,
  Megaphone,
  MessageCircleQuestion,
  MessagesSquare,
  Bell,
} from "lucide-react";
import { MdQueryBuilder } from "react-icons/md";
import { Suspense } from "react";

function StudentLayout() {
  const NavLinks = [
    {
      path: "/student",
      label: "Dashboard",
      icon: <Home className="h-5" />,
    },
    {
      path: "/student/task",
      label: "UserTask",
      icon: <MdQueryBuilder className="h-5" />,
    },

    {
      path: "/student/calender",
      label: "Calender",
      icon: <Calendar className="h-5" />,
    },
    // {
    //   path: "/student/exam",
    //   label: "Exam",
    //   icon: <ClipboardPenLine className="h-5" />,
    // },
    {
      path: "/student/progressReport",
      label: "Task Progress Report",
      icon: <ClipboardCheck className="h-5" />,
    },
    
    {
      path: "/student/achievements",
      label: "Achievements",
      icon: <Award className="h-5" />,
    },
    {
      path: "/student/announcement",
      label: "Announcement",
      icon: <Megaphone className="h-5" />,
    },
    {
      path: "/student/forum",
      label: "Forum",
      icon: <MessagesSquare className="h-5" />,
    },

    {
      path: "/student/query",
      label: "Query",
      icon: <MessageCircleQuestion className="h-5" />,
    },
  ];
  return (
    <>
      {/* <div className="relative flex w-full">
        <DashboardSidebar />
        <div className="flex-1 w-full relative">
          <div className="flex flex-col w-full">
            <DashboardNavbar />
            <div className="flex-1">
              <Outlet />
            </div>
          </div>
        </div>
      </div> */}
      <div className="relative flex w-full">
        <DashboardSidebar NavLinks={NavLinks} />
        <div className="w-full relative">
          <div className="flex flex-col">
            <DashboardNavbar />
            <div className="flex-1 h-[calc(100vh-4rem)]">
              <Suspense fallback={<Loading />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentLayout;

const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>
);
