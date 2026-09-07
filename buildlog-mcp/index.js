import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import getDiff from "./tools/getDiff.js";
import createLog from "./tools/createLog.js";

const PORT = 3210;

const sessionData = {};
const transports = {};

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    exposedHeaders: ["mcp-session-id"],
  }),
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.options("*path", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mcp-session-id, x-buildlog-token, x-buildlog-api-url",
  );
  res.sendStatus(200);
});

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "BuildLog MCP server is running" });
});

function createServer() {
  const server = new McpServer({
    name: "buildlog-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "get_git_diff",
    {
      description: "Gets the latest git diff from the user's local repository",
    },
    async () => {
      const result = getDiff();
      if (!result.success) {
        return {
          content: [{ type: "text", text: `Error: ${result.message}` }],
        };
      }
      return { content: [{ type: "text", text: result.diff }] };
    },
  );

  server.registerTool(
    "create_log",
    {
      description: "Creates a log entry in the Build Log platform",
      inputSchema: {
        projectId: z.string().describe("The project ID to attach the log to"),
        entryType: z
          .enum(["Decision", "Blocker", "Win", "Learn"])
          .describe("Type of log entry"),
        content: z
          .string()
          .describe("The log content describing what happened"),
        tags: z.array(z.string()).describe("Relevant tags for this log entry"),
      },
    },
    async (arg, extra) => {
      const sessionId = extra?.sessionId;
      const session = sessionData[sessionId];

      if (!session?.token || !session?.apiUrl) {
        return {
          content: [
            {
              type: "text",
              text: "Error: No auth token or API URL found for this session",
            },
          ],
        };
      }

      const result = await createLog({
        ...arg,
        token: session.token,
        apiUrl: session.apiUrl,
      });

      if (!result.success) {
        return {
          content: [{ type: "text", text: `Error: ${result.message}` }],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Log created successfully — ${arg.entryType}: ${arg.content.slice(0, 80)}...`,
          },
        ],
      };
    },
  );

  return server;
}

// helper to check if a request is an initialize request..
function isInitializeRequest(body) {
  return body?.method === "initialize";
}

// POST /mcp — handles init, tool calls, notifications..
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  // console.log("Incoming request:", req.body?.method, "sessionId:", sessionId);
  // console.log("Known sessions:", Object.keys(transports));
  try {
    let transport;

    if (sessionId && transports[sessionId]) {
      // existing session — reuse transport..
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // new session — only create transport for initialize requests..
      const token = req.headers["x-buildlog-token"];
      const apiUrl = req.headers["x-buildlog-api-url"];

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          // store transport only after session is fully initialized — avoids race condition..
          transports[sid] = transport;
          if (token && apiUrl) {
            sessionData[sid] = { token, apiUrl };
          }
        },
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) {
          delete transports[sid];
          delete sessionData[sid];
        }
      };

      // connect server to transport before handling the request..
      const server = createServer();
      await server.connect(transport);
    } else {
      return res
        .status(400)
        .json({ message: "Bad request — send initialize first" });
    }

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.log("MCP POST error", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    }
  }
});

// GET /mcp — SSE stream for server-initiated messages..
app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = transports[sessionId];

  if (!transport) {
    return res.status(400).json({ message: "No session found" });
  }

  await transport.handleRequest(req, res);
});

// DELETE /mcp — session termination..
app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = transports[sessionId];

  if (!transport) {
    return res.status(400).json({ message: "No session found" });
  }

  await transport.handleRequest(req, res);
});

app.listen(PORT, () => {
  console.log(`BuildLog MCP server running on http://localhost:${PORT}`);
  console.log(
    `Run this from your project folder so git diff reads the right repo`,
  );
});
