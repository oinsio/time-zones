// Verifies FR8, NFR-P2, M3 of apply-data-updates-silently.
import { describe, expect, it, vi } from "vitest";
import {
  COMPARISON_SECONDS,
  createZone,
  releaseOf,
} from "@/test/zoneRules/lisbonLikeZone";
import { findChangedZones } from "./zoneRulesDifference.ts";

describe("findChangedZones", () => {
  const LISBON = "Europe/Lisbon";
  const MOSCOW = "Europe/Moscow";

  it("should list only the zones whose rules changed", () => {
    const changedLisbon = createZone({ futureRule: undefined });
    const active = releaseOf({
      [LISBON]: createZone(),
      [MOSCOW]: createZone(),
    });
    const stored = releaseOf({
      [LISBON]: changedLisbon,
      [MOSCOW]: createZone(),
    });
    expect(
      findChangedZones(active, stored, [LISBON, MOSCOW], COMPARISON_SECONDS),
    ).toEqual([LISBON]);
  });

  it("should count a zone that only the active release holds", () => {
    const active = releaseOf({ [LISBON]: createZone() });
    expect(
      findChangedZones(active, releaseOf({}), [LISBON], COMPARISON_SECONDS),
    ).toEqual([LISBON]);
  });

  it("should count a zone that only the stored release holds", () => {
    const stored = releaseOf({ [LISBON]: createZone() });
    expect(
      findChangedZones(releaseOf({}), stored, [LISBON], COMPARISON_SECONDS),
    ).toEqual([LISBON]);
  });

  it("should not count a zone that neither release holds", () => {
    expect(
      findChangedZones(
        releaseOf({}),
        releaseOf({}),
        [LISBON],
        COMPARISON_SECONDS,
      ),
    ).toEqual([]);
  });

  it("should ignore a zone that is not asked for", () => {
    const active = releaseOf({ [LISBON]: createZone() });
    const stored = releaseOf({
      [LISBON]: createZone({ futureRule: undefined }),
    });
    expect(findChangedZones(active, stored, [], COMPARISON_SECONDS)).toEqual(
      [],
    );
  });

  it("should compare a link by the rules it leads to", () => {
    const sharedRules = createZone();
    const active = releaseOf({ "Africa/Luanda": sharedRules });
    const stored = releaseOf({ "Africa/Luanda": structuredClone(sharedRules) });
    expect(
      findChangedZones(active, stored, ["Africa/Luanda"], COMPARISON_SECONDS),
    ).toEqual([]);
  });

  it("should read each given zone once from each release", () => {
    const active = releaseOf({
      [LISBON]: createZone(),
      [MOSCOW]: createZone(),
    });
    const stored = releaseOf({
      [LISBON]: createZone(),
      [MOSCOW]: createZone(),
    });
    const activeRead = vi.spyOn(active.zones, "get");
    const storedRead = vi.spyOn(stored.zones, "get");
    findChangedZones(active, stored, [LISBON, MOSCOW], COMPARISON_SECONDS);
    expect(activeRead).toHaveBeenCalledTimes(2);
    expect(storedRead).toHaveBeenCalledTimes(2);
  });
});
