import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth.js";
import { logoutUser } from "../../store/authSlice.js";
import toast from "react-hot-toast";
import { HeartPulse, Menu, X, ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, role } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getDashboardLink = () => {
    if (role === "doctor") return "/doctor/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/patient/dashboard";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm group-hover:bg-primary-700 transition-colors">
              <HeartPulse size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Med<span className="text-primary-600">ora</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#specialties" className="text-sm text-slate-600 hover:text-primary-600 transition-colors font-medium">
              Specialties
            </a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-primary-600 transition-colors font-medium">
              How It Works
            </a>
            <a href="#about" className="text-sm text-slate-600 hover:text-primary-600 transition-colors font-medium">
              About
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-fade-in">
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      to="/patient/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User size={15} />
                      My Profile
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors px-4 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2 px-5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <a href="#specialties" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-600 hover:text-primary-600 py-2 font-medium">
              Specialties
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-600 hover:text-primary-600 py-2 font-medium">
              How It Works
            </a>
            <hr className="border-slate-100" />
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} className="block text-sm text-slate-600 hover:text-primary-600 py-2 font-medium">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-left text-sm text-danger py-2 font-medium">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-center text-sm">
                  Log In
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;