import zoneCitiesUrl from "virtual:zone-cities-url";
import type { CitySearch, LoadCitySearch } from "@/ports";
import type { ZoneCityData } from "./citySource";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

/**
 * Loads the zone-cities data file with `fetch` and builds the search from it.
 * A `fetch` keeps no memory of an earlier failure, so a retry is a new request.
 * Implements FR15, FR16, NFR-P2 of add-locations-via-search (D8).
 */

const SEARCH_DATA_ERROR = {
  REQUEST_FAILED: "The city search data could not be fetched",
  INVALID_RECORDS: "The city search data is not a list of zone cities",
} as const;

const isRecordObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function isZoneCityData(value: unknown): value is ZoneCityData {
  if (!isRecordObject(value) || !isRecordObject(value.names)) return false;
  return (
    typeof value.timeZoneId === "string" &&
    typeof value.names.en === "string" &&
    typeof value.names.ru === "string" &&
    typeof value.countryCode === "string"
  );
}

/** Validates the fetched JSON; throws when it is not a list of zone cities. */
export function parseZoneCityRecords(payload: unknown): ZoneCityData[] {
  if (!Array.isArray(payload) || !payload.every(isZoneCityData)) {
    throw new Error(SEARCH_DATA_ERROR.INVALID_RECORDS);
  }
  return payload;
}

type FetchCitySearchOptions = {
  fetchResource?: typeof fetch;
  dataUrl?: string;
};

export function createFetchCitySearchLoader({
  fetchResource = (...fetchArguments) => globalThis.fetch(...fetchArguments),
  dataUrl = zoneCitiesUrl,
}: FetchCitySearchOptions = {}): LoadCitySearch {
  return async (): Promise<CitySearch> => {
    const response = await fetchResource(dataUrl);
    if (!response.ok) throw new Error(SEARCH_DATA_ERROR.REQUEST_FAILED);
    return createCompositeCitySearch(
      parseZoneCityRecords(await response.json()),
    );
  };
}
