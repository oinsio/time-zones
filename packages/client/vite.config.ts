import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import {
  APP_BASE_PATH,
  APP_ICON_SOURCE_DIR,
  APP_LIGHT_BACKGROUND_COLOR,
  APP_NAME,
  APP_SHORT_NAME,
  APP_THEME_COLOR,
  BUILD_OUT_DIR,
  BUILD_TARGETS,
} from "./app.config";
import { mainChunkPreloadPlugin } from "./scripts/legacyBoot/mainChunkPreloadPlugin";
import { legacyCoreJsPlugin } from "./scripts/legacyCoreJs/legacyCoreJsPlugin";
import { zoneDataPlugin } from "./scripts/zoneData/zoneDataPlugin";

const SHARED_VIEWS_PATH = "/src/views/shared/";

export default defineConfig({
  base: APP_BASE_PATH,
  build: {
    outDir: BUILD_OUT_DIR,
    target: BUILD_TARGETS,
    cssTarget: BUILD_TARGETS,
    rollupOptions: {
      // The shared view blocks have no import-time effects: unused ones stay
      // out of the initial JavaScript, which keeps it under the NFR-P1 budget.
      treeshake: {
        moduleSideEffects: (moduleId) => !moduleId.includes(SHARED_VIEWS_PATH),
      },
    },
  },
  plugins: [
    react(),
    zoneDataPlugin(),
    legacyCoreJsPlugin(),
    mainChunkPreloadPlugin(),
    VitePWA({
      registerType: "prompt",
      pwaAssets: {
        config: true,
        overrideManifestIcons: true,
        injectThemeColor: true,
        // The icon source lives outside `public/`, so tell the generator where
        // it is and where to write icons; otherwise they land next to the source.
        integration: {
          publicDir: resolve(__dirname, APP_ICON_SOURCE_DIR),
          outDir: resolve(__dirname, BUILD_OUT_DIR),
        },
      },
      manifest: {
        name: APP_NAME,
        short_name: APP_SHORT_NAME,
        display: "standalone",
        start_url: APP_BASE_PATH,
        scope: APP_BASE_PATH,
        theme_color: APP_THEME_COLOR,
        background_color: APP_LIGHT_BACKGROUND_COLOR,
      },
      workbox: {
        globPatterns: ["**/*.{js,mjs,css,html,ico,png,svg,json,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
