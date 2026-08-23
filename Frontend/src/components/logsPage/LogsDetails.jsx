import { useState } from "react";
import axios from "../../axiosConfig/axiosConfig";
import { GitBranch, AlertTriangle, Trophy, Lightbulb } from "lucide-react";

const typeBadge = {
  Decision: "bg-[#eeedfe] text-[#3c3489]",
  Blocker: "bg-[#fcebeb] text-[#a32d2d]",
  Win: "bg-[#eaf3de] text-[#27500a]",
  Learn: "bg-[#faeeda] text-[#633806]",
};

const typeGrid = [
  {
    label: "Decision",
    icon: GitBranch,
    border: "border-[#7f77dd]",
    bg: "bg-[#eeedfe]",
    text: "text-[#3c3489]",
  },
  {
    label: "Blocker",
    icon: AlertTriangle,
    border: "border-[#e24b4a]",
    bg: "bg-[#fcebeb]",
    text: "text-[#a32d2d]",
  },
  {
    label: "Win",
    icon: Trophy,
    border: "border-[#639922]",
    bg: "bg-[#eaf3de]",
    text: "text-[#27500a]",
  },
  {
    label: "Learn",
    icon: Lightbulb,
    border: "border-[#ba7517]",
    bg: "bg-[#faeeda]",
    text: "text-[#633806]",
  },
];

export default function LogDetail({
  projectId,
  selectedLog,
  isAdding,
  headers,
  handleAuthError,
  onSuccess,
  onDelete,
  onCancelAdd,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    entryType: "Decision",
    content: "",
    tags: "",
  });
  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState("");

  const isEditMode = isEditing || isAdding;

  const getError = (field) => {
    const matched = errors.find((err) => err.path === field);
    return matched ? matched.msg : null;
  };

  const handleEditClick = () => {
    setForm({
      entryType: selectedLog.entryType,
      content: selectedLog.content,
      tags: selectedLog.tags.join(", "),
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm({ entryType: "Decision", content: "", tags: "" });
    setErrors([]);
    setServerError("");
    if (isAdding) {
      onCancelAdd();
    } else {
      setIsEditing(false);
    }
  };

  const handleSubmit = () => {
    setErrors([]);
    setServerError("");

    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const request = isAdding
      ? axios.post(`/api/logs/${projectId}`, payload, { headers })
      : axios.patch(`/api/logs/${projectId}/${selectedLog._id}`, payload, {
          headers,
        });

    request
      .then((response) => {
        onSuccess(response.data.data, isAdding ? "add" : "edit");
        setIsEditing(false);
        setForm({ entryType: "Decision", content: "", tags: "" });
      })
      .catch((err) => {
        handleAuthError(err);
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 400 && data?.error) {
          setErrors(data.error);
        } else {
          setServerError(data?.message || "Something went wrong");
        }
      });
  };

  // current entry type — for view mode use log's type, for edit/add use form state
  const currentType = isEditMode
    ? form.entryType
    : selectedLog?.entryType || "Decision";

  return (
    <div className="h-full flex flex-col px-8 py-6 overflow-hidden">
      {/* --- empty state --- */}
      {!selectedLog && !isAdding && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
            No log selected
          </p>
          <p className="text-xs text-neutral-300 dark:text-neutral-600">
            Pick a log from the left to view details
          </p>
        </div>
      )}

      {/* --- form (add, edit, view) --- */}
      {(selectedLog || isAdding) && (
        <>
          {/* entry type grid — always visible, clickable only in edit/add mode */}
          <div className="grid grid-cols-4 gap-2 mb-5 shrink-0">
            {typeGrid.map(({ label, icon: Icon, border, bg, text }) => {
              const isSelected = currentType === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    isEditMode && setForm({ ...form, entryType: label })
                  }
                  className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all
                    ${
                      isSelected
                        ? `${border} ${bg} border-[1.5px]`
                        : "border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800"
                    }
                    ${isEditMode && !isSelected ? "cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-600" : "cursor-default"}
                  `}
                >
                  <Icon
                    size={16}
                    className={
                      isSelected
                        ? text
                        : "text-neutral-300 dark:text-neutral-600"
                    }
                  />
                  <span
                    className={`text-[11px] font-medium ${isSelected ? text : "text-neutral-400 dark:text-neutral-600"}`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {serverError && (
            <p className="text-xs text-red-500 mb-3">{serverError}</p>
          )}

          {/* content */}
          <div className="flex-1 flex flex-col min-h-0 mb-4">
            <textarea
              rows={6}
              readOnly={!isEditMode}
              value={isEditMode ? form.content : selectedLog?.content || ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder={
                isAdding
                  ? "Describe the decision, what led to it, and what alternatives you considered..."
                  : ""
              }
              className={`w-full flex-1 px-0 py-0 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed resize-none outline-none bg-transparent placeholder:text-neutral-300 dark:placeholder:text-neutral-600
                ${isEditMode ? "border-b border-neutral-200 dark:border-neutral-700 pb-2 focus:border-neutral-400 dark:focus:border-neutral-500" : "cursor-default"}
              `}
            />
            {isEditMode && (
              <p className="text-[11px] text-neutral-300 dark:text-neutral-600 text-right mt-1 shrink-0">
                {form.content.length} / 5000
              </p>
            )}
            {getError("content") && (
              <p className="text-xs text-red-500 mt-1">{getError("content")}</p>
            )}
          </div>

          {/* tags */}
          <div className="mb-5 shrink-0">
            {isEditMode ? (
              <>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. backend, auth, bug"
                  className="w-full px-0 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 bg-transparent border-b border-neutral-200 dark:border-neutral-700 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 transition-colors"
                />
                <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-1">
                  Separate each tag with a comma
                </p>
              </>
            ) : (
              <div className="flex gap-1.5 flex-wrap">
                {selectedLog?.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[11px] px-2.5 py-1 rounded-full ${typeBadge[selectedLog.entryType]} bg-opacity-60`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* action buttons */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
                >
                  {isAdding ? "Save entry" : "Save changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onDelete(selectedLog._id)}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-900 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
