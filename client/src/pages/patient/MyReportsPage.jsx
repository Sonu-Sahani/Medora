import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Loader from "../../components/common/Loader.jsx";
import Button from "../../components/common/Button.jsx";
import { getPatientReportsApi, deleteReportApi } from "../../api/report.api.js";

const ReportCard = ({ report, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(report.pdfExpiresAt) - new Date()) / (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-cardHover transition-all duration-300">
      <div className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500" />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">
                {report.title}
              </h3>
              <p className="text-xs text-primary-600 font-medium mt-0.5">
                {report.specialty?.name}
              </p>
            </div>
          </div>
          <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full font-medium shrink-0 capitalize">
            {report.status}
          </span>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-primary-400" />
            Dr. {report.doctor?.name}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-primary-400" />
            {new Date(report.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Expiry Warning */}
        {daysLeft <= 7 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-2.5 mb-4">
            <AlertCircle size={13} className="text-warning shrink-0" />
            <p className="text-xs text-yellow-700">
              {daysLeft === 0
                ? "Expires today!"
                : `Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
            </p>
          </div>
        )}

        {/* AI Summary */}
        {report.aiSummary && (
          <div className="mb-4">
            <button
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors w-full"
            >
              <Sparkles size={15} />
              AI Health Summary
              {showAI ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showAI && (
              <div className="mt-3 bg-gradient-to-br from-purple-50 to-primary-50 rounded-xl border border-purple-100 p-4 animate-fade-in">
                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  {report.aiSummary}
                </p>
                {report.aiPrecautions?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      ⚠️ Precautions:
                    </p>
                    <ul className="space-y-1">
                      {report.aiPrecautions.map((p, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-600 flex items-start gap-1.5"
                        >
                          <span className="text-warning mt-0.5">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.aiRecommendations?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      💡 Recommendations:
                    </p>
                    <ul className="space-y-1">
                      {report.aiRecommendations.map((r, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-600 flex items-start gap-1.5"
                        >
                          <span className="text-secondary-500 mt-0.5">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {report.pdfUrl && (
            <a
              href={report.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-semibold py-2.5 rounded-xl border border-primary-100 transition-colors"
            >
              <Download size={14} />
              Download PDF
            </a>
          )}
          <button
            onClick={() => onDelete(report._id)}
            className="p-2.5 hover:bg-red-50 text-slate-400 hover:text-danger rounded-xl border border-slate-100 hover:border-red-200 transition-all duration-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await getPatientReportsApi();
      setReports(res.data.data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report? This action cannot be undone."))
      return;
    try {
      await deleteReportApi(id);
      toast.success("Report deleted");
      fetchReports();
    } catch {
      toast.error("Failed to delete report");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          My Medical Reports
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          View and download your medical reports. Reports auto-delete after 30
          days.
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : reports.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <FileText size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-700">No reports yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Your medical reports will appear here after consultations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyReportsPage;
