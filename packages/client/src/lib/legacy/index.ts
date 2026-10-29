export { bootApp } from "./bootApp";
export { needsLegacySupport } from "./needsLegacySupport";
export { IS_POINTER_EVENTS_SUPPORTED } from "./pointerEvents";
export type { LegacyZoneNames } from "./zoneShim";

/** Loads the polyfills in their own chunk. */
export const loadLegacySupport = () => import("./installLegacySupport");
