import { chrome } from "../../.electron-vendors.cache.json";
import { builtinModules } from "module";
import { defineConfig } from "vite";

const PACKAGE_ROOT = __dirname;

export default defineConfig({
	mode: process.env.MODE,
	root: PACKAGE_ROOT,
	envDir: process.cwd(),
	build: {
		ssr: true,
		target: `chrome${chrome}`,
		sourcemap: "inline",
		outDir: "../../dist/preload",
		emptyOutDir: true,
		assetsDir: ".",
		// set to development in the watch script
		minify: process.env.MODE !== "development",
		lib: {
			entry: "./index.js",
			formats: ["cjs"],
		},
		rollupOptions: {
			output: {
				entryFileNames: "[name].cjs",
			},
			external: [
				// Exclude Electron from build.
				"electron",
				// Exclude Node builtin modules.
				...builtinModules.flatMap((p) => [p, `node:${p}`]),
			],
		},
		reportCompressedSize: false,
	},
});
