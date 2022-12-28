import { chrome } from "../../.electron-vendors.cache.json";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { join } from "path";
import { builtinModules } from "module";

const PACKAGE_ROOT = __dirname;

// https://vitejs.dev/config/
// import.meta vite specific vars have not been injected yet here.
// for example: import.meta.env.MODE isn't available and automatically gets set to "production" during vite build
// to override that behaviour: set an env MODE variable and pass a mode: process.env.MODE to the vite config
// https://vitejs.dev/guide/env-and-mode.html

export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  base: "./",
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    target: `chrome${chrome}`,
    sourcemap: "inline",
    outDir: "../../dist/renderer",
    emptyOutDir: true,
    assetsDir: ".",
    // set to development in the watch script
    minify: process.env.MODE !== "development",
    rollupOptions: {
      input: join(PACKAGE_ROOT, "index.html"),
      external: [
        // Exclude Node builtin modules.
        ...builtinModules.flatMap((p) => [p, `node:${p}`]),
      ],
    },
    reportCompressedSize: false,
  },
  plugins: [react()],
  test: {
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    cache: {
      // store the cache in the root node_modules folder
      dir: "../../node_modules/.vitest",
    },
  },
});
