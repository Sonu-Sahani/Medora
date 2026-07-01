import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth.js";
import { logoutUser } from "../../store/authSlice.js";
import toast from "react-hot-toast";
import {
  HeartPulse, LayoutDashboard, Calendar, FileText,
  User, LogOut, Menu, X, Stethoscope, Users,
  BarChart3, ChevronRight, Bell,
} from "lucide-react";

const patientNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/patient/dashboard" },
  { label: "Specialties", icon: Stethoscope, path: "/patient/specialties" },
  { label: "My Appointments", icon: Calendar, path: "/patient/appointments" },
  { label: "My Reports", icon: FileText, path: "/patient/reports" },
  { label: "Profile", icon: User, path: "/patient/profile" },
];

const doctorNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/doctor/dashboard" },
  { label: "Appointments", icon: Calendar, path: "/doctor/appointments" },
  { label: "Patient Records", icon: Users, path: "/doctor/records" },
  { label: "Create Report", icon: FileText, path: "/doctor/reports/create" },
  { label: "Profile Settings", icon: User, path: "/doctor/profile" },
];

const adminNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Manage Doctors", icon: Stethoscope, path: "/admin/doctors" },
  { label: "Manage Patients", icon: Users, path: "/admin/patients" },
  { label: "Appointments", icon: Calendar, path: "/admin/appointments" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
];

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems =
    role === "doctor"
      ? doctorNav
      : role === "admin"
      ? adminNav
      : patientNav;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <HeartPulse size={17} className="text-white" />
        </div>
        <span className="text-lg font-bold text-slate-800">
          Med<span className="text-primary-600">ora</span>
        </span>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
          <div className="h-9 w-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-primary-600 capitalize font-medium">
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <Icon size={17} className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"} />
              {label}
              {isActive && <ChevronRight size={14} className="ml-auto text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-danger transition-all duration-200 group"
        >
          <LogOut size={17} className="text-slate-400 group-hover:text-danger" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 w-64 bg-white h-full shadow-xl animate-slide-up">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 lg:flex-none" />

          {/* Topbar Right */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell size={18} className="text-slate-500" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger rounded-full" />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;