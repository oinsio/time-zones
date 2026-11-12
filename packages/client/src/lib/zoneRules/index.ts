/**
 * The zone rules: the app's own time zone data of one IANA release. App code
 * imports only this index (design D11).
 * Implements FR1–FR6 of add-zone-rules-from-iana.
 */
export * from "./core/index.ts";
export { createZoneRulesDateTimeFormat } from "./dateTimeFormatWrapper.ts";
export {
  getInstalledRelease,
  getKnownZoneIds,
  installZoneRulesDateTimeFormat,
} from "./installZoneRules.ts";
