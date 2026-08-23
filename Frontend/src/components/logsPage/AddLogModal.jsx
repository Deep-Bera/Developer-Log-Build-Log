import { useState } from "react";
import axios from "../../axiosConfig/axiosConfig";

export default function AddLogModal({ projectId, onClose, onLogAdded }) {
  const [form, setForm] = useState({
    entryType: "Decision",
    content: "",
    tags: "",
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
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    // console.log(payload);
    axios
      .post(`/api/logs/${projectId}`, payload, { headers })
      .then((response) => {
        onLogAdded(response.data.data);
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
    // backdrop
    <div onClick={onClose}>
      {/* modal box */}
      <div onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div>
          <p>Add log entry</p>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {serverError && <p>{serverError}</p>}

          {/* entry type selector */}
          <div>
            <label>Entry type</label>
            <div>
              {["Decision", "Blocker", "Win", "Learn"].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setForm({ ...form, entryType: type })}
                  style={{
                    fontWeight: form.entryType === type ? "600" : "400",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label>What happened?</label>
            <textarea
              name="content"
              rows="5"
              placeholder="Describe the decision, blocker, win or learning..."
              value={form.content}
              onChange={handleChange}
            />
            {getError("content") && <p>{getError("content")}</p>}
          </div>

          <div>
            <label>Tags — optional</label>
            <input
              type="text"
              name="tags"
              placeholder="e.g. backend, auth, bug"
              value={form.tags}
              onChange={handleChange}
            />
            <small>Separate each tag with a comma</small>
          </div>

          <div>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}
