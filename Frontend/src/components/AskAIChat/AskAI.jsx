import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "../../axiosConfig/axiosConfig";
import useAuthError from "../../customHook/AuthErrorHook";
import SkeletonCard from "./SkeletonCard";
import SourceChips from "./SourceChips";

const STORAGE_KEY = "askai_history";

export default function AskAI() {
  const [query, setQuery] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const [history, setHistory] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const handleAuthError = useAuthError();

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading, pendingQuestion]);

  const handleAsk = async () => {
    if (!query.trim() || isLoading) return;

    const question = query.trim();
    const token = localStorage.getItem("token");
    setQuery("");
    setPendingQuestion(question);
    setIsLoading(true);

    try {
      const response = await axios.post(
        "/api/ask",
        { query: question },
        { headers: { Authorization: token } },
      );

      const { answer, sources } = response.data;

      setHistory((prev) => [
        ...prev,
        {
          question,
          answer,
          sources,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      handleAuthError(err);
      const status = err.response?.status;

      let errorMessage = "Something went wrong. Please try again.";
      if (status === 503) {
        errorMessage =
          "AI service is currently busy. Please try again in a moment.";
      } else if (status === 400) {
        errorMessage = "Please enter a valid question.";
      }

      setHistory((prev) => [
        ...prev,
        {
          question,
          answer: errorMessage,
          sources: [],
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setPendingQuestion(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); //to prevent adding a new line in the text area not prevent the page reload
      handleAsk();
    }
  };
  //to grow the text input area if the input text increases....
  const handleTextChange = (e) => {
    setQuery(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleClearChat = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Top Header — Full Width with Glass Fade */}
      <header className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0 shadow-xs px-6 py-3 flex items-center justify-between">
        {/* Left Section: Title & Subtitle */}
        <div>
          <h1 className="text-base font-semibold text-neutral-900 dark:text-white">
            Ask AI
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Ask anything about your logs across all projects
          </p>
        </div>

        {/* Right Section: Clear Chat Button */}
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="group relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={14} />

            {/* Tooltip Box */}
            <span className="absolute right-0 top-full mt-1.5 bg-neutral-800 dark:bg-neutral-700 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-20 shadow-md">
              Clear Chat History
            </span>
          </button>
        )}
      </header>

      {/* Main Scrollable Chat Area — Scrollbar Gutter Stable keeps alignment matched */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 hide-scrollbar">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {history.length === 0 && !isLoading && !pendingQuestion && (
            <div className="flex flex-col items-center justify-center min-h-[45vh] gap-3 text-center my-auto">
              <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
                <Sparkles
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">
                Ask anything about your build journey
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-sm leading-relaxed">
                Try asking: "What blockers did I face recently?" or "What
                database decisions were logged?"
              </p>
            </div>
          )}

          {history.map((item, index) => (
            <div key={item.timestamp || index} className="space-y-3">
              {/* Question Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-xs">
                  {item.question}
                </div>
              </div>

              {/* AI Answer Box */}
              <div className="flex items-start gap-3 bg-white dark:bg-neutral-900 border border-neutral-300/80 dark:border-neutral-800 p-4 rounded-2xl shadow-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles
                    size={12}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                <div className="flex-1 overflow-hidden">
                  <div
                    className={`text-sm leading-relaxed ${
                      item.isError
                        ? "text-red-500 dark:text-red-400"
                        : "text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        ul: ({ ...props }) => (
                          <ul
                            className="list-disc list-inside space-y-1 my-2"
                            {...props}
                          />
                        ),
                        ol: ({ ...props }) => (
                          <ol
                            className="list-decimal list-inside space-y-1 my-2"
                            {...props}
                          />
                        ),
                        li: ({ ...props }) => (
                          <li className="leading-relaxed" {...props} />
                        ),
                        p: ({ ...props }) => (
                          <p
                            className="mb-2 last:mb-0 leading-relaxed"
                            {...props}
                          />
                        ),
                        code({ inline, className, children, ...props }) {
                          const isInline = inline || !className;

                          return isInline ? (
                            <code
                              className="bg-neutral-200/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-1.5 py-0.5 rounded text-xs font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code
                              className="block bg-neutral-900 dark:bg-neutral-950 text-neutral-100 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 border border-neutral-800"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {item.answer}
                    </ReactMarkdown>
                  </div>

                  <SourceChips sources={item.sources} />
                </div>
              </div>
            </div>
          ))}

          {isLoading && pendingQuestion && (
            <div className="space-y-3">
              {/*to show the users question..... */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-xs text-sm leading-relaxed shadow-xs">
                  {pendingQuestion}
                </div>
              </div>

              {/* to show the skeleton card.... */}
              <SkeletonCard />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Sticky Bottom Dock — Matches exact padding and scrollbar spacing */}
      <footer className="bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md shrink-0 pt-0.5 pb-3 px-4 sm:px-6 ">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl px-3.5 py-2 shadow-xs focus-within:border-indigo-500/70 dark:focus-within:border-indigo-500/70 transition-all">
            <textarea
              rows={1}
              value={query}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your logs..."
              className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none resize-none leading-relaxed py-1 min-h-[38px] max-h-32"
            />
            <button
              type="button"
              onClick={handleAsk}
              disabled={!query.trim() || isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <Send size={12} />
              Ask
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 ml-2 text-left">
            Press{" "}
            <kbd className="font-sans px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300 border border-neutral-300/50 dark:border-neutral-700/50">
              Enter
            </kbd>{" "}
            to send ·{" "}
            <kbd className="font-sans px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300 border border-neutral-300/50 dark:border-neutral-700/50">
              Shift + Enter
            </kbd>{" "}
            for new line
          </p>
        </div>
      </footer>
    </div>
  );
}
