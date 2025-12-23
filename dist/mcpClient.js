"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMcpServer = connectToMcpServer;
exports.listTools = listTools;
exports.callTool = callTool;
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/client/sse.js");
const eventsource_1 = __importDefault(require("eventsource"));
// Polyfill EventSource for Node.js environment if needed by the SDK
// The SDK's SSEClientTransport might expect global EventSource or take it as an option.
// Looking at SDK docs (simulated), usually we pass it or it uses global.
// Let's set it globally just in case.
global.EventSource = eventsource_1.default;
let currentClient = null;
let currentTransport = null;
async function connectToMcpServer(url, headers = {}) {
    if (currentClient) {
        try {
            await currentClient.close();
        }
        catch (e) {
            console.error("Error closing existing client:", e);
        }
        currentClient = null;
        currentTransport = null;
    }
    console.log(`Connecting to ${url}...`);
    // Create a new SSE transport
    // The SSEClientTransport constructor takes the URL and an options object which can include eventSourceInit (for headers)
    currentTransport = new sse_js_1.SSEClientTransport(new URL(url), {
        eventSourceInit: {
            headers: headers
        }
    });
    currentClient = new index_js_1.Client({
        name: "mcp-tools-workbench",
        version: "1.0.0",
    }, {
        capabilities: {
            sampling: {},
        },
    });
    await currentClient.connect(currentTransport);
    console.log("Connected to MCP Server");
    return { status: "connected" };
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
