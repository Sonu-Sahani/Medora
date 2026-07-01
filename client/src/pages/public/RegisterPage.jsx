import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { registerPatient } from "../../store/authSlice.js";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { HeartPulse } from "lucide-react";
import Navbar from "../../components/layout/Navbar.jsx";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await dispatch(registerPatient(data));
    setLoading(false);

    if (registerPatient.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      navigate("/patient/dashboard");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50">
    <Navbar />
    <div className="flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary-600 text-white mb-3">
            <HeartPulse size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Create your Medora account
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your health, book appointments, and more.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone Number (optional)"
            placeholder="+91 9876543210"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" fullWidth loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  </div>
);
};

export default RegisterPage;