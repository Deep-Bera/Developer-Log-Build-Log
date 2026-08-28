import { Loader2 } from "lucide-react";

export default function ArtifactList({
  artifacts,
  selectedArtifact,
  onSelectArtifact,
  loading,
  countByType,
  getTypeIcon,
  getTypeLabel,
}) {
  return (
    <div className="w-[35%] shrink-0 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
      {/* counts */}
      <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            README {countByType("readme")}/3
          </span>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            Q&A {countByType("interview-qa")}/3
          </span>
        </div>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2
              size={16}
              className="animate-spin text-neutral-400 dark:text-neutral-500"
            />
          </div>
        ) : artifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              No artifacts generated yet
            </p>
            <p className="text-[11px] text-neutral-300 dark:text-neutral-600">
              Click Generate Artifact to create one
            </p>
          </div>
        ) : (
          <div className="flex flex-col py-2">
            {artifacts.map((artifact) => (
              <button
                key={artifact._id}
                onClick={() => onSelectArtifact(artifact)}
                className={`w-full text-left px-5 py-3.5 transition-colors border-b border-neutral-50 dark:border-neutral-800/50 last:border-0 ${
                  selectedArtifact?._id === artifact._id
                    ? "bg-neutral-50 dark:bg-neutral-800"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {getTypeIcon(artifact.type)}
                  </span>
                  <span className="text-xs font-medium text-neutral-900 dark:text-white">
                    {getTypeLabel(artifact.type)}
                  </span>
                  <span className="ml-auto text-[10px] text-neutral-400 dark:text-neutral-600">
                    #
                    {artifacts
                      .filter((a) => a.type === artifact.type)
                      .indexOf(artifact) + 1}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {new Date(artifact.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
