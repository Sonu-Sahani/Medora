import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, Clock, FileText, Upload,
  X, ArrowLeft, CheckCircle2, IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import Button from "../../components/common/Button.jsx";
import { getDoctorByIdApi } from "../../api/patient.api.js";
import {
  getAvailableSlotsApi,
  createOrderApi,
  verifyPaymentApi,
} from "../../api/appointment.api.js";
import { useAuth } from "../../hooks/useAuth.js";

const BookingPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: select, 2: confirm, 3: success
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Get next 14 days (excluding past)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    getDoctorByIdApi(doctorId)
      .then((res) => setDoctor(res.data.data))
      .catch(() => {
        toast.error("Doctor not found");
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot("");
    getAvailableSlotsApi(doctorId, selectedDate)
      .then((res) => setSlots(res.data.data))
      .catch(() => toast.error("Failed to load slots"))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select date and time slot");
      return;
    }

    setBookingLoading(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Payment gateway failed to load. Check your internet.");
        setBookingLoading(false);
        return;
      }

      // Create order
      const orderRes = await createOrderApi({
        doctorId,
        date: selectedDate,
        slot: selectedSlot,
        symptoms,
      });

      const { orderId, amount, currency, keyId } = orderRes.data.data;

      // Open Razorpay Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "Medora Healthcare",
        description: `Consultation with Dr. ${doctor.name}`,
        order_id: orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || "",
        },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            const verifyRes = await verifyPaymentApi({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              doctorId,
              date: selectedDate,
              slot: selectedSlot,
              symptoms,
            });
            setBookedAppointment(verifyRes.data.data);
            setStep(3);
            toast.success("Appointment booked successfully!");
          } catch (err) {
            toast.error(
              err.response?.data?.message || "Payment verification failed"
            );
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setBookingLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );

  // Success Screen
  if (step === 3) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-16 animate-slide-up">
          <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Appointment Confirmed!
          </h1>
          <p className="text-slate-500 mb-8">
            Your appointment with Dr. {doctor?.name} has been successfully booked.
          </p>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Doctor</span>
              <span className="font-semibold text-slate-800">
                Dr. {doctor?.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-800">
                {formatDisplayDate(selectedDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Time</span>
              <span className="font-semibold text-slate-800">
                {selectedSlot}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-semibold text-success">
                ₹{doctor?.consultationFee}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="bg-green-50 text-success text-xs font-semibold px-2.5 py-1 rounded-full">
                Confirmed
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              fullWidth
              onClick={() => navigate("/patient/appointments")}
            >
              View My Appointments
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate("/patient/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const availableDates = getAvailableDates();

  return (
    <DashboardLayout>
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Booking Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Doctor Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl shrink-0">
              {doctor?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Dr. {doctor?.name}</h2>
              <p className="text-sm text-primary-600">
                {doctor?.specialty?.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {doctor?.qualifications?.join(" · ")}
              </p>
            </div>
          </div>

          {/* Step 1: Date Selection */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={17} className="text-primary-600" />
              Select Date
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {availableDates.map((date) => {
                const dateStr = formatDate(date);
                const isSelected = selectedDate === dateStr;
                const dayName = date.toLocaleDateString("en-IN", {
                  weekday: "short",
                });
                const dayNum = date.getDate();
                const month = date.toLocaleDateString("en-IN", {
                  month: "short",
                });

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center py-3 px-2 rounded-xl border text-sm transition-all duration-200 ${
                      isSelected
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium ${
                        isSelected ? "text-primary-200" : "text-slate-400"
                      }`}
                    >
                      {dayName}
                    </span>
                    <span className="text-base font-bold mt-0.5">{dayNum}</span>
                    <span
                      className={`text-xs ${
                        isSelected ? "text-primary-200" : "text-slate-400"
                      }`}
                    >
                      {month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Slot Selection */}
          {selectedDate && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={17} className="text-primary-600" />
                Select Time Slot
              </h3>

              {slotsLoading ? (
                <Loader />
              ) : slots.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No slots available on this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        selectedSlot === slot
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
          )}

          {/* Symptoms */}
          {selectedSlot && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={17} className="text-primary-600" />
                Describe Your Symptoms
                <span className="text-xs text-slate-400 font-normal">
                  (optional)
                </span>
              </h3>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for visit..."
                rows={4}
                className="input-field resize-none"
              />
            </div>
          )}
        </div>

        {/* Right - Summary Card */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-6">
            <h3 className="font-bold text-slate-800 mb-4">
              Booking Summary
            </h3>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Doctor</span>
                <span className="font-semibold text-slate-800 text-right">
                  Dr. {doctor?.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Specialty</span>
                <span className="font-semibold text-slate-800">
                  {doctor?.specialty?.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-semibold text-slate-800">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Time</span>
                <span className="font-semibold text-slate-800">
                  {selectedSlot || "Not selected"}
                </span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Consultation Fee</span>
                <span className="font-bold text-slate-800 flex items-center gap-0.5">
                  <IndianRupee size={14} />
                  {doctor?.consultationFee}
                </span>
              </div>
            </div>

            <Button
              fullWidth
              loading={bookingLoading}
              disabled={!selectedDate || !selectedSlot}
              onClick={handleBooking}
              className="py-3"
            >
              <IndianRupee size={16} />
              Pay & Book Appointment
            </Button>

            <p className="text-xs text-slate-400 text-center mt-3">
              Secured by Razorpay. 100% safe payment.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingPage;