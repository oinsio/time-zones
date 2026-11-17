/**
 * Vite plugin that publishes the app revision of a build as
 * `app-revision.json` in the build root.
 * Implements FR2 of apply-data-updates-silently (D2).
 */
import type { Plugin } from "vite";
import { APP_REVISION_FILE } from "../../app.config.ts";

const BUILD_COMMAND = "build";

export type AppRevisionPluginOptions = { appRevision: string };

export type ServedAppRevisionFile = { fileName: string; source: string };

export function buildServedAppRevisionFile(
  appRevision: string,
): ServedAppRevisionFile {
  return {
    fileName: APP_REVISION_FILE,
    source: JSON.stringify({ appRevision }),
  };
}

export function appRevisionPlugin({
  appRevision,
}: AppRevisionPluginOptions): Plugin {
  // Stryker disable next-line BooleanLiteral: equivalent — `configResolved` sets it before any other hook runs
  let isBuild = false;
  return {
    name: "time-zones-app-revision",
    configResolved(config) {
      isBuild = config.command === BUILD_COMMAND;
    },
    generateBundle() {
      if (!isBuild) return;
      this.emitFile({
        type: "asset",
        ...buildServedAppRevisionFile(appRevision),
      });
    },
  };
}
