import { useAuth } from "../../hooks/useAuth.js";

const DoctorDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <h1 className="text-2xl font-bold text-slate-800">
        Welcome, Dr. {user?.name} 👋
      </h1>
      <p className="text-slate-500 mt-1">This is your doctor dashboard.</p>
    </div>
  );
};

export default DoctorDashboard;