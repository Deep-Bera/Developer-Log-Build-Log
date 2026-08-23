import { useState } from "react";

export default function LogCard({ log, onSave, onDelete }) {
  // local edit state lives here now, no need to track it in the parent..
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    entryType: "",
    content: "",
    tags: "",
  });

  // dot color per entry type
  const dotColor = {
    Decision: "#7f77dd",
    Blocker: "#e24b4a",
    Win: "#639922",
    Learn: "#ba7517",
  };

  // pre fill the form with existing log data so user doesnt have to retype everything..
  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({
      entryType: log.entryType,
      content: log.content,
      tags: log.tags.join(", "),
    });
  };

  // just reset everything back..
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ entryType: "", content: "", tags: "" });
  };

  // fire the patch and let the parent update the logs state..
  const handleSaveEdit = () => {
    const payload = {
      entryType: editForm.entryType,
      content: editForm.content,
      tags: editForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    onSave(log._id, payload, handleCancelEdit);
  };

  // confirm before deleting..
  const handleDeleteClick = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this log? This cannot be undone.",
    );
    if (!confirmed) return;
    onDelete(log._id);
  };

  return (
    <div style={{ display: "flex", gap: "16px" }}>
      {/* timeline dot */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: dotColor[log.entryType],
            marginTop: "5px",
          }}
        ></div>
        <div
          style={{
            width: "1px",
            background: "#e2e8f0",
            flex: 1,
            marginTop: "4px",
          }}
        ></div>
      </div>

      {/* log card */}
      <div style={{ flex: 1, marginBottom: "16px" }}>
        {/* flip between edit mode and read mode..  */}
        {isEditing ? (
          // --- inline edit mode ---
          <div>
            {/* entry type selector */}
            <div>
              {["Decision", "Blocker", "Win", "Learn"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, entryType: type })}
                  style={{
                    fontWeight: editForm.entryType === type ? "600" : "400",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* content */}
            <textarea
              rows="4"
              value={editForm.content}
              onChange={(e) =>
                setEditForm({ ...editForm, content: e.target.value })
              }
            />

            {/* tags */}
            <input
              type="text"
              value={editForm.tags}
              placeholder="e.g. backend, auth, bug"
              onChange={(e) =>
                setEditForm({ ...editForm, tags: e.target.value })
              }
            />
            <small>Separate each tag with a comma</small>

            {/* save / cancel */}
            <div>
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          // --- read mode ---
          <div>
            <div>
              <span>{log.entryType}</span>
              <span>
                {new Date(log.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p>{log.content}</p>
            <div>
              {log.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            {/* edit and delete buttons sitting directly on the card.. */}
            <div>
              <button onClick={handleEditClick}>Edit</button>
              <button onClick={handleDeleteClick}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
