import { useState } from "react";
import axios from "../../axiosConfig/axiosConfig";

export default function NewProjectModal({ onClose, onProjectCreated }) {
  const [form, setForm] = useState({
    name: "",
    stack: "",
    startDate: "",
  });
  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState("");

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
      .post("/api/projects", payload, {
        headers: { Authorization: `${localStorage.getItem("token")}` },
      })
      .then((response) => {
        onProjectCreated(response.data.data);
        onClose();
      })
      .catch((err) => {
        const status = err.response?.status;
        const data = err.response?.data;
        console.log(data);
        if (status === 400 && data?.error) {
          setErrors(data.error);
        } else {
          setServerError(data?.message || "Something went wrong");
        }
      });
  };

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div>
          <p>New project</p>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {serverError && <p style={{ color: "red" }}>{serverError}</p>}

          <div>
            <label>Project name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Build Log"
              value={form.name}
              onChange={handleChange}
            />
            {getError("name") && (
              <p style={{ color: "red" }}>{getError("name")}</p>
            )}
          </div>

          <div>
            <label>Tech stack</label>
            <input
              type="text"
              name="stack"
              placeholder="e.g. React, Node, MongoDB"
              value={form.stack}
              onChange={handleChange}
            />
            <small>Separate each technology with a comma</small>
            {getError("stack") && (
              <p style={{ color: "red" }}>{getError("stack")}</p>
            )}
          </div>

          <div>
            <label>Start date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
            />
            {getError("startDate") && (
              <p style={{ color: "red" }}>{getError("startDate")}</p>
            )}
          </div>

          <div>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Create project</button>
          </div>
        </form>
      </div>
    </div>
  );
}
