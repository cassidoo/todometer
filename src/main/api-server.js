import http from "http";
import { randomBytes } from "crypto";
import * as db from "./db.js";

let server = null;
let apiToken = null;
let onDataChanged = null;

const DEFAULT_PORT = 19747;

function parseBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on("data", (chunk) => chunks.push(chunk));
		req.on("end", () => {
			try {
				const body = Buffer.concat(chunks).toString();
				resolve(body ? JSON.parse(body) : {});
			} catch (err) {
				reject(new Error("Invalid JSON body"));
			}
		});
		req.on("error", reject);
	});
}

function sendJson(res, statusCode, data) {
	res.writeHead(statusCode, { "Content-Type": "application/json" });
	res.end(JSON.stringify(data));
}

function authenticate(req) {
	const auth = req.headers["authorization"];
	if (!auth || !auth.startsWith("Bearer ")) return false;
	return auth.slice(7) === apiToken;
}

function handleRequest(req, res) {
	// CORS preflight
	if (req.method === "OPTIONS") {
		res.writeHead(204);
		res.end();
		return;
	}

	if (!authenticate(req)) {
		sendJson(res, 401, { error: "Unauthorized. Provide Authorization: Bearer <token>" });
		return;
	}

	const url = new URL(req.url, `http://localhost`);
	const pathname = url.pathname;

	// Route: GET /api/items
	if (req.method === "GET" && pathname === "/api/items") {
		try {
			const items = db.getAllItems();
			sendJson(res, 200, { items });
		} catch (err) {
			sendJson(res, 500, { error: err.message });
		}
		return;
	}

	// Route: POST /api/items
	if (req.method === "POST" && pathname === "/api/items") {
		const contentType = req.headers["content-type"] || "";
		if (!contentType.includes("application/json")) {
			sendJson(res, 415, { error: "Content-Type must be application/json" });
			return;
		}

		parseBody(req)
			.then((body) => {
				const item = db.addItem({
					text: body.text,
					status: body.status,
				});
				sendJson(res, 201, { item });
				if (onDataChanged) onDataChanged();
			})
			.catch((err) => {
				sendJson(res, 400, { error: err.message });
			});
		return;
	}

	// Route: PATCH /api/items/:id
	const patchMatch = pathname.match(/^\/api\/items\/(.+)$/);
	if (req.method === "PATCH" && patchMatch) {
		const contentType = req.headers["content-type"] || "";
		if (!contentType.includes("application/json")) {
			sendJson(res, 415, { error: "Content-Type must be application/json" });
			return;
		}

		const id = decodeURIComponent(patchMatch[1]);
		parseBody(req)
			.then((body) => {
				const item = db.updateItem({
					id,
					text: body.text,
					status: body.status,
				});
				sendJson(res, 200, { item });
				if (onDataChanged) onDataChanged();
			})
			.catch((err) => {
				if (err.message.includes("not found")) {
					sendJson(res, 404, { error: err.message });
				} else {
					sendJson(res, 400, { error: err.message });
				}
			});
		return;
	}

	// Route: DELETE /api/items/:id
	const deleteMatch = pathname.match(/^\/api\/items\/(.+)$/);
	if (req.method === "DELETE" && deleteMatch) {
		const id = decodeURIComponent(deleteMatch[1]);
		try {
			db.deleteItem(id);
			sendJson(res, 200, { success: true });
			if (onDataChanged) onDataChanged();
		} catch (err) {
			if (err.message.includes("not found")) {
				sendJson(res, 404, { error: err.message });
			} else {
				sendJson(res, 400, { error: err.message });
			}
		}
		return;
	}

	sendJson(res, 404, { error: "Not found" });
}

export function startApiServer(token, port = DEFAULT_PORT, changeCallback = null) {
	if (server) return { port, token };

	apiToken = token;
	onDataChanged = changeCallback;
	server = http.createServer(handleRequest);
	server.listen(port, "127.0.0.1", () => {
		console.log(`todometer API server running on http://127.0.0.1:${port}`);
	});

	return { port, token };
}

export function stopApiServer() {
	if (server) {
		server.close();
		server = null;
		apiToken = null;
	}
}

export function isApiServerRunning() {
	return server !== null;
}

export function generateApiToken() {
	return randomBytes(32).toString("hex");
}

export function getDefaultPort() {
	return DEFAULT_PORT;
}
