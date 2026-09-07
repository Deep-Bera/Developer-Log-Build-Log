import axios from "axios";

const MCP_URL = import.meta.env.VITE_MCP_URL || "http://localhost:3210";

// check if MCP server is running..
export async function checkHealth() {
  try {
    const response = await axios.get(`${MCP_URL}/health`);
    return response.status >= 200 && response.status < 300;
  } catch {
    return false;
  }
}

// initialize an MCP session — passes auth credentials so create_log can call the backend API..
export async function initSession(token, apiUrl) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };

  // pass auth credentials for the create_log tool..
  if (token) headers["x-buildlog-token"] = token;
  if (apiUrl) headers["x-buildlog-api-url"] = apiUrl;

  const response = await axios.post(
    `${MCP_URL}/mcp`,
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "buildlog-frontend", version: "1.0.0" },
      },
    },
    { headers },
  );

  const sessionId =
    response.headers?.["mcp-session-id"] ||
    (typeof response.headers?.get === "function"
      ? response.headers.get("mcp-session-id")
      : null);

  // send initialized notification..
  await axios
    .post(
      `${MCP_URL}/mcp`,
      {
        jsonrpc: "2.0",
        method: "notifications/initialized",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "mcp-session-id": sessionId,
        },
      },
    )
    .catch(() => {}); // ignore notification errors..

  return sessionId;
}

// call an MCP tool and parse the SSE response..
export async function callTool(sessionId, toolName, args = {}) {
  const response = await axios.post(
    `${MCP_URL}/mcp`,
    {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: toolName, arguments: args },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId,
      },
      responseType: "text",
    },
  );

  const text = response.data;

  // parse SSE response — extract the data line..
  const dataLine = (typeof text === "string" ? text : JSON.stringify(text))
    .split("\n")
    .find((line) => line.startsWith("data:"));
  if (!dataLine) throw new Error("No data in MCP response");

  const parsed = JSON.parse(dataLine.replace("data:", "").trim());
  const resultText = parsed?.result?.content?.[0]?.text;

  if (!resultText || resultText.startsWith("Error:")) {
    throw new Error(resultText || `MCP tool ${toolName} failed`);
  }

  return resultText;
}
