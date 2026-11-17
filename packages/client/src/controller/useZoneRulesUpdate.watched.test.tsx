// Verifies FR8, FR9, FR10, NFR-P2 of apply-data-updates-silently: the notice only for a release that changes a watched zone.
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetPageVisibility } from "@/test/pageVisibility";
import {
  countFindChangedZones,
  startZoneComparisonCount,
} from "@/test/zoneComparisonCount";
import {
  ASUNCION_ZONE_ID,
  buildWatchedZonesDocument,
  CAIRO_ZONE_ID,
  LISBON_ZONE_ID,
  MOSCOW_ZONE_ID,
  parseWatchedZonesRelease,
} from "@/test/zoneRules/watchedZoneReleases";
import {
  createZoneRulesUpdateWorld,
  SIXTEEN_MINUTES_LATER,
} from "@/test/zoneRules/zoneRulesUpdateWorld";

vi.mock("@/lib/zoneRules", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/zoneRules")>();
  return {
    ...original,
    findChangedZones: countFindChangedZones(original.findChangedZones),
  };
});

const STORED = "2026g";

const worldStoring = (changedZoneIds: string[], watched: string[]) =>
  createZoneRulesUpdateWorld({
    activeRelease: parseWatchedZonesRelease("2026f"),
    watchedZoneIds: watched,
    script: {
      version: { release: STORED },
      releases: { [STORED]: buildWatchedZonesDocument(STORED, changedZoneIds) },
    },
  });

afterEach(resetPageVisibility);

describe("useZoneRulesUpdate with watched zones", () => {
  it("should report a release that changes a watched zone", async () => {
    const world = worldStoring([LISBON_ZONE_ID], [LISBON_ZONE_ID]);
    await world.settle();
    expect(world.result.current.readyRelease).toBe(STORED);
  });

  it("should store but not report a release that changes no watched zone", async () => {
    const world = worldStoring(
      [ASUNCION_ZONE_ID],
      [LISBON_ZONE_ID, MOSCOW_ZONE_ID],
    );
    await world.settle();
    expect(world.save).toHaveBeenCalledTimes(1);
    expect(world.result.current.readyRelease).toBeUndefined();
  });

  it("should report a stored release that changes a watched zone without a download", async () => {
    const world = createZoneRulesUpdateWorld({
      activeRelease: parseWatchedZonesRelease("2026f"),
      watchedZoneIds: [CAIRO_ZONE_ID],
      storedDocument: buildWatchedZonesDocument(STORED, [CAIRO_ZONE_ID]),
      script: { version: { release: STORED } },
    });
    await world.settle();
    expect(world.versionSource.requestedReleases()).toEqual([]);
    expect(world.result.current.readyRelease).toBe(STORED);
  });

  it("should compare again and report when a watched zone is added", async () => {
    const world = worldStoring([CAIRO_ZONE_ID], [LISBON_ZONE_ID]);
    await world.settle();
    expect(world.result.current.readyRelease).toBeUndefined();
    world.watchZones([LISBON_ZONE_ID, CAIRO_ZONE_ID]);
    expect(world.result.current.readyRelease).toBe(STORED);
  });

  it("should stop reporting when the changed zone is no longer watched", async () => {
    const world = worldStoring([CAIRO_ZONE_ID], [CAIRO_ZONE_ID]);
    await world.settle();
    world.watchZones([LISBON_ZONE_ID]);
    expect(world.result.current.readyRelease).toBeUndefined();
  });
});

describe("useZoneRulesUpdate work bound", () => {
  it("should compare each watched zone once, and nothing on a render or a later check", async () => {
    const counter = startZoneComparisonCount();
    const watched = [LISBON_ZONE_ID, CAIRO_ZONE_ID, MOSCOW_ZONE_ID];
    const world = worldStoring([ASUNCION_ZONE_ID], watched);
    await world.settle();
    expect(counter.comparedZones()).toBe(watched.length);
    world.rerender({ zoneIds: [...watched] });
    await world.returnToPage(SIXTEEN_MINUTES_LATER);
    expect(counter.comparedZones()).toBe(watched.length);
    for (const zoneId of watched) {
      expect(counter.comparedZonesByZone().get(zoneId)).toBe(1);
    }
    counter.stop();
  });

  it("should compare every watched zone again once after the watched zones change", async () => {
    const counter = startZoneComparisonCount();
    const world = worldStoring([ASUNCION_ZONE_ID], [LISBON_ZONE_ID]);
    await world.settle();
    world.watchZones([LISBON_ZONE_ID, CAIRO_ZONE_ID]);
    expect(counter.comparedZonesByZone().get(LISBON_ZONE_ID)).toBe(2);
    expect(counter.comparedZonesByZone().get(CAIRO_ZONE_ID)).toBe(1);
    counter.stop();
  });
});
