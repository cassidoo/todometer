import { node } from "../../.electron-vendors.cache.json";
import { defineConfig } from "vite";
import { builtinModules } from "module";

const PACKAGE_ROOT = __dirname;

export default defineConfig({
	mode: process.env.MODE,
	root: PACKAGE_ROOT,
	envDir: process.cwd(),
	build: {
		ssr: true,
		target: `node${node}`,
		sourcemap: "inline",
		outDir: "../../dist/main",
		emptyOutDir: true,
		assetsDir: ".",
		// set to development in the watch script
		minify: process.env.MODE !== "development",
		lib: {
			entry: "./index.js",
			formats: ["cjs"],
		},
		rollupOptions: {
			external: [
				// Exclude Electron from built output
				"electron",
				// electron-updater must not be bundled (resolved at runtime)
				"electron-updater",
				// better-sqlite3 is a native module, must be resolved at runtime
				"better-sqlite3",
				// Exclude Node builtin modules.
				...builtinModules.flatMap((p) => [p, `node:${p}`]),
			],
			output: {
				entryFileNames: "[name].cjs",
			},
		},
		reportCompressedSize: false,
	},
});
