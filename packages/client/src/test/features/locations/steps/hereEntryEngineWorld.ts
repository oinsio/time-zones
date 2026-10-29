// Implements FR12, NFR-P1 of show-here-entry-for-device-time: the Here entry on an outdated engine and under the work counter.

import zoneCities from "virtual:zone-cities";
import i18n from "i18next";
import { expect } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { getUtcOffsetMinutes, type Location } from "@/model";
import type { LocationRowsContext } from "@/presenter";
import { presentHereEntry, presentLocationRows } from "@/presenter";
import { buildReferenceDay } from "@/test/referenceDay";
import {
  MAX_TRANSITION_LOOKUPS_PER_ZONE,
  startWorkCount,
  type WorkCount,
} from "@/test/workCounters";
import type { FreshModules } from "../../browser_compatibility/steps/legacyZoneWorld";
import { cityEntry } from "./locationsUiWorld";
import {
  BUDGET_FIRST_MOMENT,
  BUDGET_ROW_COUNT,
  BUDGET_SECOND_MOMENT,
  buildBudgetLocations,
} from "./rowBudgetWorld";

const LANGUAGE = "en";
const BUDGET_DEVICE_ZONE = "Asia/Almaty";

/** Presents the Here entry with the modules of an engine, the way the controller does. */
export async function presentHereEntryOnEngine(
  modules: FreshModules,
  input: { deviceTimeZone: string; instant: string; listedCity: string },
) {
  const { model, presenter, temporal, adapters } = modules;
  const added = model.reduceLocations(model.INITIAL_WORLD_CLOCK_STATE, {
    type: model.LocationCommandType.ADD_LOCATION,
    ...cityEntry(input.listedCity),
  });
  if (!added.ok) throw new Error("the listed city could not be added");
  const reported = model.reduceLocations(added.state, {
    type: model.LocationCommandType.SET_DEVICE_TIME_ZONE,
    timeZoneId: input.deviceTimeZone,
  });
  if (!reported.ok) throw new Error("the device time zone was not accepted");
  const state = reported.state;
  const hereEntry = model.getHereEntry(state);
  if (hereEntry === undefined) throw new Error("no Here entry");
  const instant = temporal.Temporal.Instant.from(input.instant);
  const city = adapters
    .createCompositeCitySearch(zoneCities)
    .getExemplarCity(hereEntry.timeZoneId, LANGUAGE);
  const presented = presenter.presentHereEntry(hereEntry, city, {
    language: LANGUAGE,
    instant,
    translate: i18n.getFixedT(LANGUAGE),
    deviceTimeZoneId: state.deviceTimeZoneId,
    homeLocationId: state.homeLocationId,
    referenceOffsetMinutes: model.getReferenceOffsetMinutes(state, instant),
    referenceDay: model.getReferenceDay(state, instant),
  });
  return { presented, deviceTimeZoneId: state.deviceTimeZoneId };
}

const contextAt = (timestamp: string): LocationRowsContext => {
  const instant = fakeClock(timestamp).instant();
  return {
    language: LANGUAGE,
    instant,
    translate: i18n.getFixedT(LANGUAGE),
    deviceTimeZoneId: BUDGET_DEVICE_ZONE,
    homeLocationId: null,
    referenceOffsetMinutes: getUtcOffsetMinutes(BUDGET_DEVICE_ZONE, instant),
    referenceDay: buildReferenceDay(instant, BUDGET_DEVICE_ZONE),
  };
};

const HERE_ENTRY = { timeZoneId: BUDGET_DEVICE_ZONE };

/** Presents the rows and the Here entry of the device time zone, as one presentation. */
export function presentRowsAndHereEntry(
  locations: readonly Location[],
  timestamp: string,
) {
  presentLocationRows(locations, contextAt(timestamp));
  presentHereEntry(HERE_ENTRY, "Almaty", contextAt(timestamp));
}

/** Presents rows and the Here entry once, then again under the work counter. */
export function createWarmHereEntryCheck() {
  let workCount: WorkCount | undefined;
  const locations = buildBudgetLocations(BUDGET_ROW_COUNT);
  const presentAll = async (timestamp: string) => {
    presentRowsAndHereEntry(locations, timestamp);
  };
  return {
    presentOnce: () => presentAll(BUDGET_FIRST_MOMENT),
    presentAgain: async () => {
      workCount = startWorkCount();
      await presentAll(BUDGET_SECOND_MOMENT);
      workCount.stop();
    },
    expectNoFormatter: () => expect(workCount?.formatters()).toBe(0),
    expectHereEntryLookupsWithinRowBound: () =>
      expect(
        workCount?.transitionLookupsByZone().get(BUDGET_DEVICE_ZONE) ?? 0,
      ).toBeLessThanOrEqual(MAX_TRANSITION_LOOKUPS_PER_ZONE),
    stop: () => workCount?.stop(),
  };
}
