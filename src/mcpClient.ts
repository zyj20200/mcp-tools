import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import EventSource from "eventsource";

// Polyfill EventSource for Node.js environment if needed by the SDK
// The SDK's SSEClientTransport might expect global EventSource or take it as an option.
// Looking at SDK docs (simulated), usually we pass it or it uses global.
// Let's set it globally just in case.
(global as any).EventSource = EventSource;

let currentClient: Client | null = null;
let currentTransport: SSEClientTransport | null = null;

export async function connectToMcpServer(url: string, headers: Record<string, string> = {}) {
  if (currentClient) {
    try {
      await currentClient.close();
    } catch (e) {
      console.error("Error closing existing client:", e);
    }
    currentClient = null;
    currentTransport = null;
  }

  console.log(`Connecting to ${url}...`);

  // Create a new SSE transport
  // The SSEClientTransport constructor takes the URL and an options object which can include eventSourceInit (for headers)
  currentTransport = new SSEClientTransport(new URL(url), {
    eventSourceInit: {
        headers: headers
    } as any
  });

  currentClient = new Client(
    {
      name: "mcp-tools-workbench",
      version: "1.0.0",
    },
    {
      capabilities: {
        sampling: {},
      },
    }
  );

  await currentClient.connect(currentTransport);
  console.log("Connected to MCP Server");
  
  return { status: "connected" };
}

export async function disconnectMcpServer() {
  if (currentClient) {
    try {
      await currentClient.close();
      console.log("Disconnected from MCP Server");
    } catch (e) {
      console.error("Error closing client:", e);
      throw e;
    } finally {
      currentClient = null;
      currentTransport = null;
    }
  }
  return { status: "disconnected" };
}

export async function listTools() {
  if (!currentClient) {
    throw new Error("Not connected to any MCP Server");
  }
  
  const result = await currentClient.listTools();
  return result.tools;
}

export async function callTool(name: string, args: any) {
  if (!currentClient) {
    throw new Error("Not connected to any MCP Server");
  }

  const result = await currentClient.callTool({
    name,
    arguments: args,
  });

  return result;
}
