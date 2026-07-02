import { useState, useEffect } from "react";
import { Search, Calendar, Filter } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import { getAllAppointmentsAdminApi } from "../../api/admin.api.js";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-green-50 text-green-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
};

const ManageAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAppointments = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getAllAppointmentsAdminApi(params);
      setAppointments(res.data.data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchAppointments, 400);
    return () => clearTimeout(delay);
  }, [search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Appointments</h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor all appointments across the platform.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[180px]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : appointments.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <Calendar size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-700">No appointments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Patient</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Doctor</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Specialty</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Date & Time</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Payment</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{apt.patient?.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">Dr. {apt.doctor?.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{apt.specialty?.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {new Date(apt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {apt.slot}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apt.payment?.status === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    }`}>
                      ₹{apt.payment?.amount || 0} · {apt.payment?.status || "pending"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[apt.status]}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageAppointmentsPage;