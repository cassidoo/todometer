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
