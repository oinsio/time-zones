// Verifies FR5 of make-location-menu-button-vertical.
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DESIGN_SCREEN_DEVICE_SCALE_FACTOR,
  DESIGN_SCREEN_SELECTOR,
  FONT_STYLESHEET_HOST,
} from "../../../scripts/designScreens/constants.ts";
import {
  readPngPixelSize,
  runDesignScreens,
} from "../../../scripts/designScreens/designScreenPng.ts";
import {
  buildManropeStylesheet,
  DesignScreenRequest,
  decideDesignScreenRequest,
} from "../../../scripts/designScreens/designScreenRequests.ts";

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

describe("decideDesignScreenRequest", () => {
  it.each([
    [
      `https://${FONT_STYLESHEET_HOST}/css2?family=Manrope:wght@400;500;600;700;800&display=swap`,
      DesignScreenRequest.SERVE_FONT_STYLESHEET,
    ],
    ["file:///repo/docs/design/screens/a.html", DesignScreenRequest.CONTINUE],
    ["https://fonts.gstatic.com/s/manrope.woff2", DesignScreenRequest.ABORT],
    ["https://unpkg.com/lucide", DesignScreenRequest.ABORT],
    ["http://example.com/x", DesignScreenRequest.ABORT],
  ])("should decide %s as %s", (url, expected) => {
    expect(decideDesignScreenRequest(url)).toBe(expected);
  });
});

describe("buildManropeStylesheet", () => {
  it("should hold one font face covering the used weights with the given bytes", () => {
    const fontBytes = Buffer.from([1, 2, 3, 250]);

    const stylesheet = buildManropeStylesheet(fontBytes);

    expect(stylesheet.match(/@font-face/g)).toHaveLength(1);
    expect(stylesheet).toContain('font-family: "Manrope"');
    expect(stylesheet).toContain("font-weight: 400 800");
    expect(stylesheet).toContain(
      `url(data:font/woff2;base64,${fontBytes.toString("base64")})`,
    );
  });
});

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
  let screensFolder: string;

  beforeEach(async () => {
    screensFolder = await mkdtemp(join(tmpdir(), "design-screens-"));
  });
  afterEach(async () => {
    await rm(screensFolder, { recursive: true, force: true });
  });

  async function seedScreen(name: string, png: Buffer) {
    await writeFile(join(screensFolder, `${name}.html`), "<html></html>");
    await writeFile(join(screensFolder, `${name}.png`), png);
    return join(screensFolder, `${name}.html`);
  }

  const dependenciesFor = (renderedPng: Buffer, rendered: string[] = []) => ({
    screensFolder,
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
    const htmlPath = await seedScreen("a", original);

    const exitCode = await runDesignScreens(
      [htmlPath],
      dependenciesFor(buildPng(100, 300, 2)),
    );

    expect(exitCode).not.toBe(0);
    expect(await readFile(htmlPath.replace(".html", ".png"))).toEqual(original);
  });

  it("should write a PNG of the same pixel size and succeed", async () => {
    const htmlPath = await seedScreen("a", buildPng(100, 200, 1));
    const replacement = buildPng(100, 200, 2);

    const exitCode = await runDesignScreens(
      [htmlPath],
      dependenciesFor(replacement),
    );

    expect(exitCode).toBe(0);
    expect(await readFile(htmlPath.replace(".html", ".png"))).toEqual(
      replacement,
    );
  });

  it("should render with the scale factor and the screen selector", async () => {
    const htmlPath = await seedScreen("a", buildPng(100, 200));
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
    await seedScreen("a", buildPng(1, 1));
    await seedScreen("b", buildPng(1, 1));
    await mkdir(join(screensFolder, "nested"));
    await mkdir(join(screensFolder, "folder.html"));
    await writeFile(join(screensFolder, "notes.txt"), "x");
    const renderedPaths: string[] = [];

    await runDesignScreens([], {
      screensFolder,
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
    const namedPath = await seedScreen("named", buildPng(1, 1));
    await seedScreen("other", buildPng(1, 1));
    const renderedPaths: string[] = [];

    await runDesignScreens([namedPath], {
      screensFolder,
      renderScreens: async (htmlPaths) => {
        renderedPaths.push(...htmlPaths);
        return [];
      },
    });

    expect(renderedPaths).toEqual([namedPath]);
  });

  it("should name both sizes when only the width differs", async () => {
    const htmlPath = await seedScreen("a", buildPng(100, 200, 1));
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
    await writeFile(htmlPath, "<html></html>");

    const exitCode = await runDesignScreens(
      [htmlPath],
      dependenciesFor(buildPng(1, 1)),
    );

    expect(exitCode).not.toBe(0);
  });
});
