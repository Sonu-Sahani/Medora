import { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit2, Save,
  X, FileText, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  getTemplatesApi,
  createTemplateApi,
  updateTemplateApi,
  deleteTemplateApi,
} from "../../api/report.api.js";
import { getSpecialtiesApi } from "../../api/patient.api.js";

const TemplateManagerPage = () => {
  const [templates, setTemplates] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    specialtyId: "",
    quickPhrases: [],
  });
  const [newPhrase, setNewPhrase] = useState({ label: "", text: "" });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your template content here...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose max-w-none p-4 min-h-[200px] focus:outline-none text-slate-700 text-sm",
      },
    },
  });

  const fetchData = async () => {
    try {
      const [tplRes, spcRes] = await Promise.all([
        getTemplatesApi(),
        getSpecialtiesApi(),
      ]);
      setTemplates(tplRes.data.data);
      setSpecialties(spcRes.data.data);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({ name: "", specialtyId: "", quickPhrases: [] });
    editor?.commands.setContent("");
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (template) => {
    setEditing(template._id);
    setForm({
      name: template.name,
      specialtyId: template.specialty?._id || "",
      quickPhrases: template.quickPhrases || [],
    });
    editor?.commands.setContent(template.content);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!form.name || !form.specialtyId || !editor?.getText()?.trim()) {
      return toast.error("Name, specialty and content are required");
    }
    setSaving(true);
    try {
      const data = {
        name: form.name,
        specialtyId: form.specialtyId,
        content: editor.getHTML(),
        quickPhrases: form.quickPhrases,
      };

      if (editing) {
        await updateTemplateApi(editing, data);
        toast.success("Template updated!");
      } else {
        await createTemplateApi(data);
        toast.success("Template created!");
      }
      await fetchData();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await deleteTemplateApi(id);
      toast.success("Template deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const addPhrase = () => {
    if (!newPhrase.label || !newPhrase.text) return;
    setForm({
      ...form,
      quickPhrases: [...form.quickPhrases, { ...newPhrase }],
    });
    setNewPhrase({ label: "", text: "" });
  };

  const removePhrase = (index) => {
    setForm({
      ...form,
      quickPhrases: form.quickPhrases.filter((_, i) => i !== index),
    });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Report Templates
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create reusable templates for faster report generation.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} />
          New Template
        </Button>
      </div>

      {/* Template Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-primary-200 p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText size={17} className="text-primary-600" />
              {editing ? "Edit Template" : "Create New Template"}
            </h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input
              label="Template Name"
              placeholder="e.g. General Consultation"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Specialty
              </label>
              <select
                value={form.specialtyId}
                onChange={(e) => setForm({ ...form, specialtyId: e.target.value })}
                className="input-field"
              >
                <option value="">Select specialty</option>
                {specialties.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Editor */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
            <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-500">
              Template Content
            </div>
            <EditorContent editor={editor} />
          </div>

          {/* Quick Phrases */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-500" />
              Quick Phrases
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                placeholder="Label (e.g. Normal BP)"
                value={newPhrase.label}
                onChange={(e) => setNewPhrase({ ...newPhrase, label: e.target.value })}
                className="input-field text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Text to insert"
                  value={newPhrase.text}
                  onChange={(e) => setNewPhrase({ ...newPhrase, text: e.target.value })}
                  className="input-field text-sm flex-1"
                />
                <button
                  type="button"
                  onClick={addPhrase}
                  className="px-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.quickPhrases.map((p, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs px-2.5 py-1.5 rounded-lg border border-purple-100"
                >
                  <span className="font-medium">{p.label}:</span> {p.text}
                  <button
                    type="button"
                    onClick={() => removePhrase(i)}
                    className="text-purple-400 hover:text-danger"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave}>
              <Save size={16} />
              {editing ? "Update Template" : "Save Template"}
            </Button>
          </div>
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <Loader />
      ) : templates.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <FileText size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-700">No templates yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">
            Create reusable templates to speed up report writing.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-white rounded-2xl border border-slate-100 hover:shadow-cardHover transition-all duration-300 overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{template.name}</h3>
                    <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {template.specialty?.name}
                    </span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-1.5 hover:bg-primary-50 text-slate-400 hover:text-primary-600 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-danger rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div
                  className="text-xs text-slate-500 line-clamp-3 mb-3 prose prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: template.content?.slice(0, 200) || "",
                  }}
                />

                {template.quickPhrases?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Sparkles size={11} className="text-purple-400" />
                    {template.quickPhrases.length} quick phrase
                    {template.quickPhrases.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TemplateManagerPage;