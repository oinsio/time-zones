// Verifies FR6, FR15 of add-locations-via-search (D8, D9).
import { act, renderHook, waitFor } from "@testing-library/react";
import zoneCities from "virtual:zone-cities";
import { createCompositeCitySearch } from "@/adapters";
import type { CitySearch, LoadCitySearch } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { CitySearchStatus, useCitySearch } from "./useCitySearch";

const createLoader = (): LoadCitySearch =>
  vi.fn(async () => createCompositeCitySearch(zoneCities));

describe("useCitySearch", () => {
  it("should be loading until the data arrives, then ready", async () => {
    const { result } = renderHook(() => useCitySearch(createLoader()));
    expect(result.current.status).toBe(CitySearchStatus.LOADING);
    await waitFor(() =>
      expect(result.current.status).toBe(CitySearchStatus.READY),
    );
  });

  it("should fail when the loader rejects and retry with a new call", async () => {
    const loader: LoadCitySearch = vi
      .fn<LoadCitySearch>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(createCompositeCitySearch(zoneCities));
    const { result } = renderHook(() => useCitySearch(loader));
    await waitFor(() =>
      expect(result.current.status).toBe(CitySearchStatus.FAILED),
    );
    act(() => result.current.retry());
    expect(result.current.status).toBe(CitySearchStatus.LOADING);
    await waitFor(() =>
      expect(result.current.status).toBe(CitySearchStatus.READY),
    );
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("should reuse a loaded search on the next mount", async () => {
    const loader = createLoader();
    const first = renderHook(() => useCitySearch(loader));
    await waitFor(() =>
      expect(first.result.current.status).toBe(CitySearchStatus.READY),
    );
    first.unmount();
    const second = renderHook(() => useCitySearch(loader));
    expect(second.result.current.status).toBe(CitySearchStatus.READY);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("should keep loading when a replaced loader answers late", async () => {
    let resolveFirst: (search: CitySearch) => void = () => undefined;
    const firstLoader: LoadCitySearch = () =>
      new Promise((resolve) => {
        resolveFirst = resolve;
      });
    const secondLoader: LoadCitySearch = () => new Promise(() => undefined);
    const { result, rerender } = renderHook(
      ({ loader }) => useCitySearch(loader),
      { initialProps: { loader: firstLoader } },
    );
    rerender({ loader: secondLoader });
    await act(async () => {
      resolveFirst(createCompositeCitySearch(zoneCities));
    });
    expect(result.current.status).toBe(CitySearchStatus.LOADING);
  });

  it("should not report a failure of a replaced loader", async () => {
    let rejectFirst: () => void = () => undefined;
    const firstLoader: LoadCitySearch = () =>
      new Promise((_resolve, reject) => {
        rejectFirst = () => reject(new Error("late"));
      });
    const secondLoader: LoadCitySearch = () => new Promise(() => undefined);
    const { result, rerender } = renderHook(
      ({ loader }) => useCitySearch(loader),
      { initialProps: { loader: firstLoader } },
    );
    rerender({ loader: secondLoader });
    await act(async () => {
      rejectFirst();
    });
    expect(result.current.status).toBe(CitySearchStatus.LOADING);
  });

  it("should load again on every retry", async () => {
    const loader = vi.fn<LoadCitySearch>().mockRejectedValue(new Error("x"));
    const { result } = renderHook(() => useCitySearch(loader));
    await waitFor(() =>
      expect(result.current.status).toBe(CitySearchStatus.FAILED),
    );
    act(() => result.current.retry());
    await waitFor(() =>
      expect(result.current.status).toBe(CitySearchStatus.FAILED),
    );
    act(() => result.current.retry());
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(3));
  });

  describe("presentResults", () => {
    const renderReady = async () => {
      const view = renderHook(() => useCitySearch(createLoader()));
      await waitFor(() =>
        expect(view.result.current.status).toBe(CitySearchStatus.READY),
      );
      return view.result;
    };

    it.each(["", "   "])(
      "should present suggestions for the query %j",
      async (query) => {
        const result = await renderReady();
        const presented = result.current.presentResults(query, []);
        expect(presented[0]?.timeZoneId).toBe("UTC");
      },
    );

    it("should present search results for a query", async () => {
      const result = await renderReady();
      const presented = result.current.presentResults("Moscow", []);
      expect(presented.map(({ timeZoneId }) => timeZoneId)).toEqual([
        "Europe/Moscow",
      ]);
    });

    it("should mark results already in the list", async () => {
      const result = await renderReady();
      const presented = result.current.presentResults("Moscow", [
        buildLocation(),
      ]);
      expect(presented[0]?.isAdded).toBe(true);
    });

    it("should present nothing before the data is ready", () => {
      const neverLoaded: LoadCitySearch = () => new Promise(() => undefined);
      const { result } = renderHook(() => useCitySearch(neverLoaded));
      expect(result.current.presentResults("Moscow", [])).toEqual([]);
    });
  });
});
