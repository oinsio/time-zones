/**
 * Legacy support, loaded only on an engine that lacks a built-in. Importing
 * this module installs, in order: the core-js polyfills and `ResizeObserver`
 * when absent.
 * Implements FR2, FR6 of support-legacy-ios-12-safari (D3).
 */
import "virtual:legacy-core-js";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver =
    ResizeObserverPolyfill as unknown as typeof globalThis.ResizeObserver;
}
