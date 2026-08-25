import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig/axiosConfig";
import useAuthError from "../customHook/AuthErrorHook";

export default function PublicFeed() {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleAuthError = useAuthError();

  const headers = { Authorization: `${localStorage.getItem("token")}` };

  // fetch all public projects on mount..
  useEffect(() => {
    axios
      .get("/api/projects/public", { headers })
      .then((response) => {
        setProjects(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response.data);
        setLoading(false);
      });
  }, []);

  // frontend search by project name..
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400">
        <p className="text-sm">Loading public projects...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-200">
      {/* topbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Public Feed
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {projects.length} public projects from the community
          </p>
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-56 pl-3 pr-4 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:border-sky-500 focus:shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all placeholder:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
        />
      </div>

      {/* projects grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-400 dark:text-neutral-600">
          <p className="text-sm">No public projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/public/${project._id}`)}
              className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-xl dark:hover:shadow-xl dark:hover:shadow-emerald-100/10"
            >
              {/* name and status */}
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white capitalize">
                  {project.name}
                </p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    project.status === "in-progress"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {project.status === "in-progress"
                    ? "In Progress"
                    : "Complete"}
                </span>
              </div>

              {/* stack */}
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                {project.stack.join(" · ")}
              </p>

              {/* meta row */}
              <div className="flex items-center gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {project.logCount || 0} logs
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  Started{" "}
                  {new Date(project.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto capitalize">
                  by {project.userId?.name || "Unknown"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
