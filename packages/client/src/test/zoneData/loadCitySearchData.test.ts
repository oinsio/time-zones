// Verifies FR3, FR5 of add-city-coordinates-to-locations (D3): zone cities carry their zone coordinates.
import { describe, expect, it } from "vitest";
import { DATASET_PATH } from "../../../scripts/cityData/constants.ts";
import { loadCitySearchData } from "../../../scripts/zoneData/loadCitySearchData.ts";

const { zoneCities } = loadCitySearchData(DATASET_PATH);
const findZoneCity = (timeZoneId: string) =>
  zoneCities.find((record) => record.timeZoneId === timeZoneId);

describe("loadCitySearchData zone coordinates", () => {
  it("should give Moscow its zone coordinates in tenths", () => {
    expect(findZoneCity("Europe/Moscow")).toMatchObject({
      latitudeTenths: 558,
      longitudeTenths: 376,
    });
  });

  it("should give UTC no coordinates", () => {
    const utc = findZoneCity("UTC");
    expect(utc).toBeDefined();
    expect(utc).not.toHaveProperty("latitudeTenths");
    expect(utc).not.toHaveProperty("longitudeTenths");
  });

  it("should give every zone city but UTC coordinates", () => {
    const withoutCoordinates = zoneCities
      .filter((record) => record.latitudeTenths === undefined)
      .map((record) => record.timeZoneId);
    expect(withoutCoordinates).toEqual(["UTC"]);
  });

  it("should keep the names and the country code of the zone city", () => {
    expect(findZoneCity("Europe/Moscow")).toMatchObject({
      names: { en: "Moscow", ru: "Москва" },
      countryCode: "RU",
    });
  });
});
