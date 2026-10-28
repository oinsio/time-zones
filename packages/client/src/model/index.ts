// Public API of the model layer (ADR-0002).
// Implements FR8, FR9, FR10 of add-locations-via-search and FR2 of
// reorder-locations-by-drag-and-drop.
// Implements FR1-FR4 of mark-device-time-zone-in-location-list.
// Implements FR1, FR4 of match-here-mark-to-design.

export {
  CalendarMove,
  getCalendarFocusTarget,
  getCalendarWeeks,
} from "./calendar";
export {
  assembleDayPeriodStops,
  type DayPeriodStop,
  getDayPeriodStops,
} from "./dayPeriodStops";
// Implements FR1-FR6 of add-time-sliders-to-location-cards.
export {
  DAY_PERIOD_SCHEDULE,
  DayPeriod,
  type DayPeriodBoundary,
  getDayPeriod,
} from "./dayPeriods";
export {
  type BlendWindow,
  collectBlendWindows,
  collectOffsetEdges,
  type OffsetEdge,
} from "./dayPeriodWindows";
export {
  getInstantAfterTrackMove,
  getInstantAtTrackFraction,
  getLastTrackStepMinutes,
  getReferenceDay,
  getTrackFraction,
  getTrackValueMinutes,
  type ReferenceDay,
  TrackMove,
} from "./dayTrack";
export { isLocationInDeviceTimeZone } from "./deviceTimeZone";
// Implements FR1, FR2, FR6 of show-local-time-and-date-on-location-cards.
export { getLocalDateTime } from "./localDateTime";
export { getLocationMarkKind, LocationMarkKind } from "./locationMark";
export {
  buildLocationId,
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  reduceLocations,
  type WorldClockState,
} from "./locations";
export { moveLocationInList } from "./moveLocation";
export {
  type ParseStoredLocationsResult,
  parseStoredLocations,
} from "./parseStoredLocations";
// Implements FR1-FR4, FR6, FR10 of select-date-with-calendar-and-now.
export {
  getEffectiveInstant,
  getReferenceZone,
  LIVE_REFERENCE_MOMENT,
  ReferenceMode,
  type ReferenceMoment,
} from "./referenceMoment";
export { createStore, type ReduceResult, type Store } from "./store";
export { canonicalizeTimeZoneId } from "./timeZoneId";
// Implements FR2, FR6 of show-utc-offset-on-location-rows.
export { getUtcOffsetMinutes } from "./utcOffset";
export { resolveWallClock, WallClockStatus } from "./wallClock";
