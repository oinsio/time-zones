// Verifies FR1, FR2, FR4, NFR-P1 of show-city-labels-in-interface-language (D3).
import { act, renderHook, waitFor } from "@testing-library/react";
import i18n from "i18next";
import { createCompositeCitySearch } from "@/adapters";
import { buildDeviceTimeLocation, type Location } from "@/model";
import type { CitySearch, LoadCitySearch } from "@/ports";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation } from "@/test/factories/buildLocation";
import { loadCitySearchOnce } from "./cityDataCache";
import { useCityLabels } from "./useCityLabels";
import { useExemplarCity } from "./useExemplarCity";

type ZoneCityData = Parameters<typeof createCompositeCitySearch>[0][number];

const city = (
  timeZoneId: string,
  en: string,
  ru: string,
  countryCode: string,
): ZoneCityData => ({ timeZoneId, names: { en, ru }, countryCode });

const search = createCompositeCitySearch([
  city("Asia/Tokyo", "Tokyo", "Токио", "JP"),
  city("Europe/Moscow", "Moscow", "Москва", "RU"),
]);

const tokyoInRussian = buildLocation({
  label: "Токио",
  timeZoneId: "Asia/Tokyo",
  countryCode: "JP",
});
const moscow = buildLocation();

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

describe("useCityLabels", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should give no labels before the load resolves", () => {
    const { load } = createDeferredLoader();
    const { result } = renderHook(() => useCityLabels([tokyoInRussian], load));

    expect(result.current).toBeUndefined();
  });

  it("should label the locations in the interface language, following a switch", async () => {
    const deferred = createDeferredLoader();
    const locations = [tokyoInRussian, moscow];
    const { result } = renderHook(() =>
      useCityLabels(locations, deferred.load),
    );

    await act(async () => deferred.resolve());
    expect(result.current?.get(tokyoInRussian.id)).toBe("Tokyo");
    expect(result.current?.get(moscow.id)).toBe("Moscow");

    await act(async () => {
      await i18n.changeLanguage("ru");
    });
    expect(result.current?.get(tokyoInRussian.id)).toBe("Токио");
    expect(result.current?.get(moscow.id)).toBe("Москва");
  });

  it("should use data a later load filled after the first load failed", async () => {
    // FR1: the search's retry fills the cache the labels read on the next render
    const load: LoadCitySearch = vi
      .fn<LoadCitySearch>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(search);
    const { result } = renderHook(() => useCityLabels([tokyoInRussian], load));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    await act(async () => undefined);
    await act(async () => {
      await loadCitySearchOnce(load);
    });

    await act(async () => {
      await i18n.changeLanguage("ru");
    });
    await act(async () => {
      await i18n.changeLanguage("en");
    });

    expect(result.current?.get(tokyoInRussian.id)).toBe("Tokyo");
  });

  it("should keep no labels and load once when the load fails, also after the list changes", async () => {
    const deferred = createDeferredLoader();
    const { result, rerender } = renderHook(
      ({ locations }) => useCityLabels(locations, deferred.load),
      { initialProps: { locations: [tokyoInRussian, moscow] } },
    );

    await act(async () => deferred.reject());
    rerender({ locations: [moscow] });
    rerender({ locations: [moscow, tokyoInRussian] });

    expect(result.current).toBeUndefined();
    expect(deferred.load).toHaveBeenCalledTimes(1);
  });

  it.each([
    { name: "an empty list", locations: [] as Location[] },
    {
      name: "only the device time location",
      locations: [buildDeviceTimeLocation(UNIT_TEST_DEVICE_TIME_ZONE)],
    },
  ])("should not load for $name", ({ locations }) => {
    const deferred = createDeferredLoader();

    const { result } = renderHook(() =>
      useCityLabels(locations, deferred.load),
    );

    expect(result.current).toBeUndefined();
    expect(deferred.load).not.toHaveBeenCalled();
  });

  it("should return the same map and ask for no label when rendered again with the same inputs", async () => {
    const deferred = createDeferredLoader();
    const locations = [tokyoInRussian, moscow];
    const { result, rerender } = renderHook(() =>
      useCityLabels(locations, deferred.load),
    );
    await act(async () => deferred.resolve());
    const firstMap = result.current;
    const getCityLabel = vi.spyOn(search, "getCityLabel");

    rerender();

    expect(result.current).toBe(firstMap);
    expect(getCityLabel).not.toHaveBeenCalled();
    getCityLabel.mockRestore();
  });

  it("should share one load with the exemplar city", async () => {
    const deferred = createDeferredLoader();
    renderHook(() => {
      useCityLabels([tokyoInRussian], deferred.load);
      useExemplarCity(UNIT_TEST_DEVICE_TIME_ZONE, deferred.load);
    });
    await act(async () => deferred.resolve());
    await waitFor(() =>
      expect(loadCitySearchOnce(deferred.load)).resolves.toBe(search),
    );

    expect(deferred.load).toHaveBeenCalledTimes(1);
  });
});
