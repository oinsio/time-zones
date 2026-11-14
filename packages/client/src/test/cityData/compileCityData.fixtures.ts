import type {
  Admin1Row,
  AlternateNameRow,
  GeoNamesCityRow,
} from "../../../scripts/cityData/cityDataTypes.ts";
import type { CityDataInput } from "../../../scripts/cityData/compileCityData.ts";

export function cityRow(overrides: Partial<GeoNamesCityRow>): GeoNamesCityRow {
  return {
    geonameId: 1,
    name: "City",
    countryCode: "RU",
    admin1Code: "01",
    featureCode: "PPL",
    population: 200_000,
    timeZoneId: "Europe/Moscow",
    ...overrides,
  };
}

export function russianName(geonameId: number, name: string): AlternateNameRow {
  return {
    geonameId,
    language: "ru",
    name,
    isPreferred: true,
    isShort: false,
    isColloquial: false,
    isHistoric: false,
  };
}

export const ADMIN1_ROWS: Admin1Row[] = [
  { key: "RU.01", name: "Region One", geonameId: 9001 },
  { key: "US.IL", name: "Illinois", geonameId: 9002 },
  { key: "US.MO", name: "Missouri", geonameId: 9003 },
];

export function buildInput(overrides: Partial<CityDataInput>): CityDataInput {
  return {
    cityRows: [],
    admin1Rows: ADMIN1_ROWS,
    alternateNames: new Map(),
    zoneCities: [
      {
        timeZoneId: "Europe/Moscow",
        names: { en: "Moscow", ru: "Москва" },
        countryCode: "RU",
      },
    ],
    timeZoneAliases: { "Asia/Calcutta": "Asia/Kolkata" },
    releaseZones: new Set([
      "Europe/Moscow",
      "Asia/Kolkata",
      "America/Chicago",
      "Europe/Berlin",
    ]),
    dumpDate: "2026-11-13",
    ...overrides,
  };
}
