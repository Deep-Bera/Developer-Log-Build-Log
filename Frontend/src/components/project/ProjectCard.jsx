import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  ScrollText,
  Calendar,
  Globe,
  Lock,
} from "lucide-react";

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onTogglePublic,
  onMarkComplete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close the menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-xl dark:hover:shadow-xl dark:hover:shadow-emerald-100/10">
      {/* top row — name, stack, badge, menu */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-white truncate capitalize group-hover:text-neutral-600  dark:group-hover:text-sky-400 transition-colors">
            {project.name}
          </h3>
          {/* to show the tech stack */}
          <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
            {(Array.isArray(project.stack)
              ? project.stack
              : (project.stack || "").split(",").map((s) => s.trim())
            ).map((tech, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/60 uppercase"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* status badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
              project.status === "in-progress"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            }`}
          >
            {project.status === "in-progress" ? "Building" : "Complete"}
          </span>

          {/* ... menu */}
          <div
            ref={menuRef}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="flex items-center justify-center w-6 h-6 rounded-md text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 overflow-hidden rounded-lg ">
                <button
                  onClick={() => {
                    onEdit(project);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[13px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors rounded-lg"
                >
                  Edit project
                </button>

                {project.status === "in-progress" && (
                  <button
                    onClick={() => {
                      onMarkComplete(project._id);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[13px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg"
                  >
                    Mark as complete
                  </button>
                )}

                <button
                  onClick={() => {
                    onTogglePublic(project._id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[13px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg"
                >
                  {project.isPublic ? "Make private" : "Make public"}
                </button>

                <button
                  onClick={() => {
                    onDelete(project._id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[13px] text-red-500 hover:bg-red-100 dark:hover:bg-red-950 transition-colors rounded-lg"
                >
                  Delete project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* bottom row */}
      <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <span className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
          <ScrollText size={12} />
          {project.logCount === 1 ? "1 log" : `${project.logCount} logs`}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
          <Calendar size={12} />
          Started{" "}
          {new Date(project.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 ml-auto">
          {project.isPublic ? <Globe size={12} /> : <Lock size={12} />}
          {project.isPublic ? "Public" : "Private"}
        </span>
      </div>
    </div>
  );
}
