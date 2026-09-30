// Verifies FR15, FR16, NFR-P2 of add-locations-via-search (D8).
import zoneCities from "virtual:zone-cities";
import { describe, expect, it, vi } from "vitest";
import {
  createFetchCitySearchLoader,
  parseZoneCityRecords,
} from "./fetchCitySearch";

const INVALID_RECORDS_MESSAGE = "not a list of zone cities";
const DATA_URL = "/assets/city-search-test.json";

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
    const fetchResource = vi.fn().mockResolvedValue(respondWith(zoneCities));
    const citySearch = await createLoader(fetchResource)();
    expect(citySearch.search("Moscow", "en")[0]?.record.timeZoneId).toBe(
      "Europe/Moscow",
    );
  });

  it("should request the data url", async () => {
    const fetchResource = vi.fn().mockResolvedValue(respondWith(zoneCities));
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
    const fetchResource = vi.fn().mockResolvedValue(respondWith(brokenRecords));
    await expect(createLoader(fetchResource)()).rejects.toThrow(
      INVALID_RECORDS_MESSAGE,
    );
  });

  it("should fetch again after a rejection and then resolve", async () => {
    const fetchResource = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(respondWith(zoneCities));
    const load = createLoader(fetchResource);
    await expect(load()).rejects.toThrow();
    await expect(load()).resolves.toBeDefined();
    expect(fetchResource).toHaveBeenCalledTimes(2);
  });
});

describe("default fetch", () => {
  it("should use the global fetch when none is injected", async () => {
    const globalFetch = vi.fn().mockResolvedValue(respondWith(zoneCities));
    vi.stubGlobal("fetch", globalFetch);
    try {
      await createFetchCitySearchLoader({ dataUrl: DATA_URL })();
      expect(globalFetch).toHaveBeenCalledWith(DATA_URL);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("parse zone city records", () => {
  const validRecord = {
    timeZoneId: "Europe/Moscow",
    names: { en: "Moscow", ru: "Москва" },
    countryCode: "RU",
  };

  it("should accept an array of valid records", () => {
    expect(parseZoneCityRecords([validRecord])).toEqual([validRecord]);
  });

  it("should reject a list with one invalid record among valid ones", () => {
    expect(() => parseZoneCityRecords([validRecord, null])).toThrow(
      INVALID_RECORDS_MESSAGE,
    );
  });

  it.each([
    ["a non-array", {}],
    ["null", null],
    ["a null record", [null]],
    ["a record without an id", [{ ...validRecord, timeZoneId: undefined }]],
    ["a record with a numeric id", [{ ...validRecord, timeZoneId: 1 }]],
    ["a record without names", [{ ...validRecord, names: undefined }]],
    ["a record with null names", [{ ...validRecord, names: null }]],
    [
      "a record without an English name",
      [{ ...validRecord, names: { ru: "Москва" } }],
    ],
    [
      "a record with a numeric Russian name",
      [{ ...validRecord, names: { en: "Moscow", ru: 1 } }],
    ],
    [
      "a record without a country code",
      [{ ...validRecord, countryCode: undefined }],
    ],
  ])("should reject %s", (_label, payload) => {
    expect(() => parseZoneCityRecords(payload)).toThrow(
      INVALID_RECORDS_MESSAGE,
    );
  });
});
