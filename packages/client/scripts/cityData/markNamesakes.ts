/**
 * Marks the namesakes among the city data records and builds the region table:
 * records sharing a country and a normalized English or Russian name.
 * Implements FR7 of add-geonames-city-source (D4).
 */
import { normalizeSearchText } from "../../src/lib/searchText/index.ts";
import type { CityNames } from "./cityDataTypes.ts";

export type NamesakeCandidate = {
  id: string;
  countryCode: string;
  names: CityNames;
  region: CityNames | undefined;
};

export type NamesakeRegions = {
  regions: [string, string][];
  regionIndexById: Map<string, number>;
};

const GROUP_KEY_SEPARATOR = "|";

function toRegionKey(region: CityNames): string {
  return `${region.en}${GROUP_KEY_SEPARATOR}${region.ru}`;
}

function groupByName(
  candidates: NamesakeCandidate[],
  readName: (candidate: NamesakeCandidate) => string,
): NamesakeCandidate[][] {
  const groups = new Map<string, NamesakeCandidate[]>();
  for (const candidate of candidates) {
    const key = `${candidate.countryCode}${GROUP_KEY_SEPARATOR}${normalizeSearchText(readName(candidate))}`;
    groups.set(key, [...(groups.get(key) ?? []), candidate]);
  }
  return [...groups.values()];
}

function findNamesakes(candidates: NamesakeCandidate[]): NamesakeCandidate[] {
  const namesakes = new Set<NamesakeCandidate>();
  const groups = [
    ...groupByName(candidates, (candidate) => candidate.names.en),
    ...groupByName(candidates, (candidate) => candidate.names.ru),
  ];
  for (const group of groups) {
    if (group.length < 2) continue;
    for (const candidate of group) namesakes.add(candidate);
  }
  return [...namesakes];
}

export function markNamesakes(
  candidates: NamesakeCandidate[],
): NamesakeRegions {
  const namesakes = findNamesakes(candidates);
  const pairs = new Map<string, [string, string]>();
  for (const namesake of namesakes) {
    if (namesake.region === undefined) {
      throw new Error(
        `The city ${namesake.names.en} (${namesake.id}, ${namesake.countryCode}) is a namesake but has no region`,
      );
    }
    pairs.set(toRegionKey(namesake.region), [
      namesake.region.en,
      namesake.region.ru,
    ]);
  }
  const sortedKeys = [...pairs.keys()].sort();
  const regions = sortedKeys.map((key) => pairs.get(key) as [string, string]);
  const indexByKey = new Map(sortedKeys.map((key, index) => [key, index]));
  const regionIndexById = new Map<string, number>();
  for (const namesake of namesakes) {
    regionIndexById.set(
      namesake.id,
      indexByKey.get(toRegionKey(namesake.region as CityNames)) as number,
    );
  }
  return { regions, regionIndexById };
}
