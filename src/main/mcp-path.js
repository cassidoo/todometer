import path from "path";

export function getMcpServerPath({ isPackaged, resourcesPath, appPath }) {
	if (isPackaged) {
		return path.join(resourcesPath, "mcp", "index.mjs");
	}

	return path.join(appPath, "src", "mcp", "index.mjs");
}
