import { useState, useEffect } from "react";
import {
  Plus, Search, Edit2, Trash2, X,
  CheckCircle2, XCircle, Stethoscope, Save,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import {
  getAllDoctorsAdminApi,
  createDoctorApi,
  updateDoctorApi,
  toggleDoctorStatusApi,
  deleteDoctorApi,
} from "../../api/admin.api.js";
import { getSpecialtiesApi } from "../../api/patient.api.js";

const emptyForm = {
  name: "", email: "", phone: "", specialtyId: "",
  experience: "", consultationFee: "", bio: "",
  qualifications: [],
};

const ManageDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newQual, setNewQual] = useState("");

  const fetchData = async () => {
    try {
      const [docRes, spcRes] = await Promise.all([
        getAllDoctorsAdminApi(search ? { search } : {}),
        getSpecialtiesApi(),
      ]);
      setDoctors(docRes.data.data);
      setSpecialties(spcRes.data.data);
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [search]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    setNewQual("");
  };

  const handleEdit = (doctor) => {
    setEditing(doctor._id);
    setForm({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone || "",
      specialtyId: doctor.specialty?._id || "",
      experience: doctor.experience || "",
      consultationFee: doctor.consultationFee || "",
      bio: doctor.bio || "",
      qualifications: doctor.qualifications || [],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addQual = () => {
    if (!newQual.trim()) return;
    setForm({ ...form, qualifications: [...form.qualifications, newQual.trim()] });
    setNewQual("");
  };

  const removeQual = (i) => {
    setForm({ ...form, qualifications: form.qualifications.filter((_, idx) => idx !== i) });
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.specialtyId || !form.consultationFee) {
      return toast.error("Name, email, specialty and fee are required");
    }
    setSaving(true);
    try {
      if (editing) {
        await updateDoctorApi(editing, {
          name: form.name,
          phone: form.phone,
          specialty: form.specialtyId,
          experience: Number(form.experience) || 0,
          consultationFee: Number(form.consultationFee),
          bio: form.bio,
          qualifications: form.qualifications,
        });
        toast.success("Doctor updated successfully!");
      } else {
        await createDoctorApi({
          name: form.name,
          email: form.email,
          phone: form.phone,
          specialtyId: form.specialtyId,
          experience: Number(form.experience) || 0,
          consultationFee: Number(form.consultationFee),
          bio: form.bio,
          qualifications: form.qualifications,
        });
        toast.success("Doctor created! Login credentials sent via email.");
      }
      await fetchData();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleDoctorStatusApi(id);
      toast.success("Status updated");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this doctor? This cannot be undone.")) return;
    try {
      await deleteDoctorApi(id);
      toast.success("Doctor deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Doctors</h1>
          <p className="text-slate-500 text-sm mt-1">
            Add, edit and manage doctor accounts on the platform.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} />
          Add Doctor
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search doctors by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-primary-200 p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope size={17} className="text-primary-600" />
              {editing ? "Edit Doctor" : "Add New Doctor"}
            </h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input
              label="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email *"
              type="email"
              disabled={!!editing}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Specialty *
              </label>
              <select
                value={form.specialtyId}
                onChange={(e) => setForm({ ...form, specialtyId: e.target.value })}
                className="input-field"
              >
                <option value="">Select specialty</option>
                {specialties.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Experience (years)"
              type="number"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            />
            <Input
              label="Consultation Fee (₹) *"
              type="number"
              value={form.consultationFee}
              onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="Brief professional bio..."
            />
          </div>

          {/* Qualifications */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Qualifications
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newQual}
                onChange={(e) => setNewQual(e.target.value)}
                placeholder="e.g. MBBS, MD - Cardiology"
                className="input-field"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQual())}
              />
              <button
                type="button"
                onClick={addQual}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.qualifications.map((q, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm px-3 py-1.5 rounded-xl border border-primary-100"
                >
                  {q}
                  <button onClick={() => removeQual(i)} className="text-primary-400 hover:text-danger">
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {!editing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5 text-xs text-yellow-700">
              📧 A random password will be auto-generated and sent to the doctor's email
              along with login instructions.
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>
              <Save size={16} />
              {editing ? "Update Doctor" : "Create Doctor"}
            </Button>
          </div>
        </div>
      )}

      {/* Doctors Table */}
      {loading ? (
        <Loader />
      ) : doctors.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <Stethoscope size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-700">No doctors found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Doctor</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Specialty</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Fee</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Rating</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {doc.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Dr. {doc.name}</p>
                        <p className="text-xs text-slate-400">{doc.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{doc.specialty?.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">₹{doc.consultationFee}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    ⭐ {doc.ratingsAverage?.toFixed(1) || "New"}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggleStatus(doc._id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${
                        doc.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      } transition-colors`}
                    >
                      {doc.isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {doc.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="p-1.5 hover:bg-primary-50 text-slate-400 hover:text-primary-600 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-danger rounded-lg transition-colors"
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

export default ManageDoctorsPage;