import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, Pencil, Check, X, Loader2 } from "lucide-react";

export default function ArtifactViewer({
  selectedArtifact,
  isEditing,
  editContent,
  setEditContent,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onDownload,
  getTypeIcon,
  getTypeLabel,
}) {
  return (
    <div className="flex-1 overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-sm flex flex-col">
      {selectedArtifact ? (
        <>
          {/* viewer topbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 dark:text-neutral-400">
                {getTypeIcon(selectedArtifact.type)}
              </span>
              <span className="text-xs font-medium text-neutral-900 dark:text-white">
                {getTypeLabel(selectedArtifact.type)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={onCancel}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <X size={12} />
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-40 transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onDownload}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Download size={12} />
                    Download
                  </button>
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full resize-none text-sm font-mono bg-transparent text-neutral-800 dark:text-neutral-200 outline-none leading-relaxed"
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedArtifact.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-6">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Select an artifact to view it
          </p>
        </div>
      )}
    </div>
  );
}
