import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, Award, IndianRupee, Clock,
  CheckCircle2, Calendar, Phone, Mail,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import { getDoctorByIdApi } from "../../api/patient.api.js";
import toast from "react-hot-toast";
import { getDoctorReviewsApi } from "../../api/review.api.js";

const DoctorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
  const fetchDoctor = async () => {
    try {
      const [doctorRes, reviewsRes] = await Promise.all([
        getDoctorByIdApi(id),
        getDoctorReviewsApi(id),
      ]);
      setDoctor(doctorRes.data.data);
      setReviews(reviewsRes.data.data);
    } catch {
      toast.error("Doctor not found");
      navigate("/patient/specialties");
    } finally {
      setLoading(false);
    }
  };
  fetchDoctor();
}, [id]);

  if (loading) return (
    <DashboardLayout>
      <Loader />
    </DashboardLayout>
  );

  if (!doctor) return null;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <DashboardLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to Doctors
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Doctor Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500" />
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="h-20 w-20 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-3xl shrink-0">
                  {doctor.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-slate-800">
                    Dr. {doctor.name}
                  </h1>
                  <p className="text-primary-600 font-medium text-sm mt-0.5">
                    {doctor.specialty?.name}
                  </p>
                  {doctor.qualifications?.length > 0 && (
                    <p className="text-slate-400 text-sm mt-1">
                      {doctor.qualifications.join(" · ")}
                    </p>
                  )}

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-slate-800">
                        {doctor.ratingsAverage?.toFixed(1) || "New"}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({doctor.ratingsCount || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-primary-500" />
                      <span className="text-sm font-semibold text-slate-800">
                        {doctor.experience} years
                      </span>
                      <span className="text-xs text-slate-400">experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IndianRupee size={14} className="text-secondary-500" />
                      <span className="text-sm font-semibold text-slate-800">
                        {doctor.consultationFee}
                      </span>
                      <span className="text-xs text-slate-400">per consultation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          {doctor.bio && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-bold text-slate-800 mb-3">About</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{doctor.bio}</p>
            </div>
          )}

          {/* Qualifications */}
          {doctor.qualifications?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-bold text-slate-800 mb-3">Qualifications</h2>
              <div className="space-y-2">
                {doctor.qualifications.map((q, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 size={15} className="text-secondary-500 shrink-0" />
                    {q}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {doctor.availability?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-bold text-slate-800 mb-4">
                Weekly Availability
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const avail = doctor.availability.find((a) => a.day === day);
                  return (
                    <div key={day} className="text-center">
                      <p className="text-xs font-medium text-slate-400 mb-2">{day}</p>
                      <div
                        className={`h-10 rounded-xl flex items-center justify-center text-xs font-semibold ${
                          avail
                            ? "bg-secondary-50 text-secondary-700 border border-secondary-200"
                            : "bg-slate-50 text-slate-300 border border-slate-100"
                        }`}
                      >
                        {avail ? "✓" : "—"}
                      </div>
                      {avail && (
                        <p className="text-xs text-slate-400 mt-1">
                          {avail.slots?.length || 0} slots
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Booking */}
        <div className="space-y-5">
          {/* Book Now Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-6">
            <h2 className="font-bold text-slate-800 mb-1">Book Appointment</h2>
            <p className="text-slate-400 text-sm mb-5">
              Consultation fee: ₹{doctor.consultationFee}
            </p>

            {/* Reviews */}
{reviews.length > 0 && (
  <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <h2 className="font-bold text-slate-800 mb-4">
      Patient Reviews ({reviews.length})
    </h2>
    <div className="space-y-4">
      {(showAllReviews ? reviews : reviews.slice(0, 2)).map((review) => (
        <div key={review._id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center font-bold text-xs">
                {review.patient?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {review.patient?.name}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-slate-500 ml-10">{review.comment}</p>
          )}
          <p className="text-xs text-slate-300 ml-10 mt-1">
            {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      ))}
    </div>

    {/* Show More / Show Less Button */}
    {reviews.length > 2 && (
      <button
        onClick={() => setShowAllReviews(!showAllReviews)}
        className="w-full mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 py-2.5 rounded-xl transition-colors"
      >
        {showAllReviews
          ? "Show Less"
          : `Show ${reviews.length - 2} More Review${reviews.length - 2 !== 1 ? "s" : ""}`}
      </button>
    )}
  </div>
)}

            <button
              onClick={() =>
                navigate(`/patient/book/${doctor._id}`)
              }
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              <Calendar size={17} />
              Book Now
            </button>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              {doctor.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone size={14} className="text-primary-400" />
                  {doctor.phone}
                </div>
              )}
              {doctor.email && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={14} className="text-primary-400" />
                  {doctor.email}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
            <Clock size={20} className="mb-3 text-primary-200" />
            <p className="font-bold text-lg">
              {doctor.availability?.reduce(
                (acc, a) => acc + (a.slots?.length || 0), 0
              ) || 0}+
            </p>
            <p className="text-primary-200 text-sm">Weekly slots available</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDetailsPage;