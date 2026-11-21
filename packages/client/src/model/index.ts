// Public API of the model layer (ADR-0002).
// Implements FR8, FR9, FR10 of add-locations-via-search and FR2 of
// reorder-locations-by-drag-and-drop.
// Implements FR1-FR4 of mark-device-time-zone-in-location-list.
// Implements FR1, FR4 of match-here-mark-to-design.
// Implements FR1-FR5, FR7, FR10 of set-home-location-and-show-differences.

export {
  CalendarMove,
  getCalendarFocusTarget,
  getCalendarWeeks,
} from "./calendar";
export {
  type ClockChange,
  ClockChangeDirection,
  ClockChangeTense,
  findNearestClockChange,
  getClockChanges,
  type NearestClockChange,
} from "./clockChange";
// Implements FR5, FR6, FR7 of add-city-coordinates-to-locations.
export {
  type Coordinates,
  getCoordinatesKey,
  parseCoordinates,
} from "./coordinates";
// Implements FR1-FR6 of add-time-sliders-to-location-cards.
// Implements FR1, FR2, FR5, FR9 of bind-day-periods-to-sun.
export { getDayPeriodBoundaries } from "./dayPeriodBoundaries";
export {
  assembleDayPeriodStops,
  type DayPeriodStop,
  getDayPeriodStops,
} from "./dayPeriodStops";
export {
  DayPeriod,
  type DayPeriodBoundary,
  getDayPeriodAt,
} from "./dayPeriods";
export { type BlendWindow, collectBlendWindows } from "./dayPeriodWindows";
// Implements FR1-FR12 of add-grid-meeting-range-and-share.
export { DayShift, getDayShift } from "./dayShift";
export {
  type ClockChangeWindow,
  getInstantAfterTrackMove,
  getInstantAtTrackFraction,
  getReferenceDay,
  getTrackEndMinutes,
  getTrackFraction,
  getTrackValueMinutes,
  type ReferenceDay,
  TrackMove,
} from "./dayTrack";
// Implements FR8, FR9, FR12 of add-settings-page-and-device-time-location.
export {
  buildDeviceTimeLocation,
  buildFirstLaunchLocations,
  isDeviceTimeLocation,
  withDeviceTimeZone,
} from "./deviceTimeLocation";
export { isLocationInDeviceTimeZone } from "./deviceTimeZone";
// Implements FR1, FR2, FR5, FR6, FR8 of add-grid-hour-cells-and-hour-frame.
export { getLargestSharePeriod } from "./hourCellPeriod";
export {
  getHourCellCount,
  getHourCellStart,
  getHourCells,
  getHourFrameIndex,
  type HourCell,
} from "./hourCells";
// Implements FR1, FR2, FR6 of show-local-time-and-date-on-location-cards.
export { getLocalDateTime } from "./localDateTime";
export { LocationKind } from "./locationKind";
export { getLocationMarkKind, LocationMarkKind } from "./locationMark";
export {
  getLocationMeetingRange,
  type LocationMeetingRange,
} from "./locationMeetingRange";
export {
  buildLocationId,
  canonicalizeLocationId,
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  reduceLocations,
  type WorldClockState,
} from "./locations";
// Implements FR3, FR10 of add-meeting-share-dialog.
export {
  getMeetingInvitation,
  type InvitedLocation,
  type MeetingInvitation,
} from "./meetingInvitation";
export {
  getMeetingHandleLimits,
  getMeetingRangeAfterHandleMove,
  getMeetingRangeAtHandleMinutes,
  getMeetingRangeOfCells,
  getMeetingSpan,
  isValidMeetingRange,
  MeetingHandle,
  type MeetingHandleLimits,
  type MeetingRange,
  type MeetingSpan,
  moveMeetingRangeToDay,
} from "./meetingRange";
export { moveLocationInList } from "./moveLocation";
export {
  getOffsetDifferenceMinutes,
  getReferenceOffsetMinutes,
} from "./offsetDifference";
export {
  type ParseStoredLocationsResult,
  parseStoredLocations,
} from "./parseStoredLocations";
export { withoutMeetingRange } from "./reduceMeetingRange";
// Implements FR1-FR4, FR6, FR10 of select-date-with-calendar-and-now.
export {
  getEffectiveInstant,
  getReferenceZone,
  LIVE_REFERENCE_MOMENT,
  ReferenceMode,
  type ReferenceMoment,
  type WallTimeTarget,
  WallTimeTargetKind,
} from "./referenceMoment";
export {
  getRowNote,
  type RowNote,
  RowNoteKind,
  type RowWallClockNote,
} from "./rowNote";
export { createStore, type ReduceResult, type Store } from "./store";
// Implements FR1-FR4 of bind-day-periods-to-sun.
export {
  getSolarDay,
  getSunElevation,
  type SolarDay,
  type SunThreshold,
  SunThresholdState,
} from "./sun";
export { getSunCoordinates, getZoneCoordinates } from "./sunCoordinates";
export { loadSunSupport } from "./sunRegistry";
export { canonicalizeTimeZoneId } from "./timeZoneId";
// Implements FR2, FR6 of show-utc-offset-on-location-rows.
export { getUtcOffsetMinutes } from "./utcOffset";
export {
  isCanonicalWallTime,
  resolveWallClock,
  WallClockStatus,
} from "./wallClock";
// Implements FR7, FR9 of add-wall-time-input-with-hint.
export {
  getWallClockNote,
  type WallClockNote,
  WallClockNotePlacement,
} from "./wallClockNote";
// Implements FR9 of apply-data-updates-silently.
export { getWatchedZoneIds } from "./watchedZones";
// Implements FR7 of add-meeting-share-dialog.
export { getWeekday, Weekday } from "./weekday";
// Implements FR8, FR10, FR11 of add-day-colouring-setting.
export {
  getHourCellWorkingFlags,
  getWorkingTimeSpans,
  getWorkingTimeStops,
  isWorkingDay,
  isWorkingTime,
  type WorkingTimeSpan,
  type WorkingTimeStop,
} from "./workingTime";
// Implements FR1, FR2 of show-zone-abbreviations-and-zone-label-setting.
export { getZoneAbbreviation, getZoneAbbreviations } from "./zoneAbbreviation";
