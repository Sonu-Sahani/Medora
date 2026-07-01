import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  User, Lock, Clock, Save,
  Plus, Trash2, Eye, EyeOff, PenTool,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  updateDoctorProfileApi,
  changeDoctorPasswordApi,
  uploadSignatureApi,
  deleteSignatureApi,
} from "../../api/doctor.api.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  experience: z.coerce.number().min(0).optional(),
  consultationFee: z.coerce.number().min(0, "Fee is required"),
  bio: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const DoctorProfileSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [qualifications, setQualifications] = useState([]);
  const [newQual, setNewQual] = useState("");
  const [availability, setAvailability] = useState([]);

  // Signature state
  const [signaturePreview, setSignaturePreview] = useState(user?.signature?.url || "");
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureLoading, setSignatureLoading] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      experience: user?.experience || 0,
      consultationFee: user?.consultationFee || 0,
      bio: user?.bio || "",
    },
  });

  const {
    register: regPass,
    handleSubmit: handlePass,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      setQualifications(user.qualifications || []);
      setAvailability(user.availability || []);
      setSignaturePreview(user.signature?.url || "");
    }
  }, [user]);

  const toggleDay = (day) => {
    const exists = availability.find((a) => a.day === day);
    if (exists) {
      setAvailability(availability.filter((a) => a.day !== day));
    } else {
      setAvailability([...availability, { day, slots: [] }]);
    }
  };

  const toggleSlot = (day, slot) => {
    setAvailability(
      availability.map((a) => {
        if (a.day !== day) return a;
        const slots = a.slots.includes(slot)
          ? a.slots.filter((s) => s !== slot)
          : [...a.slots, slot].sort();
        return { ...a, slots };
      })
    );
  };

  const addQualification = () => {
    if (!newQual.trim()) return;
    setQualifications([...qualifications, newQual.trim()]);
    setNewQual("");
  };

  const removeQualification = (index) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const onProfileSubmit = async (data) => {
    setSaving(true);
    try {
      await updateDoctorProfileApi({ ...data, qualifications, availability });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setSaving(true);
    try {
      await changeDoctorPasswordApi({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully!");
      resetPass();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleSignatureUpload = async () => {
    if (!signatureFile) return;
    setSignatureLoading(true);
    try {
      const formData = new FormData();
      formData.append("signature", signatureFile);
      const res = await uploadSignatureApi(formData);
      setSignaturePreview(res.data.data.signature.url);
      setSignatureFile(null);
      toast.success("Signature uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setSignatureLoading(false);
    }
  };

  const handleSignatureDelete = async () => {
    if (!window.confirm("Delete your signature?")) return;
    setSignatureLoading(true);
    try {
      await deleteSignatureApi();
      setSignaturePreview("");
      setSignatureFile(null);
      toast.success("Signature deleted");
    } catch {
      toast.error("Failed to delete signature");
    } finally {
      setSignatureLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your professional profile and availability.
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-6 flex items-center gap-5 text-white">
        <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold">Dr. {user?.name}</h2>
          <p className="text-primary-200 text-sm">{user?.email}</p>
          <p className="text-primary-200 text-xs mt-1">
            {user?.experience} years experience
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
        {[
          { key: "profile", label: "Profile", icon: User },
          { key: "availability", label: "Availability", icon: Clock },
          { key: "signature", label: "Signature", icon: PenTool },
          { key: "password", label: "Password", icon: Lock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === key
                ? "bg-white text-primary-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleProfile(onProfileSubmit)}
          className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Full Name" error={profileErrors.name?.message} {...regProfile("name")} />
            <Input label="Phone" {...regProfile("phone")} />
            <Input
              label="Experience (years)"
              type="number"
              error={profileErrors.experience?.message}
              {...regProfile("experience")}
            />
            <Input
              label="Consultation Fee (₹)"
              type="number"
              error={profileErrors.consultationFee?.message}
              {...regProfile("consultationFee")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
            <textarea
              {...regProfile("bio")}
              rows={4}
              placeholder="Tell patients about yourself..."
              className="input-field resize-none"
            />
          </div>

          {/* Qualifications */}
          <div>
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
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQualification())}
              />
              <button
                type="button"
                onClick={addQualification}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {qualifications.map((q, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm px-3 py-1.5 rounded-xl border border-primary-100"
                >
                  {q}
                  <button
                    type="button"
                    onClick={() => removeQualification(i)}
                    className="text-primary-400 hover:text-danger transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              <Save size={16} />
              Save Profile
            </Button>
          </div>
        </form>
      )}

      {/* Availability Tab */}
      {activeTab === "availability" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Clock size={17} className="text-primary-600" />
            Set Your Weekly Availability
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Select working days and time slots for patient bookings.
          </p>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const dayAvail = availability.find((a) => a.day === day);
              const isActive = !!dayAvail;
              return (
                <div
                  key={day}
                  className={`border rounded-2xl p-4 transition-all duration-200 ${
                    isActive ? "border-primary-200 bg-primary-50/30" : "border-slate-100 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => toggleDay(day)}
                        className={`h-5 w-9 rounded-full transition-colors cursor-pointer ${
                          isActive ? "bg-primary-600" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            isActive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </div>
                      <span className="font-semibold text-slate-800">{day}</span>
                    </label>
                    {isActive && (
                      <span className="text-xs text-primary-600 font-medium">
                        {dayAvail.slots.length} slots selected
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleSlot(day, slot)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-200 ${
                            dayAvail.slots.includes(slot)
                              ? "bg-primary-600 text-white border-primary-600"
                              : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              loading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await updateDoctorProfileApi({ availability });
                  toast.success("Availability updated!");
                } catch {
                  toast.error("Failed to update availability");
                } finally {
                  setSaving(false);
                }
              }}
            >
              <Save size={16} />
              Save Availability
            </Button>
          </div>
        </div>
      )}

      {/* Signature Tab */}
      {activeTab === "signature" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-lg">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <PenTool size={17} className="text-primary-600" />
            Doctor Signature
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            Upload your signature — it will automatically appear on all generated PDF
            reports. Use a white/transparent background PNG for best results.
          </p>

          {/* Current Signature Preview */}
          {signaturePreview ? (
            <div className="mb-5">
              <p className="text-xs font-medium text-slate-600 mb-2">Current Signature:</p>
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 inline-block">
                <img
                  src={signaturePreview}
                  alt="Doctor Signature"
                  className="max-h-20 max-w-xs object-contain"
                />
              </div>
              <div className="mt-3">
                <button
                  onClick={handleSignatureDelete}
                  disabled={signatureLoading}
                  className="text-xs text-danger hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Delete Signature
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-5 p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
              <PenTool size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No signature uploaded yet</p>
            </div>
          )}

          {/* Upload New */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload New Signature
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleSignatureFileChange}
              className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
            />
            <p className="text-xs text-slate-400 mt-1">
              PNG recommended (transparent background). Max 5MB.
            </p>

            {signatureFile && (
              <Button
                className="mt-4"
                loading={signatureLoading}
                onClick={handleSignatureUpload}
              >
                <Save size={16} />
                Upload Signature
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form
          onSubmit={handlePass(onPasswordSubmit)}
          className="bg-white rounded-2xl border border-slate-100 p-6 max-w-md space-y-4"
        >
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Lock size={17} className="text-primary-600" />
            Change Password
          </h3>
          <div className="relative">
            <Input
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              error={passErrors.currentPassword?.message}
              {...regPass("currentPassword")}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-9 text-slate-400"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="New Password"
              type={showNew ? "text" : "password"}
              error={passErrors.newPassword?.message}
              {...regPass("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-9 text-slate-400"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Input
            label="Confirm New Password"
            type="password"
            error={passErrors.confirmPassword?.message}
            {...regPass("confirmPassword")}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving}>
              <Lock size={16} />
              Update Password
            </Button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
};

export default DoctorProfileSettings;