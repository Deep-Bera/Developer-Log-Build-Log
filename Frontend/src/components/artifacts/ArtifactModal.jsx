import { useState } from "react";
import {
  X,
  FileCode,
  HelpCircle,
  GraduationCap,
  ClipboardList,
  Briefcase,
  Lightbulb,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function ArtifactModal({
  onClose,
  onGenerate,
  isGenerating,
  error,
}) {
  const types = [
    {
      id: "readme",
      icon: FileCode,
      title: "README.md",
      badge: "Dev & Code",
      categoryColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/50",
      shortDesc: "Standard repo setup, architecture & tech stack",
      highlights: [
        "Project overview & tech stack specification",
        "Key architectural decisions made during development",
        "Technical challenges solved & key learnings",
        "Getting started guide tailored to your stack",
      ],
      audience: "Developers, Open-Source & Tech Portfolios",
    },
    {
      id: "interview-qa",
      icon: HelpCircle,
      title: "Interview Q&A",
      badge: "Career & Prep",
      categoryColor: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/50",
      shortDesc: "STAR-method questions based on your logs",
      highlights: [
        "6 insightful behavioral & technical Q&A pairs",
        "Clear Situation, Task, Action, Result (STAR) structure",
        "Architecture & problem-solving rationale",
        "Directly usable for job and technical interviews",
      ],
      audience: "Job Seekers & Technical Interview Candidates",
    },
    {
      id: "study-summary",
      icon: GraduationCap,
      title: "Study & Revision Notes",
      badge: "Learning & Academic",
      categoryColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/50",
      shortDesc: "Key concepts, takeaways & self-assessment quiz",
      highlights: [
        "Core concepts synthesized from your Learn logs",
        "Common pitfalls & resolved doubts from Blockers",
        "Key problem-solving decisions documented",
        "Self-assessment quiz with answers in blockquotes",
      ],
      audience: "Students, Self-Learners & Exam Takers",
    },
    {
      id: "progress-report",
      icon: ClipboardList,
      title: "Formal Progress Report",
      badge: "Report & Submission",
      categoryColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50",
      shortDesc: "Executive status, milestones & next actions",
      highlights: [
        "Executive project summary & status overview",
        "Completed milestones structured from Wins & Decisions",
        "Active roadblocks & mitigation strategies",
        "Clear next steps & upcoming action plan",
      ],
      audience: "Professors, Mentors & Freelance Clients",
    },
    {
      id: "work-summary",
      icon: Briefcase,
      title: "Work & Sprint Digest",
      badge: "Work & Team",
      categoryColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/50",
      shortDesc: "Executive recap of wins, decisions & blockers",
      highlights: [
        "High-impact wins & completed deliverables",
        "Key strategic decisions & architectural rationale",
        "Cross-team dependencies & overcome hurdles",
        "Ready for Slack, team standups & appraisal reviews",
      ],
      audience: "Engineers, Managers & Team Leads",
    },
    {
      id: "lesson-reflection",
      icon: Lightbulb,
      title: "Lesson Reflection",
      badge: "Teaching & Education",
      categoryColor: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50",
      shortDesc: "Pedagogical review of student struggles & wins",
      highlights: [
        "Learning outcomes & syllabus progress review",
        "What worked well in class engagement & explanations",
        "Student struggle areas & conceptual hurdle analysis",
        "Actionable adjustments for the next lesson or batch",
      ],
      audience: "Teachers, Tutors & Course Creators",
    },
  ];

  const [selectedType, setSelectedType] = useState(types[0].id);
  const currentItem = types.find((t) => t.id === selectedType) || types[0];
  const CurrentIcon = currentItem.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
              Generate Artifact
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              Select a document type to synthesize and format your project logs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* error banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 leading-relaxed">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* body — master-detail layout */}
        <div className="flex flex-col md:flex-row flex-1 min-h-[380px] overflow-hidden">
          {/* left list pane */}
          <div className="w-full md:w-5/12 border-r border-neutral-100 dark:border-neutral-800 p-3 overflow-y-auto space-y-1.5 bg-neutral-50/50 dark:bg-neutral-950/30">
            {types.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                    isSelected
                      ? "bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200/80 dark:border-neutral-700"
                      : "hover:bg-white/80 dark:hover:bg-neutral-800/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          isSelected
                            ? "text-neutral-900 dark:text-white"
                            : "text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {type.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                        {type.shortDesc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`shrink-0 transition-transform ${
                      isSelected
                        ? "text-neutral-900 dark:text-white translate-x-0.5"
                        : "text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* right preview pane */}
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto bg-white dark:bg-neutral-900">
            <div>
              {/* title & category */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <CurrentIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {currentItem.title}
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      {currentItem.shortDesc}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${currentItem.categoryColor}`}
                >
                  {currentItem.badge}
                </span>
              </div>

              {/* highlights */}
              <div className="mt-5 space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  What this document includes:
                </p>
                <div className="space-y-2">
                  {currentItem.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed"
                    >
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500 shrink-0 mt-0.5"
                      />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* audience */}
              <div className="mt-5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-xs">
                <span className="font-medium text-neutral-500 dark:text-neutral-400">
                  Target Audience:{" "}
                </span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                  {currentItem.audience}
                </span>
              </div>
            </div>

            {/* tip */}
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-6 italic">
              ✨ AI synthesizes all project logs, decisions, wins, and blockers into structured Markdown.
            </p>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedType && onGenerate(selectedType)}
            disabled={!selectedType || isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Generate {currentItem.title}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
