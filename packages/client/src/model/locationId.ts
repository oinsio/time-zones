import { canonicalizeTimeZoneId } from "./timeZoneId";

/** The one owner of the location id format. Implements FR8 of add-locations-via-search. */
const ID_SEPARATOR = "|";

export function buildLocationId(timeZoneId: string, label: string): string {
  return `${timeZoneId}${ID_SEPARATOR}${label}`;
}

/**
 * The id with its zone canonicalized, or `undefined` for an unknown zone. The
 * one owner of the id format besides `buildLocationId`.
 */
export function canonicalizeLocationId(id: string): string | undefined {
  const separatorIndex = id.indexOf(ID_SEPARATOR);
  if (separatorIndex < 0) return undefined;
  const timeZoneId = canonicalizeTimeZoneId(id.slice(0, separatorIndex));
  if (timeZoneId === undefined) return undefined;
  return buildLocationId(timeZoneId, id.slice(separatorIndex + 1));
}
