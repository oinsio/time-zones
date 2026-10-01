// Verifies FR11–FR14 of add-locations-via-search (D3, D5).
// Verifies FR2, FR4 of show-utc-offset-on-location-rows (D4).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import { createInMemoryLocationRepository } from "@/adapters";
import { type Clock, fakeClock } from "@/lib/temporal";
import { LocationsLoadStatus } from "@/ports";
import { moscow, renderLocations } from "@/test/renderLocations";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationsStatus, useLocations } from "./useLocations";

describe("useLocations", () => {
  it("should throw outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useLocations())).toThrow(/LocationsProvider/);
    vi.restoreAllMocks();
  });

  it("should return exactly the documented members", () => {
    const { result } = renderLocations(createInMemoryLocationRepository());
    expect(Object.keys(result.current).sort()).toEqual(
      [
        "rows",
        "locations",
        "loadStatus",
        "hasSaveFailed",
        "addLocation",
        "removeLocation",
        "moveLocation",
        "resetLocations",
      ].sort(),
    );
  });

  describe("loading", () => {
    it("should show the stored list as ready", () => {
      const repository = createInMemoryLocationRepository({
        initialDocument: {
          status: LocationsLoadStatus.LOADED,
          locations: [moscow],
        },
      });
      const { result } = renderLocations(repository);
      expect(result.current.locations).toEqual([moscow]);
      expect(result.current.loadStatus).toBe(LocationsStatus.READY);
    });

    it("should present rows in the active language", () => {
      const repository = createInMemoryLocationRepository({
        initialDocument: {
          status: LocationsLoadStatus.LOADED,
          locations: [moscow],
        },
      });
      const { result } = renderLocations(
        repository,
        immediateWriteScheduler,
        fakeClock("2026-07-15T12:00:00Z"),
      );
      expect(result.current.rows).toEqual([
        {
          id: moscow.id,
          cityLabel: "Moscow",
          countryName: "Россия",
          utcOffsetLabel: "UTC+3",
        },
      ]);
    });

    it("should read the instant again when the list changes", () => {
      const january = fakeClock("2026-01-15T12:00:00Z");
      const july = fakeClock("2026-07-15T12:00:00Z");
      let currentClock = january;
      const switchableClock: Clock = {
        instant: () => currentClock.instant(),
        plainDateISO: () => currentClock.plainDateISO(),
        timeZoneId: () => currentClock.timeZoneId(),
      };
      const newYork = {
        timeZoneId: "America/New_York",
        label: "New York",
        countryCode: "US",
      };
      const { result } = renderLocations(
        createInMemoryLocationRepository(),
        immediateWriteScheduler,
        switchableClock,
      );
      act(() => {
        result.current.addLocation(newYork);
      });
      expect(result.current.rows[0]?.utcOffsetLabel).toBe("UTC\u22125");
      currentClock = july;
      act(() => {
        result.current.addLocation({
          timeZoneId: "Asia/Kolkata",
          label: "Kolkata",
          countryCode: "IN",
        });
      });
      expect(result.current.rows.map((row) => row.utcOffsetLabel)).toEqual([
        "UTC\u22124",
        "UTC+5:30",
      ]);
    });

    it("should re-present rows when the language changes", async () => {
      const repository = createInMemoryLocationRepository({
        initialDocument: {
          status: LocationsLoadStatus.LOADED,
          locations: [moscow],
        },
      });
      const { result } = renderLocations(repository);
      await act(() => i18n.changeLanguage("en"));
      expect(result.current.rows[0]?.countryName).toBe("Russia");
      await act(() => i18n.changeLanguage("ru"));
    });

    it("should start empty and ready when nothing is stored", () => {
      const { result } = renderLocations(createInMemoryLocationRepository());
      expect(result.current.locations).toEqual([]);
      expect(result.current.loadStatus).toBe(LocationsStatus.READY);
    });

    it("should report an unreadable document", () => {
      const repository = createInMemoryLocationRepository({
        initialDocument: { status: LocationsLoadStatus.UNREADABLE },
      });
      const { result } = renderLocations(repository);
      expect(result.current.loadStatus).toBe(LocationsStatus.UNREADABLE);
    });

    it("should not write on first launch", () => {
      const repository = createInMemoryLocationRepository();
      const save = vi.spyOn(repository, "save");
      renderLocations(repository);
      expect(save).not.toHaveBeenCalled();
    });
  });
});
