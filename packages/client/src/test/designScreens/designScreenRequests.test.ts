// Verifies FR5 of make-location-menu-button-vertical.
import { describe, expect, it } from "vitest";
import {
  FONT_STYLESHEET_HOST,
  MANROPE_FONT_SUBSETS,
} from "../../../scripts/designScreens/constants.ts";
import {
  buildManropeStylesheet,
  DesignScreenRequest,
  decideDesignScreenRequest,
} from "../../../scripts/designScreens/designScreenRequests.ts";

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
  const subsetFonts = MANROPE_FONT_SUBSETS.map((subset, index) => ({
    unicodeRange: subset.unicodeRange,
    bytes: Buffer.from([index, 2, 3, 250]),
  }));

  it("should hold one font face per subset", () => {
    const stylesheet = buildManropeStylesheet(subsetFonts);

    expect(stylesheet.match(/@font-face/g)).toHaveLength(
      MANROPE_FONT_SUBSETS.length,
    );
  });

  it("should join the faces with nothing between them", () => {
    const joinedFaces = subsetFonts
      .map((subsetFont) => buildManropeStylesheet([subsetFont]))
      .join("");

    expect(buildManropeStylesheet(subsetFonts)).toBe(joinedFaces);
  });

  it("should cover Cyrillic", () => {
    expect(
      MANROPE_FONT_SUBSETS.some((subset) =>
        subset.file.includes("manrope-cyrillic-wght"),
      ),
    ).toBe(true);
  });

  it.each(subsetFonts)(
    "should give the face its own range and bytes ($unicodeRange)",
    ({ unicodeRange, bytes }) => {
      const stylesheet = buildManropeStylesheet(subsetFonts);

      expect(stylesheet).toContain(`unicode-range: ${unicodeRange};`);
      expect(stylesheet).toContain(
        `url(data:font/woff2;base64,${bytes.toString("base64")})`,
      );
    },
  );

  it("should name the family and the used weights in every face", () => {
    const stylesheet = buildManropeStylesheet(subsetFonts);

    expect(stylesheet.match(/font-family: "Manrope"/g)).toHaveLength(
      subsetFonts.length,
    );
    expect(stylesheet.match(/font-weight: 400 800/g)).toHaveLength(
      subsetFonts.length,
    );
  });
});
