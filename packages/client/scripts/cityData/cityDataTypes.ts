/**
 * The dataset type of design D5 and the parsed GeoNames row types.
 * Implements FR1, FR2, FR7, FR12 of add-geonames-city-source (D5).
 */

/** [geonameId, English name, Russian name or 0 when equal, country code, zone index, population, region index?] */
export type CityTuple =
  | [number, string, string | 0, string, number, number]
  | [number, string, string | 0, string, number, number, number];

export type CityDataset = {
  formatVersion: number;
  source: { name: string; licence: string; dumpDate: string };
  zones: string[];
  regions: [string, string][];
  cities: CityTuple[];
  zoneCityPopulations: Record<string, number>;
  zoneCityRegions: Record<string, number>;
};

export type GeoNamesCityRow = {
  geonameId: number;
  name: string;
  countryCode: string;
  admin1Code: string;
  featureCode: string;
  population: number;
  timeZoneId: string;
};

export type AlternateNameRow = {
  geonameId: number;
  language: string;
  name: string;
  isPreferred: boolean;
  isShort: boolean;
  isColloquial: boolean;
  isHistoric: boolean;
};

export type Admin1Row = { key: string; name: string; geonameId: number };

export type AlternateNamesByCity = Map<number, AlternateNameRow[]>;
export type CityNames = { en: string; ru: string };
