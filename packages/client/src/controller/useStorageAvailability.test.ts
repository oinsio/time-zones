// Verifies FR9 of add-main-page-scaffold: the page learns whether it can save.
import { renderHook } from "@testing-library/react";
import { inMemoryStorageAvailability } from "@/adapters";
import { useStorageAvailability } from "./useStorageAvailability";

describe("useStorageAvailability", () => {
  it.each([true, false])(
    "should expose isStorageAvailable as %s from the port",
    (isAvailable) => {
      const { result } = renderHook(() =>
        useStorageAvailability(inMemoryStorageAvailability(isAvailable)),
      );
      expect(result.current).toBe(isAvailable);
    },
  );

  it("should use the browser local storage by default", () => {
    const { result } = renderHook(() => useStorageAvailability());
    expect(result.current).toBe(true);
  });

  // NFR-A2: the warning must be inserted into an already rendered live region.
  it("should report storage as available on the first render and ask the port after mount", () => {
    const renderedValues: boolean[] = [];
    renderHook(() => {
      const isAvailable = useStorageAvailability(
        inMemoryStorageAvailability(false),
      );
      renderedValues.push(isAvailable);
      return isAvailable;
    });
    expect([renderedValues[0], renderedValues.at(-1)]).toEqual([true, false]);
  });
});
