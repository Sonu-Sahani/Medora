import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope, Calendar, FileText,
  ArrowRight, Activity,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getSpecialtiesApi } from "../../api/patient.api.js";
import SpecialtyCard from "../../components/patient/SpecialtyCard.jsx";

const quickActions = [
  {
    label: "Browse Specialties",
    description: "Find the right specialist",
    icon: Stethoscope,
    color: "bg-primary-50 text-primary-600 border-primary-100",
    path: "/patient/specialties",
  },
  {
    label: "My Appointments",
    description: "View upcoming visits",
    icon: Calendar,
    color: "bg-secondary-50 text-secondary-600 border-secondary-100",
    path: "/patient/appointments",
  },
  {
    label: "My Reports",
    description: "View medical reports",
    icon: FileText,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    path: "/patient/reports",
  },
];

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    getSpecialtiesApi()
      .then((res) => setSpecialties(res.data.data.slice(0, 5)))
      .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-40 opacity-10">
          <Activity size={160} className="text-white -translate-y-4 translate-x-4" />
        </div>
        <p className="text-primary-200 text-sm font-medium">{greeting},</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name} 👋</h1>
        <p className="text-primary-200 text-sm mt-1">
          How are you feeling today? Let's get you the care you need.
        </p>
        <button
          onClick={() => navigate("/patient/specialties")}
          className="mt-4 bg-white text-primary-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-1.5"
        >
          Book Appointment
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Quick Actions */}
      <h2 className="text-base font-bold text-slate-800 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {quickActions.map(({ label, description, icon: Icon, color, path }) => (
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
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Specialties Preview */}
      {specialties.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">
              Browse by Specialty
            </h2>
            <button
              onClick={() => navigate("/patient/specialties")}
              className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {specialties.map((s, i) => (
              <SpecialtyCard key={s._id} specialty={s} index={i} />
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default PatientDashboard;