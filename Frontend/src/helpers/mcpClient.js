const MCP_URL = "http://localhost:3210";

// check if MCP server is running..
export async function checkHealth() {
  try {
    const response = await fetch(`${MCP_URL}/health`);
    return response.ok;
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

  const response = await fetch(`${MCP_URL}/mcp`, {
    method: "POST",
    headers,
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

  return sessionId;
}

// call an MCP tool and parse the SSE response..
export async function callTool(sessionId, toolName, args = {}) {
  const response = await fetch(`${MCP_URL}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: toolName, arguments: args },
    }),
  });

  const text = await response.text();

  // parse SSE response — extract the data line..
  const dataLine = text.split("\n").find((line) => line.startsWith("data:"));
  if (!dataLine) throw new Error("No data in MCP response");

  const parsed = JSON.parse(dataLine.replace("data:", "").trim());
  const resultText = parsed?.result?.content?.[0]?.text;

  if (!resultText || resultText.startsWith("Error:")) {
    throw new Error(resultText || `MCP tool ${toolName} failed`);
  }

  return resultText;
}
