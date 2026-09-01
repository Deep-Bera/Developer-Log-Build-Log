import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function SourceChips({ sources }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const uniqueSources = Array.from(
    new Map(
      sources.map((s) => [s.logId || `${s.entryType}-${s.createdAt}`, s]),
    ).values(),
  );

  return (
    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
      >
        <FileText size={13} className="text-indigo-500 dark:text-indigo-400" />
        <span className="font-medium">
          {uniqueSources.length}{" "}
          {uniqueSources.length === 1 ? "source log" : "source logs"} referenced
        </span>
        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {isExpanded && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {uniqueSources.map((source, i) => (
            <span
              key={source.logId || i}
              className="flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/60 rounded-md text-[11px] text-neutral-600 dark:text-neutral-300"
            >
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {source.entryType}
              </span>
              <span>·</span>
              <span>
                {new Date(source.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
