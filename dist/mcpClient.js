"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMcpServer = connectToMcpServer;
exports.getCurrentTransportType = getCurrentTransportType;
exports.disconnectMcpServer = disconnectMcpServer;
exports.listTools = listTools;
exports.callTool = callTool;
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/client/sse.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/client/streamableHttp.js");
const eventsource_1 = __importDefault(require("eventsource"));
// Polyfill EventSource for Node.js environment if needed by the SDK
// The SDK's SSEClientTransport might expect global EventSource or take it as an option.
// Looking at SDK docs (simulated), usually we pass it or it uses global.
// Let's set it globally just in case.
global.EventSource = eventsource_1.default;
let currentClient = null;
let currentTransport = null;
let currentTransportType = null;
function createClient() {
    return new index_js_1.Client({
        name: "mcp-tools-workbench",
        version: "1.0.0",
    }, {
        capabilities: {
            sampling: {},
        },
    });
}
function createSseTransport(url, headers) {
    return new sse_js_1.SSEClientTransport(url, {
        eventSourceInit: {
            headers,
        },
        requestInit: {
            headers,
        },
    });
}
function createStreamableHttpTransport(url, headers) {
    return new streamableHttp_js_1.StreamableHTTPClientTransport(url, {
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
    }
    catch (e) {
        console.error("Error closing existing client:", e);
    }
    finally {
        currentClient = null;
        currentTransport = null;
        currentTransportType = null;
    }
}
async function connectWithTransport(url, headers, transportType) {
    const transport = transportType === "sse"
        ? createSseTransport(url, headers)
        : createStreamableHttpTransport(url, headers);
    const client = createClient();
    try {
        await client.connect(transport);
    }
    catch (error) {
        try {
            await client.close();
        }
        catch {
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
async function connectToMcpServer(url, headers = {}, transportType = "auto") {
    await clearCurrentConnection();
    const normalizedUrl = new URL(url);
    console.log(`Connecting to ${url} with transport=${transportType} ...`);
    if (transportType !== "auto") {
        return connectWithTransport(normalizedUrl, headers, transportType);
    }
    try {
        return await connectWithTransport(normalizedUrl, headers, "streamable-http");
    }
    catch (streamableError) {
        console.warn("Streamable HTTP connection failed, falling back to SSE:", streamableError?.message || streamableError);
        try {
            return await connectWithTransport(normalizedUrl, headers, "sse");
        }
        catch (sseError) {
            throw new Error(`Failed to connect via Streamable HTTP (${streamableError?.message || "unknown error"}) and SSE (${sseError?.message || "unknown error"})`);
        }
    }
}
function getCurrentTransportType() {
    return currentTransportType;
}
async function disconnectMcpServer() {
    if (!currentClient) {
        return { status: "disconnected", transportType: null };
    }
    const previousTransportType = currentTransportType;
    try {
        await currentClient.close();
        console.log("Disconnected from MCP Server");
    }
    catch (e) {
        console.error("Error closing client (ignoring):", e);
    }
    finally {
        currentClient = null;
        currentTransport = null;
        currentTransportType = null;
    }
    return { status: "disconnected", transportType: previousTransportType };
}
async function listTools() {
    if (!currentClient) {
        throw new Error("Not connected to any MCP Server");
    }
    const result = await currentClient.listTools();
    return result.tools;
}
async function callTool(name, args) {
    if (!currentClient) {
        throw new Error("Not connected to any MCP Server");
    }
    const result = await currentClient.callTool({
        name,
        arguments: args,
    });
    return result;
}
