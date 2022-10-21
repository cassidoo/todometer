import { node } from "../../.electron-vendors.cache.json";
import { join } from "path";

import { defineConfig } from "vite";
import { builtinModules } from "module";

const PACKAGE_ROOT = __dirname;

// why is this needed? Isn't `node` typed as "string" already?
if (typeof node !== "string") {
  throw new Error(`The imported vendor version was not a string`);
}

// https://vitejs.dev/config/
// import.meta vite specific vars have not been injected yet here.
// for example: import.meta.env.MODE isn't available and automatically gets set to "production" during vite build
// to override that behaviour: set an env MODE variable and pass a mode: process.env.MODE to the vite config
// https://vitejs.dev/guide/env-and-mode.html

export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  resolve: {
    alias: {
      "/@/": join(PACKAGE_ROOT) + "/",
    },
  },
  build: {
    ssr: true,
    target: `node${node}`,
    sourcemap: "inline",
    outDir: "dist",
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