import {
  Home,
  BookOpen,
  Info,
  Phone,
  LogIn,
  School,
  Scale,
} from "lucide-react";
import { useNavigate } from "react-router";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow-md sticky top-0 z-50">
      <nav className=" px-6 py-4 flex justify-between items-center container mx-auto">
        {/* Logo */}
        <div className="text-2xl font-bold text-green-600 flex items-center space-x-2">
          <Scale /> <span>LawEdu</span>
        </div>

        {/* Nav Links */}
        <div className=" items-center space-x-6 hidden md:flex">
          <NavItem icon={<Home size={18} />} label="Home" />
          <NavItem icon={<BookOpen size={18} />} label="Courses" />
          <NavItem icon={<Info size={18} />} label="About" />
          <NavItem icon={<Phone size={18} />} label="Contact Us" />
        </div>

        {/* Login Button */}
        <button
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => navigate("/login")}
        >
          <LogIn size={18} />
          Login
        </button>
      </nav>
    </div>
  );
};

// Reusable NavItem Component
const NavItem = ({ icon, label }) => (
  <a
    href="#"
    className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition"
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </a>
);

export default Navbar;
