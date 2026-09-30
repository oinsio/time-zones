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
} from "./app.config";
import { zoneDataPlugin } from "./scripts/zoneData/zoneDataPlugin";

export default defineConfig({
  base: APP_BASE_PATH,
  build: { outDir: BUILD_OUT_DIR },
  plugins: [
    react(),
    zoneDataPlugin(),
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
