import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HeartPulse, Mail, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import Navbar from "../../components/layout/Navbar.jsx";
import Button from "../../components/common/Button.jsx";
import { verifyEmailApi, resendVerifyOTPApi } from "../../api/auth.api.js";
import { setCredentials } from "../../store/authSlice.js";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`votp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`votp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) setOtp(pasted.split(""));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return toast.error("Enter complete 6-digit OTP");

    setLoading(true);
    try {
      const res = await verifyEmailApi(email, otpString);
      const { user, role } = res.data.data;
      dispatch(setCredentials({ user, role }));
      toast.success("Email verified! Welcome to Medora 🎉");
      navigate("/patient/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendVerifyOTPApi(email);
      toast.success("OTP resent to your email!");
      setResendTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
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
              Verify Your Email
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              We sent a 6-digit OTP to
            </p>
            <p className="text-primary-600 font-semibold text-sm">{email}</p>
          </div>

          <div className="card">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center">
                <Mail size={30} className="text-primary-600" />
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
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
                      id={`votp-${index}`}
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
                Verify Email
              </Button>
            </form>

            {/* Resend */}
            <div className="text-center mt-4">
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="flex items-center justify-center gap-1.5 text-sm text-primary-600 hover:underline font-medium mx-auto"
                >
                  <RefreshCw size={13} className={resendLoading ? "animate-spin" : ""} />
                  Resend OTP
                </button>
              ) : (
                <p className="text-sm text-slate-400">
                  Resend OTP in{" "}
                  <span className="text-primary-600 font-semibold">
                    {resendTimer}s
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;