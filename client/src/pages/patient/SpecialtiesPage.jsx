import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import SpecialtyCard from "../../components/patient/SpecialtyCard.jsx";
import Loader from "../../components/common/Loader.jsx";
import { getSpecialtiesApi } from "../../api/patient.api.js";
import toast from "react-hot-toast";

const SpecialtiesPage = () => {
  const [specialties, setSpecialties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await getSpecialtiesApi();
        setSpecialties(res.data.data);
        setFiltered(res.data.data);
      } catch {
        toast.error("Failed to load specialties");
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      specialties.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      )
    );
  }, [search, specialties]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Medical Specialties
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Choose a specialty to find the right doctor for your needs.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-8">
        <Search
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search specialties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-sm">
            No specialties found for "{search}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((specialty, index) => (
            <SpecialtyCard
              key={specialty._id}
              specialty={specialty}
              index={index}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SpecialtiesPage;