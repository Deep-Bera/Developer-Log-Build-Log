import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

export default function PublicProjectView() {
  const { id } = useParams();
  // const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const headers = { Authorization: `${localStorage.getItem("token")}` };

  // fetch public project..
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/api/projects/public/${id}`, {
          headers,
        });

        setProject(response.data.data);
      } catch (err) {
        console.log(err.response?.data);
      }
    })();
  }, [id]);

  // fetch logs..
  useEffect(() => {
    (async () => {
      try {
        const filterParam =
          activeFilter !== "all" ? `&entryType=${activeFilter}` : "";
        const response = await axios.get(
          `/api/logs/${id}?page=${page}&limit=10&sort=${sort}${filterParam}`,
          { headers },
        );
        console.log("logs response", response.data);
        setLogs(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.log(err.response?.data);
      }
    })();
  }, [id, page, sort, activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSort((prev) => (prev === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  if (!project)
    return (
      <div className="min-h-screen p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400">
        <p className="text-sm">Loading public projects logs...</p>
      </div>
    );
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* topbar */}
      {/* <div className="flex items-center px-7 py-3 shrink-0 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500">
          <span
            onClick={() => navigate("/PublicFeed")}
            className="cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Public Feed
          </span>
          <span className="text-2xl text-neutral-200 dark:text-neutral-700">
            ›
          </span>
          <span className="text-neutral-900 dark:text-white font-medium">
            {project.name
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </span>
        </div>
      </div> */}

      {/* project header — full width, read only, no action buttons */}
      <div className="flex items-center justify-between px-7 py-4 bg-white dark:bg-neutral-900 shrink-0 shadow-sm rounded-xl ">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-base font-semibold text-neutral-900 dark:text-white">
              {project.name
                .split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </span>
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full
              ${
                project.status === "in-progress"
                  ? "bg-[#faeeda] text-[#854f0b]"
                  : "bg-[#eaf3de] text-[#27500a]"
              }`}
            >
              {project.status === "in-progress" ? "Building" : "Complete"}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
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

        {/* read only badge */}
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500">
          Read only
        </span>
      </div>

      {/* body — two columns */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* left column */}
        <div className="w-[38%] shrink-0 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
          {/* filter + sort */}
          <div className="flex items-center gap-1.5 px-4 py-3 shrink-0 flex-wrap">
            {["all", "Decision", "Blocker", "Win", "Learn"].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize
                  ${
                    activeFilter === f
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={handleSortToggle}
              className="ml-auto text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              {sort === "desc" ? "Newest first" : "Oldest first"}
            </button>
          </div>

          {/* log list */}
          <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 hide-scrollbar">
            {logs.length === 0 ? (
              <p className="text-sm text-neutral-400 dark:text-neutral-600 px-2 py-4">
                No logs found.
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log._id}
                  onClick={() => setSelectedLog(log)}
                  className={`px-4 py-3 rounded-xl cursor-pointer transition-all
                    ${
                      selectedLog?._id === log._id
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeBadge[log.entryType]}`}
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
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-2">
                    {log.content}
                  </p>
                  {log.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {log.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="text-xs text-neutral-500 dark:text-neutral-400 disabled:opacity-30 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-neutral-400 dark:text-neutral-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="text-xs text-neutral-500 dark:text-neutral-400 disabled:opacity-30 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* right column — read only detail */}
        <div className="flex-1 overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
          {!selectedLog ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
                No log selected
              </p>
              <p className="text-xs text-neutral-300 dark:text-neutral-600">
                Pick a log from the left to view details
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col px-8 py-6 overflow-hidden">
              {/* entry type grid — read-only state */}
              <div className="grid grid-cols-4 gap-2 mb-5 shrink-0">
                {typeGrid.map(({ label, icon: Icon, border, bg, text }) => {
                  const isSelected = selectedLog.entryType === label;
                  return (
                    <div
                      key={label}
                      className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all cursor-default ${
                        isSelected
                          ? `${border} ${bg} border-[1.5px]`
                          : "border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800"
                      }`}
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
                        className={`text-[11px] font-medium ${
                          isSelected
                            ? text
                            : "text-neutral-400 dark:text-neutral-600"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* date subheader */}
              <div className="mb-3 shrink-0 flex items-center justify-between">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  Logged on{" "}
                  {new Date(selectedLog.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* content textarea */}
              <div className="flex-1 flex flex-col min-h-0 mb-4 overflow-y-auto hide-scrollbar">
                <textarea
                  rows={6}
                  readOnly
                  value={selectedLog.content || ""}
                  className="w-full flex-1 px-0 py-0 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed resize-none outline-none bg-transparent cursor-default"
                />
              </div>

              {/* tags */}
              {selectedLog.tags?.length > 0 && (
                <div className="mb-2 shrink-0">
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedLog.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[11px] px-2.5 py-1 rounded-full ${typeBadge[selectedLog.entryType]} bg-opacity-60`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
