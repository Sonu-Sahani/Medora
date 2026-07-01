import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, IndianRupee, X,
  CheckCircle2, AlertCircle, Stethoscope,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import Button from "../../components/common/Button.jsx";
import {
  getMyAppointmentsApi,
  cancelAppointmentApi,
} from "../../api/appointment.api.js";

const statusConfig = {
  pending: {
    label: "Pending",
    class: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: AlertCircle,
  },
  confirmed: {
    label: "Confirmed",
    class: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    class: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-red-50 text-red-700 border-red-200",
    icon: X,
  },
};

const AppointmentCard = ({ appointment, onCancel }) => {
  const status = statusConfig[appointment.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isPast = new Date(appointment.date) < new Date();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:shadow-cardHover transition-all duration-300 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
              {appointment.doctor?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">
                Dr. {appointment.doctor?.name}
              </h3>
              <p className="text-xs text-primary-600 font-medium">
                {appointment.specialty?.name}
              </p>
            </div>
          </div>
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.class} shrink-0`}
          >
            <StatusIcon size={11} />
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={14} className="text-primary-400 shrink-0" />
            {new Date(appointment.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock size={14} className="text-primary-400 shrink-0" />
            {appointment.slot}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <IndianRupee size={14} className="text-secondary-500 shrink-0" />
            ₹{appointment.doctor?.consultationFee}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`text-xs font-medium ${
                appointment.payment?.status === "paid"
                  ? "text-success"
                  : "text-warning"
              }`}
            >
              {appointment.payment?.status === "paid"
                ? "✓ Paid"
                : "Payment Pending"}
            </span>
          </div>
        </div>

        {appointment.symptoms && (
          <div className="bg-slate-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-slate-500">
              <span className="font-semibold">Symptoms: </span>
              {appointment.symptoms}
            </p>
          </div>
        )}

        {appointment.status === "confirmed" && !isPast && (
          <Button
            variant="danger"
            onClick={() => onCancel(appointment._id)}
            className="w-full text-sm py-2"
          >
            Cancel Appointment
          </Button>
        )}
      </div>
    </div>
  );
};

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await getMyAppointmentsApi();
      setAppointments(res.data.data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    try {
      await cancelAppointmentApi(id, "Cancelled by patient");
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation failed");
    }
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const filtered =
    activeTab === "all"
      ? appointments
      : appointments.filter((a) => a.status === activeTab);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            My Appointments
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and manage your medical appointments.
          </p>
        </div>
        <Button onClick={() => navigate("/patient/specialties")}>
          <Calendar size={16} />
          Book New
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === key
                ? "bg-white text-primary-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
            {key === "all" && appointments.length > 0 && (
              <span className="ml-1.5 text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">
                {appointments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={28} className="text-slate-300" />
          </div>
          <p className="font-semibold text-slate-700">No appointments found</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">
            {activeTab === "all"
              ? "You haven't booked any appointments yet."
              : `No ${activeTab} appointments.`}
          </p>
          <Button onClick={() => navigate("/patient/specialties")}>
            Book Your First Appointment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyAppointmentsPage;