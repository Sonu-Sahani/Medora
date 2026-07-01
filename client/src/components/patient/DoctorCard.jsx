import { useNavigate } from "react-router-dom";
import { Star, Clock, IndianRupee, Award } from "lucide-react";

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/patient/doctors/${doctor._id}`)}
      className="bg-white rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-cardHover transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      {/* Top colored bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary-500 to-secondary-500" />

      <div className="p-5">
        {/* Doctor Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
            {doctor.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-800 truncate">
              Dr. {doctor.name}
            </h3>
            <p className="text-xs text-primary-600 font-medium mt-0.5">
              {doctor.specialty?.name || "Specialist"}
            </p>
            {doctor.qualifications?.length > 0 && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {doctor.qualifications.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-slate-800">
                {doctor.ratingsAverage?.toFixed(1) || "New"}
              </span>
            </div>
            <p className="text-xs text-slate-400">Rating</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Award size={11} className="text-primary-500" />
              <span className="text-sm font-bold text-slate-800">
                {doctor.experience || 0}yr
              </span>
            </div>
            <p className="text-xs text-slate-400">Exp.</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <IndianRupee size={11} className="text-secondary-500" />
              <span className="text-sm font-bold text-slate-800">
                {doctor.consultationFee}
              </span>
            </div>
            <p className="text-xs text-slate-400">Fee</p>
          </div>
        </div>

        {/* Availability */}
        {doctor.availability?.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4 text-xs text-slate-500">
            <Clock size={12} className="text-secondary-500" />
            Available:{" "}
            {doctor.availability
              .slice(0, 3)
              .map((a) => a.day)
              .join(", ")}
            {doctor.availability.length > 3 && " ..."}
          </div>
        )}

        {/* CTA */}
        <button className="w-full bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white border border-primary-100 hover:border-primary-600 text-sm font-semibold py-2.5 rounded-xl transition-all duration-300">
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;