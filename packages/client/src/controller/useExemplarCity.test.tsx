// Verifies FR8, NFR-P2 of show-here-entry-for-device-time (D4).
import zoneCities from "virtual:zone-cities";
import { act, renderHook, waitFor } from "@testing-library/react";
import i18n from "i18next";
import { createCompositeCitySearch } from "@/adapters";
import type { CitySearch, LoadCitySearch } from "@/ports";
import { loadCitySearchOnce } from "./cityDataCache";
import { useExemplarCity } from "./useExemplarCity";

const search = createCompositeCitySearch(zoneCities);

/** A loader that answers when the test says so. */
function createDeferredLoader() {
  let resolve: (loaded: CitySearch) => void = () => undefined;
  let reject: (reason: Error) => void = () => undefined;
  const load: LoadCitySearch = vi.fn(
    () =>
      new Promise<CitySearch>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
      }),
  );
  return {
    load,
    resolve: (loaded: CitySearch = search) => resolve(loaded),
    reject: () => reject(new Error("offline")),
  };
}

describe("useExemplarCity", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should give the derived name first and call the loader only after the first render", () => {
    const { load } = createDeferredLoader();
    const names: string[] = [];
    const callsAtRender: number[] = [];

    renderHook(() => {
      callsAtRender.push(vi.mocked(load).mock.calls.length);
      const name = useExemplarCity("Asia/Almaty", load);
      names.push(name ?? "");
      return name;
    });

    expect(names[0]).toBe("Almaty");
    expect(callsAtRender[0]).toBe(0);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("should give the loaded name in the interface language", async () => {
    const deferred = createDeferredLoader();
    const { result } = renderHook(() =>
      useExemplarCity("Asia/Almaty", deferred.load),
    );

    await act(async () => deferred.resolve());

    expect(result.current).toBe("Алматы");
  });

  it("should keep the derived name when the load fails, without a second call", async () => {
    const deferred = createDeferredLoader();
    const { result } = renderHook(() =>
      useExemplarCity("Asia/Almaty", deferred.load),
    );

    await act(async () => deferred.reject());

    expect(result.current).toBe("Almaty");
    expect(deferred.load).toHaveBeenCalledTimes(1);
  });

  it("should not call the loader without a zone", () => {
    const deferred = createDeferredLoader();

    const { result } = renderHook(() =>
      useExemplarCity(undefined, deferred.load),
    );

    expect(result.current).toBeUndefined();
    expect(deferred.load).not.toHaveBeenCalled();
  });

  it("should start the load when a zone appears later", () => {
    const deferred = createDeferredLoader();
    const { rerender } = renderHook(
      ({ timeZoneId }: { timeZoneId?: string }) =>
        useExemplarCity(timeZoneId, deferred.load),
      { initialProps: {} },
    );

    rerender({ timeZoneId: "Asia/Almaty" });

    expect(deferred.load).toHaveBeenCalledTimes(1);
  });

  it("should give the loaded name on the first render when the data is already loaded", async () => {
    const load: LoadCitySearch = vi.fn(async () => search);
    await loadCitySearchOnce(load);

    const { result } = renderHook(() => useExemplarCity("Asia/Almaty", load));

    expect(result.current).toBe("Алматы");
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
  });

  it("should give the loaded name after a failed load when the data is loaded elsewhere", async () => {
    const load: LoadCitySearch = vi
      .fn<LoadCitySearch>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(search);
    const { result, rerender } = renderHook(() =>
      useExemplarCity("Asia/Almaty", load),
    );
    await act(async () => undefined);
    expect(result.current).toBe("Almaty");

    await act(async () => {
      await loadCitySearchOnce(load);
    });
    rerender();

    expect(result.current).toBe("Алматы");
  });
});
