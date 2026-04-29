#!/usr/bin/env node

// todometer MCP Server — standalone process for Model Context Protocol
// Run via: node src/mcp/index.js [--db-path /path/to/todometer.db]
//
// {
//   "mcpServers": {
//     "todometer": {
//       "command": "node",
//       "args": ["/path/to/todometer/src/mcp/index.js"]
//     }
//   }
// }

import { createInterface } from "readline";
import path from "path";
import os from "os";
import * as db from "../main/db.js";

const SERVER_NAME = "todometer";
const SERVER_VERSION = "1.0.0";

// Determine DB path from args or default
function getDbPath() {
	const args = process.argv.slice(2);
	const dbIdx = args.indexOf("--db-path");
	if (dbIdx !== -1 && args[dbIdx + 1]) {
		return args[dbIdx + 1];
	}

	const platform = process.platform;
	let userDataDir;
	if (platform === "darwin") {
		userDataDir = path.join(os.homedir(), "Library", "Application Support", "todometer");
	} else if (platform === "win32") {
		userDataDir = path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "todometer");
	} else {
		userDataDir = path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "todometer");
	}
	return path.join(userDataDir, "todometer.db");
}

// JSON-RPC helpers
function sendResponse(id, result) {
	const msg = JSON.stringify({ jsonrpc: "2.0", id, result });
	process.stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);
}

function sendError(id, code, message) {
	const msg = JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
	process.stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);
}

function sendNotification(method, params) {
	const msg = JSON.stringify({ jsonrpc: "2.0", method, params });
	process.stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);
}

const TOOLS = [
	{
		name: "list_todos",
		description: "List all todo items. Returns items with their id, text, status (pending/paused/completed), and timestamps.",
		inputSchema: {
			type: "object",
			properties: {
				status: {
					type: "string",
					enum: ["pending", "paused", "completed"],
					description: "Filter by status. If omitted, returns all items.",
				},
			},
		},
	},
	{
		name: "add_todo",
		description: "Add a new todo item.",
		inputSchema: {
			type: "object",
			properties: {
				text: {
					type: "string",
					description: "The text of the todo item.",
				},
				status: {
					type: "string",
					enum: ["pending", "paused"],
					description: "Initial status. Defaults to 'pending'.",
				},
			},
			required: ["text"],
		},
	},
	{
		name: "update_todo",
		description: "Update an existing todo item's text or status.",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The UUID of the todo item to update.",
				},
				text: {
					type: "string",
					description: "New text for the todo item.",
				},
				status: {
					type: "string",
					enum: ["pending", "paused", "completed"],
					description: "New status for the todo item.",
				},
			},
			required: ["id"],
		},
	},
	{
		name: "delete_todo",
		description: "Delete a todo item (soft delete).",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The UUID of the todo item to delete.",
				},
			},
			required: ["id"],
		},
	},
];

function handleRequest(method, params, id) {
	switch (method) {
		case "initialize":
			sendResponse(id, {
				protocolVersion: "2024-11-05",
				capabilities: {
					tools: {},
				},
				serverInfo: {
					name: SERVER_NAME,
					version: SERVER_VERSION,
				},
			});
			break;

		case "notifications/initialized":
			break;

		case "tools/list":
			sendResponse(id, { tools: TOOLS });
			break;

		case "tools/call":
			handleToolCall(params, id);
			break;

		case "ping":
			sendResponse(id, {});
			break;

		default:
			if (id !== undefined) {
				sendError(id, -32601, `Method not found: ${method}`);
			}
	}
}

function handleToolCall(params, id) {
	const { name, arguments: args } = params;

	try {
		switch (name) {
			case "list_todos": {
				let items = db.getAllItems();
				if (args?.status) {
					items = items.filter((i) => i.status === args.status);
				}
				sendResponse(id, {
					content: [
						{
							type: "text",
							text: JSON.stringify(items, null, 2),
						},
					],
				});
				break;
			}

			case "add_todo": {
				const item = db.addItem({
					text: args.text,
					status: args.status || "pending",
				});
				sendResponse(id, {
					content: [
						{
							type: "text",
							text: JSON.stringify(item, null, 2),
						},
					],
				});
				break;
			}

			case "update_todo": {
				const item = db.updateItem({
					id: args.id,
					text: args.text,
					status: args.status,
				});
				sendResponse(id, {
					content: [
						{
							type: "text",
							text: JSON.stringify(item, null, 2),
						},
					],
				});
				break;
			}

			case "delete_todo": {
				db.deleteItem(args.id);
				sendResponse(id, {
					content: [
						{
							type: "text",
							text: `Deleted todo ${args.id}`,
						},
					],
				});
				break;
			}

			default:
				sendError(id, -32601, `Unknown tool: ${name}`);
		}
	} catch (err) {
		sendResponse(id, {
			content: [
				{
					type: "text",
					text: `Error: ${err.message}`,
				},
			],
			isError: true,
		});
	}
}

function startServer() {
	const dbPath = getDbPath();
	db.openDatabase(dbPath);

	let buffer = "";

	process.stdin.setEncoding("utf8");
	process.stdin.on("data", (chunk) => {
		buffer += chunk;

		while (true) {
			const headerEnd = buffer.indexOf("\r\n\r\n");
			if (headerEnd === -1) break;

			const header = buffer.slice(0, headerEnd);
			const match = header.match(/Content-Length:\s*(\d+)/i);
			if (!match) {
				buffer = buffer.slice(headerEnd + 4);
				continue;
			}

			const contentLength = parseInt(match[1], 10);
			const bodyStart = headerEnd + 4;
			if (buffer.length < bodyStart + contentLength) break;

			const body = buffer.slice(bodyStart, bodyStart + contentLength);
			buffer = buffer.slice(bodyStart + contentLength);

			try {
				const msg = JSON.parse(body);
				handleRequest(msg.method, msg.params, msg.id);
			} catch (err) {
				if (body.includes('"id"')) {
					sendError(null, -32700, "Parse error");
				}
			}
		}
	});

	process.stdin.on("end", () => {
		db.closeDatabase();
		process.exit(0);
	});
}

startServer();
