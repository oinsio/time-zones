// FR6 of add-zone-rules-from-iana: temporal-polyfill over the wrapper on a stale engine
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installZoneRulesDateTimeFormat } from "@/lib/zoneRules";
import {
  installStaleEngine,
  restoreEngine,
  type StaleEngineCall,
} from "@/test/fakeStaleDateTimeFormat";
import {
  committedRelease,
  realNativeDateTimeFormat,
} from "@/test/installZoneRules";

const ALMATY_ZONE_ID = "Asia/Almaty";
const ALMATY_INSTANT = "2026-07-15T08:00:00Z";

describe("temporal-polyfill over the wrapper on a stale engine", () => {
  let staleCalls: StaleEngineCall[];

  beforeEach(() => {
    staleCalls = installStaleEngine().calls;
    installZoneRulesDateTimeFormat(committedRelease);
    vi.resetModules();
  });

  afterEach(() => {
    restoreEngine();
    vi.resetModules();
  });

  it("shows Almaty at 13:00 and +05:00 although the engine says UTC+6", async () => {
    const { Temporal } = await import("@/lib/temporal");
    const zoned =
      Temporal.Instant.from(ALMATY_INSTANT).toZonedDateTimeISO(ALMATY_ZONE_ID);
    expect(zoned.toPlainTime().toString()).toBe("13:00:00");
    expect(zoned.offset).toBe("+05:00");
  });

  it.each([
    ["Asia/Almaty", "2026-07-15T13:00", "2026-07-15T08:00:00Z", "UNIQUE"],
    ["America/New_York", "2026-03-08T02:30", "2026-03-08T07:30:00Z", "GAP"],
    [
      "America/New_York",
      "2026-11-01T01:30",
      "2026-11-01T05:30:00Z",
      "AMBIGUOUS",
    ],
  ])(
    "resolves the wall clock %s %s to %s as %s",
    async (zoneId, wallClock, expectedInstant, expectedStatus) => {
      const { Temporal } = await import("@/lib/temporal");
      const { resolveWallClock } = await import("@/model");
      const resolved = resolveWallClock(
        zoneId,
        Temporal.PlainDateTime.from(wallClock),
      );
      expect(resolved.instant.toString()).toBe(expectedInstant);
      expect(resolved.status).toBe(expectedStatus);
    },
  );

  it("accepts a zone the engine rejects", async () => {
    const { Temporal } = await import("@/lib/temporal");
    const zoned = Temporal.Instant.from(ALMATY_INSTANT).toZonedDateTimeISO(
      "America/Ciudad_Juarez",
    );
    expect(zoned.offset).toBe("-06:00");
  });

  it("reads the device zone from the native engine", async () => {
    const { Temporal } = await import("@/lib/temporal");
    expect(Temporal.Now.timeZoneId()).toBe(
      new realNativeDateTimeFormat().resolvedOptions().timeZone,
    );
  });

  it("never asks the engine for Almaty after the install", async () => {
    const { Temporal } = await import("@/lib/temporal");
    Temporal.Instant.from(ALMATY_INSTANT)
      .toZonedDateTimeISO(ALMATY_ZONE_ID)
      .toLocaleString("ru");
    expect(
      staleCalls.filter(
        (call) => call.timeZone?.toLowerCase() === ALMATY_ZONE_ID.toLowerCase(),
      ),
    ).toEqual([]);
  });
});
