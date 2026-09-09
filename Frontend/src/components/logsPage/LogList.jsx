import LogCard from "./LogCard";

export default function LogList({ logs, selectedLog, onSelectLog }) {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2 hide-scrollbar">
      {logs.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-600 px-2 py-4">
          No logs found.
        </p>
      ) : (
        logs.map((log) => (
          <LogCard
            key={log._id}
            log={log}
            isSelected={selectedLog?._id === log._id}
            onSelectLog={onSelectLog}
          />
        ))
      )}
    </div>
  );
}
