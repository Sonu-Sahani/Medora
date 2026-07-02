import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Stethoscope, Calendar, FileText,
  IndianRupee, TrendingUp, ArrowRight, Activity,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getAdminDashboardStatsApi } from "../../api/admin.api.js";

const COLORS = ["#2563eb", "#0d9488", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-cardHover transition-all duration-300">
    <div className="flex items-center justify-between mb-3">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <TrendingUp size={14} className="text-slate-300" />
    </div>
    <p className="text-2xl font-extrabold text-slate-800">{value}</p>
    <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-primary-600 font-medium mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardStatsApi()
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  const trendData = stats?.appointmentTrend?.map((t) => ({
    date: new Date(t._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    appointments: t.count,
  })) || [];

  const statCards = [
    { label: "Total Doctors", value: stats?.totalDoctors ?? 0, icon: Stethoscope, color: "bg-primary-50 text-primary-600", sub: `${stats?.activeDoctors ?? 0} active` },
    { label: "Total Patients", value: stats?.totalPatients ?? 0, icon: Users, color: "bg-secondary-50 text-secondary-600", sub: "Registered users" },
    { label: "Total Appointments", value: stats?.totalAppointments ?? 0, icon: Calendar, color: "bg-purple-50 text-purple-600", sub: `${stats?.todayAppointments ?? 0} today` },
    { label: "Total Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-green-50 text-green-600", sub: "All time" },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <Activity size={120} />
        </div>
        <p className="text-primary-200 text-sm font-medium">Welcome back,</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name} 👋</h1>
        <p className="text-primary-200 text-sm mt-1">
          Here's what's happening on your platform today.
        </p>
        <button
          onClick={() => navigate("/admin/doctors")}
          className="mt-4 bg-white text-primary-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-1.5"
        >
          Manage Doctors
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Appointment Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Appointments (Last 7 Days)</h3>
          <p className="text-slate-400 text-xs mb-5">Daily appointment bookings trend</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="appointments"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: "#2563eb", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Specialty Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Doctors by Specialty</h3>
          <p className="text-slate-400 text-xs mb-5">Distribution across specialties</p>
          {stats?.specialtyDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.specialtyDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {stats.specialtyDistribution.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-300 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-base font-bold text-slate-800 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Manage Doctors", desc: "Add or edit doctors", icon: Stethoscope, color: "bg-primary-50 text-primary-600 border-primary-100", path: "/admin/doctors" },
          { label: "Manage Patients", desc: "View patient accounts", icon: Users, color: "bg-secondary-50 text-secondary-600 border-secondary-100", path: "/admin/patients" },
          { label: "All Appointments", desc: "Monitor bookings", icon: Calendar, color: "bg-purple-50 text-purple-600 border-purple-100", path: "/admin/appointments" },
        ].map(({ label, desc, icon: Icon, color, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-cardHover transition-all duration-300 text-left group"
          >
            <div className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Doctors */}
      {stats?.recentDoctors?.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Recently Added Doctors</h2>
            <button
              onClick={() => navigate("/admin/doctors")}
              className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {stats.recentDoctors.map((doc, i) => (
              <div
                key={doc._id}
                className={`flex items-center justify-between p-4 ${
                  i !== stats.recentDoctors.length - 1 ? "border-b border-slate-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {doc.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Dr. {doc.name}</p>
                    <p className="text-xs text-slate-400">{doc.specialty?.name}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  doc.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  <CheckCircle2 size={11} />
                  {doc.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;