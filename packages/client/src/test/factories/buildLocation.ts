import { buildLocationId, type Location } from "@/model";

/** Builds a location with its derived id; every field can be overridden. */
export function buildLocation(overrides: Partial<Location> = {}): Location {
  const timeZoneId = overrides.timeZoneId ?? "Europe/Moscow";
  const label = overrides.label ?? "Moscow";
  return {
    id: buildLocationId(timeZoneId, label),
    timeZoneId,
    label,
    countryCode: "RU",
    ...overrides,
  };
}

/** Well-known locations shared by feature steps, keyed by city label. */
export const KNOWN_CITIES: Record<
  string,
  { timeZoneId: string; countryCode: string }
> = {
  Almaty: { timeZoneId: "Asia/Almaty", countryCode: "KZ" },
  Moscow: { timeZoneId: "Europe/Moscow", countryCode: "RU" },
  Kolkata: { timeZoneId: "Asia/Kolkata", countryCode: "IN" },
  "New York": { timeZoneId: "America/New_York", countryCode: "US" },
  Kyiv: { timeZoneId: "Europe/Kyiv", countryCode: "UA" },
  Tokyo: { timeZoneId: "Asia/Tokyo", countryCode: "JP" },
  Kathmandu: { timeZoneId: "Asia/Kathmandu", countryCode: "NP" },
  UTC: { timeZoneId: "UTC", countryCode: "" },
};
