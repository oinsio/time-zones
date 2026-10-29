// NFR-P1, NFR-P2 of support-legacy-ios-12-safari: the main chunk is preloaded, the legacy chunk is not.
import { describe, expect, it } from "vitest";
import { addMainChunkPreloads } from "../../../scripts/legacyBoot/addMainChunkPreloads";

const HTML =
  '<html><head><title>T</title></head><body><script type="module" src="/a/boot.js"></script></body></html>';

describe("addMainChunkPreloads", () => {
  it("should add one modulepreload link per chunk, in order, inside the head", () => {
    const result = addMainChunkPreloads(HTML, ["/a/main.js", "/a/vendor.js"]);

    const mainIndex = result.indexOf('href="/a/main.js"');
    const vendorIndex = result.indexOf('href="/a/vendor.js"');
    expect(result.match(/rel="modulepreload"/g)).toHaveLength(2);
    expect(mainIndex).toBeGreaterThan(-1);
    expect(vendorIndex).toBeGreaterThan(mainIndex);
    expect(vendorIndex).toBeLessThan(result.indexOf("</head>"));
  });

  it("should add no link for a chunk that is not passed in", () => {
    const result = addMainChunkPreloads(HTML, ["/a/main.js"]);

    expect(result).not.toContain("installLegacySupport");
    expect(result.match(/modulepreload/g)).toHaveLength(1);
  });

  it("should leave the HTML unchanged for an empty list", () => {
    expect(addMainChunkPreloads(HTML, [])).toBe(HTML);
  });

  it("should not repeat a chunk the page already links", () => {
    const linked = addMainChunkPreloads(HTML, ["/a/main.js"]);

    expect(addMainChunkPreloads(linked, ["/a/main.js"])).toBe(linked);
  });
});

describe("addMainChunkPreloads placement", () => {
  it("should put the links right before the closing head tag, one per line", () => {
    const result = addMainChunkPreloads(HTML, ["/a/main.js", "/a/vendor.js"]);

    expect(result).toContain(
      '<title>T</title><link rel="modulepreload" crossorigin href="/a/main.js">\n    <link rel="modulepreload" crossorigin href="/a/vendor.js">\n  </head>',
    );
  });
});
