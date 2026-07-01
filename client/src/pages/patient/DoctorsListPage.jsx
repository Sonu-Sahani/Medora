import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, SlidersHorizontal } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import DoctorCard from "../../components/patient/DoctorCard.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  getDoctorsBySpecialtyApi,
  getAllDoctorsApi,
} from "../../api/patient.api.js";
import toast from "react-hot-toast";

const DoctorsListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const specialtyId = searchParams.get("specialty");
  const specialtyName = searchParams.get("name");

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = specialtyId
          ? await getDoctorsBySpecialtyApi(specialtyId, search)
          : await getAllDoctorsApi(search);
        setDoctors(res.data.data);
      } catch {
        toast.error("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchDoctors, 400);
    return () => clearTimeout(delay);
  }, [specialtyId, search]);

  const sortedDoctors = [...doctors].sort((a, b) => {
    if (sortBy === "rating") return (b.ratingsAverage || 0) - (a.ratingsAverage || 0);
    if (sortBy === "experience") return (b.experience || 0) - (a.experience || 0);
    if (sortBy === "fee-low") return (a.consultationFee || 0) - (b.consultationFee || 0);
    if (sortBy === "fee-high") return (b.consultationFee || 0) - (a.consultationFee || 0);
    return 0;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/patient/specialties")}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {specialtyName ? `${specialtyName} Doctors` : "All Doctors"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {loading ? "Loading..." : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search doctors by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-2.5 pr-8 min-w-[160px] cursor-pointer"
          >
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="fee-low">Fee: Low to High</option>
            <option value="fee-high">Fee: High to Low</option>
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <Loader />
      ) : sortedDoctors.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold">No doctors found</p>
          <p className="text-slate-400 text-sm mt-1">
            Try a different search or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedDoctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorsListPage;