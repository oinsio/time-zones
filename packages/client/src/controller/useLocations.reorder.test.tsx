// Verifies FR2, FR3, FR4, FR6 of reorder-locations-by-drag-and-drop (D2).
import { act } from "@testing-library/react";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationErrorCode } from "@/model";
import { LocationsLoadStatus, SaveOutcome } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { almaty, moscow, renderLocations } from "@/test/renderLocations";

const newYork = buildLocation({
  timeZoneId: "America/New_York",
  label: "New York",
  countryCode: "US",
});

const seededRepository = () =>
  createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [moscow, almaty, newYork],
    },
  });

describe("useLocations moveLocation", () => {
  it("should reorder rows and locations and save once with the new order", () => {
    const repository = seededRepository();
    const save = vi.spyOn(repository, "save");
    const { result } = renderLocations(repository);
    act(() => {
      result.current.moveLocation(newYork.id, 0);
    });
    expect(result.current.locations).toEqual([newYork, moscow, almaty]);
    expect(result.current.rows.map((row) => row.id)).toEqual([
      newYork.id,
      moscow.id,
      almaty.id,
    ]);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith([newYork, moscow, almaty]);
  });

  it("should return ok and save nothing for a move to its own index", () => {
    const repository = seededRepository();
    const save = vi.spyOn(repository, "save");
    const { result } = renderLocations(repository);
    let outcome: ReturnType<typeof result.current.moveLocation> | undefined;
    act(() => {
      outcome = result.current.moveLocation(moscow.id, 0);
    });
    expect(outcome?.ok).toBe(true);
    expect(save).not.toHaveBeenCalled();
  });

  it("should return the range error and save nothing for a bad index", () => {
    const repository = seededRepository();
    const save = vi.spyOn(repository, "save");
    const { result } = renderLocations(repository);
    let outcome: ReturnType<typeof result.current.moveLocation> | undefined;
    act(() => {
      outcome = result.current.moveLocation(moscow.id, 3);
    });
    expect(outcome).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_POSITION_OUT_OF_RANGE,
    });
    expect(save).not.toHaveBeenCalled();
  });

  it("should return not found and save nothing for an unknown id", () => {
    const repository = seededRepository();
    const save = vi.spyOn(repository, "save");
    const { result } = renderLocations(repository);
    let outcome: ReturnType<typeof result.current.moveLocation> | undefined;
    act(() => {
      outcome = result.current.moveLocation("none", 0);
    });
    expect(outcome).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_NOT_FOUND,
    });
    expect(save).not.toHaveBeenCalled();
  });

  it("should still reorder and flag the failure when saving fails", () => {
    const repository = seededRepository();
    vi.spyOn(repository, "save").mockReturnValue(SaveOutcome.FAILED);
    const { result } = renderLocations(repository);
    act(() => {
      result.current.moveLocation(almaty.id, 0);
    });
    expect(result.current.locations).toEqual([almaty, moscow, newYork]);
    expect(result.current.hasSaveFailed).toBe(true);
  });
});
