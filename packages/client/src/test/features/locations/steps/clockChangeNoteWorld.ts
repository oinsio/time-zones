// Implements FR1–FR8 of show-clock-change-note-on-location-cards (D1–D5).
import i18n from "i18next";
import type { MockInstance } from "vitest";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { fakeClock } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import {
  buildDeviceTimeLocation,
  getEffectiveInstant,
  getReferenceDay,
  getReferenceOffsetMinutes,
  getWallClockNote,
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  type LocationCommand,
  LocationCommandType,
  reduceLocations,
  WallTimeTargetKind,
  type WorldClockState,
} from "@/model";
import { HourFormat } from "@/preferences";
import { type LocationRow, presentLocationRows } from "@/presenter";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { type StubbedZoneRules, stubZoneRules } from "@/test/stubZoneRules";

export const DEVICE_TIME_LOCATION_LABEL = "the device time location";
const UNKNOWN_ZONE_ID = "Mars/Olympus";
const DEFAULT_NOW = "2026-03-08T07:30:00Z";
const ISO_DATE_LENGTH = "YYYY-MM-DD".length;
const NARROW_NO_BREAK_SPACE = /\u202f/g;

export const LANGUAGES: Record<string, InterfaceLanguageCode> = {
  Russian: "ru",
  English: "en",
};
export const HOUR_FORMATS: Record<string, HourFormat> = {
  "24-hour": HourFormat.H24,
  "12-hour": HourFormat.H12,
};

/** Normalizes the narrow no-break space of 12-hour times for comparison. */
export const plainSpaces = (text: string | undefined) =>
  text?.replace(NARROW_NO_BREAK_SPACE, " ");

const split = (text: string) => text.split(",").map((part) => part.trim());

/** The state, the clock and the presenting of one scenario, composed the way `useLocations` does. */
export function createClockChangeNoteWorld() {
  let state: WorldClockState = INITIAL_WORLD_CLOCK_STATE;
  let now = DEFAULT_NOW;
  let language: InterfaceLanguageCode = "en";
  let hourFormat: HourFormat = HourFormat.H24;
  let spies: MockInstance[] = [];

  const apply = (command: LocationCommand) => {
    const outcome = reduceLocations(state, command);
    if (!outcome.ok) throw new Error(outcome.error);
    state = outcome.state;
  };
  const buildListed = (label: string): Location => {
    if (label === DEVICE_TIME_LOCATION_LABEL) {
      return buildDeviceTimeLocation(state.deviceTimeZoneId);
    }
    return buildLocation({ label, ...KNOWN_CITIES[label] });
  };

  return {
    reset() {
      for (const spy of spies) spy.mockRestore();
      spies = [];
      state = INITIAL_WORLD_CLOCK_STATE;
      now = DEFAULT_NOW;
      language = "en";
      hourFormat = HourFormat.H24;
    },
    setLanguage(name: string) {
      language = LANGUAGES[name];
    },
    setHourFormat(name: string) {
      hourFormat = HOUR_FORMATS[name];
    },
    setDeviceTimeZone(timeZoneId: string) {
      state = { ...state, deviceTimeZoneId: timeZoneId };
    },
    setNow(timestamp: string) {
      now = timestamp;
    },
    setList(labels: string) {
      state = { ...state, locations: split(labels).map(buildListed) };
    },
    addUnknownZoneLocation(label: string) {
      const unknown = buildLocation({ label, timeZoneId: UNKNOWN_ZONE_ID });
      state = {
        ...state,
        locations: state.locations.map((location) =>
          location.label === label ? unknown : location,
        ),
      };
    },
    stubRules(label: string, rules: StubbedZoneRules) {
      const { timeZoneId } = KNOWN_CITIES[label];
      spies.push(...stubZoneRules(timeZoneId, rules));
    },
    setHome(label: string) {
      const home = state.locations.find((location) => location.label === label);
      if (home === undefined) throw new Error(label);
      apply({ type: LocationCommandType.SET_HOME_LOCATION, id: home.id });
    },
    pin(instant: string) {
      apply({ type: LocationCommandType.SELECT_INSTANT, instant });
    },
    shiftDate(days: number) {
      apply({ type: LocationCommandType.SHIFT_DATE, days, now });
    },
    typeWallTime(label: string, time: string) {
      const target = state.locations.find(
        (location) => location.label === label,
      );
      if (target === undefined) throw new Error(label);
      apply({
        type: LocationCommandType.SET_WALL_TIME,
        target: { kind: WallTimeTargetKind.LOCATION, locationId: target.id },
        time,
        date: this.effectiveInstant().toString().slice(0, ISO_DATE_LENGTH),
      });
    },
    effectiveInstant: () =>
      getEffectiveInstant(state, fakeClock(now).instant()),
    presentRows(): LocationRow[] {
      const clockInstant = fakeClock(now).instant();
      const instant = getEffectiveInstant(state, clockInstant);
      return presentLocationRows(state.locations, {
        language,
        hourFormat,
        instant,
        translate: i18n.getFixedT(language),
        deviceTimeZoneId: state.deviceTimeZoneId,
        homeLocationId: state.homeLocationId,
        referenceOffsetMinutes: getReferenceOffsetMinutes(state, instant),
        referenceDay: getReferenceDay(state, clockInstant),
        wallClockNote: getWallClockNote(state),
      });
    },
    rowOf(label: string): LocationRow {
      const id =
        label === DEVICE_TIME_LOCATION_LABEL
          ? DEVICE_TIME_LOCATION_ID
          : state.locations.find((location) => location.label === label)?.id;
      const row = this.presentRows().find((candidate) => candidate.id === id);
      if (row === undefined) throw new Error(label);
      return row;
    },
    /** The pinned moment at 09:00 UTC of a date. */
    pinnedAtNine: (date: string) => `${date}T09:00:00Z`,
  };
}
