// FR12, FR13 of support-legacy-ios-12-safari
import { describe, expect, it } from "vitest";
import {
  findDvhWithoutFallback,
  findInsetShorthand,
  findLegacyCssIssues,
  findLegacySyntaxIssues,
  LegacyConstruct,
} from "../../../scripts/legacyBuild/findLegacySyntaxIssues";

const FILE = "assets/main.js";
const constructsOf = (source: string) =>
  findLegacySyntaxIssues(FILE, source).map((issue) => issue.construct);

describe("findLegacySyntaxIssues", () => {
  it.each([
    ["a?.b", LegacyConstruct.OPTIONAL_CHAINING],
    ["a?.[0]", LegacyConstruct.OPTIONAL_CHAINING],
    ["a ?? b", LegacyConstruct.NULLISH_COALESCING],
    ["const n = 10n;", LegacyConstruct.BIGINT_LITERAL],
    ["/(?<=a)b/.test(x)", LegacyConstruct.REGEX_LOOKBEHIND],
    ["/(?<!a)b/.test(x)", LegacyConstruct.REGEX_LOOKBEHIND],
    ['new RegExp("(?<=a)b")', LegacyConstruct.REGEX_LOOKBEHIND],
    ['RegExp("(?<!a)b")', LegacyConstruct.REGEX_LOOKBEHIND],
  ])("should report %s as %s", (source, construct) => {
    expect(constructsOf(source)).toEqual([construct]);
  });

  it.each(["a ??= b", "const n = 1_000;", "await load();"])(
    "should report %s as a parse error",
    (source) => {
      const [construct] = constructsOf(source);

      expect(construct).toMatch(/^parse error: /);
    },
  );

  it.each([
    'import("./chunk.js");',
    "console.log(import.meta.url);",
    "try { run(); } catch {}",
    "/(?:a)b/.test(x);",
    'new RegExp("(?:a)b");',
    "new RegExp(pattern);",
    "new Map();",
    "a.b(c);",
  ])("should allow %s", (source) => {
    expect(constructsOf(source)).toEqual([]);
  });

  it("should name the file of each issue", () => {
    expect(findLegacySyntaxIssues(FILE, "a?.b")).toEqual([
      { file: FILE, construct: LegacyConstruct.OPTIONAL_CHAINING },
    ]);
  });

  it("should find constructs nested in functions and arrays", () => {
    expect(constructsOf("function f(){ return [a ?? b, c?.d]; }")).toEqual([
      LegacyConstruct.NULLISH_COALESCING,
      LegacyConstruct.OPTIONAL_CHAINING,
    ]);
  });
});

describe("findInsetShorthand", () => {
  it.each([
    [".a{inset:0}", 1],
    [".a{top:0;inset: auto}", 1],
    [".a{inset:0}.b{inset:auto}", 2],
    [".a{top:0;inset-inline:0}", 0],
    [".a{--tw-ring-inset: ;top:0}", 0],
    ["", 0],
  ])("should find in %s the count %i", (css, count) => {
    expect(findInsetShorthand(css)).toHaveLength(count);
  });
});

describe("findDvhWithoutFallback", () => {
  it.each([
    ".min-h-dvh{min-height:100dvh}",
    ".h-dvh{height:100dvh}",
    ".x{min-height:100dvh;min-height:100vh}",
    ".x{height:100vh;min-height:100dvh}",
    "@media(min-width:1px){.y{height:50.5dvh}}",
  ])("should report %s", (css) => {
    expect(findDvhWithoutFallback(css)).toHaveLength(1);
  });

  it.each([
    ".min-h-dvh{min-height:100vh;min-height:100dvh}",
    ".a{height:10px}",
    ".a{min-height:calc(100vh - 1px);min-height:calc(100dvh - 1px)}",
    "",
  ])("should not report %s", (css) => {
    expect(findDvhWithoutFallback(css)).toEqual([]);
  });

  it("should name the rule", () => {
    expect(findDvhWithoutFallback(".min-h-dvh{min-height:100dvh}")).toEqual([
      `${LegacyConstruct.DVH_WITHOUT_FALLBACK}: .min-h-dvh { min-height: 100dvh }`,
    ]);
  });
});

describe("findLegacyCssIssues", () => {
  it("should name the file of each CSS issue", () => {
    expect(findLegacyCssIssues("a.css", ".a{inset:0}")).toEqual([
      { file: "a.css", construct: LegacyConstruct.INSET_SHORTHAND },
    ]);
  });
});
