// FR12 of support-legacy-ios-12-safari: `inset` becomes top, right, bottom and left.
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import {
  expandInsetShorthand,
  splitTopLevelValues,
} from "../../../scripts/legacyCss/expandInsetShorthand.mjs";

const expand = async (css: string) =>
  (await postcss([expandInsetShorthand()]).process(css, { from: undefined }))
    .css;

describe("expandInsetShorthand", () => {
  it.each([
    ["inset: 0", "top: 0; right: 0; bottom: 0; left: 0"],
    ["inset: auto", "top: auto; right: auto; bottom: auto; left: auto"],
    ["inset: 1px 2px", "top: 1px; right: 2px; bottom: 1px; left: 2px"],
    ["inset: 1px 2px 3px", "top: 1px; right: 2px; bottom: 3px; left: 2px"],
    ["inset: 1px 2px 3px 4px", "top: 1px; right: 2px; bottom: 3px; left: 4px"],
    [
      "inset: calc(1px + 2px) 0",
      "top: calc(1px + 2px); right: 0; bottom: calc(1px + 2px); left: 0",
    ],
  ])("should expand %s", async (declaration, expected) => {
    const output = await expand(`.a { ${declaration} }`);

    expect(output.replace(/\s+/g, " ")).toBe(`.a { ${expected} }`);
  });

  it("should keep !important on every side", async () => {
    const output = await expand(".a { inset: 0 !important }");

    expect(output.match(/!important/g)).toHaveLength(4);
  });

  it.each(["inset-inline: 0", "--tw-ring-inset: ", "top: 0"])(
    "should leave %s alone",
    async (declaration) => {
      const output = await expand(`.a { ${declaration} }`);

      expect(output).toBe(`.a { ${declaration} }`);
    },
  );

  it("should leave a declaration with five values alone", async () => {
    const output = await expand(".a { inset: 1px 2px 3px 4px 5px }");

    expect(output).toContain("inset:");
  });
});

describe("splitTopLevelValues", () => {
  it("should split on spaces outside parentheses", () => {
    expect(
      splitTopLevelValues("  1px  calc(1px + 2px) var(--a, 3px) "),
    ).toEqual(["1px", "calc(1px + 2px)", "var(--a, 3px)"]);
  });
});
