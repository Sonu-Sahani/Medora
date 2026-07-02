import { useState, useEffect } from "react";
import { Search, CheckCircle2, XCircle, Users, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  getAllPatientsAdminApi,
  togglePatientStatusApi,
  deletePatientApi,
} from "../../api/admin.api.js";

const ManagePatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchPatients = async () => {
    try {
      const res = await getAllPatientsAdminApi(search ? { search } : {});
      setPatients(res.data.data);
    } catch {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchPatients, 400);
    return () => clearTimeout(delay);
  }, [search]);

  const handleToggle = async (id) => {
    try {
      await togglePatientStatusApi(id);
      toast.success("Status updated");
      fetchPatients();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`
      )
    )
      return;

    setDeletingId(id);
    try {
      await deletePatientApi(id);
      toast.success("Patient deleted successfully");
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete patient");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manage Patients</h1>
        <p className="text-slate-500 text-sm mt-1">
          View and manage registered patient accounts.
        </p>
      </div>

      <div className="relative max-w-md mb-6">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <Loader />
      ) : patients.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <Users size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-700">No patients found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Patient</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Contact</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Age/Gender</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Joined</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Verified</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-secondary-100 text-secondary-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {p.name?.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-slate-800">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <p>{p.email}</p>
                    <p className="text-xs text-slate-400">{p.phone || "-"}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {p.age || "-"} · {p.gender || "-"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    {p.isEmailVerified ? (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Verified</span>
                    ) : (
                      <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggle(p._id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${
                        p.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      } transition-colors`}
                    >
                      {p.isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={deletingId === p._id}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-danger rounded-lg transition-colors disabled:opacity-50"
                        title="Delete patient"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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

export default ManagePatientsPage;