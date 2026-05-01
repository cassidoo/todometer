#!/usr/bin/env node

// todometer MCP Server — standalone process for Model Context Protocol
// Connects to todometer's local REST API (no native modules required).
//
// Requires the Local API to be enabled in todometer settings.
//
// {
//   "mcpServers": {
//     "todometer": {
//       "command": "node",
//       "args": ["/path/to/todometer/src/mcp/index.js"],
//       "env": {
//         "TODOMETER_API_TOKEN": "<your-token>"
//       }
//     }
//   }
// }

import http from "http";

const SERVER_NAME = "todometer";
const SERVER_VERSION = "1.0.0";

const API_PORT = parseInt(process.env.TODOMETER_API_PORT || "19747", 10);
const API_TOKEN = (() => {
	const args = process.argv.slice(2);
	const tokenIdx = args.indexOf("--token");
	if (tokenIdx !== -1 && args[tokenIdx + 1]) {
		return args[tokenIdx + 1];
	}
	return process.env.TODOMETER_API_TOKEN || null;
})();

// HTTP helper to call the local REST API
function apiRequest(method, path, body = null) {
	return new Promise((resolve, reject) => {
		if (!API_TOKEN) {
			reject(
				new Error(
					"No API token provided. Set TODOMETER_API_TOKEN env var or pass --token <token>.",
				),
			);
			return;
		}

		const options = {
			hostname: "127.0.0.1",
			port: API_PORT,
			path,
			method,
			headers: {
				Authorization: `Bearer ${API_TOKEN}`,
			},
		};

		if (body) {
			const payload = JSON.stringify(body);
			options.headers["Content-Type"] = "application/json";
			options.headers["Content-Length"] = Buffer.byteLength(payload);
		}

		const req = http.request(options, (res) => {
			const chunks = [];
			res.on("data", (chunk) => chunks.push(chunk));
			res.on("end", () => {
				const text = Buffer.concat(chunks).toString();
				try {
					const data = JSON.parse(text);
					if (res.statusCode >= 400) {
						reject(new Error(data.error || `API returned ${res.statusCode}`));
					} else {
						resolve(data);
					}
				} catch {
					reject(new Error(`Invalid API response: ${text}`));
				}
			});
		});

		req.on("error", (err) => {
			if (err.code === "ECONNREFUSED") {
				reject(
					new Error(
						"Could not connect to todometer. Make sure the app is running and the Local API is enabled in Settings.",
					),
				);
			} else {
				reject(err);
			}
		});

		if (body) {
			req.write(JSON.stringify(body));
		}
		req.end();
	});
}

// JSON-RPC helpers
function sendResponse(id, result) {
	const msg = JSON.stringify({ jsonrpc: "2.0", id, result });
	process.stdout.write(
		`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`,
	);
}

function sendError(id, code, message) {
	const msg = JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
	process.stdout.write(
		`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`,
	);
}

const TOOLS = [
	{
		name: "list_todos",
		description:
			"List all to-do items from todometer. Returns items with their id, text, status (pending/paused/completed), and timestamps.",
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
		description: "Add a new to-do item to todometer.",
		inputSchema: {
			type: "object",
			properties: {
				text: {
					type: "string",
					description: "The text of the to-do item.",
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
		description: "Update an existing todometer item's text or status.",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The UUID of the to-do item to update.",
				},
				text: {
					type: "string",
					description: "New text for the to-do item.",
				},
				status: {
					type: "string",
					enum: ["pending", "paused", "completed"],
					description: "New status for the to-do item.",
				},
			},
			required: ["id"],
		},
	},
	{
		name: "delete_todo",
		description: "Delete a todometer item (soft delete).",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The UUID of the to-do item to delete.",
				},
			},
			required: ["id"],
		},
	},
];

async function handleRequest(method, params, id) {
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
				instructions:
					"You MUST use these MCP tools to interact with todometer. NEVER read or write the todometer SQLite database directly — direct database access bypasses validation, notifications, and UI sync. Always use the provided list_todos, add_todo, update_todo, and delete_to-do tools.",
			});
			break;

		case "notifications/initialized":
			break;

		case "tools/list":
			sendResponse(id, { tools: TOOLS });
			break;

		case "tools/call":
			await handleToolCall(params, id);
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

async function handleToolCall(params, id) {
	const { name, arguments: args } = params;

	try {
		switch (name) {
			case "list_todos": {
				const data = await apiRequest("GET", "/api/items");
				let items = data.items || [];
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
				const data = await apiRequest("POST", "/api/items", {
					text: args.text,
					status: args.status || "pending",
				});
				sendResponse(id, {
					content: [
						{
							type: "text",
							text: JSON.stringify(data.item, null, 2),
						},
					],
				});
				break;
			}

			case "update_todo": {
				const body = {};
				if (args.text !== undefined) body.text = args.text;
				if (args.status !== undefined) body.status = args.status;
				const data = await apiRequest(
					"PATCH",
					`/api/items/${encodeURIComponent(args.id)}`,
					body,
				);
				sendResponse(id, {
					content: [
						{
							type: "text",
							text: JSON.stringify(data.item, null, 2),
						},
					],
				});
				break;
			}

			case "delete_todo": {
				await apiRequest("DELETE", `/api/items/${encodeURIComponent(args.id)}`);
				sendResponse(id, {
					content: [
						{
							type: "text",
							text: `Deleted to-do ${args.id}`,
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
				handleRequest(msg.method, msg.params, msg.id).catch((err) => {
					if (msg.id !== undefined) {
						sendError(msg.id, -32603, err.message);
					}
				});
			} catch (err) {
				if (body.includes('"id"')) {
					sendError(null, -32700, "Parse error");
				}
			}
		}
	});

	process.stdin.on("end", () => {
		process.exit(0);
	});
}

startServer();
