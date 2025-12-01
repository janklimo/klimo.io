import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "static",
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, "static/js/index.js"),
      output: {
        entryFileNames: "bundle.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "styles.css";
          }
          return assetInfo.name;
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
