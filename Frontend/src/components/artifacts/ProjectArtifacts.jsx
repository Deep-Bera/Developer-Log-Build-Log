import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axiosConfig/axiosConfig";
import useAuthError from "../../customHook/AuthErrorHook";
import ArtifactModal from "../artifacts/ArtifactModal";
import ArtifactList from "../artifacts/ArtifactList";
import ArtifactViewer from "../artifacts/ArtifactViewer";
import {
  ChevronLeft,
  Loader2,
  FileText,
  MessageCircle,
  Sparkles,
} from "lucide-react";

export default function ProjectArtifacts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showArtifactModal, setShowArtifactModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `${localStorage.getItem("token")}` };
  const handleAuthError = useAuthError();

  // fetch project details..
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/api/projects/${id}`, { headers });
        setProject(response.data.data);
      } catch (err) {
        handleAuthError(err);
        console.log(err.response?.data);
      }
    })();
  }, [id]);

  // fetch all artifacts for this project..
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/api/artifacts/${id}`, { headers });
        setArtifacts(response.data.data);
        setLoading(false);
      } catch (err) {
        handleAuthError(err);
        console.log(err.response?.data);
        setLoading(false);
      }
    })();
  }, [id]);

  const handleGenerate = (type) => {
    setIsGenerating(true);
    axios
      .post(`/api/artifacts/${id}`, { type }, { headers })
      .then((response) => {
        const newArtifact = response.data.data;
        setArtifacts((prev) => [newArtifact, ...prev]);
        setSelectedArtifact(newArtifact);
        setShowArtifactModal(false);
      })
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response?.data);
      })
      .finally(() => setIsGenerating(false));
  };

  const handleEdit = () => {
    setEditContent(selectedArtifact.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    axios
      .patch(
        `/api/artifacts/${id}/${selectedArtifact._id}`,
        { content: editContent },
        { headers },
      )
      .then((response) => {
        const updated = response.data.data;
        setArtifacts((prev) =>
          prev.map((a) => (a._id === updated._id ? updated : a)),
        );
        setSelectedArtifact(updated);
        setIsEditing(false);
      })
      .catch((err) => {
        handleAuthError(err);
        console.log(err.response?.data);
      })
      .finally(() => setIsSaving(false));
  };

  const handleDownload = () => {
    const blob = new Blob([selectedArtifact.content], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name}-${selectedArtifact.type}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectArtifact = (artifact) => {
    setSelectedArtifact(artifact);
    setIsEditing(false);
  };

  const countByType = (type) => artifacts.filter((a) => a.type === type).length;

  const getTypeIcon = (type) =>
    type === "readme" ? <FileText size={13} /> : <MessageCircle size={13} />;

  const getTypeLabel = (type) =>
    type === "readme" ? "README.md" : "Interview Q&A";

  if (!project)
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-950">
        <Loader2
          size={20}
          className="animate-spin text-neutral-400 dark:text-neutral-500"
        />
      </div>
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* topbar */}
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
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
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
          {project.status === "complete" && (
            <button
              onClick={() => setShowArtifactModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={12} />
              Generate Artifact
            </button>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 px-7 py-2 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
        <button
          onClick={() => navigate(`/Project/${id}`)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Logs
        </button>
        <button
          onClick={() => navigate(`/Project/${id}/artifacts`)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-colors"
        >
          ✨ Artifacts {artifacts.length > 0 && `(${artifacts.length})`}
        </button>
      </div>

      {/* body — two columns */}
      <div className="flex flex-1 overflow-hidden gap-2 p-2">
        <ArtifactList
          artifacts={artifacts}
          selectedArtifact={selectedArtifact}
          onSelectArtifact={handleSelectArtifact}
          loading={loading}
          countByType={countByType}
          getTypeIcon={getTypeIcon}
          getTypeLabel={getTypeLabel}
        />

        <ArtifactViewer
          selectedArtifact={selectedArtifact}
          isEditing={isEditing}
          editContent={editContent}
          setEditContent={setEditContent}
          isSaving={isSaving}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          onDownload={handleDownload}
          getTypeIcon={getTypeIcon}
          getTypeLabel={getTypeLabel}
        />
      </div>

      {showArtifactModal && (
        <ArtifactModal
          onClose={() => setShowArtifactModal(false)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}
