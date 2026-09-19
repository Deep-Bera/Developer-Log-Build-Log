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
  Code2,
  BookOpen,
  Target,
} from "lucide-react";

export default function ArtifactModal({
  onClose,
  onGenerate,
  isGenerating,
  error,
}) {
  const tabs = [
    { id: "dev-work", label: "Dev & Work", icon: Code2 },
    { id: "learning", label: "Learning & Teaching", icon: BookOpen },
    { id: "career-reports", label: "Career & Reports", icon: Target },
  ];

  const types = [
    {
      id: "readme",
      tab: "dev-work",
      icon: FileCode,
      title: "README.md",
      description: "Standard repo setup, features & tech stack documentation",
      bullets: [
        "Project description, tech stack & setup instructions",
        "Key architectural decisions & solutions to challenges",
      ],
    },
    {
      id: "work-summary",
      tab: "dev-work",
      icon: Briefcase,
      title: "Work & Sprint Digest",
      description: "Executive recap of wins, decisions & roadblocks for standups",
      bullets: [
        "High-impact deliverables & key decisions made",
        "Cross-team dependencies resolved for appraisals & updates",
      ],
    },
    {
      id: "study-summary",
      tab: "learning",
      icon: GraduationCap,
      title: "Study & Revision Notes",
      description: "Synthesize core concepts, key formulas & self-assessment quiz",
      bullets: [
        "Takeaways extracted from Learn logs & doubts clarified",
        "Self-assessment quiz with answers in blockquotes",
      ],
    },
    {
      id: "lesson-reflection",
      tab: "learning",
      icon: Lightbulb,
      title: "Lesson Reflection",
      description: "Pedagogical review of classroom engagement & student struggles",
      bullets: [
        "What worked in class explanations & curriculum progress",
        "Hurdles identified with actionable adjustments for next lesson",
      ],
    },
    {
      id: "interview-qa",
      tab: "career-reports",
      icon: HelpCircle,
      title: "Interview Q&A",
      description: "STAR-method behavioral & technical Q&As based on your logs",
      bullets: [
        "6 structured Q&A pairs (Situation, Task, Action, Result)",
        "Highlighting decision-making and problem-solving skills",
      ],
    },
    {
      id: "progress-report",
      tab: "career-reports",
      icon: ClipboardList,
      title: "Formal Progress Report",
      description: "Executive status overview, completed milestones & next actions",
      bullets: [
        "Formal status report for professors, mentors, or clients",
        "Active roadblocks, mitigation strategies & action plan",
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [selectedType, setSelectedType] = useState(types[0].id);

  const filteredTypes = types.filter((t) => t.tab === activeTab);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstInTab = types.find((t) => t.tab === tabId);
    if (firstInTab) setSelectedType(firstInTab.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Choose Artifact Type
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
          Select what type of document you want to generate
        </p>

        {/* category tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-4">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${isActive
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
              >
                <TabIcon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* error banner */}
        {error && (
          <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 leading-relaxed">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* tab content — 2 clean cards */}
        <div className="space-y-3 mb-6">
          {filteredTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${isSelected
                  ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800"
                  : "border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900"
                  }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Icon
                    size={18}
                    className={`shrink-0 mt-0.5 ${isSelected
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-400 dark:text-neutral-500"
                      }`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold ${isSelected
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-700 dark:text-neutral-300"
                        }`}
                    >
                      {type.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-2 mt-0.5 leading-relaxed">
                      {type.description}
                    </p>
                    <div className="space-y-1">
                      {type.bullets.map((bullet, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400"
                        >
                          <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600 shrink-0" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-3.5 h-3.5 rounded-full border shrink-0 mt-1 transition-colors ${isSelected
                    ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white"
                    : "border-neutral-300 dark:border-neutral-600"
                    }`}
                />
              </button>
            );
          })}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedType && onGenerate(selectedType)}
            disabled={!selectedType || isGenerating}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
