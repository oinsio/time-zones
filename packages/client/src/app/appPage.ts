/**
 * The pages of the application shell. The settings page and a tool page are
 * shell state, not a URL and not a view (D10 of add-settings-page-and-device-time-location;
 * D2 of add-unix-time-converter-tool).
 * Implements FR3 of add-settings-page-and-device-time-location.
 * Implements FR5 of add-unix-time-converter-tool.
 */
export enum AppPage {
  MAIN = "MAIN",
  SETTINGS = "SETTINGS",
  TOOL = "TOOL",
}
