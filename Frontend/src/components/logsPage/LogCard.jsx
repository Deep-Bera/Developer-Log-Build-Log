const typeBadge = {
  Decision: "bg-[#eeedfe] text-[#3c3489]",
  Blocker: "bg-[#fcebeb] text-[#a32d2d]",
  Win: "bg-[#eaf3de] text-[#27500a]",
  Learn: "bg-[#faeeda] text-[#633806]",
};

export default function LogCard({ log, isSelected, onSelectLog }) {
  return (
    <div
      onClick={() => onSelectLog(log)}
      className={`px-4 py-3 rounded-xl cursor-pointer transition-all group
        ${
          isSelected
            ? "bg-neutral-100 dark:bg-neutral-800 shadow-sm"
            : "hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:shadow-sm"
        }`}
    >
      {/* type badge + date */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeBadge[log.entryType] || ""}`}
        >
          {log.entryType}
        </span>
        <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
          {new Date(log.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* content snippet */}
      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-2">
        {log.content}
      </p>

      {/* tags */}
      {log.tags && log.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {log.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
