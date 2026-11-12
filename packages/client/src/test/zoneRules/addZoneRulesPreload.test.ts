// @add-zone-rules-from-iana @NFR-P2: the preload link of the zone rules asset
import { describe, expect, it } from "vitest";
import { addZoneRulesPreload } from "../../../scripts/zoneRules/addZoneRulesPreload.ts";

const HTML = "<html><head><title>t</title></head><body></body></html>";
const HREF = "/time-zones/assets/zone-rules-abc123.json";
const PRELOAD_LINK = `<link rel="preload" as="fetch" crossorigin href="${HREF}">`;

describe("addZoneRulesPreload", () => {
  it("adds one preload link before the end of the head", () => {
    expect(addZoneRulesPreload(HTML, HREF)).toBe(
      `<html><head><title>t</title>${PRELOAD_LINK}</head><body></body></html>`,
    );
  });

  it("is idempotent", () => {
    const once = addZoneRulesPreload(HTML, HREF);
    expect(addZoneRulesPreload(once, HREF)).toBe(once);
  });

  it("adds a link for another address next to the first", () => {
    const once = addZoneRulesPreload(HTML, HREF);
    const twice = addZoneRulesPreload(once, "/other.json");
    expect(twice.match(/rel="preload"/g)).toHaveLength(2);
  });

  it("leaves a page without a head unchanged", () => {
    expect(addZoneRulesPreload("<body></body>", HREF)).toBe("<body></body>");
  });
});
