import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
  Users,
  FolderOpen,
  Clock,
  Flag,
  CheckCircle,
  XCircle,
  EyeOff,
} from "lucide-react";
import axios from "../axiosConfig/axiosConfig";
import AdminLayout from "../components/admin/AdminLayout";
import RejectModal from "../components/admin/RejectModal";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [reportedProjects, setReportedProjects] = useState([]);
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    project: null,
  });
  const [isRejecting, setIsRejecting] = useState(false);
  //   const navigate = useNavigate();

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          axios.get("/api/admin/stats", { headers }),
          axios.get("/api/admin/projects", { headers }),
        ]);

        setStats(statsRes.data.data);

        const all = projectsRes.data.data;

        // pending = public but not yet approved..
        setPendingProjects(all.filter((p) => p.isPublic && !p.isApproved));

        // reported = has at least one report..
        setReportedProjects(
          all
            .filter((p) => p.reportCount > 0)
            .sort((a, b) => b.reportCount - a.reportCount),
        );
      } catch (err) {
        console.log(err.message);
      }
    })();
  }, []);

  const handleApprove = (projectId) => {
    axios
      .patch(`/api/admin/projects/${projectId}/approve`, {}, { headers })
      .then(() => {
        setPendingProjects((prev) => prev.filter((p) => p._id !== projectId));
        setStats((prev) => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
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
      .then(() => {
        setPendingProjects((prev) =>
          prev.filter((p) => p._id !== rejectModal.project._id),
        );
        setStats((prev) => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
        setRejectModal({ isOpen: false, project: null });
      })
      .catch((err) => console.log(err.message))
      .finally(() => setIsRejecting(false));
  };

  const handleToggleHide = (projectId) => {
    axios
      .patch(`/api/admin/projects/${projectId}/hide`, {}, { headers })
      .then((res) => {
        setReportedProjects((prev) =>
          prev.map((p) => (p._id === projectId ? res.data.data : p)),
        );
      })
      .catch((err) => console.log(err.message));
  };

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          color: "text-amber-500",
        },
        {
          label: "Total Projects",
          value: stats.totalProjects,
          icon: FolderOpen,
          color: "text-amber-500",
        },
        {
          label: "Pending Approvals",
          value: stats.pendingApprovals,
          icon: Clock,
          color: "text-amber-500",
        },
        {
          label: "Reported Projects",
          value: stats.reportedProjects,
          icon: Flag,
          color: "text-red-500",
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="p-7">
        {/* header */}
        <div className="mb-7">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage users, projects, and platform activity
          </p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {label}
                </p>
                <Icon size={15} className={color} />
              </div>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* pending approvals */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl mb-6">
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Pending Approvals
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              Projects waiting to appear on the public feed
            </p>
          </div>

          {pendingProjects.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                No projects pending approval
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {pendingProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {project.name}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      by {project.userId?.name || "Unknown"} ·{" "}
                      {project.stack?.join(", ") || "No stack"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(project._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/60 transition-colors"
                    >
                      <CheckCircle size={13} />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectModal({ isOpen: true, project })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
                    >
                      <XCircle size={13} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* reported projects */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Reported Projects
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              Sorted by report count — highest first
            </p>
          </div>

          {reportedProjects.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                No reported projects
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {reportedProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {project.name}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      by {project.userId?.name || "Unknown"} ·{" "}
                      <span className="text-red-500 font-medium">
                        {project.reportCount} reports
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleHide(project._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <EyeOff size={13} />
                    {project.isHidden ? "Unhide" : "Hide"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {rejectModal.isOpen && (
        <RejectModal
          project={rejectModal.project}
          onClose={() => setRejectModal({ isOpen: false, project: null })}
          onConfirm={handleRejectConfirm}
          isLoading={isRejecting}
        />
      )}
    </AdminLayout>
  );
}
