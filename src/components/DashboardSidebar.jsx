import { LogOutIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Logout } from "../service/api";

function DashboardSidebar({ NavLinks }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const HandleLogout = async () => {
    try {
      const res = await Logout();
      if (!res) {
        alert("Logout failed. Redirecting to home.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // alert("An error occurred during logout.");
    } finally {
      navigate("/");
    }
  };
  return (
    <>
      <div
        className={`sticky top-0 left-0 z-40 h-dvh flex flex-col duration-500 transition ease-in-out bg-neutral-100 ${
          isOpen ? "min-w-2xs" : ""
        }`}
      >
        <button
          className={`size-10 rounded-full border-none flex items-center justify-center shadow absolute -right-5  top-2 cursor-pointer ${
            isOpen ? "bg-green-600 text-white" : "bg-white"
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
        <div className="h-14 px-4 flex items-center ">
          <h1 className="font-medium text-2xl">{isOpen ? "LAW" : "L"}</h1>
        </div>
        <div className="flex flex-col justify-between  p-2 h-full">
          <div className="flex flex-col gap-2">
            {NavLinks.map((navLink) => (
              <Link
                key={navLink.label}
                to={navLink.path}
                className={`flex gap-2 lg:px-4 px-2 py-2 items-center border-r-4 border-green-700/0 rounded-md  ${
                  location.pathname === navLink.path
                    ? "border-green-700/100 text-green-700 bg-white  shadow-2xl"
                    : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                {navLink.icon}
                <span className={` ${isOpen ? "block" : "hidden"}`}>
                  {navLink.label}
                </span>
              </Link>
            ))}
          </div>
          <button
            className="flex items-center gap-2 hover:font-semibold hover:bg-green-600 lg:px-4 px-2 py-2 rounded-md hover:text-white"
            onClick={() => HandleLogout()}
          >
            <LogOutIcon />
            <span className={`font-medium ${isOpen ? "block" : "hidden"} `}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

export default DashboardSidebar;
