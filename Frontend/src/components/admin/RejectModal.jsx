import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export default function RejectModal({
  project,
  onClose,
  onConfirm,
  isLoading,
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Reject Project
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-5">
          Rejecting{" "}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {project?.name}
          </span>
          . The owner will see this reason on their project.
        </p>

        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this project is being rejected..."
          className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors placeholder:text-neutral-400 resize-none mb-4"
        />

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Rejecting...
              </>
            ) : (
              "Confirm Reject"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
