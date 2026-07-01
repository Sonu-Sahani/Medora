import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Mail, KeyRound, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import {
  forgotPasswordApi,
  verifyOTPApi,
  resetPasswordApi,
} from "../../api/auth.api.js";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password, 4: success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP Input handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return toast.error("Enter complete 6-digit OTP");
    setLoading(true);
    try {
      await verifyOTPApi(email, otpString);
      toast.success("OTP verified!");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      return toast.error("Please fill all fields");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      await resetPasswordApi(email, newPassword);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = {
    1: { title: "Forgot Password?", sub: "Enter your email to receive a reset OTP." },
    2: { title: "Enter OTP", sub: `We sent a 6-digit OTP to ${email}` },
    3: { title: "New Password", sub: "Create a strong new password." },
    4: { title: "All Done!", sub: "Your password has been reset successfully." },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary-600 text-white mb-3">
              <HeartPulse size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              {stepTitles[step].title}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {stepTitles[step].sub}
            </p>
          </div>

          {/* Step Indicator */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      s < step
                        ? "bg-success text-white"
                        : s === step
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {s < step ? "✓" : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-0.5 w-8 rounded-full transition-all duration-300 ${
                        s < step ? "bg-success" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="card">
            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" fullWidth loading={loading}>
                  <Mail size={16} />
                  Send OTP
                </Button>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors mt-2"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                    Enter 6-digit OTP
                  </label>
                  <div
                    className="flex justify-center gap-2"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-11 h-12 text-center text-lg font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                          digit
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-slate-200 text-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" fullWidth loading={loading}>
                  <KeyRound size={16} />
                  Verify OTP
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="text-sm text-slate-400 hover:text-primary-600 transition-colors"
                  >
                    Didn't receive OTP? Go back
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button type="submit" fullWidth loading={loading}>
                  <Lock size={16} />
                  Reset Password
                </Button>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center py-4">
                <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} className="text-success" />
                </div>
                <p className="text-slate-600 text-sm mb-6">
                  Your password has been reset successfully. You can now log in
                  with your new password.
                </p>
                <Button
                  fullWidth
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;