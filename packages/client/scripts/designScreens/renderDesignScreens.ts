import { readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import {
  CSS_CONTENT_TYPE,
  DESIGN_SCREEN_VIEWPORT,
  DESIGN_SCREENS_FOLDER,
  MANROPE_FONT_FILE,
} from "./constants.ts";
import { runDesignScreens } from "./designScreenPng.ts";
import {
  buildManropeStylesheet,
  DesignScreenRequest,
  decideDesignScreenRequest,
} from "./designScreenRequests.ts";

/**
 * The CLI: `pnpm design:screens [screen.html ...]` re-renders the PNG of each
 * design screen (all screens when none is named), offline.
 * Implements FR5 of make-location-menu-button-vertical (D3).
 */
const fontBytes = await readFile(
  createRequire(import.meta.url).resolve(MANROPE_FONT_FILE),
);
const browser = await chromium.launch();
try {
  process.exitCode = await runDesignScreens(
    process.argv.slice(2).map((path) => resolve(path)),
    {
      screensFolder: resolve(DESIGN_SCREENS_FOLDER),
      listFileNames: async (folder) =>
        (await readdir(folder, { withFileTypes: true }))
          .filter((entry) => entry.isFile())
          .map((entry) => entry.name),
      readPng: (pngPath) => readFile(pngPath),
      writePng: (pngPath, png) => writeFile(pngPath, png),
      renderScreens: async (htmlPaths, { deviceScaleFactor, selector }) => {
        const context = await browser.newContext({
          deviceScaleFactor,
          viewport: DESIGN_SCREEN_VIEWPORT,
        });
        await context.route("**/*", (route) => {
          const decision = decideDesignScreenRequest(route.request().url());
          if (decision === DesignScreenRequest.SERVE_FONT_STYLESHEET) {
            return route.fulfill({
              contentType: CSS_CONTENT_TYPE,
              body: buildManropeStylesheet(fontBytes),
            });
          }
          return decision === DesignScreenRequest.CONTINUE
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        const renderedScreens = [];
        for (const htmlPath of htmlPaths) {
          await page.goto(pathToFileURL(htmlPath).href);
          await page.evaluate("document.fonts.ready");
          renderedScreens.push({
            htmlPath,
            png: await page.locator(selector).screenshot(),
          });
        }
        await context.close();
        return renderedScreens;
      },
    },
  );
} finally {
  await browser.close();
}
