// Verifies FR3, FR4, FR8, FR10 of set-home-location-and-show-differences (D1, D6).

import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { LocationsLoadStatus, type StoredLocations } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { useLocations } from "./useLocations";
import { useReferenceMoment } from "./useReferenceMoment";

const almaty = buildLocation({ label: "Almaty", ...KNOWN_CITIES.Almaty });
const moscow = buildLocation({ label: "Moscow", ...KNOWN_CITIES.Moscow });
const stored = (homeLocationId: string | null): StoredLocations => ({
  locations: [almaty, moscow],
  homeLocationId,
});

function setup(initialHome: string | null = null) {
  const backend = createInMemoryLocationBackend({
    status: LocationsLoadStatus.LOADED,
    ...stored(initialHome),
  });
  const repository = createInMemoryLocationRepository({ backend });
  const other = createInMemoryLocationRepository({ backend });
  const writeScheduler = createManualWriteScheduler();
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Europe/Moscow");
  const save = vi.spyOn(repository, "save");
  const rendered = renderHook(
    () => ({ locations: useLocations(), reference: useReferenceMoment() }),
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
  const markOf = (city: string) =>
    rendered.result.current.locations.rows.find((row) => row.cityLabel === city)
      ?.mark?.kind;
  return { ...rendered, other, writeScheduler, save, markOf };
}

describe("useLocations home location", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should write the list once with the new home", () => {
    const { result, writeScheduler, save } = setup();

    act(() => {
      result.current.locations.setHomeLocation(almaty.id);
    });
    act(() => writeScheduler.runPending());

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(stored(almaty.id));
  });

  it("should write nothing when the same home is set again", () => {
    const { result, writeScheduler, save } = setup(almaty.id);

    act(() => {
      result.current.locations.setHomeLocation(almaty.id);
    });
    act(() => writeScheduler.runPending());

    expect(save).not.toHaveBeenCalled();
  });

  it("should mark the home row and show the differences at once", () => {
    const { result, markOf } = setup();

    act(() => {
      result.current.locations.setHomeLocation(moscow.id);
    });

    expect(markOf("Moscow")).toBe("home");
    expect(result.current.locations.rows[0]?.offsetDifferenceLabel).toBe(
      "+2 h",
    );
  });

  it("should clear home and write the list without it", () => {
    const { result, writeScheduler, save } = setup(almaty.id);

    act(() => {
      result.current.locations.setHomeLocation(null);
    });
    act(() => writeScheduler.runPending());

    expect(save).toHaveBeenCalledWith(stored(null));
  });

  it("should keep home when the id is unknown", () => {
    const { result, markOf } = setup(almaty.id);

    act(() => {
      result.current.locations.setHomeLocation("Asia/Tokyo|Tokyo");
    });

    expect(markOf("Almaty")).toBe("home");
  });

  it("should clear home together with its removed location", () => {
    const { result, writeScheduler, save } = setup(almaty.id);

    act(() => {
      result.current.locations.removeLocation(almaty.id);
    });
    act(() => writeScheduler.runPending());

    expect(save).toHaveBeenCalledWith({
      locations: [moscow],
      homeLocationId: null,
    });
  });

  it("should write nothing when a document without home is opened", () => {
    const { writeScheduler, save } = setup();

    act(() => writeScheduler.runPending());

    expect(save).not.toHaveBeenCalled();
  });

  it("should apply the home that another tab saved, without writing back", () => {
    const { other, save, markOf } = setup();

    act(() => {
      other.save(stored(almaty.id));
    });

    expect(markOf("Almaty")).toBe("home");
    expect(save).not.toHaveBeenCalled();
  });

  it("should leave no home after the reset", () => {
    const { result } = setup(almaty.id);

    act(() => result.current.locations.resetLocations());

    expect(result.current.locations.rows.map((row) => row.id)).toEqual([
      DEVICE_TIME_LOCATION_ID,
    ]);
    expect(result.current.locations.rows[0]?.mark?.kind).toBe("here");
  });

  it("should keep a pinned instant when home changes", () => {
    const { result } = setup();
    act(() => result.current.reference.showNextDay());
    const moscowTimeBefore = result.current.locations.rows[1]?.localTimeLabel;

    act(() => {
      result.current.locations.setHomeLocation(almaty.id);
    });

    expect(result.current.locations.rows[1]?.localTimeLabel).toBe(
      moscowTimeBefore,
    );
    expect(result.current.locations.rows[1]?.localIsoDate).toBe("2026-03-09");
  });
});
