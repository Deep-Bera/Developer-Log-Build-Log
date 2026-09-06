import { useState } from "react";
import { X, FileText, MessageCircle, Loader2, AlertCircle } from "lucide-react";

export default function ArtifactModal({
  onClose,
  onGenerate,
  isGenerating,
  error,
}) {
  const [selectedType, setSelectedType] = useState(null);

  const types = [
    {
      id: "readme",
      icon: FileText,
      title: "README.md",
      description: "Standard repo setup, features & tech stack",
    },
    {
      id: "interview-qa",
      icon: MessageCircle,
      title: "Project Q&A",
      description: "FAQ, architecture decisions & log Q&As",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Choose Artifact Type
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
          Select what type of document you want to generate
        </p>

        {/* error banner */}
        {error && (
          <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 leading-relaxed">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* type cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {types.map(({ id, icon: Icon, title, description }) => (
            <button
              key={id}
              onClick={() => setSelectedType(id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedType === id
                  ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
              }`}
            >
              <Icon
                size={20}
                className={`mb-2 ${
                  selectedType === id
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}
              />
              <p
                className={`text-xs font-semibold mb-1 ${
                  selectedType === id
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {title}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
                {description}
              </p>
            </button>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedType && onGenerate(selectedType)}
            disabled={!selectedType || isGenerating}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
