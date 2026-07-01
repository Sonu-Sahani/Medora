import { useNavigate } from "react-router-dom";
import {
  Flower2, ScanLine, Smile, Stethoscope, Ear,
  HeartPulse, Sparkles, Bone, Baby, Brain,
  Activity,
} from "lucide-react";

const iconMap = {
  Flower2, ScanLine, Smile, Stethoscope, Ear,
  HeartPulse, Sparkles, Bone, Baby, Brain, Activity,
};

const colorMap = [
  "bg-pink-50 text-pink-600 border-pink-100",
  "bg-blue-50 text-blue-600 border-blue-100",
  "bg-yellow-50 text-yellow-600 border-yellow-100",
  "bg-green-50 text-green-600 border-green-100",
  "bg-orange-50 text-orange-600 border-orange-100",
  "bg-red-50 text-red-600 border-red-100",
  "bg-purple-50 text-purple-600 border-purple-100",
  "bg-slate-50 text-slate-600 border-slate-200",
  "bg-teal-50 text-teal-600 border-teal-100",
  "bg-indigo-50 text-indigo-600 border-indigo-100",
];

const SpecialtyCard = ({ specialty, index }) => {
  const navigate = useNavigate();
  const Icon = iconMap[specialty.icon] || Activity;
  const colorClass = colorMap[index % colorMap.length];

  return (
    <div
      onClick={() => navigate(`/patient/doctors?specialty=${specialty._id}&name=${specialty.name}`)}
      className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-cardHover transition-all duration-300 cursor-pointer"
    >
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800 leading-tight">
          {specialty.name}
        </p>
        {specialty.description && (
          <p className="text-xs text-slate-400 mt-1 leading-snug line-clamp-2">
            {specialty.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default SpecialtyCard;