import { expect, vi } from "vitest";
import { LOCATIONS_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { loadLegacySupport } from "@/lib/legacy";
import { LocationsLoadStatus, SaveOutcome } from "@/ports";

type DateTimeFormatConstructor = typeof Intl.DateTimeFormat;

const nativeDateTimeFormat = Intl.DateTimeFormat;
const OUTDATED_ZONE_DATA = ["Europe/Kyiv", "America/Ciudad_Juarez"];
const DEVICE_ZONE_ID = "Asia/Almaty";
const SAMPLE_TIME_OF_DAY = "T07:30:00Z";

const hasZone = (zones: readonly string[], timeZone: string) =>
  zones.some((zone) => zone.toLowerCase() === timeZone.toLowerCase());

/**
 * Stands in for the `Intl.DateTimeFormat` of an engine with zone data older
 * than IANA 2022b: it rejects the zones renamed or added since.
 * Implements FR4 of support-legacy-ios-12-safari (D11).
 */
function buildOutdatedDateTimeFormat(rejectedZones: string[]) {
  function OutdatedDateTimeFormat(
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ) {
    const { timeZone } = options ?? {};
    if (timeZone !== undefined && hasZone(OUTDATED_ZONE_DATA, timeZone)) {
      rejectedZones.push(timeZone);
      throw new RangeError(`Invalid time zone specified: ${timeZone}`);
    }
    return new nativeDateTimeFormat(locales, options);
  }
  Object.defineProperty(OutdatedDateTimeFormat, "prototype", {
    value: nativeDateTimeFormat.prototype,
  });
  return Object.assign(OutdatedDateTimeFormat, {
    supportedLocalesOf: nativeDateTimeFormat.supportedLocalesOf,
  }) as unknown as DateTimeFormatConstructor;
}

/** Fresh copies of the modules that keep the `Intl.DateTimeFormat` they first see. */
const importFreshModules = async () => {
  vi.resetModules();
  const [adapters, model, presenter, temporal] = await Promise.all([
    import("@/adapters"),
    import("@/model"),
    import("@/presenter"),
    import("@/lib/temporal"),
  ]);
  return { adapters, model, presenter, temporal };
};

export type FreshModules = Awaited<ReturnType<typeof importFreshModules>>;

/** An engine with outdated zone data and the legacy zone shim installed over it. */
export async function startOnOutdatedZoneData() {
  const rejectedZones: string[] = [];
  vi.resetModules();
  Intl.DateTimeFormat = buildOutdatedDateTimeFormat(rejectedZones);
  await loadLegacySupport();
  return { rejectedZones, modules: await importFreshModules() };
}

export const restoreZoneData = () => {
  Intl.DateTimeFormat = nativeDateTimeFormat;
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.resetModules();
};

/** Zone check and day-period stops of the device zone on a date, computed on fresh modules. */
export async function checkAlmatyDayStops(
  date: string,
  isBigIntPresent: boolean,
) {
  if (!isBigIntPresent) vi.stubGlobal("BigInt", undefined);
  const { model, temporal } = await importFreshModules();
  const day = model.getReferenceDay(
    { ...model.INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: DEVICE_ZONE_ID },
    temporal.Temporal.Instant.from(`${date}${SAMPLE_TIME_OF_DAY}`),
  );
  const canonicalZone = model.canonicalizeTimeZoneId(DEVICE_ZONE_ID);
  const stops = model.getDayPeriodStops(DEVICE_ZONE_ID, day);
  vi.unstubAllGlobals();
  return { canonicalZone, stops };
}

/** Writes a stored list holding one location, the way a previous visit left it. */
export const seedStoredLocation = (label: string, timeZoneId: string) =>
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    JSON.stringify({
      schemaVersion: LOCATIONS_SCHEMA_VERSION,
      payload: { locations: [{ label, timeZoneId, countryCode: "" }] },
    }),
  );

/** Zone ids of the stored list, read back through the repository of the fresh modules. */
export const loadStoredZoneIds = (modules: FreshModules) => {
  const loaded = modules.adapters.localStorageLocationRepository.load();
  expect(loaded.status).toBe(LocationsLoadStatus.LOADED);
  return loaded.status === LocationsLoadStatus.LOADED
    ? loaded.locations.map((location) => location.timeZoneId)
    : [];
};

/** Saves the locations, then returns the zone ids the stored list holds. */
export const saveAndLoadStoredZoneIds = (
  modules: FreshModules,
  locations: Parameters<
    FreshModules["adapters"]["localStorageLocationRepository"]["save"]
  >[0]["locations"],
) => {
  expect(
    modules.adapters.localStorageLocationRepository.save({
      locations,
      homeLocationId: null,
    }),
  ).toBe(SaveOutcome.SAVED);
  return loadStoredZoneIds(modules);
};

/** The outdated engine was asked for the zone (compared in lower case). */
export const expectZoneRejectedNatively = (
  rejectedZones: string[],
  lowerCaseZone: string,
) => {
  expect(rejectedZones.map((zone) => zone.toLowerCase())).toContain(
    lowerCaseZone,
  );
};

/** Adds a location with no country to an empty world clock. */
export const addLocationTo = (
  modules: FreshModules,
  label: string,
  timeZoneId: string,
) =>
  modules.model.reduceLocations(modules.model.INITIAL_WORLD_CLOCK_STATE, {
    type: modules.model.LocationCommandType.ADD_LOCATION,
    label,
    timeZoneId,
    countryCode: "",
  });
