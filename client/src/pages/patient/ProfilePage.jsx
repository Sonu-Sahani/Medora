import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  User, Lock, Save, Eye, EyeOff,
  Phone, MapPin, Droplets, Calendar,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import { getMyProfileApi, updateMyProfileApi, changePasswordApi } from "../../api/patient.api.js";
import { setCredentials } from "../../store/authSlice.js";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  age: z.coerce.number().min(1).max(120).optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profile, setProfile] = useState(null);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset,
    formState: { errors: profileErrors },
  } = useForm({ resolver: zodResolver(profileSchema) });

  const {
    register: regPass,
    handleSubmit: handlePass,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfileApi();
        const data = res.data.data;
        setProfile(data);
        reset({
          name: data.name || "",
          phone: data.phone || "",
          age: data.age || "",
          gender: data.gender || "",
          bloodGroup: data.bloodGroup || "",
          address: data.address || "",
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const onProfileSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await updateMyProfileApi(data);
      const updated = res.data.data;
      setProfile(updated);
      dispatch(setCredentials({ user: updated, role: "patient" }));
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
      await changePasswordApi({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully!");
      resetPass();
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-6 flex items-center gap-5 text-white">
        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-bold">{profile?.name}</h2>
          <p className="text-primary-200 text-sm">{profile?.email}</p>
          <div className="flex flex-wrap gap-3 mt-2">
            {profile?.bloodGroup && (
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Droplets size={11} /> {profile.bloodGroup}
              </span>
            )}
            {profile?.age && (
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Calendar size={11} /> {profile.age} years
              </span>
            )}
            {profile?.gender && (
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full capitalize">
                {profile.gender}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
        {[
          { key: "profile", label: "Personal Info", icon: User },
          { key: "password", label: "Change Password", icon: Lock },
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
          className="bg-white rounded-2xl border border-slate-100 p-6"
        >
          <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <User size={17} className="text-primary-600" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={profileErrors.name?.message}
              {...regProfile("name")}
            />
            <Input
              label="Phone Number"
              placeholder="+91 9876543210"
              error={profileErrors.phone?.message}
              {...regProfile("phone")}
            />
            <Input
              label="Age"
              type="number"
              placeholder="25"
              error={profileErrors.age?.message}
              {...regProfile("age")}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Gender
              </label>
              <select
                {...regProfile("gender")}
                className="input-field"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Droplets size={14} className="text-red-500" />
                  Blood Group
                </span>
              </label>
              <select {...regProfile("bloodGroup")} className="input-field">
                <option value="">Select blood group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  Address
                </span>
              </label>
              <textarea
                {...regProfile("address")}
                placeholder="Your address..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" loading={saving}>
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form
          onSubmit={handlePass(onPasswordSubmit)}
          className="bg-white rounded-2xl border border-slate-100 p-6 max-w-md"
        >
          <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Lock size={17} className="text-primary-600" />
            Change Password
          </h3>

          <div className="space-y-4">
            {/* Current Password */}
            <div className="relative">
              <Input
                label="Current Password"
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                error={passErrors.currentPassword?.message}
                {...regPass("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <Input
                label="New Password"
                type={showNew ? "text" : "password"}
                placeholder="At least 6 characters"
                error={passErrors.newPassword?.message}
                {...regPass("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat new password"
                error={passErrors.confirmPassword?.message}
                {...regPass("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-6">
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

export default ProfilePage;