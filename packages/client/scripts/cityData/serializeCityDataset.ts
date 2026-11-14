/**
 * Serializes the city data set compactly, one city per line, so that diffs are
 * reviewable and equal sets give byte-identical files.
 * Implements FR12 of add-geonames-city-source (D5).
 */
import type { CityDataset } from "./cityDataTypes.ts";

export function serializeCityDataset(dataset: CityDataset): string {
  const cityLines = dataset.cities.map((city) => JSON.stringify(city));
  return [
    "{",
    `"formatVersion":${JSON.stringify(dataset.formatVersion)},`,
    `"source":${JSON.stringify(dataset.source)},`,
    `"zones":${JSON.stringify(dataset.zones)},`,
    `"regions":${JSON.stringify(dataset.regions)},`,
    `"cities":[\n${cityLines.join(",\n")}\n],`,
    `"zoneCityPopulations":${JSON.stringify(dataset.zoneCityPopulations)},`,
    `"zoneCityRegions":${JSON.stringify(dataset.zoneCityRegions)}`,
    "}",
    "",
  ].join("\n");
}
