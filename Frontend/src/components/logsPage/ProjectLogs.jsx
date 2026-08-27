import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axiosConfig/axiosConfig";
import useAuthError from "../../customHook/AuthErrorHook";
import LogList from "./LogList";
import LogDetail from "./LogsDetails";
import ProjectModal from "../project/projectModal";
import { ChevronLeft } from "lucide-react";

export default function ProjectLogs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("desc");
  const [refresh, setRefresh] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

  const headers = { Authorization: `${localStorage.getItem("token")}` };
  const handleAuthError = useAuthError();

  // fetch project details...
  useEffect(() => {
    localStorage.removeItem("lastVisitedProject");
    localStorage.setItem("lastVisitedProject", id); // to store the id of the project which was last opened...
    (async () => {
      try {
        const response = await axios.get(`/api/projects/${id}`, { headers });
        setProject(response.data.data);
      } catch (err) {
        handleAuthError(err);
        console.log(err.response.data);
      }
    })();
  }, [id]);

  // fetch logs — reruns when page, sort, filter, or refresh changes....
  useEffect(() => {
    const filterParam =
      activeFilter !== "all" ? `&entryType=${activeFilter}` : "";
    axios
      .get(`/api/logs/${id}?page=${page}&limit=10&sort=${sort}${filterParam}`, {
        headers,
      })
      .then((response) => {
        setLogs(response.data.data);
        setTotalPages(response.data.totalPages);
      })
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response.data);
      });
  }, [id, page, sort, activeFilter, refresh]);

  const handleTogglePublic = () => {
    axios
      .patch(`/api/projects/${id}/visibility`, {}, { headers })
      .then((response) => setProject(response.data.data))
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response.data);
      });
  };

  const handleMarkComplete = () => {
    axios
      .patch(`/api/projects/${id}`, { status: "complete" }, { headers })
      .then((response) => setProject(response.data.data))
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response.data);
      });
  };
  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject);
  };
  const handleLogSuccess = (data, mode) => {
    if (mode === "add") {
      setSelectedLog(data);
      setIsAdding(false);
      setProject({ ...project, logCount: project.logCount + 1 });
      setRefresh((prev) => prev + 1);
    } else {
      setLogs(logs.map((log) => (log._id === data._id ? data : log)));
      setSelectedLog(data);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSort((prev) => (prev === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  const handleDeleteLog = (logId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this log? This cannot be undone.",
    );
    if (!confirmed) return;

    axios
      .delete(`/api/logs/${id}/${logId}`, { headers })
      .then(() => {
        setLogs(logs.filter((log) => log._id !== logId));
        setProject({ ...project, logCount: project.logCount - 1 });
        setSelectedLog(null);
      })
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response.data);
      });
  };

  const handleAddLog = () => {
    setSelectedLog(null);
    setIsAdding(true);
  };
  if (!project) return <p>Loading...</p>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* topbar */}
      {/* <div className="flex items-center justify-between px-7 py-4 shrink-0 bg-white dark:bg-neutral-900 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <span
            onClick={() => navigate("/Dashboard")}
            className="cursor-pointer hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Projects
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 text-2xl">
            ›
          </span>
          <span className=" cursor-pointer text-neutral-900 dark:text-white font-medium capitalize">
            {project.name}
          </span>
        </div>
      </div> */}

      {/* project details top bar...  */}
      <div className="flex items-center justify-between px-7 py-4 bg-white dark:bg-neutral-900 shrink-0 shadow-sm rounded-xl">
        <div
          onClick={() => navigate("/Dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-600 hover:text-neutral-400 dark:hover:text-neutral-300 cursor-pointer mb-3 transition-colors"
        >
          <ChevronLeft size={13} />
          <span>Projects</span>
        </div>
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-base font-semibold text-neutral-900 dark:text-white capitalize">
              {project.name}
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

        {/* action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setShowEditModal(true);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Edit project
          </button>
          <button
            onClick={handleTogglePublic}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {project.isPublic ? "Make private" : "Make public"}
          </button>
          {project.status === "in-progress" && (
            <button
              onClick={handleMarkComplete}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Mark complete
            </button>
          )}
          <button
            onClick={handleAddLog}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
          >
            + Add log
          </button>
        </div>
      </div>

      {/* body — two columns */}
      <div className="flex flex-1 overflow-hidden gap-2 p-2">
        {/* left column */}
        <div className="w-[40%] shrink-0 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
          {/* filter + sort */}
          <div className="flex items-center gap-1.5 px-5 py-2.5 flex-wrap shrink-0">
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
          <LogList
            logs={logs}
            selectedLog={selectedLog}
            onSelectLog={(log) => {
              setSelectedLog(log);
              setIsAdding(false);
            }}
          />

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
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

        {/* right column */}
        <div className="flex-1 overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
          <LogDetail
            key={selectedLog?._id || "empty"}
            projectId={id}
            selectedLog={selectedLog}
            isAdding={isAdding}
            headers={headers}
            handleAuthError={handleAuthError}
            onSuccess={handleLogSuccess}
            onDelete={handleDeleteLog}
            onCancelAdd={() => setIsAdding(false)}
          />
        </div>
      </div>
      {showEditModal && (
        <ProjectModal
          mode="edit"
          project={project}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleProjectUpdated}
        />
      )}
    </div>
  );
}
