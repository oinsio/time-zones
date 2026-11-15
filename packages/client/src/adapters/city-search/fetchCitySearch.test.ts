// Verifies FR15, FR16, NFR-P2 of add-locations-via-search (D8); FR14 of add-geonames-city-source (D5).
// Verifies FR5 of add-city-coordinates-to-locations (D2, D5): coordinates are decoded from tenths.
import zoneCities, { cityData } from "virtual:zone-cities";
import { describe, expect, it, vi } from "vitest";
import { createFetchCitySearchLoader } from "./fetchCitySearch";

const INVALID_RECORDS_MESSAGE = "not a list of zone cities";
const DATA_URL = "/assets/city-search-test.json";
const searchData = { zoneCities, cityData };

const respondWith = (body: unknown, isOk = true) =>
  ({
    ok: isOk,
    json: () =>
      typeof body === "string"
        ? Promise.reject(new SyntaxError("not JSON"))
        : Promise.resolve(body),
  }) as Response;

const createLoader = (fetchResource: typeof fetch) =>
  createFetchCitySearchLoader({ fetchResource, dataUrl: DATA_URL });

describe("fetch city search loader", () => {
  it("should resolve to a search that finds Moscow", async () => {
    const fetchResource = vi.fn().mockResolvedValue(respondWith(searchData));
    const citySearch = await createLoader(fetchResource)();
    expect(citySearch.search("Moscow", "en")[0]?.record.timeZoneId).toBe(
      "Europe/Moscow",
    );
  });

  it("should resolve to a search that finds a city of the city data", async () => {
    const fetchResource = vi.fn().mockResolvedValue(respondWith(searchData));
    const citySearch = await createLoader(fetchResource)();
    expect(citySearch.search("Kazan", "en")[0]?.record.timeZoneId).toBe(
      "Europe/Moscow",
    );
  });

  it("should request the data url", async () => {
    const fetchResource = vi.fn().mockResolvedValue(respondWith(searchData));
    await createLoader(fetchResource)();
    expect(fetchResource).toHaveBeenCalledWith(DATA_URL);
  });

  it("should reject when the fetch rejects", async () => {
    const fetchResource = vi.fn().mockRejectedValue(new TypeError("offline"));
    await expect(createLoader(fetchResource)()).rejects.toThrow();
  });

  it("should reject when the response is not ok", async () => {
    const fetchResource = vi.fn().mockResolvedValue(respondWith([], false));
    await expect(createLoader(fetchResource)()).rejects.toThrow();
  });

  it("should reject when the body is not JSON", async () => {
    const fetchResource = vi.fn().mockResolvedValue(respondWith("<html>"));
    await expect(createLoader(fetchResource)()).rejects.toThrow();
  });

  it("should reject when a record lacks its Russian name", async () => {
    const brokenRecords = [
      {
        timeZoneId: "Europe/Moscow",
        names: { en: "Moscow" },
        countryCode: "RU",
      },
    ];
    const fetchResource = vi
      .fn()
      .mockResolvedValue(respondWith({ zoneCities: brokenRecords, cityData }));
    await expect(createLoader(fetchResource)()).rejects.toThrow(
      INVALID_RECORDS_MESSAGE,
    );
  });

  it("should fetch again after a rejection and then resolve", async () => {
    const fetchResource = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(respondWith(searchData));
    const load = createLoader(fetchResource);
    await expect(load()).rejects.toThrow();
    await expect(load()).resolves.toBeDefined();
    expect(fetchResource).toHaveBeenCalledTimes(2);
  });
});

describe("default fetch", () => {
  it("should use the global fetch when none is injected", async () => {
    const globalFetch = vi.fn().mockResolvedValue(respondWith(searchData));
    vi.stubGlobal("fetch", globalFetch);
    try {
      await createFetchCitySearchLoader({ dataUrl: DATA_URL })();
      expect(globalFetch).toHaveBeenCalledWith(DATA_URL);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
