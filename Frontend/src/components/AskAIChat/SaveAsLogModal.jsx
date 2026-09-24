import { useState, useEffect } from "react";
import { X, Sparkles, Loader2, AlertCircle, Bookmark, Check } from "lucide-react";
import axios from "../../axiosConfig/axiosConfig";

const typeOptions = [
  {
    id: "Decision",
    label: "Decision",
    activeClass:
      "bg-[#eeedfe] text-[#3c3489] border-[#c4bdfb] dark:bg-[#3c3489]/30 dark:text-[#c4bdfb] dark:border-[#5349b6]",
    inactiveClass:
      "bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300",
  },
  {
    id: "Blocker",
    label: "Blocker",
    activeClass:
      "bg-[#fcebeb] text-[#a32d2d] border-[#f8b4b4] dark:bg-[#a32d2d]/30 dark:text-[#fca5a5] dark:border-[#7f1d1d]",
    inactiveClass:
      "bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300",
  },
  {
    id: "Win",
    label: "Win",
    activeClass:
      "bg-[#eaf3de] text-[#27500a] border-[#bbf7d0] dark:bg-[#27500a]/30 dark:text-[#86efac] dark:border-[#14532d]",
    inactiveClass:
      "bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300",
  },
  {
    id: "Learn",
    label: "Learn",
    activeClass:
      "bg-[#faeeda] text-[#633806] border-[#fde68a] dark:bg-[#633806]/30 dark:text-[#fde047] dark:border-[#78350f]",
    inactiveClass:
      "bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300",
  },
];

export default function SaveAsLogModal({
  isOpen,
  onClose,
  question,
  answer,
  precedingContext = "",
  projects = [],
  onLogSaved,
}) {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [entryType, setEntryType] = useState("Learn");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // When modal opens, initialize and request AI summary
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    // Default project
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    } else if (projects.length > 0 && !projects.some(p => p._id === selectedProjectId)) {
      setSelectedProjectId(projects[0]._id);
    }

    // Reset form state while AI is summarizing
    setContent("");
    setEntryType("Learn");
    setTags("");
    setIsSummarizing(true);

    const token = localStorage.getItem("token");
    axios
      .post(
        "/api/ask/summarize-to-log",
        { question, answer, precedingContext },
        { headers: { Authorization: token } }
      )
      .then((res) => {
        if (res.data) {
          if (res.data.entryType) setEntryType(res.data.entryType);
          if (res.data.content) setContent(res.data.content);
          if (Array.isArray(res.data.tags)) setTags(res.data.tags.join(", "));
        }
      })
      .catch((err) => {
        console.log("Failed to summarize log with AI:", err.message);
        // Fallback: strip raw markdown headers and fences for a cleaner snippet
        const cleanedSnippet = answer
          .replace(/```[\s\S]*?```/g, "[code block]")
          .replace(/#+\s*/g, "")
          .replace(/\n+/g, " ")
          .trim()
          .slice(0, 250);
        setContent(cleanedSnippet);
      })
      .finally(() => {
        setIsSummarizing(false);
      });
  }, [isOpen, question, answer, precedingContext, projects]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError("Please select a project to save this log to.");
      return;
    }
    if (!content.trim()) {
      setError("Log content cannot be empty.");
      return;
    }

    setError("");
    setIsSaving(true);
    const token = localStorage.getItem("token");

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      const response = await axios.post(
        `/api/logs/${selectedProjectId}`,
        {
          entryType,
          content: content.trim(),
          tags: parsedTags,
        },
        { headers: { Authorization: token } }
      );

      const savedLog = response.data?.data;
      if (onLogSaved) {
        onLogSaved(selectedProjectId, savedLog);
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.[0]?.msg ||
        "Failed to save log. Please try again.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="hide-scrollbar w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6 flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bookmark size={15} />
            </div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Save as Project Log
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 ml-9">
          Convert this insight into a structured log entry in your project journal.
        </p>

        {/* AI Summarizing Notice */}
        {isSummarizing && (
          <div className="mb-4 px-3 py-2 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
            <Loader2 size={13} className="animate-spin shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>AI is drafting a concise summary and suggesting tags...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 leading-relaxed">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Project Selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Project
            </label>
            {projects.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No projects found. Please create a project first.
              </p>
            ) : (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300/80 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Entry Type Selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Entry Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {typeOptions.map((opt) => {
                const isSelected = entryType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEntryType(opt.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${isSelected ? opt.activeClass : opt.inactiveClass
                      }`}
                  >
                    {isSelected && <Check size={11} />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Log Content
              </label>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                1–3 sentences recommended
              </span>
            </div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isSummarizing
                  ? "AI is drafting a crisp summary of this conversation..."
                  : "What was decided, solved, or learned?"
              }
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-3 text-neutral-900 dark:text-white outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Tags Field */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. express, cors, bugfix"
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300/80 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isSummarizing || projects.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Bookmark size={13} />
                  Save Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
