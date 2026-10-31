// Implements FR8, NFR-P1 of add-settings-page-and-device-time-location: the device time location on an outdated engine and under the work counter.

import zoneCities from "virtual:zone-cities";
import i18n from "i18next";
import { expect } from "vitest";
import { fakeClock } from "@/lib/temporal";
import {
  buildDeviceTimeLocation,
  getUtcOffsetMinutes,
  type Location,
} from "@/model";
import { HourFormat } from "@/preferences";
import type { LocationRowsContext } from "@/presenter";
import { presentLocationRows } from "@/presenter";
import { buildReferenceDay } from "@/test/referenceDay";
import {
  MAX_TRANSITION_LOOKUPS_PER_ZONE,
  startWorkCount,
  type WorkCount,
} from "@/test/workCounters";
import type { FreshModules } from "../../browser_compatibility/steps/legacyZoneWorld";
import {
  BUDGET_FIRST_MOMENT,
  BUDGET_ROW_COUNT,
  BUDGET_SECOND_MOMENT,
  buildBudgetLocations,
} from "./rowBudgetWorld";

const LANGUAGE = "en";
const BUDGET_DEVICE_ZONE = "Asia/Almaty";

/** Presents the device time location with the modules of an engine, the way the controller does. */
export async function presentDeviceTimeOnEngine(
  modules: FreshModules,
  input: { deviceTimeZone: string; instant: string },
) {
  const { model, presenter, temporal, adapters } = modules;
  const state = model.reduceLocations(
    {
      ...model.INITIAL_WORLD_CLOCK_STATE,
      locations: model.buildFirstLaunchLocations(input.deviceTimeZone),
      deviceTimeZoneId: input.deviceTimeZone,
    },
    {
      type: model.LocationCommandType.SET_DEVICE_TIME_ZONE,
      timeZoneId: input.deviceTimeZone,
    },
  );
  if (!state.ok) throw new Error("the device time zone was not accepted");
  const instant = temporal.Temporal.Instant.from(input.instant);
  const deviceTimeLocation = state.state.locations[0];
  const deviceTimeCityLabel = adapters
    .createCompositeCitySearch(zoneCities)
    .getExemplarCity(deviceTimeLocation.timeZoneId, LANGUAGE);
  const [presented] = presenter.presentLocationRows([deviceTimeLocation], {
    language: LANGUAGE,
    hourFormat: HourFormat.H24,
    instant,
    translate: i18n.getFixedT(LANGUAGE),
    deviceTimeZoneId: state.state.deviceTimeZoneId,
    deviceTimeCityLabel,
    homeLocationId: state.state.homeLocationId,
    referenceOffsetMinutes: model.getReferenceOffsetMinutes(
      state.state,
      instant,
    ),
    referenceDay: model.getReferenceDay(state.state, instant),
  });
  return { presented, deviceTimeZoneId: state.state.deviceTimeZoneId };
}

const contextAt = (timestamp: string): LocationRowsContext => {
  const instant = fakeClock(timestamp).instant();
  return {
    language: LANGUAGE,
    hourFormat: HourFormat.H24,
    instant,
    translate: i18n.getFixedT(LANGUAGE),
    deviceTimeZoneId: BUDGET_DEVICE_ZONE,
    deviceTimeCityLabel: "Almaty",
    homeLocationId: null,
    referenceOffsetMinutes: getUtcOffsetMinutes(BUDGET_DEVICE_ZONE, instant),
    referenceDay: buildReferenceDay(instant, BUDGET_DEVICE_ZONE),
  };
};

/** Presents rows with the device time location once, then again under the work counter. */
export function createWarmDeviceTimeCheck() {
  let workCount: WorkCount | undefined;
  const locations = [
    buildDeviceTimeLocation(BUDGET_DEVICE_ZONE),
    ...buildBudgetLocations(BUDGET_ROW_COUNT),
  ];
  const presentAll = async (timestamp: string) => {
    presentLocationRows(locations, contextAt(timestamp));
  };
  return {
    presentOnce: () => presentAll(BUDGET_FIRST_MOMENT),
    presentAgain: async () => {
      workCount = startWorkCount();
      await presentAll(BUDGET_SECOND_MOMENT);
      workCount.stop();
    },
    expectNoFormatter: () => expect(workCount?.formatters()).toBe(0),
    expectLookupsWithinRowBound: () =>
      expect(
        workCount?.transitionLookupsByZone().get(BUDGET_DEVICE_ZONE) ?? 0,
      ).toBeLessThanOrEqual(MAX_TRANSITION_LOOKUPS_PER_ZONE),
    stop: () => workCount?.stop(),
  };
}

/** Presents the rows of the list with the device time location first, as one presentation. */
export function presentRowsWithDeviceTime(
  locations: readonly Location[],
  timestamp: string,
) {
  presentLocationRows(
    [buildDeviceTimeLocation(BUDGET_DEVICE_ZONE), ...locations],
    contextAt(timestamp),
  );
}
