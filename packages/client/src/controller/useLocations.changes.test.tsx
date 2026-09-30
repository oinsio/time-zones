// Verifies FR8, FR10, FR11 of add-locations-via-search (D3).
import { act } from "@testing-library/react";
import { createInMemoryLocationRepository } from "@/adapters";
import { LOCATIONS_WRITE_DEBOUNCE_MS } from "@/constants";
import { LocationsLoadStatus } from "@/ports";
import {
  almaty,
  moscow,
  moscowInput,
  renderLocations,
} from "@/test/renderLocations";
import { createManualWriteScheduler } from "@/test/writeSchedulers";

describe("useLocations", () => {
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
});
