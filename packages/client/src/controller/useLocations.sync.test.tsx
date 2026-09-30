// Verifies FR11–FR14 of add-locations-via-search (D3, D5).
import { act } from "@testing-library/react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsLoadStatus, SaveOutcome } from "@/ports";
import {
  almaty,
  moscow,
  moscowInput,
  renderLocations,
} from "@/test/renderLocations";
import { LocationsStatus } from "./useLocations";

describe("useLocations", () => {
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
