/**
 * Legacy support, loaded only on an engine that lacks a built-in. Importing
 * this module installs, in order: the core-js polyfills, `ResizeObserver`
 * when absent, and the legacy zone shim when the zone data is outdated.
 * Implements FR2, FR4, FR6 of support-legacy-ios-12-safari (D3).
 */
import "virtual:legacy-core-js";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";
import { isZoneDataOutdated } from "./needsLegacySupport";
import { installLegacyZoneShim } from "./zoneShim";

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver =
    ResizeObserverPolyfill as unknown as typeof globalThis.ResizeObserver;
}

if (isZoneDataOutdated()) installLegacyZoneShim();
