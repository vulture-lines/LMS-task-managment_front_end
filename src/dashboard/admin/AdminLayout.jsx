import { Outlet } from "react-router";
import DashboardSidebar from "../../components/DashboardSidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import { AwardIcon, Bell, BookOpen, Calendar, Home, Megaphone, MessagesSquare, Users } from "lucide-react";
import { BiAward, BiCertification } from "react-icons/bi";
import { GiProgression } from "react-icons/gi";
import { MdQueryBuilder, MdQueryStats } from "react-icons/md";
function AdminLayout() {
  const NavLinks = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <Home className="h-5" />,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: <Users className="h-5" />,
    },

    {
      path: "/admin/task",
      label: "task",
      icon: <MdQueryBuilder className="h-5" />,
    },
 
    {
      path: "/admin/calendar",
      label: "Calendar",
      icon: <Calendar className="h-5" />,
    },
    // {
    //   path: "/admin/progress",
    //   label: "Progress",
    //   icon: <GiProgression className="h-5" />,
    // },
    {
      path: "/admin/achievement",
      label: "Achievement",
      icon: <AwardIcon className="h-5" />,
    },
    {
      path: "/admin/announcement",
      label: "Announcements",
      icon: <Megaphone className="h-5" />,
    },
    {
      path: "/admin/forum",
      label: "Forum",
      icon: <MessagesSquare className="h-5" />,
    },
    {
      path: "/admin/query",
      label: "Query",
      icon: <MdQueryStats className="h-5" />,
    },
    {
      path: "/admin/notification",
      label: "Notification",
      icon: <Bell className="h-5" />,
    },
    
  ];
  return (
    <>
      <div className="relative flex w-full">
        <DashboardSidebar NavLinks={NavLinks} />
        <div className="flex-1 w-full relative">
          <div className="flex flex-col w-full">
            <DashboardNavbar />
            <div className="flex-1 h-[calc(100vh-4rem)]">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLayout;
