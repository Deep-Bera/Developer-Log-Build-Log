import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, Pencil, Check, X, Loader2 } from "lucide-react";

function serializeDomToMarkdown(element) {
  if (!element) return "";

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tag = node.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map(walk).join("");

    switch (tag) {
      case "h1":
        return `\n# ${children.trim()}\n\n`;
      case "h2":
        return `\n## ${children.trim()}\n\n`;
      case "h3":
        return `\n### ${children.trim()}\n\n`;
      case "h4":
        return `\n#### ${children.trim()}\n\n`;
      case "p":
        return `\n${children.trim()}\n\n`;
      case "strong":
      case "b":
        return `**${children}**`;
      case "em":
      case "i":
        return `*${children}*`;
      case "li":
        return `- ${children.trim()}\n`;
      case "ul":
        return `\n${children}\n`;
      case "ol":
        return `\n${children}\n`;
      case "blockquote":
        return `\n> ${children.trim()}\n\n`;
      case "code":
        return `\`${children}\``;
      case "pre":
        return `\n\`\`\`\n${children}\n\`\`\`\n`;
      case "hr":
        return `\n---\n\n`;
      case "br":
        return `\n`;
      default:
        return children;
    }
  }

  const raw = Array.from(element.childNodes).map(walk).join("");
  return raw.replace(/\n{3,}/g, "\n\n").trim();
}

export default function ArtifactViewer({
  selectedArtifact,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onDownload,
  getTypeIcon,
  getTypeLabel,
}) {
  const editableRef = useRef(null);

  const handleSaveClick = () => {
    if (editableRef.current) {
      const updatedMarkdown = serializeDomToMarkdown(editableRef.current);
      onSave(updatedMarkdown || selectedArtifact.content);
    } else {
      onSave(selectedArtifact.content);
    }
  };

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
                    onClick={handleSaveClick}
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

          {/* edit mode banner */}
          {isEditing && (
            <div className="px-6 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
              <span>✏️ Click anywhere on the text below to edit directly</span>
            </div>
          )}

          {/* content — in-place editable visual view */}
          <div className="flex-1 overflow-y-auto px-6 py-5 hide-scrollbar">
            <div
              key={selectedArtifact._id + (isEditing ? "-edit" : "-view")}
              ref={editableRef}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              className={`prose prose-sm dark:prose-invert max-w-none outline-none focus:outline-none focus:ring-0 ${
                isEditing
                  ? "cursor-text ring-1 ring-neutral-200 dark:ring-neutral-700/60 rounded-xl p-4 bg-neutral-50/30 dark:bg-neutral-800/20 min-h-[300px]"
                  : ""
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedArtifact.content}
              </ReactMarkdown>
            </div>
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
