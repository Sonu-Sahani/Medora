import { useAuth } from "../../hooks/useAuth.js";

const AdminDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <h1 className="text-2xl font-bold text-slate-800">
        Welcome, {user?.name} 👋
      </h1>
      <p className="text-slate-500 mt-1">This is your admin dashboard.</p>
    </div>
  );
};

export default AdminDashboard;