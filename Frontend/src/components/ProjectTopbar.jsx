import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProjectTopBar({ project, activeTab, children }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-sm shrink-0">
      {/* row 1 — back, name, badge, tab pill, action buttons */}
      <div className="flex items-center gap-4 px-7 py-3.5">
        {/* back button with tooltip */}
        <div className="relative group shrink-0">
          <button
            onClick={() => navigate("/Dashboard")}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="absolute left-9 top-1/2 -translate-y-1/2 bg-neutral-800 dark:bg-neutral-700 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            Back to Projects
          </span>
        </div>

        {/* project name + badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {project.name}
          </span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              project.status === "in-progress"
                ? "bg-[#faeeda] text-[#854f0b]"
                : "bg-[#eaf3de] text-[#27500a]"
            }`}
          >
            {project.status === "in-progress" ? "Building" : "Complete"}
          </span>
        </div>

        {/* tab pill — grows to fill center space */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 mx-auto">
          <button
            onClick={() => navigate(`/Project/${project._id}`)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === "logs"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            Logs
          </button>

          {/* artifacts tab only shows when project is complete */}
          {project.status === "complete" && (
            <button
              onClick={() => navigate(`/Project/${project._id}/artifacts`)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === "artifacts"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              ✨ Artifacts
            </button>
          )}
        </div>

        {/* action buttons — passed in from parent */}
        <div className="flex items-center gap-1.5 shrink-0">{children}</div>
      </div>

      {/* row 2 — metadata */}
      <div className="flex items-center gap-3 px-7 pb-3 flex-wrap">
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          Started{" "}
          {new Date(project.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          {project.logCount} entries
        </span>
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
