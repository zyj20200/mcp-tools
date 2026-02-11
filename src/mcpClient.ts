import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import EventSource from "eventsource";

// Polyfill EventSource for Node.js environment if needed by the SDK
// The SDK's SSEClientTransport might expect global EventSource or take it as an option.
// Looking at SDK docs (simulated), usually we pass it or it uses global.
// Let's set it globally just in case.
(global as any).EventSource = EventSource;

let currentClient: Client | null = null;
let currentTransport: SSEClientTransport | StreamableHTTPClientTransport | null = null;
let currentTransportType: "sse" | "streamable-http" | null = null;

export type MCPTransportType = "auto" | "sse" | "streamable-http";

function createClient() {
  return new Client(
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
}

function createSseTransport(url: URL, headers: Record<string, string>) {
  return new SSEClientTransport(url, {
    eventSourceInit: {
      headers,
    } as any,
    requestInit: {
      headers,
    },
  });
}

function createStreamableHttpTransport(url: URL, headers: Record<string, string>) {
  return new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers,
    },
  });
}

async function clearCurrentConnection() {
  if (!currentClient) {
    return;
  }

  try {
    await currentClient.close();
  } catch (e) {
    console.error("Error closing existing client:", e);
  } finally {
    currentClient = null;
    currentTransport = null;
    currentTransportType = null;
  }
}

async function connectWithTransport(url: URL, headers: Record<string, string>, transportType: "sse" | "streamable-http") {
  const transport = transportType === "sse"
    ? createSseTransport(url, headers)
    : createStreamableHttpTransport(url, headers);

  const client = createClient();
  try {
    await client.connect(transport);
  } catch (error) {
    try {
      await client.close();
    } catch {
      // ignore cleanup errors
    }
    throw error;
  }

  currentClient = client;
  currentTransport = transport;
  currentTransportType = transportType;

  console.log(`Connected to MCP Server via ${transportType}`);
  return { status: "connected", transportType };
}

export async function connectToMcpServer(
  url: string,
  headers: Record<string, string> = {},
  transportType: MCPTransportType = "auto"
) {
  await clearCurrentConnection();

  const normalizedUrl = new URL(url);

  console.log(`Connecting to ${url} with transport=${transportType} ...`);

  if (transportType !== "auto") {
    return connectWithTransport(normalizedUrl, headers, transportType);
  }

  try {
    return await connectWithTransport(normalizedUrl, headers, "streamable-http");
  } catch (streamableError: any) {
    console.warn("Streamable HTTP connection failed, falling back to SSE:", streamableError?.message || streamableError);
    try {
      return await connectWithTransport(normalizedUrl, headers, "sse");
    } catch (sseError: any) {
      throw new Error(
        `Failed to connect via Streamable HTTP (${streamableError?.message || "unknown error"}) and SSE (${sseError?.message || "unknown error"})`
      );
    }
  }
}

export function getCurrentTransportType() {
  return currentTransportType;
}

export async function disconnectMcpServer() {
  if (!currentClient) {
    return { status: "disconnected", transportType: null };
  }

  const previousTransportType = currentTransportType;
  try {
    await currentClient.close();
    console.log("Disconnected from MCP Server");
  } catch (e) {
    console.error("Error closing client (ignoring):", e);
  } finally {
    currentClient = null;
    currentTransport = null;
    currentTransportType = null;
  }

  return { status: "disconnected", transportType: previousTransportType };
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
