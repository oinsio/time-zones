// Verifies FR6 of polish-settings-and-remove-offline-update-notice.
import { describe, expect, it } from "vitest";
import { APP_DEPLOY_INSTANT } from "@/constants";
import { fakeClock } from "@/lib/temporal";
import { TEST_DEPLOY_INSTANT } from "../../../app.config";
import { resolveDeployInstant } from "../../../scripts/deployInstant/resolveDeployInstant.ts";

describe("resolveDeployInstant", () => {
  it.each([
    ["2026-11-06T10:30:00Z", "2026-11-06T10:30:00.000Z"],
    ["2026-11-06T10:30:00.123456Z", "2026-11-06T10:30:00.123Z"],
  ])("should write the instant %s as %s", (clockInstant, expected) => {
    expect(resolveDeployInstant(fakeClock(clockInstant))).toBe(expected);
  });

  it("should match the ISO 8601 timestamp format with the Z suffix", () => {
    expect(resolveDeployInstant(fakeClock("2026-11-06T10:30:00Z"))).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  it("should give the tests the fixed deploy instant of the test config", () => {
    expect(APP_DEPLOY_INSTANT).toBe(TEST_DEPLOY_INSTANT);
  });
});
