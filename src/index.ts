import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { connectToMcpServer, disconnectMcpServer, listTools, callTool } from "./mcpClient.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// API Endpoints

// Connect to MCP Server
app.post("/api/connect", async (req, res) => {
  try {
    const { url, headers } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    await connectToMcpServer(url, headers || {});
    res.json({ success: true, message: "Connected successfully" });
  } catch (error: any) {
    console.error("Connection error:", error);
    res.status(500).json({ error: error.message || "Failed to connect" });
  }
});

// Disconnect from MCP Server
app.post("/api/disconnect", async (req, res) => {
  try {
    await disconnectMcpServer();
    res.json({ success: true, message: "Disconnected successfully" });
  } catch (error: any) {
    console.error("Disconnect error:", error);
    res.status(500).json({ error: error.message || "Failed to disconnect" });
  }
});

// List Tools
app.get("/api/tools", async (req, res) => {
  try {
    const tools = await listTools();
    res.json(tools);
  } catch (error: any) {
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
    const result = await callTool(name, args || {});
    res.json(result);
  } catch (error: any) {
    console.error("Call tool error:", error);
    res.status(500).json({ error: error.message || "Failed to call tool" });
  }
});

// Serve frontend for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`MCP Tools Workbench running at http://localhost:${PORT}`);
});
