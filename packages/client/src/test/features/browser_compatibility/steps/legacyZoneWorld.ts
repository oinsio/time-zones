import { expect, vi } from "vitest";
import { LOCATIONS_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { LocationsLoadStatus, SaveOutcome } from "@/ports";
import {
  installStaleEngine,
  restoreEngine,
} from "@/test/fakeStaleDateTimeFormat";
import { committedRelease } from "@/test/installZoneRules";

/** The wrapper the test setup installed over the real engine. */
const setupDateTimeFormat = Intl.DateTimeFormat;
const OUTDATED_ZONE_DATA = ["Europe/Kyiv", "America/Ciudad_Juarez"];
const DEVICE_ZONE_ID = "Asia/Almaty";
const SAMPLE_TIME_OF_DAY = "T07:30:00Z";

/** The modules that keep the `Intl.DateTimeFormat` they first see, imported as they are. */
const importModules = async () => {
  const [adapters, model, presenter, temporal] = await Promise.all([
    import("@/adapters"),
    import("@/model"),
    import("@/presenter"),
    import("@/lib/temporal"),
  ]);
  return { adapters, model, presenter, temporal };
};

/** Fresh copies of the modules that keep the `Intl.DateTimeFormat` they first see. */
const importFreshModules = async () => {
  vi.resetModules();
  return importModules();
};

export type FreshModules = Awaited<ReturnType<typeof importFreshModules>>;

/**
 * An engine with outdated zone data (the stale-engine fake rejecting the renamed and new
 * zones) and the zone rules wrapper installed over it.
 * Implements FR5 of add-zone-rules-from-iana (design D9, D10).
 */
export async function startOnOutdatedZoneData() {
  vi.resetModules();
  const { calls } = installStaleEngine({
    staleZones: {},
    rejectedZones: OUTDATED_ZONE_DATA,
  });
  const zoneRules = await import("@/lib/zoneRules");
  zoneRules.installZoneRulesDateTimeFormat(committedRelease);
  return { calls, modules: await importModules() };
}

export const restoreZoneData = () => {
  restoreEngine();
  Intl.DateTimeFormat = setupDateTimeFormat;
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
