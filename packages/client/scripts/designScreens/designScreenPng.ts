import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  DESIGN_SCREEN_DEVICE_SCALE_FACTOR,
  DESIGN_SCREEN_SELECTOR,
  HTML_EXTENSION,
  PNG_EXTENSION,
  PNG_HEADER_BYTES,
  PNG_HEIGHT_OFFSET,
  PNG_SIGNATURE,
  PNG_WIDTH_OFFSET,
} from "./constants.ts";

export type PixelSize = { width: number; height: number };
export type RenderedScreen = { htmlPath: string; png: Uint8Array };
export type RenderOptions = { deviceScaleFactor: number; selector: string };
export type DesignScreenDependencies = {
  screensFolder: string;
  renderScreens: (
    htmlPaths: string[],
    options: RenderOptions,
  ) => Promise<RenderedScreen[]>;
};

const SUCCESS_EXIT_CODE = 0;
const FAILURE_EXIT_CODE = 1;

/**
 * Reads the pixel size from the header of a PNG.
 * Implements FR5 of make-location-menu-button-vertical (D3).
 */
export function readPngPixelSize(pngBytes: Uint8Array): PixelSize {
  const bytes = Buffer.from(pngBytes);
  const hasSignature = PNG_SIGNATURE.every(
    (signatureByte, index) => bytes[index] === signatureByte,
  );
  if (bytes.length < PNG_HEADER_BYTES || !hasSignature) {
    throw new Error("The bytes are not a PNG image");
  }
  return {
    width: bytes.readUInt32BE(PNG_WIDTH_OFFSET),
    height: bytes.readUInt32BE(PNG_HEIGHT_OFFSET),
  };
}

const pngPathOf = (htmlPath: string) =>
  htmlPath.slice(0, -HTML_EXTENSION.length) + PNG_EXTENSION;

async function listScreenPaths(screensFolder: string) {
  const entries = await readdir(screensFolder, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(HTML_EXTENSION))
    .map((entry) => join(screensFolder, entry.name))
    .sort();
}

/**
 * Renders the screens and replaces each PNG, unless the new image has another
 * pixel size than the one it replaces. Resolves to the process exit code.
 * Implements FR5 of make-location-menu-button-vertical (D3).
 */
export async function runDesignScreens(
  screenPaths: string[],
  dependencies: DesignScreenDependencies,
): Promise<number> {
  const htmlPaths =
    screenPaths.length > 0
      ? screenPaths
      : await listScreenPaths(dependencies.screensFolder);
  const renderedScreens = await dependencies.renderScreens(htmlPaths, {
    deviceScaleFactor: DESIGN_SCREEN_DEVICE_SCALE_FACTOR,
    selector: DESIGN_SCREEN_SELECTOR,
  });
  let exitCode = SUCCESS_EXIT_CODE;
  for (const { htmlPath, png } of renderedScreens) {
    const pngPath = pngPathOf(htmlPath);
    try {
      const existingSize = readPngPixelSize(await readFile(pngPath));
      const renderedSize = readPngPixelSize(png);
      if (
        existingSize.width !== renderedSize.width ||
        existingSize.height !== renderedSize.height
      ) {
        throw new Error(
          `${pngPath}: ${renderedSize.width}x${renderedSize.height} px replaces ${existingSize.width}x${existingSize.height} px`,
        );
      }
      await writeFile(pngPath, png);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      exitCode = FAILURE_EXIT_CODE;
    }
  }
  return exitCode;
}
