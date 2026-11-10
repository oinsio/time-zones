// Implements FR1-FR4, FR8, FR10 of add-grid-meeting-range-and-share: the store world of the meeting range features.
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  createStore,
  getEffectiveInstant,
  getReferenceZone,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  type LocationErrorCode,
  type MeetingRange,
  type ReduceResult,
  ReferenceMode,
  reduceLocations,
  type WorldClockState,
} from "@/model";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";

export const ALMATY_ZONE = "Asia/Almaty";
export const SAMPLE_NOW = "2026-03-08T07:30:00Z";
export const SAMPLE_START = "2026-03-08T04:00:00Z";
export const SAMPLE_END = "2026-03-08T06:00:00Z";

export const idOf = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] }).id;

/** The times of an instant in a zone as "HH:MM". */
export const clockTimeIn = (instant: Temporal.Instant, zone: string) =>
  instant
    .toZonedDateTimeISO(zone)
    .toPlainTime()
    .toString({ smallestUnit: "minute" });

/** "09:00–11:00": the range's local start and end in a zone. */
export const spanIn = (range: MeetingRange, zone: string) =>
  `${clockTimeIn(range.start, zone)}–${clockTimeIn(range.end, zone)}`;

export type MeetingWorldOptions = {
  deviceZone?: string;
  cities?: string[];
  homeCity?: string | null;
};

/** A store over the real reducer, with the sample meeting set on request. */
export const createMeetingWorld = () => {
  let store = createStore(reduceLocations, INITIAL_WORLD_CLOCK_STATE);
  let lastOutcome: ReduceResult<WorldClockState, LocationErrorCode> | undefined;
  let stateBefore: WorldClockState = INITIAL_WORLD_CLOCK_STATE;

  const open = ({
    deviceZone = ALMATY_ZONE,
    cities = ["Almaty", "Moscow", "Kolkata", "New York"],
    homeCity = "Almaty",
  }: MeetingWorldOptions = {}) => {
    store = createStore(reduceLocations, {
      ...INITIAL_WORLD_CLOCK_STATE,
      deviceTimeZoneId: deviceZone,
      locations: cities.map((label) =>
        buildLocation({ label, ...KNOWN_CITIES[label] }),
      ),
      homeLocationId: homeCity === null ? null : idOf(homeCity),
    });
  };
  const dispatch = (command: Parameters<typeof store.dispatch>[0]) => {
    stateBefore = store.getSnapshot();
    lastOutcome = store.dispatch(command);
    return lastOutcome;
  };
  const setRange = (start: string, end: string) =>
    dispatch({ type: LocationCommandType.SET_MEETING_RANGE, start, end });
  const state = () => store.getSnapshot();

  return {
    open,
    dispatch,
    setRange,
    state,
    getStore: () => store,
    openWithSampleMeeting: (options: MeetingWorldOptions = {}) => {
      open(options);
      setRange(SAMPLE_START, SAMPLE_END);
    },
    expectSpan: (expected: string, zone = ALMATY_ZONE) => {
      const range = state().meeting;
      expect(range).toBeDefined();
      expect(spanIn(range as MeetingRange, zone)).toBe(expected);
    },
    expectNoRange: () => expect(state().meeting).toBeUndefined(),
    expectPinnedAt: (instant: string) => {
      const { reference } = state();
      expect(reference.mode).toBe(ReferenceMode.PINNED);
      expect(
        getEffectiveInstant(
          state(),
          Temporal.Instant.from(SAMPLE_NOW),
        ).toString(),
      ).toBe(instant);
    },
    lastError: () =>
      lastOutcome?.ok === false ? lastOutcome.error : undefined,
    expectStateUnchanged: () => expect(state()).toBe(stateBefore),
    referenceZone: () => getReferenceZone(state()),
  };
};
