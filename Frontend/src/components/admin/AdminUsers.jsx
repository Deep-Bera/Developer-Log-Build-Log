import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import axios from "../../axiosConfig/axiosConfig";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/admin/users", { headers });
        setUsers(res.data.data);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = (userId) => {
    const confirmed = window.confirm(
      "Delete this user? This will also delete all their projects and logs.",
    );
    if (!confirmed) return;

    setDeletingId(userId);
    axios
      .delete(`/api/admin/users/${userId}`, { headers })
      .then(() => {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      })
      .catch((err) => console.log(err.message))
      .finally(() => setDeletingId(null));
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      {/* header */}
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
          All Users
        </h2>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
          {users.length} registered users
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2
            size={18}
            className="animate-spin text-neutral-400 dark:text-neutral-500"
          />
        </div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            No users found
          </p>
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
            <tr>
              {["Name", "Email", "Role", "Joined", ""].map((col) => (
                <th
                  key={col}
                  className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
              >
                {/* name */}
                <td className="px-5 py-3.5 text-sm font-medium text-neutral-900 dark:text-white capitalize">
                  {user.name}
                </td>

                {/* email */}
                <td className="px-5 py-3.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {user.email}
                </td>

                {/* role badge */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      user.role === "admin"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* joined date */}
                <td className="px-5 py-3.5 text-sm text-neutral-400 dark:text-neutral-500">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                {/* delete action */}
                <td className="px-5 py-3.5 text-right">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingId === user._id}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                    >
                      {deletingId === user._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
