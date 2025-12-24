"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const mcpClient_js_1 = require("./mcpClient.js");
const app = (0, express_1.default)();
const PORT = 3001;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
// API Endpoints
// Connect to MCP Server
app.post("/api/connect", async (req, res) => {
    try {
        const { url, headers } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }
        await (0, mcpClient_js_1.connectToMcpServer)(url, headers || {});
        res.json({ success: true, message: "Connected successfully" });
    }
    catch (error) {
        console.error("Connection error:", error);
        res.status(500).json({ error: error.message || "Failed to connect" });
    }
});
// Disconnect from MCP Server
app.post("/api/disconnect", async (req, res) => {
    try {
        await (0, mcpClient_js_1.disconnectMcpServer)();
        res.json({ success: true, message: "Disconnected successfully" });
    }
    catch (error) {
        console.error("Disconnect error:", error);
        res.status(500).json({ error: error.message || "Failed to disconnect" });
    }
});
// List Tools
app.get("/api/tools", async (req, res) => {
    try {
        const tools = await (0, mcpClient_js_1.listTools)();
        res.json(tools);
    }
    catch (error) {
        console.error("List tools error:", error);
        res.status(500).json({ error: error.message || "Failed to list tools" });
    }
});
// Call Tool
app.post("/api/tools/call", async (req, res) => {
    try {
        const { name, args } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Tool name is required" });
        }
        const result = await (0, mcpClient_js_1.callTool)(name, args || {});
        res.json(result);
    }
    catch (error) {
        console.error("Call tool error:", error);
        res.status(500).json({ error: error.message || "Failed to call tool" });
    }
});
// Serve frontend for any other route
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/index.html"));
});
app.listen(PORT, () => {
    console.log(`MCP Tools Workbench running at http://localhost:${PORT}`);
});
