import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

const SCHEMA_VERSION = 1;
const VALID_STATUSES = ["pending", "paused", "completed"];
const MAX_TEXT_LENGTH = 10000;

let db = null;

export function openDatabase(dbPath) {
	const dir = path.dirname(dbPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	db = new Database(dbPath);
	db.pragma("journal_mode = WAL");
	db.pragma("foreign_keys = ON");

	db.exec(`
		CREATE TABLE IF NOT EXISTS items (
			id TEXT PRIMARY KEY,
			text TEXT NOT NULL CHECK(length(trim(text)) > 0),
			status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paused', 'completed')),
			sort_order INTEGER,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			deleted INTEGER NOT NULL DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS app_state (
			key TEXT PRIMARY KEY,
			value TEXT
		);
	`);

	const currentVersion = getAppState("schema_version");
	if (!currentVersion) {
		setAppState("schema_version", String(SCHEMA_VERSION));
	}

	return db;
}

export function closeDatabase() {
	if (db) {
		db.close();
		db = null;
	}
}

export function exportTo(destPath) {
	if (!db) throw new Error("Database not open");
	const dir = path.dirname(destPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	db.exec(`VACUUM INTO '${destPath.replace(/'/g, "''")}'`);
}

function validateItem(item) {
	if (!item.text || typeof item.text !== "string") {
		throw new Error("Item text must be a non-empty string");
	}
	const trimmed = item.text.trim();
	if (trimmed.length === 0) {
		throw new Error("Item text must not be blank");
	}
	if (trimmed.length > MAX_TEXT_LENGTH) {
		throw new Error(`Item text exceeds maximum length of ${MAX_TEXT_LENGTH}`);
	}
	if (item.status && !VALID_STATUSES.includes(item.status)) {
		throw new Error(
			`Invalid status: ${item.status}. Must be one of: ${VALID_STATUSES.join(", ")}`,
		);
	}
}

export function getAllItems() {
	if (!db) throw new Error("Database not open");
	return db
		.prepare(
			"SELECT id, text, status, sort_order, created_at, updated_at FROM items WHERE deleted = 0 ORDER BY sort_order ASC, created_at ASC",
		)
		.all();
}

export function addItem(item) {
	if (!db) throw new Error("Database not open");
	validateItem(item);

	const now = new Date().toISOString();
	const id = item.id || randomUUID();
	const maxOrder = db
		.prepare("SELECT MAX(sort_order) as max_order FROM items WHERE deleted = 0")
		.get();
	const sortOrder = item.sort_order ?? (maxOrder?.max_order ?? -1) + 1;

	db.prepare(
		"INSERT INTO items (id, text, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
	).run(id, item.text.trim(), item.status || "pending", sortOrder, now, now);

	return { id, text: item.text.trim(), status: item.status || "pending", sort_order: sortOrder, created_at: now, updated_at: now };
}

export function updateItem(item) {
	if (!db) throw new Error("Database not open");
	if (!item.id) throw new Error("Item id is required for update");

	const existing = db
		.prepare("SELECT * FROM items WHERE id = ? AND deleted = 0")
		.get(item.id);
	if (!existing) throw new Error(`Item not found: ${item.id}`);

	const updates = {};
	if (item.text !== undefined) {
		validateItem({ text: item.text });
		updates.text = item.text.trim();
	}
	if (item.status !== undefined) {
		if (!VALID_STATUSES.includes(item.status)) {
			throw new Error(`Invalid status: ${item.status}`);
		}
		updates.status = item.status;
	}
	if (item.sort_order !== undefined) {
		updates.sort_order = item.sort_order;
	}

	if (Object.keys(updates).length === 0) return existing;

	const now = new Date().toISOString();
	const setClauses = Object.keys(updates)
		.map((k) => `${k} = ?`)
		.concat("updated_at = ?");
	const values = Object.values(updates).concat(now, item.id);

	db.prepare(`UPDATE items SET ${setClauses.join(", ")} WHERE id = ?`).run(
		...values,
	);

	return { ...existing, ...updates, updated_at: now };
}

export function deleteItem(id) {
	if (!db) throw new Error("Database not open");
	if (!id) throw new Error("Item id is required");

	const now = new Date().toISOString();
	const result = db
		.prepare(
			"UPDATE items SET deleted = 1, updated_at = ? WHERE id = ? AND deleted = 0",
		)
		.run(now, id);

	if (result.changes === 0) {
		throw new Error(`Item not found: ${id}`);
	}
}

export function setItems(items) {
	if (!db) throw new Error("Database not open");

	const setItemsTransaction = db.transaction((newItems) => {
		// Soft-delete all existing items
		const now = new Date().toISOString();
		db.prepare(
			"UPDATE items SET deleted = 1, updated_at = ? WHERE deleted = 0",
		).run(now);

		// Insert new items
		const insert = db.prepare(
			"INSERT OR REPLACE INTO items (id, text, status, sort_order, created_at, updated_at, deleted) VALUES (?, ?, ?, ?, ?, ?, 0)",
		);

		for (let i = 0; i < newItems.length; i++) {
			const item = newItems[i];
			validateItem(item);
			const itemNow = new Date().toISOString();
			insert.run(
				item.id || randomUUID(),
				item.text.trim(),
				item.status || "pending",
				i,
				item.created_at || itemNow,
				itemNow,
			);
		}
	});

	setItemsTransaction(items);
	return getAllItems();
}

export function getAppState(key) {
	if (!db) throw new Error("Database not open");
	const row = db.prepare("SELECT value FROM app_state WHERE key = ?").get(key);
	return row?.value ?? null;
}

export function setAppState(key, value) {
	if (!db) throw new Error("Database not open");
	db.prepare(
		"INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)",
	).run(key, value);
}

export function loadState() {
	const items = getAllItems();
	const dateJson = getAppState("date");
	const date = dateJson ? JSON.parse(dateJson) : null;
	return { items, date };
}

export function saveDate(date) {
	setAppState("date", JSON.stringify(date));
}

// Deterministic UUID from a numeric key (for migration)
function keyToUUID(key) {
	const hex = BigInt(key).toString(16).padStart(32, "0");
	return [
		hex.slice(0, 8),
		hex.slice(8, 12),
		"4" + hex.slice(13, 16),
		"8" + hex.slice(17, 20),
		hex.slice(20, 32),
	].join("-");
}

export function migrateFromLocalStorage(state) {
	if (!db) throw new Error("Database not open");

	// Idempotency check
	if (getAppState("migration_completed") === "true") {
		return loadState();
	}

	const migrate = db.transaction(() => {
		if (state.items && Array.isArray(state.items)) {
			const insert = db.prepare(
				"INSERT OR IGNORE INTO items (id, text, status, sort_order, created_at, updated_at, deleted) VALUES (?, ?, ?, ?, ?, ?, 0)",
			);

			const now = new Date().toISOString();
			for (let i = 0; i < state.items.length; i++) {
				const item = state.items[i];
				const id = keyToUUID(item.key);
				const status = VALID_STATUSES.includes(item.status)
					? item.status
					: "pending";
				const text = (item.text || "").trim() || "Untitled";

				insert.run(id, text, status, i, now, now);
			}
		}

		if (state.date) {
			setAppState("date", JSON.stringify(state.date));
		}

		setAppState("migration_completed", "true");
	});

	migrate();
	return loadState();
}

export function getDatabasePath() {
	if (!db) return null;
	return db.name;
}
