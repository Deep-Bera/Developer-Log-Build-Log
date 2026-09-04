import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "../../axiosConfig/axiosConfig";
import useAuthError from "../../customHook/AuthErrorHook";
import findProjectInQuery from "../../helpers/findProjectInQuery";
import SkeletonCard from "./SkeletonCard";
import SourceChips from "./SourceChips";

const STORAGE_KEY = "askai_history";
const MCP_URL = "http://localhost:3210";

// keywords that trigger the MCP create log flow..
const isCreateLogIntent = (query) => {
  const keywords = [
    "create a log from git",
    "log from git",
    "log from my commit",
    "log from latest commit",
    "log from diff",
    "capture git diff",
    "create log from commit",
  ];
  return keywords.some((k) => query.toLowerCase().includes(k));
};

export default function AskAI() {
  const [query, setQuery] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [history, setHistory] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const bottomRef = useRef(null);
  const handleAuthError = useAuthError();

  // fetch projects on mount so we can validate project name in query..
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/projects", { headers: { Authorization: token } })
      .then((res) => setProjects(res.data))
      .catch((err) => console.log("failed to fetch projects", err.message));
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading, pendingQuestion]);

  // add a message to history..
  const addToHistory = (
    question,
    answer,
    sources = [],
    isError = false,
    isMcp = false,
  ) => {
    setHistory((prev) => [
      ...prev,
      {
        question,
        answer,
        sources,
        timestamp: new Date().toISOString(),
        isError,
        isMcp,
      },
    ]);
  };

  // check if MCP server is running..
  const checkMcpHealth = async () => {
    try {
      const response = await fetch(`${MCP_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  };

  // call the MCP server to get git diff..
  const getGitDiff = async () => {
    const response = await fetch(`${MCP_URL}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "buildlog-frontend", version: "1.0.0" },
        },
      }),
    });

    const sessionId = response.headers.get("mcp-session-id");

    // send initialized notification..
    await fetch(`${MCP_URL}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      }),
    }).catch(() => {}); // ignore notification errors..

    // call get_git_diff tool..
    const toolResponse = await fetch(`${MCP_URL}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "get_git_diff", arguments: {} },
      }),
    });

    const text = await toolResponse.text();

    // parse SSE response — extract the data line..
    const dataLine = text.split("\n").find((line) => line.startsWith("data:"));
    if (!dataLine) throw new Error("No data in response");

    const parsed = JSON.parse(dataLine.replace("data:", "").trim());
    const diff = parsed?.result?.content?.[0]?.text;

    if (!diff || diff.startsWith("Error:")) {
      throw new Error(diff || "Failed to get git diff");
    }

    return { diff, sessionId };
  };

  // MCP create log flow..
  const handleCreateLog = async (question) => {
    const token = localStorage.getItem("token");

    // check if project name is mentioned..
    const matchedProject = findProjectInQuery(question, projects);
    if (!matchedProject) {
      const projectNames = projects.map((p) => `**${p.name}**`).join(", ");
      addToHistory(
        question,
        `Please mention the project name in your request.\n\nFor example: *"create a log from git for ${projects[0]?.name || "your project"}"*\n\nYour projects: ${projectNames}`,
        [],
        true,
      );
      return;
    }

    // check if MCP server is running..
    const mcpRunning = await checkMcpHealth();
    if (!mcpRunning) {
      addToHistory(
        question,
        `**Local MCP server not detected.**\n\nRun this command in your project folder to start it:\n\n\`\`\`\nnpx buildlog-mcp\n\`\`\`\n\nThen try again.`,
        [],
        true,
      );
      return;
    }

    setPendingQuestion(question);
    setIsLoading(true);

    try {
      // first turn — send query to backend with tools..
      const firstResponse = await axios.post(
        "/api/ask/create-log",
        { query: question },
        { headers: { Authorization: token } },
      );

      const { type, toolName, chatHistory, answer } = firstResponse.data;

      // if gemini wants git diff — call MCP server..
      if (type === "tool_call" && toolName === "get_git_diff") {
        let diff;
        try {
          const result = await getGitDiff();
          diff = result.diff;
        } catch (err) {
          addToHistory(
            question,
            `Failed to read git diff: ${err.message}`,
            [],
            true,
          );
          return;
        }

        // second turn — send diff back to backend..
        const secondResponse = await axios.post(
          "/api/ask/tool-result",
          { diff, chatHistory, projectId: matchedProject._id },
          { headers: { Authorization: token } },
        );

        addToHistory(question, secondResponse.data.answer, [], false, true);
        return;
      }

      // gemini responded with text directly..
      addToHistory(question, answer, [], false, true);
    } catch (err) {
      handleAuthError(err);
      const status = err.response?.status;
      let errorMessage = "Something went wrong. Please try again.";
      if (status === 503)
        errorMessage =
          "AI service is currently busy. Please try again in a moment.";
      addToHistory(question, errorMessage, [], true);
    } finally {
      setIsLoading(false);
      setPendingQuestion(null);
    }
  };

  // regular RAG flow..
  const handleAsk = async () => {
    if (!query.trim() || isLoading) return;

    const question = query.trim();
    setQuery("");

    // route based on intent..
    if (isCreateLogIntent(question)) {
      await handleCreateLog(question);
      return;
    }

    // regular RAG flow..
    const token = localStorage.getItem("token");
    setPendingQuestion(question);
    setIsLoading(true);

    try {
      const response = await axios.post(
        "/api/ask",
        { query: question },
        { headers: { Authorization: token } },
      );

      const { answer, sources } = response.data;
      addToHistory(question, answer, sources);
    } catch (err) {
      handleAuthError(err);
      const status = err.response?.status;
      let errorMessage = "Something went wrong. Please try again.";
      if (status === 503)
        errorMessage =
          "AI service is currently busy. Please try again in a moment.";
      else if (status === 400) errorMessage = "Please enter a valid question.";
      addToHistory(question, errorMessage, [], true);
    } finally {
      setIsLoading(false);
      setPendingQuestion(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

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
      <header className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0 shadow-xs px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-neutral-900 dark:text-white">
            Ask AI
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Ask anything about your logs across all projects
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="group relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span className="absolute right-0 top-full mt-1.5 bg-neutral-800 dark:bg-neutral-700 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-20 shadow-md">
              Clear Chat History
            </span>
          </button>
        )}
      </header>
      {/* main scroll chat area */}
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
                Try: "What blockers did I face recently?" or "create a log from
                git for Build Log"
              </p>
            </div>
          )}

          {history.map((item, index) => (
            <div key={item.timestamp || index} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-xs">
                  {item.question}
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white dark:bg-neutral-900 border border-neutral-300/80 dark:border-neutral-800 p-4 rounded-2xl shadow-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles
                    size={12}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                <div className="flex-1 overflow-hidden">
                  <div
                    className={`text-sm leading-relaxed ${item.isError ? "text-red-500 dark:text-red-400" : "text-neutral-800 dark:text-neutral-200"}`}
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

                  {/* show mcp badge for logs created via git diff.. */}
                  {item.isMcp && !item.isError && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-indigo-500 dark:text-indigo-400">
                      <Sparkles size={11} />
                      <span>Created By AI</span>
                    </div>
                  )}

                  <SourceChips sources={item.sources} />
                </div>
              </div>
            </div>
          ))}

          {isLoading && pendingQuestion && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-xs">
                  {pendingQuestion}
                </div>
              </div>
              <SkeletonCard />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>
      <footer className="bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md shrink-0 pt-0.5 pb-3 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl px-3.5 py-2 shadow-xs focus-within:border-indigo-500/70 dark:focus-within:border-indigo-500/70 transition-all">
            <textarea
              rows={1}
              value={query}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder='Ask about your logs... or "create a log from git for [project name]"'
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
