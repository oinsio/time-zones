/**
 * Kinds of a location in the list: a city picked by search, or the device time.
 * Implements FR8 of add-settings-page-and-device-time-location (D1).
 */
export enum LocationKind {
  CITY = "CITY",
  DEVICE_TIME = "DEVICE_TIME",
}
