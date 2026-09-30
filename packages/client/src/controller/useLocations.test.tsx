// Verifies FR11–FR14 of add-locations-via-search (D3, D5).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LOCATIONS_WRITE_DEBOUNCE_MS } from "@/constants";
import {
  type LocationRepository,
  LocationsLoadStatus,
  SaveOutcome,
} from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { LocationsStatus, useLocations } from "./useLocations";
import type { WriteScheduler } from "./writeScheduler";

const moscow = buildLocation();
const almaty = buildLocation({
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
});
const moscowInput = {
  timeZoneId: "Europe/Moscow",
  label: "Moscow",
  countryCode: "RU",
};

const renderLocations = (
  repository: LocationRepository,
  writeScheduler: WriteScheduler = immediateWriteScheduler,
) =>
  renderHook(() => useLocations(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LocationsProvider
        repository={repository}
        writeScheduler={writeScheduler}
      >
        {children}
      </LocationsProvider>
    ),
  });

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
      const { result } = renderLocations(repository);
      expect(result.current.rows).toEqual([
        { id: moscow.id, cityLabel: "Moscow", countryName: "Россия" },
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

  describe("changes", () => {
    it("should add a location and save the list", () => {
      const repository = createInMemoryLocationRepository();
      const save = vi.spyOn(repository, "save");
      const { result } = renderLocations(repository);
      act(() => {
        result.current.addLocation(moscowInput);
      });
      expect(result.current.locations).toEqual([moscow]);
      expect(save).toHaveBeenCalledWith([moscow]);
    });

    it("should return the model error for a duplicate and not save again", () => {
      const repository = createInMemoryLocationRepository();
      const save = vi.spyOn(repository, "save");
      const { result } = renderLocations(repository);
      act(() => {
        result.current.addLocation(moscowInput);
      });
      let outcome: ReturnType<typeof result.current.addLocation> | undefined;
      act(() => {
        outcome = result.current.addLocation(moscowInput);
      });
      expect(outcome?.ok).toBe(false);
      expect(save).toHaveBeenCalledTimes(1);
    });

    it("should remove a location and save the list", () => {
      const repository = createInMemoryLocationRepository({
        initialDocument: {
          status: LocationsLoadStatus.LOADED,
          locations: [moscow, almaty],
        },
      });
      const save = vi.spyOn(repository, "save");
      const { result } = renderLocations(repository);
      act(() => {
        result.current.removeLocation(moscow.id);
      });
      expect(result.current.locations).toEqual([almaty]);
      expect(save).toHaveBeenCalledWith([almaty]);
    });

    it("should collapse a burst of changes into one debounced write", () => {
      const repository = createInMemoryLocationRepository();
      const save = vi.spyOn(repository, "save");
      const scheduler = createManualWriteScheduler();
      const { result } = renderLocations(repository, scheduler);
      act(() => {
        result.current.addLocation(moscowInput);
        result.current.addLocation({ ...moscowInput, label: "Moskva" });
      });
      expect(save).not.toHaveBeenCalled();
      expect(scheduler.lastDelayMs()).toBe(LOCATIONS_WRITE_DEBOUNCE_MS);
      act(() => scheduler.runPending());
      expect(save).toHaveBeenCalledTimes(1);
    });

    it("should flush a pending write on pagehide", () => {
      const repository = createInMemoryLocationRepository();
      const save = vi.spyOn(repository, "save");
      const { result } = renderLocations(
        repository,
        createManualWriteScheduler(),
      );
      act(() => {
        result.current.addLocation(moscowInput);
      });
      act(() => {
        window.dispatchEvent(new Event("pagehide"));
      });
      expect(save).toHaveBeenCalledTimes(1);
    });

    it("should not write on pagehide when nothing is pending", () => {
      const repository = createInMemoryLocationRepository();
      const save = vi.spyOn(repository, "save");
      renderLocations(repository, createManualWriteScheduler());
      window.dispatchEvent(new Event("pagehide"));
      expect(save).not.toHaveBeenCalled();
    });
  });

  describe("another instance", () => {
    const setUpTwoInstances = () => {
      const backend = createInMemoryLocationBackend();
      const own = createInMemoryLocationRepository({ backend });
      const other = createInMemoryLocationRepository({ backend });
      return { own, other, view: renderLocations(own) };
    };

    it("should replace the list with a loaded one and set ready", () => {
      const { other, view } = setUpTwoInstances();
      act(() => {
        other.save([almaty]);
      });
      expect(view.result.current.locations).toEqual([almaty]);
      expect(view.result.current.loadStatus).toBe(LocationsStatus.READY);
    });

    it("should not write back what another instance saved", () => {
      const { own, other } = setUpTwoInstances();
      const save = vi.spyOn(own, "save");
      act(() => {
        other.save([almaty]);
      });
      expect(save).not.toHaveBeenCalled();
    });

    it("should empty the list when the other instance clears", () => {
      const { other, view } = setUpTwoInstances();
      act(() => {
        other.save([almaty]);
      });
      act(() => {
        other.clear();
      });
      expect(view.result.current.locations).toEqual([]);
    });

    it("should leave the unreadable state when the other instance clears", () => {
      const backend = createInMemoryLocationBackend({
        status: LocationsLoadStatus.UNREADABLE,
      });
      const other = createInMemoryLocationRepository({ backend });
      const { result } = renderLocations(
        createInMemoryLocationRepository({ backend }),
      );
      act(() => {
        other.clear();
      });
      expect(result.current.loadStatus).toBe(LocationsStatus.READY);
    });

    it("should become unreadable when the other instance leaves an unreadable document", () => {
      const backend = createInMemoryLocationBackend();
      const own = createInMemoryLocationRepository({ backend });
      const { result } = renderLocations(own);
      act(() => {
        for (const listener of backend.listeners) {
          listener.notify({ status: LocationsLoadStatus.UNREADABLE });
        }
      });
      expect(result.current.loadStatus).toBe(LocationsStatus.UNREADABLE);
    });

    it("should stop listening after unmount", () => {
      const backend = createInMemoryLocationBackend();
      const { unmount } = renderLocations(
        createInMemoryLocationRepository({ backend }),
      );
      unmount();
      expect(backend.listeners.size).toBe(0);
    });
  });

  describe("reset", () => {
    const unreadable = () =>
      createInMemoryLocationRepository({
        initialDocument: { status: LocationsLoadStatus.UNREADABLE },
      });

    it("should clear the stored document and return to ready", () => {
      const repository = unreadable();
      const clear = vi.spyOn(repository, "clear");
      const { result } = renderLocations(repository);
      act(() => {
        result.current.resetLocations();
      });
      expect(clear).toHaveBeenCalledTimes(1);
      expect(result.current.loadStatus).toBe(LocationsStatus.READY);
      expect(result.current.locations).toEqual([]);
    });

    it("should report a failed clear and still end ready", () => {
      const repository = createInMemoryLocationRepository({
        initialDocument: { status: LocationsLoadStatus.UNREADABLE },
        isWritable: false,
      });
      const { result } = renderLocations(repository);
      act(() => {
        result.current.resetLocations();
      });
      expect(result.current.hasSaveFailed).toBe(true);
      expect(result.current.loadStatus).toBe(LocationsStatus.READY);
    });
  });

  describe("save failure", () => {
    it("should keep the list and flag a failed save", () => {
      const repository = createInMemoryLocationRepository({
        isWritable: false,
      });
      const { result } = renderLocations(repository);
      act(() => {
        result.current.addLocation(moscowInput);
      });
      expect(result.current.locations).toEqual([moscow]);
      expect(result.current.hasSaveFailed).toBe(true);
    });

    it("should clear the flag on the next successful save", () => {
      const repository = createInMemoryLocationRepository();
      const save = vi.spyOn(repository, "save");
      save.mockReturnValueOnce(SaveOutcome.FAILED);
      const { result } = renderLocations(repository);
      act(() => {
        result.current.addLocation(moscowInput);
      });
      act(() => {
        result.current.removeLocation(moscow.id);
      });
      expect(result.current.hasSaveFailed).toBe(false);
    });

    it("should not flag a failure before any save", () => {
      const { result } = renderLocations(createInMemoryLocationRepository());
      expect(result.current.hasSaveFailed).toBe(false);
    });
  });
});
