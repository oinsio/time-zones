/**
 * The app's own abbreviation table: abbreviation → zones, in display order.
 * Browser-produced abbreviations are never used (ADR-0003).
 * Implements FR4 of add-locations-via-search (D7).
 */
export const TIME_ZONE_ABBREVIATIONS: Readonly<
  Record<string, readonly string[]>
> = {
  UTC: ["UTC"],
  GMT: ["UTC", "Europe/London"],
  EST: ["America/New_York"],
  EDT: ["America/New_York"],
  ET: ["America/New_York"],
  CST: ["America/Chicago", "Asia/Shanghai", "America/Havana"],
  CDT: ["America/Chicago", "America/Havana"],
  MST: ["America/Denver", "America/Phoenix"],
  MDT: ["America/Denver"],
  PST: ["America/Los_Angeles"],
  PDT: ["America/Los_Angeles"],
  PT: ["America/Los_Angeles"],
  AKST: ["America/Anchorage"],
  AKDT: ["America/Anchorage"],
  HST: ["Pacific/Honolulu"],
  BST: ["Europe/London", "Asia/Dhaka"],
  WET: ["Europe/Lisbon"],
  WEST: ["Europe/Lisbon"],
  CET: ["Europe/Berlin", "Europe/Paris"],
  CEST: ["Europe/Berlin", "Europe/Paris"],
  EET: ["Europe/Athens", "Europe/Kyiv"],
  EEST: ["Europe/Athens", "Europe/Kyiv"],
  MSK: ["Europe/Moscow"],
  IST: ["Asia/Kolkata", "Asia/Jerusalem", "Europe/Dublin"],
  PKT: ["Asia/Karachi"],
  ALMT: ["Asia/Almaty"],
  ICT: ["Asia/Bangkok"],
  WIB: ["Asia/Jakarta"],
  SGT: ["Asia/Singapore"],
  HKT: ["Asia/Hong_Kong"],
  JST: ["Asia/Tokyo"],
  KST: ["Asia/Seoul"],
  AEST: ["Australia/Sydney"],
  AEDT: ["Australia/Sydney"],
  NZST: ["Pacific/Auckland"],
  NZDT: ["Pacific/Auckland"],
  GST: ["Asia/Dubai"],
  SAST: ["Africa/Johannesburg"],
  WAT: ["Africa/Lagos"],
  EAT: ["Africa/Nairobi"],
  CAT: ["Africa/Maputo"],
  BRT: ["America/Sao_Paulo"],
  ART: ["America/Argentina/Buenos_Aires"],
};

/** Abbreviations that map to a zone, in table order. */
export function findAbbreviationsOfZone(timeZoneId: string): string[] {
  return Object.entries(TIME_ZONE_ABBREVIATIONS)
    .filter(([, timeZoneIds]) => timeZoneIds.includes(timeZoneId))
    .map(([abbreviation]) => abbreviation);
}
