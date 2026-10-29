import * as path from "node:path";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";
import { legacyCoreJsPlugin } from "./scripts/legacyCoreJs/legacyCoreJsPlugin";
import { zoneDataPlugin } from "./scripts/zoneData/zoneDataPlugin";

export default defineConfig({
  plugins: [react(), zoneDataPlugin(), legacyCoreJsPlugin()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,steps}.{ts,tsx}"],
    // Re-evaluated after vi.resetModules(), so tests can install an Intl shim first.
    server: { deps: { inline: ["temporal-polyfill"] } },
    // E2E steps run in playwright-bdd against a real browser, not in Vitest.
    exclude: [...configDefaults.exclude, "src/**/*_e2e.steps.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockServiceWorker.js",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "virtual:pwa-register/react": path.resolve(
        __dirname,
        "./src/test/__mocks__/virtual-pwa-register-react.ts",
      ),
    },
  },
});
