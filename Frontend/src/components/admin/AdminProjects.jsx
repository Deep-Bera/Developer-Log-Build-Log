import { useEffect, useState } from "react";
import { CheckCircle, XCircle, EyeOff, Trash2, Loader2 } from "lucide-react";
import axios from "../../axiosConfig/axiosConfig";
import RejectModal from "./RejectModal";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    project: null,
  });
  const [isRejecting, setIsRejecting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/admin/projects", { headers });
        setProjects(res.data.data);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApprove = (projectId) => {
    axios
      .patch(`/api/admin/projects/${projectId}/approve`, {}, { headers })
      .then((res) => {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? res.data.data : p)),
        );
      })
      .catch((err) => console.log(err.message));
  };

  const handleRejectConfirm = (reason) => {
    setIsRejecting(true);
    axios
      .patch(
        `/api/admin/projects/${rejectModal.project._id}/reject`,
        { rejectionReason: reason },
        { headers },
      )
      .then((res) => {
        setProjects((prev) =>
          prev.map((p) =>
            p._id === rejectModal.project._id ? res.data.data : p,
          ),
        );
        setRejectModal({ isOpen: false, project: null });
      })
      .catch((err) => console.log(err.message))
      .finally(() => setIsRejecting(false));
  };

  const handleToggleHide = (projectId) => {
    axios
      .patch(`/api/admin/projects/${projectId}/hide`, {}, { headers })
      .then((res) => {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? res.data.data : p)),
        );
      })
      .catch((err) => console.log(err.message));
  };

  const handleDelete = (projectId) => {
    const confirmed = window.confirm(
      "Delete this project and all its logs? This cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(projectId);
    axios
      .delete(`/api/admin/projects/${projectId}`, { headers })
      .then(() => {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
      })
      .catch((err) => console.log(err.message))
      .finally(() => setDeletingId(null));
  };

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            All Projects
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            {projects.length} total projects across all users
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={18}
              className="animate-spin text-neutral-400 dark:text-neutral-500"
            />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              No projects found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {/* table header */}
            <div className="grid grid-cols-5 px-5 py-2.5 bg-neutral-50 dark:bg-neutral-800/50">
              {["Project", "Owner", "Status", "Flags", "Actions"].map((col) => (
                <p
                  key={col}
                  className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
                >
                  {col}
                </p>
              ))}
            </div>

            {projects.map((project) => (
              <div
                key={project._id}
                className="grid grid-cols-5 items-center px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
              >
                {/* project name */}
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {project.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {project.logCount} logs
                  </p>
                </div>

                {/* owner */}
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {project.userId?.name || "Unknown"}
                </p>

                {/* status badges */}
                <div className="flex flex-col gap-1">
                  <span
                    className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      project.status === "in-progress"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {project.status === "in-progress" ? "Building" : "Complete"}
                  </span>
                </div>

                {/* flags */}
                <div className="flex flex-col gap-1 text-[11px]">
                  {project.isPublic && !project.isApproved && (
                    <span className="text-amber-500 font-medium">Pending</span>
                  )}
                  {project.isApproved && (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Approved
                    </span>
                  )}
                  {project.isHidden && (
                    <span className="text-neutral-400 font-medium">Hidden</span>
                  )}
                  {project.reportCount > 0 && (
                    <span className="text-red-500 font-medium">
                      {project.reportCount} reports
                    </span>
                  )}
                  {!project.isPublic && (
                    <span className="text-neutral-400">Private</span>
                  )}
                </div>

                {/* actions */}
                <div className="flex items-center gap-1.5">
                  {project.isPublic && !project.isApproved && (
                    <button
                      onClick={() => handleApprove(project._id)}
                      title="Approve"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                    >
                      <CheckCircle size={15} />
                    </button>
                  )}
                  {project.isPublic && !project.isApproved && (
                    <button
                      onClick={() => setRejectModal({ isOpen: true, project })}
                      title="Reject"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <XCircle size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleHide(project._id)}
                    title={project.isHidden ? "Unhide" : "Hide"}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <EyeOff size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    disabled={deletingId === project._id}
                    title="Delete"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                  >
                    {deletingId === project._id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectModal.isOpen && (
        <RejectModal
          project={rejectModal.project}
          onClose={() => setRejectModal({ isOpen: false, project: null })}
          onConfirm={handleRejectConfirm}
          isLoading={isRejecting}
        />
      )}
    </>
  );
}
