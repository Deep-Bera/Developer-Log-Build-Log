import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig/axiosConfig";
import ProjectCard from "../components/project/ProjectCard";
import ProjectModal from "../components/project/projectModal";
import useAuthError from "../customHook/AuthErrorHook";

import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    project: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;
  const navigate = useNavigate();

  const headers = { Authorization: `${localStorage.getItem("token")}` };
  const handleAuthError = useAuthError();

  useEffect(() => {
    axios
      .get("/api/projects", { headers })
      .then((response) => {
        setProjects(response.data);
      })
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response.data);
      });
  }, []);

  const openAddModal = () =>
    setModalState({ isOpen: true, mode: "create", project: null });

  const openEditModal = (project) =>
    setModalState({ isOpen: true, mode: "edit", project });

  const closeModal = () =>
    setModalState({ isOpen: false, mode: "create", project: null });

  const handleProjectSuccess = (data, mode) => {
    if (mode === "create") {
      setProjects((prev) => [...prev, data]);
    } else {
      setProjects((prev) => prev.map((p) => (p._id === data._id ? data : p)));
    }
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };
  const filteredProjects = projects
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((p) => {
      if (activeFilter === "public") return p.isPublic;
      if (activeFilter === "private") return !p.isPublic;
      if (activeFilter === "in-progress") return p.status === "in-progress";
      if (activeFilter === "complete") return p.status === "complete";
      return true;
    });
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchQuery, activeFilter]);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage,
  );
  const handleDelete = (projectId) => {
    axios
      .delete(`/api/projects/${projectId}`, { headers })
      .then(() => {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
      })
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response.data);
      });
  };

  const handleTogglePublic = (projectId) => {
    axios
      .patch(`/api/projects/${projectId}/visibility`, {}, { headers })
      .then((response) => {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? response.data.data : p)),
        );
      })
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response.data);
      });
  };

  const handleMarkComplete = (projectId) => {
    axios
      .patch(`/api/projects/${projectId}`, { status: "complete" }, { headers })
      .then((response) => {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? response.data.data : p)),
        );
      })
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response.data);
      });
  };

  const stats = [
    {
      label: "Total projects",
      value: projects.length,
      sub: `${projects.filter((p) => p.status === "in-progress").length} active`,
    },
    {
      label: "In progress",
      value: projects.filter((p) => p.status === "in-progress").length,
      sub: "building now",
    },
    {
      label: "Complete",
      value: projects.filter((p) => p.status === "complete").length,
      sub: "shipped",
    },
    {
      label: "Public projects",
      value: projects.filter((p) => p.isPublic).length,
      sub: "visible to all",
    },
  ];

  const filters = ["all", "public", "private", "in-progress", "complete"];
  const showAddCard =
    totalPages === 0 ||
    (currentPage === totalPages && paginatedProjects.length < projectsPerPage);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* topbar */}
      <div className="shrink-0 flex items-center justify-between px-7 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <span className="text-[14px] font-medium text-neutral-900 dark:text-white">
          Dashboard
        </span>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[13px] font-medium rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 active:scale-95 transition-all duration-150"
        >
          <Plus size={14} />
          New project
        </button>
      </div>

      {/* main content — no scroll */}
      <div className="flex-1 overflow-hidden flex flex-col px-7 py-4">
        {/* stats row */}
        <div className="shrink-0 grid grid-cols-4 gap-3 mb-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3.5"
            >
              <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                {s.label}
              </p>
              <p className="text-[22px] font-medium text-neutral-900 dark:text-white leading-none mb-1">
                {s.value}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* search + filters */}
        <div className="shrink-0 flex items-center gap-3 mb-3">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-8 w-full pl-8 pr-3 text-[13px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`h-8 px-3 rounded-xl text-[12px] font-medium border transition-all duration-150 flex items-center justify-center ${
                  activeFilter === f
                    ? "bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 border-neutral-800 dark:border-white"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                {f === "in-progress"
                  ? "In progress"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* section header */}
        <div className="shrink-0 flex items-center justify-between mb-2.5">
          <span className="text-[13px] font-medium text-neutral-900 dark:text-white">
            Your projects
          </span>
        </div>

        {/* projects grid — fills remaining space */}
        <div className="flex-1 grid grid-cols-3 gap-3 content-start">
          {paginatedProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/Project/${project._id}`)}
              className="cursor-pointer"
            >
              <ProjectCard
                project={project}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onTogglePublic={handleTogglePublic}
                onMarkComplete={handleMarkComplete}
              />
            </div>
          ))}

          {/* new project card — only on last page when there's a free slot.. */}
          {showAddCard && (
            <div
              onClick={openAddModal}
              className="flex flex-col items-center justify-center gap-2 min-h-[100px] border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
            >
              <Plus
                size={18}
                className="text-neutral-400 dark:text-neutral-600"
              />
              <span className="text-[13px] text-neutral-400 dark:text-neutral-600">
                New project
              </span>
            </div>
          )}
        </div>

        {/* pagination pages to show ... */}
        {totalPages > 1 && (
          <div className="shrink-0 flex items-center justify-between pt-3 mt-3 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-[12px] text-neutral-400 dark:text-neutral-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[12px] border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {/* (_, i) the first argument is to ignore the actuall value present inside the array ....instead it will take the index */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] border transition-colors ${
                      currentPage === page
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[12px] border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalState.isOpen && (
        <ProjectModal
          mode={modalState.mode}
          project={modalState.project}
          onClose={closeModal}
          onSuccess={handleProjectSuccess}
        />
      )}
    </div>
  );
}
