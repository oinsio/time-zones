// Verifies FR7 of add-wall-time-input-with-hint (D2).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { WallClockNotePlacement } from "@/model";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { useLocations } from "./useLocations";
import { useReferenceMoment } from "./useReferenceMoment";
import { useWallTimeInput, WallTimeTargetKind } from "./useWallTimeInput";

const newYork = buildLocation({
  label: "New York",
  ...KNOWN_CITIES["New York"],
});

function setup() {
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty");
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [newYork],
      homeLocationId: null,
    },
  });
  return renderHook(
    () => ({
      locations: useLocations(),
      reference: useReferenceMoment(),
      wallTime: useWallTimeInput(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={repository}
          writeScheduler={immediateWriteScheduler}
          clock={clock}
          tickScheduler={createManualTickScheduler()}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
}

describe("useLocations after a wall-time input", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("tells the wall-time hint in the typed row and ends it with Now", () => {
    const { result } = setup();
    const target = {
      kind: WallTimeTargetKind.LOCATION,
      locationId: newYork.id,
    } as const;

    act(() => {
      result.current.wallTime.confirmWallTime(target, "0230", "2026-03-08");
    });

    const note = result.current.locations.rowsContext.wallClockNote;
    expect(note).toMatchObject({
      placement: WallClockNotePlacement.ROW,
      target,
    });
    expect(result.current.locations.rows[0]?.wallTimeHint).toContain(
      "02:30 does not exist",
    );

    act(() => result.current.reference.returnToNow());

    expect(result.current.locations.rowsContext.wallClockNote?.placement).toBe(
      WallClockNotePlacement.NONE,
    );
  });
});
