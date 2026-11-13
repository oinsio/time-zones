// Verifies FR15, FR16, NFR-P2 of add-locations-via-search (D8); FR14 of add-geonames-city-source (D5).
import zoneCities, { cityData } from "virtual:zone-cities";
import { describe, expect, it, vi } from "vitest";
import {
  createFetchCitySearchLoader,
  parseCitySearchData,
} from "./fetchCitySearch";

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

describe("parse city search data", () => {
  const validRecord = {
    timeZoneId: "Europe/Moscow",
    names: { en: "Moscow", ru: "Москва" },
    countryCode: "RU",
  };
  const validCityData = {
    zones: ["Europe/Moscow"],
    regions: [["Illinois", "Иллинойс"]],
    cities: [
      [551487, "Kazan", "Казань", "RU", 0, 1243500],
      [4250542, "Springfield", 0, "US", 0, 114394, 0],
    ],
    zoneCityPopulations: { "Europe/Moscow": 10381222 },
    zoneCityRegions: { "Europe/Moscow": 0 },
  };
  const parse = (overrides: Record<string, unknown> = {}) =>
    parseCitySearchData({
      zoneCities: [validRecord],
      cityData: { ...validCityData, ...overrides },
    });

  it("should accept valid zone cities and city data", () => {
    expect(parse().zoneCities).toEqual([validRecord]);
  });

  it("should expand a city tuple with names, zone and no region", () => {
    expect(parse().cityData.cities[0]).toEqual({
      id: "551487",
      names: { en: "Kazan", ru: "Казань" },
      countryCode: "RU",
      timeZoneId: "Europe/Moscow",
      population: 1243500,
    });
  });

  it("should expand a Russian name of 0 to the English name and a region index to its names", () => {
    expect(parse().cityData.cities[1]).toMatchObject({
      id: "4250542",
      names: { en: "Springfield", ru: "Springfield" },
      region: { en: "Illinois", ru: "Иллинойс" },
    });
  });

  it("should expand the zone city populations and regions", () => {
    const { cityData: parsed } = parse();
    expect(parsed.zoneCityPopulations).toEqual({ "Europe/Moscow": 10381222 });
    expect(parsed.zoneCityRegions).toEqual({
      "Europe/Moscow": { en: "Illinois", ru: "Иллинойс" },
    });
  });

  it.each([
    ["a non-object payload", null],
    ["a missing zone cities list", { cityData: validCityData }],
    ["a missing city data section", { zoneCities: [validRecord] }],
    ["an invalid zone city", { zoneCities: [null], cityData: validCityData }],
  ])("should reject %s", (_label, payload) => {
    expect(() => parseCitySearchData(payload)).toThrow(INVALID_RECORDS_MESSAGE);
  });

  it.each([
    ["a tuple with too few fields", { cities: [[1, "A", "А", "RU", 0]] }],
    ["a non-array city", { cities: ["x"] }],
    ["a bad tuple", { cities: [[1, 5, "А", "RU", 0, 1]] }],
    ["a bad Russian name", { cities: [[1, "A", 5, "RU", 0, 1]] }],
    ["a zone index out of range", { cities: [[1, "A", "А", "RU", 9, 1]] }],
    ["a region index out of range", { cities: [[1, "A", "А", "RU", 0, 1, 9]] }],
    ["a non-numeric population", { cities: [[1, "A", "А", "RU", 0, "1"]] }],
    ["a bad zones list", { zones: [1] }],
    ["a bad region", { regions: [["Illinois"]] }],
    ["a non-array regions list", { regions: {} }],
    ["a bad zone city population", { zoneCityPopulations: { x: "1" } }],
    ["a zone city region out of range", { zoneCityRegions: { x: 9 } }],
    ["a non-object zone city regions", { zoneCityRegions: [] }],
  ])("should reject %s", (_label, overrides) => {
    expect(() => parse(overrides)).toThrow(INVALID_RECORDS_MESSAGE);
  });

  it("should reject a list with one invalid record among valid ones", () => {
    expect(() =>
      parseCitySearchData({
        zoneCities: [validRecord, null],
        cityData: validCityData,
      }),
    ).toThrow(INVALID_RECORDS_MESSAGE);
  });

  it.each([
    ["a record without an id", { ...validRecord, timeZoneId: undefined }],
    ["a record with a numeric id", { ...validRecord, timeZoneId: 1 }],
    ["a record without names", { ...validRecord, names: undefined }],
    ["a record with null names", { ...validRecord, names: null }],
    [
      "a record without an English name",
      { ...validRecord, names: { ru: "Москва" } },
    ],
    [
      "a record with a numeric Russian name",
      { ...validRecord, names: { en: "Moscow", ru: 1 } },
    ],
    [
      "a record without a country code",
      { ...validRecord, countryCode: undefined },
    ],
  ])("should reject %s", (_label, record) => {
    expect(() =>
      parseCitySearchData({ zoneCities: [record], cityData: validCityData }),
    ).toThrow(INVALID_RECORDS_MESSAGE);
  });
});
