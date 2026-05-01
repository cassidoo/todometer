# todometer API & MCP Server Setup Guide

todometer supports two integration methods for external tools and AI assistants: a **Local REST API** and an **MCP (Model Context Protocol) Server**.

---

## Local REST API

The local API lets you manage your todos from scripts, shortcuts, or other applications over HTTP.

### Enabling the API

1. Open todometer
2. Click **menu** at the bottom of the app to open the Settings drawer
3. In the **API and MCP Configuration** section, toggle **Local API** on
4. Your bearer token and port will be displayed

The API runs on `http://127.0.0.1:19747` by default.

### Authentication

All requests require a bearer token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

You can copy your token from the Settings drawer (click **menu** → **API and MCP Configuration**).

### Endpoints

#### `GET /api/items`

Returns all todo items.

```bash
curl -H "Authorization: Bearer <token>" http://127.0.0.1:19747/api/items
```

#### `POST /api/items`

Add a new todo item.

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Buy groceries", "status": "pending"}' \
  http://127.0.0.1:19747/api/items
```

**Body fields:**

- `text` (string, required) — the todo text
- `status` (string, optional) — `"pending"` (default) or `"paused"`

#### `PATCH /api/items/:id`

Update an existing todo item.

```bash
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}' \
  http://127.0.0.1:19747/api/items/<item-id>
```

**Body fields (all optional):**

- `text` (string) — new text
- `status` (string) — `"pending"`, `"paused"`, or `"completed"`

#### `DELETE /api/items/:id`

Delete a todo item.

```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  http://127.0.0.1:19747/api/items/<item-id>
```

---

## MCP Server

The MCP server allows AI assistants to interact with your todos directly. It connects to the local REST API over HTTP, so no native modules or special runtimes are needed.

**Prerequisites:** The Local API must be enabled in the Settings drawer (click **menu** → **API and MCP Configuration** → toggle **Local API** on).

### Configuration

Add todometer to your MCP client's configuration file. You can copy the ready-to-use configuration from the Settings drawer — click **menu** at the bottom of the app, then expand the **MCP configuration** details under **API and MCP Configuration**.

```json
{
	"mcpServers": {
		"todometer": {
			"command": "node",
			"args": ["/path/to/todometer/src/mcp/index.js"],
			"env": {
				"TODOMETER_API_TOKEN": "<your-token>"
			}
		}
	}
}
```

Replace `/path/to/todometer` with the actual path to your todometer installation, and `<your-token>` with your API bearer token (available in the Settings drawer under **API and MCP Configuration**).

### Custom API port

If your API server is running on a non-default port, set the `TODOMETER_API_PORT` environment variable:

```json
{
	"mcpServers": {
		"todometer": {
			"command": "node",
			"args": ["/path/to/todometer/src/mcp/index.js"],
			"env": {
				"TODOMETER_API_TOKEN": "<your-token>",
				"TODOMETER_API_PORT": "19747"
			}
		}
	}
}
```

### Available tools

The MCP server exposes the following tools:

| Tool          | Description                                                                          |
| ------------- | ------------------------------------------------------------------------------------ |
| `list_todos`  | List all todo items. Optionally filter by status (`pending`, `paused`, `completed`). |
| `add_todo`    | Add a new todo item with text and optional status.                                   |
| `update_todo` | Update an existing todo's text or status by ID.                                      |
| `delete_todo` | Delete a todo item by ID.                                                            |

### Protocol URL

You can also add todos via the `todometer://` protocol:

```
todometer://add?text=Buy+groceries&status=pending
```

Parameters (same as above):

- `text` (string) — new text
- `status` (string) — `"pending"`, `"paused"`, or `"completed"`

This works from browsers, scripts, or any application that can open URLs.
