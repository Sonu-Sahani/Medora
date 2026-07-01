import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginUser } from "../../store/authSlice.js";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { HeartPulse } from "lucide-react";
import Navbar from "../../components/layout/Navbar.jsx";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["patient", "doctor", "admin"]),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "patient" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await dispatch(loginUser(data));
    setLoading(false);

    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back!");
      const role = result.payload.role;
      if (role === "patient") navigate("/patient/dashboard");
      else if (role === "doctor") navigate("/doctor/dashboard");
      else navigate("/admin/dashboard");
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

 return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50">
    <Navbar />
    <div className="flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        {/* baaki poora existing content same rakhna - form card etc */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary-600 text-white mb-3">
            <HeartPulse size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back to Medora
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Log in to continue managing your health.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Login as
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["patient", "doctor", "admin"].map((r) => (
                <label key={r} className="relative cursor-pointer">
                  <input
                    type="radio"
                    value={r}
                    {...register("role")}
                    className="peer sr-only"
                  />
                  <div className="text-center text-sm py-2 rounded-xl border border-slate-200 capitalize text-slate-600 peer-checked:bg-primary-600 peer-checked:text-white peer-checked:border-primary-600 transition-all duration-200">
                    {r}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />

          {/* Password field ke baad, Button ke pehle ye add karo: */}
<div className="flex justify-end">
  <Link
    to="/forgot-password"
    className="text-xs text-primary-600 hover:underline font-medium"
  >
    Forgot password?
  </Link>
</div>

          <Button type="submit" fullWidth loading={loading}>
            Log In
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>
);
};

export default LoginPage;