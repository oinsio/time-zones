// Verifies FR5 of make-location-menu-button-vertical.
import { describe, expect, it } from "vitest";
import {
  PNG_HEADER_BYTES,
  PNG_SIGNATURE,
} from "../../../scripts/designScreens/constants.ts";
import { readPngPixelSize } from "../../../scripts/designScreens/designScreenPng.ts";
import { buildPng } from "./buildPng.ts";

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
