import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText, Sparkles, Save, Send,
  ArrowLeft, ChevronDown, ChevronUp,
  Loader2, Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import Input from "../../components/common/Input.jsx";
import { getDoctorAppointmentsApi } from "../../api/doctor.api.js";
import { getTemplatesApi, aiGenerateReportApi, createReportApi } from "../../api/report.api.js";

// Quick phrases per specialty
const QUICK_PHRASES = {
  default: [
    "Patient is in stable condition",
    "Vitals are within normal limits",
    "No acute distress noted",
    "Advised rest and hydration",
    "Follow up after 2 weeks",
    "Prescribed medications as below",
  ],
  cardiology: [
    "ECG shows normal sinus rhythm",
    "Blood pressure within normal range",
    "No chest pain or dyspnea",
    "Cardiac enzymes negative",
    "Echo findings normal",
    "Advised low-sodium diet",
  ],
  dermatology: [
    "Skin lesion well-circumscribed",
    "No signs of malignancy",
    "Topical treatment prescribed",
    "Advised sun protection",
    "Patch test recommended",
    "Biopsy may be required",
  ],
};

// Tiptap Toolbar
const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  const btn = (action, label, isActive = false) => (
    <button
      type="button"
      onClick={action}
      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-primary-600 text-white"
          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1.5 p-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
      {btn(() => editor.chain().focus().toggleBold().run(), "B", editor.isActive("bold"))}
      {btn(() => editor.chain().focus().toggleItalic().run(), "I", editor.isActive("italic"))}
      {btn(() => editor.chain().focus().toggleUnderline().run(), "U", editor.isActive("underline"))}
      {btn(() => editor.chain().focus().toggleHighlight().run(), "H", editor.isActive("highlight"))}
      <div className="w-px bg-slate-200 mx-1" />
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2", editor.isActive("heading", { level: 2 }))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3", editor.isActive("heading", { level: 3 }))}
      <div className="w-px bg-slate-200 mx-1" />
      {btn(() => editor.chain().focus().toggleBulletList().run(), "• List", editor.isActive("bulletList"))}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), "1. List", editor.isActive("orderedList"))}
      <div className="w-px bg-slate-200 mx-1" />
      {btn(() => editor.chain().focus().setTextAlign("left").run(), "Left")}
      {btn(() => editor.chain().focus().setTextAlign("center").run(), "Center")}
    </div>
  );
};

const CreateReportPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [title, setTitle] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [showPhrases, setShowPhrases] = useState(true);
  const [loading, setLoading] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing the report here, or use AI to generate a draft..." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose max-w-none p-4 min-h-[300px] focus:outline-none text-slate-700",
      },
    },
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [aptRes, tplRes] = await Promise.all([
          getDoctorAppointmentsApi({ status: "confirmed" }),
          getTemplatesApi(),
        ]);
        setAppointments(aptRes.data.data);
        setTemplates(tplRes.data.data);

        if (appointmentId) {
          const found = aptRes.data.data.find((a) => a._id === appointmentId);
          if (found) setSelectedAppointment(found);
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [appointmentId]);

  const handleAIGenerate = async () => {
    if (!selectedAppointment) {
      return toast.error("Please select an appointment first");
    }
    setAiLoading(true);
    try {
      const res = await aiGenerateReportApi({
        appointmentId: selectedAppointment._id,
        symptoms: selectedAppointment.symptoms,
        doctorNotes,
        templateContent: editor?.getHTML() || "",
      });
      editor?.commands.setContent(res.data.data.content);
      if (!title) {
        setTitle(
          `Medical Report - ${selectedAppointment.patient?.name} - ${new Date().toLocaleDateString("en-IN")}`
        );
      }
      toast.success("AI report generated! Review and edit as needed.");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (status) => {
    if (!selectedAppointment) return toast.error("Select an appointment");
    if (!title.trim()) return toast.error("Report title is required");
    if (!editor?.getText()?.trim()) return toast.error("Report content cannot be empty");

    setSaving(true);
    try {
      await createReportApi({
        appointmentId: selectedAppointment._id,
        title,
        content: editor.getHTML(),
        diagnosis,
        prescription,
        followUpDate: followUpDate || null,
        aiGenerated: false,
        status,
      });
      toast.success(
        status === "finalized"
          ? "Report finalized and sent to patient!"
          : "Report saved as draft"
      );
      navigate("/doctor/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  const insertPhrase = (phrase) => {
    editor?.chain().focus().insertContent(phrase + " ").run();
  };

  const specialtySlug = selectedAppointment?.specialty?.slug || "default";
  const phrases = QUICK_PHRASES[specialtySlug] || QUICK_PHRASES.default;

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Medical Report</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            AI-assisted report generation with PDF export.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Editor */}
        <div className="lg:col-span-2 space-y-5">
          {/* Appointment Selection */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Appointment *
            </label>
            <select
              value={selectedAppointment?._id || ""}
              onChange={(e) => {
                const apt = appointments.find((a) => a._id === e.target.value);
                setSelectedAppointment(apt || null);
              }}
              className="input-field"
            >
              <option value="">-- Select a confirmed appointment --</option>
              {appointments.map((apt) => (
                <option key={apt._id} value={apt._id}>
                  {apt.patient?.name} —{" "}
                  {new Date(apt.date).toLocaleDateString("en-IN")} · {apt.slot}
                </option>
              ))}
            </select>

            {selectedAppointment && (
              <div className="mt-3 p-3 bg-primary-50 rounded-xl border border-primary-100 text-sm">
                <p className="font-semibold text-primary-800">
                  {selectedAppointment.patient?.name}
                </p>
                <p className="text-primary-600 text-xs mt-0.5">
                  Age: {selectedAppointment.patient?.age || "N/A"} ·
                  Gender: {selectedAppointment.patient?.gender || "N/A"} ·
                  Blood: {selectedAppointment.patient?.bloodGroup || "N/A"}
                </p>
                {selectedAppointment.symptoms && (
                  <p className="text-primary-600 text-xs mt-1">
                    Symptoms: {selectedAppointment.symptoms}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <Input
              label="Report Title *"
              placeholder="e.g. General Consultation Report - John Doe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Doctor Notes (for AI) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Doctor's Notes
              <span className="text-slate-400 font-normal ml-1">(used for AI generation)</span>
            </label>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Add your clinical observations, examination findings, or additional notes..."
              rows={3}
              className="input-field resize-none"
            />

            {/* AI Generate Button */}
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiLoading || !selectedAppointment}
              className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-primary-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating AI Report...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate with AI
                </>
              )}
            </button>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={16} className="text-primary-600" />
                Report Content
              </h3>
              {templates.length > 0 && (
                <select
                  onChange={(e) => {
                    const tpl = templates.find((t) => t._id === e.target.value);
                    if (tpl) {
                      editor?.commands.setContent(tpl.content);
                      toast.success(`Template "${tpl.name}" applied`);
                    }
                  }}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600"
                  defaultValue=""
                >
                  <option value="">Apply Template</option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>

          {/* Diagnosis & Prescription */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Diagnosis
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Primary diagnosis..."
                rows={2}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Prescription / Treatment Plan
              </label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Medicines, dosage, instructions..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <Input
              label="Follow-up Date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Quick Phrases + Actions */}
        <div className="space-y-5">
          {/* Quick Phrases */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPhrases(!showPhrases)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Sparkles size={15} className="text-purple-500" />
                Quick Phrases
              </span>
              {showPhrases ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {showPhrases && (
              <div className="px-4 pb-4 space-y-2">
                {phrases.map((phrase, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => insertPhrase(phrase)}
                    className="w-full text-left text-xs text-slate-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg border border-slate-100 hover:border-primary-200 transition-all duration-200"
                  >
                    + {phrase}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Save Report</h3>
            <Button
              variant="secondary"
              fullWidth
              loading={saving}
              onClick={() => handleSave("draft")}
            >
              <Save size={16} />
              Save as Draft
            </Button>
            <Button
              fullWidth
              loading={saving}
              onClick={() => handleSave("finalized")}
            >
              <Send size={16} />
              Finalize & Send to Patient
            </Button>
            <p className="text-xs text-slate-400 text-center">
              Finalizing will generate a PDF and make it visible to the patient.
            </p>
          </div>

          {/* Patient Info Card */}
          {selectedAppointment && (
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
              <p className="text-xs text-primary-200 mb-1">Patient</p>
              <p className="font-bold">{selectedAppointment.patient?.name}</p>
              <p className="text-primary-200 text-xs mt-1">
                {selectedAppointment.specialty?.name}
              </p>
              <p className="text-primary-200 text-xs">
                {new Date(selectedAppointment.date).toLocaleDateString("en-IN")} ·{" "}
                {selectedAppointment.slot}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateReportPage;