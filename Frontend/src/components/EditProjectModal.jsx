import { useState } from "react";
import axios from "../axiosConfig/axiosConfig";

export default function EditProjectModal({
  project,
  onClose,
  onProjectUpdated,
}) {
  const [form, setForm] = useState({
    name: project.name,
    stack: project.stack.join(", "),
    startDate: project.startDate ? project.startDate.split("T")[0] : "",
  });
  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState("");

  const headers = { Authorization: `${localStorage.getItem("token")}` };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const getError = (field) => {
    const matchedError = errors.find((error) => error.path === field);
    if (matchedError) {
      return matchedError.msg;
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    setServerError("");

    const payload = {
      ...form,
      stack: form.stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    axios
      .put(`/api/projects/${project._id}`, payload, { headers })
      .then((response) => {
        onProjectUpdated(response.data.data);
        onClose();
      })
      .catch((err) => {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 400 && data?.error) {
          setErrors(data.error);
        } else {
          setServerError(data?.message || "Something went wrong");
        }
      });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6"
      >
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">
            Edit project
          </p>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-[13px]">
                {serverError}
              </p>
            </div>
          )}

          {/* project name */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
              Project name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full h-9 px-3 text-[13px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
            />
            {getError("name") && (
              <p className="text-red-500 text-[12px]">{getError("name")}</p>
            )}
          </div>

          {/* tech stack */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
              Tech stack
            </label>
            <input
              type="text"
              name="stack"
              value={form.stack}
              onChange={handleChange}
              className="w-full h-9 px-3 text-[13px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
            />
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Separate each technology with a comma
            </p>
            {getError("stack") && (
              <p className="text-red-500 text-[12px]">{getError("stack")}</p>
            )}
          </div>

          {/* start date */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
              Start date
            </label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full h-9 px-3 text-[13px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
            />
            {getError("startDate") && (
              <p className="text-red-500 text-[12px]">
                {getError("startDate")}
              </p>
            )}
          </div>

          {/* actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-[13px] font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 text-[13px] font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-100 active:scale-95 rounded-lg transition-all duration-150"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
