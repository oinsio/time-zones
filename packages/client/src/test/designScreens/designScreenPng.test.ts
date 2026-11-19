// Verifies FR5 of make-location-menu-button-vertical.
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DESIGN_SCREEN_DEVICE_SCALE_FACTOR,
  DESIGN_SCREEN_SELECTOR,
} from "../../../scripts/designScreens/constants.ts";
import {
  readPngPixelSize,
  runDesignScreens,
} from "../../../scripts/designScreens/designScreenPng.ts";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const IHDR_LENGTH = 13;
const WIDTH_OFFSET = 16;
const HEIGHT_OFFSET = 20;
const PNG_HEADER_BYTES = 24;

function buildPng(width: number, height: number, marker = 0) {
  const bytes = Buffer.alloc(PNG_HEADER_BYTES + 1);
  Buffer.from(PNG_SIGNATURE).copy(bytes);
  bytes.writeUInt32BE(IHDR_LENGTH, PNG_SIGNATURE.length);
  bytes.write("IHDR", PNG_SIGNATURE.length + 4, "ascii");
  bytes.writeUInt32BE(width, WIDTH_OFFSET);
  bytes.writeUInt32BE(height, HEIGHT_OFFSET);
  bytes.writeUInt8(marker, PNG_HEADER_BYTES);
  return bytes;
}

describe("readPngPixelSize", () => {
  it("should read the width and the height from the header", () => {
    expect(readPngPixelSize(buildPng(780, 1560))).toEqual({
      width: 780,
      height: 1560,
    });
  });

  it("should read a PNG that is only its header", () => {
    expect(
      readPngPixelSize(buildPng(3, 4).subarray(0, PNG_HEADER_BYTES)),
    ).toEqual({ width: 3, height: 4 });
  });

  it("should refuse a long enough header with a wrong signature", () => {
    const bytes = buildPng(3, 4);
    bytes[PNG_SIGNATURE.length - 1] = 0;

    expect(() => readPngPixelSize(bytes)).toThrow("not a PNG");
  });

  it("should refuse a valid signature with a cut header", () => {
    const bytes = buildPng(3, 4).subarray(0, PNG_HEADER_BYTES - 1);

    expect(() => readPngPixelSize(bytes)).toThrow("not a PNG");
  });

  it("should refuse bytes that are not a PNG", () => {
    expect(() => readPngPixelSize(Buffer.alloc(PNG_HEADER_BYTES))).toThrow();
  });
});

describe("runDesignScreens", () => {
  const screensFolder = "/screens";
  let files: Map<string, Uint8Array>;

  beforeEach(() => {
    files = new Map();
  });

  function seedScreen(name: string, png: Buffer) {
    files.set(join(screensFolder, `${name}.html`), Buffer.from("<html>"));
    files.set(join(screensFolder, `${name}.png`), png);
    return join(screensFolder, `${name}.html`);
  }

  const pngOf = (htmlPath: string) =>
    files.get(htmlPath.replace(".html", ".png"));

  const fileDependencies = () => ({
    screensFolder,
    listFileNames: async (folder: string) =>
      [...files.keys()]
        .filter((path) => path.startsWith(`${folder}/`))
        .map((path) => path.slice(folder.length + 1)),
    readPng: async (pngPath: string) => {
      const png = files.get(pngPath);
      if (!png) throw new Error(`${pngPath}: no such file`);
      return png;
    },
    writePng: async (pngPath: string, png: Uint8Array) => {
      files.set(pngPath, png);
    },
  });

  const dependenciesFor = (renderedPng: Buffer, rendered: string[] = []) => ({
    ...fileDependencies(),
    renderScreens: async (
      htmlPaths: string[],
      options: { deviceScaleFactor: number; selector: string },
    ) => {
      rendered.push(JSON.stringify(options));
      return htmlPaths.map((htmlPath) => ({ htmlPath, png: renderedPng }));
    },
  });

  it("should not write a PNG of another pixel size and should fail", async () => {
    const original = buildPng(100, 200, 1);
    const htmlPath = seedScreen("a", original);

    const exitCode = await runDesignScreens(
      [htmlPath],
      dependenciesFor(buildPng(100, 300, 2)),
    );

    expect(exitCode).not.toBe(0);
    expect(pngOf(htmlPath)).toEqual(original);
  });

  it("should write a PNG of the same pixel size and succeed", async () => {
    const htmlPath = seedScreen("a", buildPng(100, 200, 1));
    const replacement = buildPng(100, 200, 2);

    const exitCode = await runDesignScreens(
      [htmlPath],
      dependenciesFor(replacement),
    );

    expect(exitCode).toBe(0);
    expect(pngOf(htmlPath)).toEqual(replacement);
  });

  it("should render with the scale factor and the screen selector", async () => {
    const htmlPath = seedScreen("a", buildPng(100, 200));
    const rendered: string[] = [];

    await runDesignScreens(
      [htmlPath],
      dependenciesFor(buildPng(100, 200), rendered),
    );

    expect(rendered).toEqual([
      JSON.stringify({
        deviceScaleFactor: DESIGN_SCREEN_DEVICE_SCALE_FACTOR,
        selector: DESIGN_SCREEN_SELECTOR,
      }),
    ]);
  });

  it("should render every HTML file of the folder when no path is given", async () => {
    seedScreen("a", buildPng(1, 1));
    seedScreen("b", buildPng(1, 1));
    files.set(join(screensFolder, "notes.txt"), Buffer.from("x"));
    const renderedPaths: string[] = [];

    await runDesignScreens([], {
      ...fileDependencies(),
      renderScreens: async (htmlPaths) => {
        renderedPaths.push(...htmlPaths);
        return htmlPaths.map((htmlPath) => ({
          htmlPath,
          png: buildPng(1, 1),
        }));
      },
    });

    expect(renderedPaths.map((path) => path.split("/").pop())).toEqual([
      "a.html",
      "b.html",
    ]);
  });

  it("should render only the named screens", async () => {
    const namedPath = seedScreen("named", buildPng(1, 1));
    seedScreen("other", buildPng(1, 1));
    const renderedPaths: string[] = [];

    await runDesignScreens([namedPath], {
      ...fileDependencies(),
      renderScreens: async (htmlPaths) => {
        renderedPaths.push(...htmlPaths);
        return [];
      },
    });

    expect(renderedPaths).toEqual([namedPath]);
  });

  it("should name both sizes when only the width differs", async () => {
    const htmlPath = seedScreen("a", buildPng(100, 200, 1));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const exitCode = await runDesignScreens(
      [htmlPath],
      dependenciesFor(buildPng(120, 200, 2)),
    );

    expect(exitCode).not.toBe(0);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("120x200 px replaces 100x200 px"),
    );
    errorSpy.mockRestore();
  });

  it("should fail when a screen has no PNG to compare with", async () => {
    const htmlPath = join(screensFolder, "lonely.html");
    files.set(htmlPath, Buffer.from("<html>"));

    const exitCode = await runDesignScreens(
      [htmlPath],
      dependenciesFor(buildPng(1, 1)),
    );

    expect(exitCode).not.toBe(0);
  });
});
