import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";
import {
  APP_ICON_BACKGROUND_COLOR,
  APP_ICON_SOURCE_PATH,
  APPLE_ICON_PADDING,
  MASKABLE_ICON_PADDING,
} from "./app.config";

/**
 * Generates every icon from one source image at build time.
 * Implements FR3, FR4 of setup-app-shell-and-pages-deploy.
 */
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      padding: MASKABLE_ICON_PADDING,
      resizeOptions: { background: APP_ICON_BACKGROUND_COLOR },
    },
    apple: {
      ...minimal2023Preset.apple,
      padding: APPLE_ICON_PADDING,
      resizeOptions: { background: APP_ICON_BACKGROUND_COLOR },
    },
  },
  images: [APP_ICON_SOURCE_PATH],
});
