import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Users, FileText, CheckCircle2,
  Clock, ArrowRight, TrendingUp, Activity, Trash2
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getDoctorDashboardStatsApi } from "../../api/doctor.api.js";
import { getDoctorDraftsApi, deleteReportApi } from "../../api/report.api.js"; // ADDED deleteReportApi
import toast from "react-hot-toast";

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

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDoctorDashboardStatsApi(), getDoctorDraftsApi()])
      .then(([statsRes, draftsRes]) => {
        setStats(statsRes.data.data);
        setDrafts(draftsRes.data.data);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteDraft = async (id) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
    try {
      await deleteReportApi(id);
      toast.success("Draft deleted successfully");
      setDrafts(drafts.filter((d) => d._id !== id));
    } catch {
      toast.error("Failed to delete draft");
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  const statCards = [
    { label: "Today's Appointments", value: stats?.todayAppointments ?? 0, icon: Calendar, color: "bg-primary-50 text-primary-600", sub: "Scheduled for today" },
    { label: "Pending", value: stats?.pendingAppointments ?? 0, icon: Clock, color: "bg-yellow-50 text-yellow-600", sub: "Awaiting completion" },
    { label: "Completed", value: stats?.completedAppointments ?? 0, icon: CheckCircle2, color: "bg-green-50 text-green-600", sub: "Total consultations" },
    { label: "Reports Created", value: stats?.totalReports ?? 0, icon: FileText, color: "bg-purple-50 text-purple-600", sub: "Medical reports" },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <Activity size={120} />
        </div>
        <p className="text-primary-200 text-sm font-medium">{greeting},</p>
        <h1 className="text-2xl font-bold mt-0.5">Dr. {user?.name} 👨‍⚕️</h1>
        <p className="text-primary-200 text-sm mt-1">
          You have{" "}
          <span className="text-white font-bold">{stats?.todayAppointments || 0}</span>{" "}
          appointment{stats?.todayAppointments !== 1 ? "s" : ""} today.
        </p>
        <button
          onClick={() => navigate("/doctor/appointments")}
          className="mt-4 bg-white text-primary-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-1.5"
        >
          View Appointments
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-base font-bold text-slate-800 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Today's Schedule", desc: "View & manage appointments", icon: Calendar, color: "bg-primary-50 text-primary-600 border-primary-100", path: "/doctor/appointments" },
          { label: "Create Report", desc: "AI-assisted report generation", icon: FileText, color: "bg-purple-50 text-purple-600 border-purple-100", path: "/doctor/reports/create" },
          { label: "My Templates", desc: "Manage report templates", icon: Users, color: "bg-teal-50 text-teal-600 border-teal-100", path: "/doctor/templates" },
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

      {/* Draft Reports */}
      {drafts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText size={16} className="text-yellow-500" />
              Draft Reports
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {drafts.length}
              </span>
            </h2>
          </div>
          {/* SLICE HATAA DIYA GAYA HAI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft) => (
              <div
                key={draft._id}
                className="bg-white rounded-2xl border border-yellow-100 p-4 hover:shadow-cardHover transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm line-clamp-1">
                      {draft.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {draft.patient?.name} · {draft.specialty?.name}
                    </p>
                  </div>
                  <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full shrink-0">
                    Draft
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  {new Date(draft.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate(`/doctor/reports/create?appointmentId=${draft.appointment}&draftId=${draft._id}`)
                    }
                    className="flex-1 text-xs py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl font-semibold transition-colors"
                  >
                    Continue Editing
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(draft._id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-danger rounded-xl transition-colors"
                    title="Delete Draft"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Appointments */}
      {stats?.recentAppointments?.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Recent Appointments</h2>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {stats.recentAppointments.map((apt, i) => (
              <div
                key={apt._id}
                className={`flex items-center justify-between p-4 ${
                  i !== stats.recentAppointments.length - 1 ? "border-b border-slate-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {apt.patient?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{apt.patient?.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(apt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {apt.slot}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    apt.status === "confirmed" ? "bg-green-50 text-green-700"
                    : apt.status === "completed" ? "bg-blue-50 text-blue-700"
                    : apt.status === "cancelled" ? "bg-red-50 text-red-700"
                    : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboard;