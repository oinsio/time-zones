// Verifies FR3, FR7, FR9, NFR-P1 of add-remote-zone-rules-updates: the check finds a newer release.
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createInMemoryStoredReleaseRepository,
  createInMemoryZoneRulesVersionSource,
} from "@/adapters";
import { StoredReleaseLoadStatus } from "@/ports";
import { resetPageVisibility } from "@/test/pageVisibility";
import { createSwitchableClock } from "@/test/switchableClock";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";
import {
  CHECK_START,
  createZoneRulesUpdateWorld,
  FIVE_MINUTES_LATER,
  publishing,
  releaseNamed,
  SIXTEEN_MINUTES_LATER,
} from "@/test/zoneRules/zoneRulesUpdateWorld";
import { useZoneRulesUpdate } from "./useZoneRulesUpdate";

afterEach(resetPageVisibility);

describe("useZoneRulesUpdate", () => {
  it("should request the version and the release, store it and show it for a newer release", async () => {
    const world = createZoneRulesUpdateWorld({ script: publishing("2026g") });
    await world.settle();
    expect(world.versionSource.versionRequestCount()).toBe(1);
    expect(world.versionSource.requestedReleases()).toEqual(["2026g"]);
    expect(world.save).toHaveBeenCalledWith(buildReleaseDocument("2026g"));
    expect(world.result.current.readyRelease).toBe("2026g");
  });

  it.each(["2026f", "2026e"])(
    "should make one request and show nothing when the version file names %s",
    async (published) => {
      const world = createZoneRulesUpdateWorld({
        script: publishing(published),
      });
      await world.settle();
      expect(world.versionSource.versionRequestCount()).toBe(1);
      expect(world.versionSource.requestedReleases()).toEqual([]);
      expect(world.result.current.readyRelease).toBeUndefined();
    },
  );

  it("should show a newer stored release without a download or a write", async () => {
    const world = createZoneRulesUpdateWorld({
      script: publishing("2026g"),
      storedDocument: buildReleaseDocument("2026g"),
    });
    await world.settle();
    expect(world.versionSource.versionRequestCount()).toBe(1);
    expect(world.versionSource.requestedReleases()).toEqual([]);
    expect(world.save).not.toHaveBeenCalled();
    expect(world.result.current.readyRelease).toBe("2026g");
  });

  it("should not replace a newer stored release with the older published one", async () => {
    const world = createZoneRulesUpdateWorld({
      script: publishing("2026g"),
      storedDocument: buildReleaseDocument("2026h"),
    });
    await world.settle();
    expect(world.versionSource.requestedReleases()).toEqual([]);
    expect(world.save).not.toHaveBeenCalled();
    expect(world.result.current.readyRelease).toBe("2026h");
  });

  it("should make no request without an active release", async () => {
    const world = createZoneRulesUpdateWorld({
      activeRelease: null,
      script: publishing("2026g"),
    });
    await world.settle();
    expect(world.versionSource.versionRequestCount()).toBe(0);
  });

  it("should make no request while offline", async () => {
    const world = createZoneRulesUpdateWorld({
      script: publishing("2026g"),
      isOnline: false,
    });
    await world.settle();
    expect(world.versionSource.versionRequestCount()).toBe(0);
    expect(world.result.current.readyRelease).toBeUndefined();
  });

  it("should request the version file again on return after 16 minutes", async () => {
    const world = createZoneRulesUpdateWorld({ script: publishing("2026f") });
    await world.settle();
    await world.returnToPage(SIXTEEN_MINUTES_LATER);
    expect(world.versionSource.versionRequestCount()).toBe(2);
  });

  it("should request nothing on return after 5 minutes", async () => {
    const world = createZoneRulesUpdateWorld({ script: publishing("2026f") });
    await world.settle();
    await world.returnToPage(FIVE_MINUTES_LATER);
    expect(world.versionSource.versionRequestCount()).toBe(1);
  });

  it("should leave the stored release as downloaded", async () => {
    const world = createZoneRulesUpdateWorld({ script: publishing("2026g") });
    await world.settle();
    expect(world.storedReleases.load()).toMatchObject({
      status: StoredReleaseLoadStatus.LOADED,
      document: buildReleaseDocument("2026g"),
    });
  });
});

describe("useZoneRulesUpdate dismissal", () => {
  it("should hide the notice after dismiss while the same release is published", async () => {
    const world = createZoneRulesUpdateWorld({ script: publishing("2026g") });
    await world.settle();
    world.result.current.dismiss();
    await world.returnToPage(SIXTEEN_MINUTES_LATER);
    expect(world.result.current.readyRelease).toBeUndefined();
  });

  it("should show a newer release after a dismissal", async () => {
    const world = createZoneRulesUpdateWorld({ script: publishing("2026g") });
    await world.settle();
    world.result.current.dismiss();
    world.versionSource.setVersion({ release: "2026h" });
    world.versionSource.setRelease("2026h", buildReleaseDocument("2026h"));
    await world.returnToPage(SIXTEEN_MINUTES_LATER);
    expect(world.result.current.readyRelease).toBe("2026h");
  });
});

describe("useZoneRulesUpdate default online state", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithoutInjectedOnlineState = (isOnline: boolean) => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(isOnline);
    const versionSource = createInMemoryZoneRulesVersionSource(
      publishing("2026g"),
    );
    renderHook(() =>
      useZoneRulesUpdate({
        clock: createSwitchableClock(CHECK_START),
        versionSource,
        storedReleases: createInMemoryStoredReleaseRepository(),
        getActiveRelease: () => releaseNamed("2026f"),
      }),
    );
    return versionSource;
  };

  it("should make no request while the browser reports offline", async () => {
    const versionSource = renderWithoutInjectedOnlineState(false);
    await act(async () => undefined);
    expect(versionSource.versionRequestCount()).toBe(0);
  });

  it("should check while the browser reports online", async () => {
    const versionSource = renderWithoutInjectedOnlineState(true);
    await act(async () => undefined);
    expect(versionSource.versionRequestCount()).toBe(1);
  });
});
