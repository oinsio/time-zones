// Verifies FR3, FR6, FR8, FR9, FR10, M5 of add-wall-time-input-with-hint (D5).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { useLocations } from "./useLocations";
import { useReferenceMoment } from "./useReferenceMoment";
import {
  useWallTimeInput,
  WallTimeInputOutcome,
  type WallTimeTarget,
  WallTimeTargetKind,
} from "./useWallTimeInput";

const newYork = buildLocation({
  label: "New York",
  ...KNOWN_CITIES["New York"],
});
const newYorkTarget = {
  kind: WallTimeTargetKind.LOCATION,
  locationId: newYork.id,
} as const;
const MARCH_8 = "2026-03-08";

function setup() {
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty");
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [newYork],
      homeLocationId: null,
    },
  });
  const save = vi.spyOn(repository, "save");
  const writeScheduler = createManualWriteScheduler();
  const rendered = renderHook(
    () => ({
      locations: useLocations(),
      reference: useReferenceMoment(),
      wallTime: useWallTimeInput(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={repository}
          writeScheduler={writeScheduler}
          clock={clock}
          tickScheduler={createManualTickScheduler()}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
  const confirm = (target: WallTimeTarget, text: string) => {
    let outcome: WallTimeInputOutcome | undefined;
    act(() => {
      outcome = rendered.result.current.wallTime.confirmWallTime(
        target,
        text,
        MARCH_8,
      );
    });
    return outcome;
  };
  return { ...rendered, save, writeScheduler, confirm };
}

describe("useWallTimeInput", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("pins the typed time and closes the field", () => {
    const { result, confirm } = setup();

    expect(confirm(newYorkTarget, "1040")).toBe(WallTimeInputOutcome.CLOSED);

    expect(result.current.locations.rows[0]?.localTimeLabel).toBe("10:40");
    expect(result.current.reference.dateBar.isPinned).toBe(true);
  });

  it("keeps the field open for text that is not a time", () => {
    const { result, confirm } = setup();

    expect(confirm(newYorkTarget, "9:3")).toBe(
      WallTimeInputOutcome.INVALID_TEXT,
    );

    expect(result.current.reference.dateBar.isPinned).toBe(false);
  });

  it("closes silently when the location is gone", () => {
    const { result, confirm } = setup();

    const outcome = confirm(
      { kind: WallTimeTargetKind.LOCATION, locationId: "gone|Gone" },
      "10:40",
    );

    expect(outcome).toBe(WallTimeInputOutcome.CLOSED);
    expect(result.current.reference.dateBar.isPinned).toBe(false);
  });

  it("writes nothing for 20 inputs and a Now", () => {
    const { result, save, writeScheduler, confirm } = setup();

    for (let attempt = 0; attempt < 20; attempt += 1) {
      confirm(newYorkTarget, `${String(attempt).padStart(2, "0")}:15`);
    }
    act(() => result.current.reference.returnToNow());
    writeScheduler.runPending();

    expect(save).not.toHaveBeenCalled();
  });
});
