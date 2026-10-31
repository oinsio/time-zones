import type { TFunction } from "i18next";

const DEVICE_TIME_OPTION_KEY = "search.deviceTimeOption";

/**
 * The texts of the Device time option in English and in Russian, matched
 * against the typed query in either language.
 * Implements FR11 of add-settings-page-and-device-time-location (D12).
 */
export function presentDeviceTimeOptionLabels(translators: {
  english: TFunction;
  russian: TFunction;
}): string[] {
  return [
    translators.english(DEVICE_TIME_OPTION_KEY),
    translators.russian(DEVICE_TIME_OPTION_KEY),
  ];
}
