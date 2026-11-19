import {
  buildLocationId,
  type Coordinates,
  type Location,
  LocationKind,
} from "@/model";

/** Builds a location with its derived id; every field can be overridden. */
export function buildLocation(overrides: Partial<Location> = {}): Location {
  const timeZoneId = overrides.timeZoneId ?? "Europe/Moscow";
  const label = overrides.label ?? "Moscow";
  return {
    id: buildLocationId(timeZoneId, label),
    kind: LocationKind.CITY,
    timeZoneId,
    label,
    countryCode: "RU",
    ...overrides,
  };
}

/** Well-known locations shared by feature steps, keyed by city label. */
export const KNOWN_CITIES: Record<
  string,
  { timeZoneId: string; countryCode: string; coordinates?: Coordinates }
> = {
  Almaty: { timeZoneId: "Asia/Almaty", countryCode: "KZ" },
  Moscow: { timeZoneId: "Europe/Moscow", countryCode: "RU" },
  "Saint Petersburg": { timeZoneId: "Europe/Moscow", countryCode: "RU" },
  Minsk: { timeZoneId: "Europe/Minsk", countryCode: "BY" },
  Kolkata: { timeZoneId: "Asia/Kolkata", countryCode: "IN" },
  "New York": { timeZoneId: "America/New_York", countryCode: "US" },
  Kyiv: { timeZoneId: "Europe/Kyiv", countryCode: "UA" },
  Tokyo: { timeZoneId: "Asia/Tokyo", countryCode: "JP" },
  Cairo: { timeZoneId: "Africa/Cairo", countryCode: "EG" },
  Токио: { timeZoneId: "Asia/Tokyo", countryCode: "JP" },
  Edo: { timeZoneId: "Asia/Tokyo", countryCode: "JP" },
  Kathmandu: { timeZoneId: "Asia/Kathmandu", countryCode: "NP" },
  Apia: { timeZoneId: "Pacific/Apia", countryCode: "WS" },
  Belgrade: { timeZoneId: "Europe/Belgrade", countryCode: "RS" },
  "Lord Howe Island": { timeZoneId: "Australia/Lord_Howe", countryCode: "AU" },
  "Boa Vista": { timeZoneId: "America/Boa_Vista", countryCode: "BR" },
  Chicago: { timeZoneId: "America/Chicago", countryCode: "US" },
  Dublin: { timeZoneId: "Europe/Dublin", countryCode: "IE" },
  Reykjavik: { timeZoneId: "Atlantic/Reykjavik", countryCode: "IS" },
  Adelaide: { timeZoneId: "Australia/Adelaide", countryCode: "AU" },
  Sydney: { timeZoneId: "Australia/Sydney", countryCode: "AU" },
  Panama: { timeZoneId: "America/Panama", countryCode: "PA" },
  Jerusalem: { timeZoneId: "Asia/Jerusalem", countryCode: "IL" },
  "St. Vincent": { timeZoneId: "America/St_Vincent", countryCode: "VC" },
  Santiago: { timeZoneId: "America/Santiago", countryCode: "CL" },
  Kazan: { timeZoneId: "Europe/Moscow", countryCode: "RU" },
  Nowhere: { timeZoneId: "Etc/GMT-5", countryCode: "" },
  Казань: { timeZoneId: "Europe/Moscow", countryCode: "RU" },
  Springfield: { timeZoneId: "America/Chicago", countryCode: "US" },
  Longyearbyen: {
    timeZoneId: "Arctic/Longyearbyen",
    countryCode: "SJ",
    coordinates: { latitude: 78.2, longitude: 15.6 },
  },
  Murmansk: {
    timeZoneId: "Europe/Moscow",
    countryCode: "RU",
    coordinates: { latitude: 69.0, longitude: 33.1 },
  },
  UTC: { timeZoneId: "UTC", countryCode: "" },
};
