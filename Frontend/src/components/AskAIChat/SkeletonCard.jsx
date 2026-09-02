import { Sparkles } from "lucide-react";

export default function SkeletonCard() {
  return (
    <div className="flex items-start gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles
          size={12}
          className="text-indigo-600 dark:text-indigo-400 animate-pulse"
        />
      </div>
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800/60 rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-neutral-100 dark:bg-neutral-800/60 rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-neutral-100 dark:bg-neutral-800/60 rounded animate-pulse" />
      </div>
    </div>
  );
}
