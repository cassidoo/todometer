import { createServer, createLogger, build } from "vite";
import electronPath from "electron";
import { spawn } from "child_process";

// process.env.MODE is used in various vite config files
const mode = (process.env.MODE = process.env.MODE ?? "development");

const exitProcess = () => {
	process.exit(0);
};

/**
 * Setup server for `renderer/`
 * On file changes: hot reload
 */
function createWebWatchServer() {
	const server = createServer({
		mode,
		customLogger: createLogger("info", { prefix: `[web]` }),
		configFile: "src/renderer/vite.config.js",
	});

	return server;
}

/**
 * Setup watcher for `preload/`
 * On file changes: reload the web page
 */
function createPreloadWatcher(viteServer) {
	const watcher = build({
		mode,
		configFile: "src/preload/vite.config.js",
		build: {
			/**
			 * Set to {} to enable rollup watcher
			 * @see https://vitejs.dev/config/build-options.html#build-watch
			 */
			watch: {},
		},
		plugins: [
			{
				name: "web-reload-on-preload-change",
				writeBundle() {
					viteServer.ws.send({ type: "full-reload" });
				},
			},
		],
	});

	return watcher;
}

/**
 * Setup watcher for `main/`
 * On file changes: shut down and relaunch electron
 */
function createMainWatcher() {
	let electronProcess = null;

	const watcher = build({
		mode,
		configFile: "src/main/vite.config.js",
		build: {
			/**
			 * Set to {} to enable rollup watcher
			 * @see https://vitejs.dev/config/build-options.html#build-watch
			 */
			watch: {},
		},
		plugins: [
			{
				name: "full-reload-on-main-change",
				writeBundle() {
					/** Kill electron if process already exist */
					if (electronProcess !== null) {
						electronProcess.removeListener("exit", exitProcess);
						electronProcess.kill("SIGINT");
						electronProcess = null;
					}

					/** Spawn new electron process */
					// I read the docs for spawn.options.stio and still don't know how it works
					// https://nodejs.org/api/child_process.html#optionsstdio
					electronProcess = spawn(String(electronPath), ["."], {
						stdio: "inherit",
					});

					/** Stops the watch script when the application has been quit */
					electronProcess.addListener("exit", exitProcess);
				},
			},
		],
	});

	return watcher;
}

// start webserver
const server = await createWebWatchServer();
await server.listen();
server.printUrls();
// start preload watcher
await createPreloadWatcher(server);
// start main watcher
await createMainWatcher();
