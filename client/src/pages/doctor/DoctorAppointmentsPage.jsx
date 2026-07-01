import { useEffect, useState } from "react";
import {
  Calendar, Clock, User, Phone,
  CheckCircle2, XCircle, Search,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import Button from "../../components/common/Button.jsx";
import {
  getDoctorAppointmentsApi,
  updateAppointmentStatusApi,
} from "../../api/doctor.api.js";
import { useNavigate } from "react-router-dom";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const DoctorAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchDate, setSearchDate] = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== "all") params.status = activeTab;
      if (searchDate) params.date = searchDate;
      const res = await getDoctorAppointmentsApi(params);
      setAppointments(res.data.data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab, searchDate]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await updateAppointmentStatusApi(id, status);
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your patient appointments.
          </p>
        </div>
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="input-field py-2 text-sm"
          />
          {searchDate && (
            <button
              onClick={() => setSearchDate("")}
              className="text-xs text-danger hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
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
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : appointments.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <Calendar size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-700">No appointments found</p>
          <p className="text-slate-400 text-sm mt-1">
            Try changing the filter or date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt._id}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-cardHover transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Patient Info */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {apt.patient?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {apt.patient?.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <User size={11} />
                        {apt.patient?.age
                          ? `${apt.patient.age} yrs`
                          : "Age N/A"}{" "}
                        · {apt.patient?.gender || "N/A"}
                      </span>
                      {apt.patient?.phone && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone size={11} />
                          {apt.patient.phone}
                        </span>
                      )}
                    </div>
                    {apt.symptoms && (
                      <p className="text-xs text-slate-400 mt-1 max-w-sm truncate">
                        Symptoms: {apt.symptoms}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar size={13} className="text-primary-400" />
                        {new Date(apt.date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                        <Clock size={11} />
                        {apt.slot}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                        statusColors[apt.status]
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  {/* Actions */}
                  {apt.status === "confirmed" && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="text-xs py-1.5 px-3"
                        loading={updating === apt._id}
                        onClick={() =>
                          handleStatusUpdate(apt._id, "completed")
                        }
                      >
                        <CheckCircle2 size={13} />
                        Complete
                      </Button>
                      <button
                        onClick={() =>
                          navigate(
                            `/doctor/reports/create?appointmentId=${apt._id}`
                          )
                        }
                        className="text-xs py-1.5 px-3 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl hover:bg-purple-100 transition-colors font-medium"
                      >
                        Create Report
                      </button>
                      <Button
                        variant="danger"
                        className="text-xs py-1.5 px-3"
                        loading={updating === apt._id}
                        onClick={() =>
                          handleStatusUpdate(apt._id, "cancelled")
                        }
                      >
                        <XCircle size={13} />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;