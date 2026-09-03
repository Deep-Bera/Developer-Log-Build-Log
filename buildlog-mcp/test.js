// test.js
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({
  name: "test-client",
  version: "1.0.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3210/mcp"),
);

await client.connect(transport);
console.log("Connected to MCP server");

// list all tools..
const { tools } = await client.listTools();
console.log(
  "Available tools:",
  tools.map((t) => t.name),
);

// call get_git_diff..
const result = await client.callTool({
  name: "get_git_diff",
  arguments: {},
});

console.log("Git diff result:", result.content[0].text);

await client.close();
