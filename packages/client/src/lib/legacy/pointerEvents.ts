/**
 * Whether the engine has Pointer Events (iOS Safari before 13 has none).
 * Read once at module load.
 * Implements FR8, FR9 of support-legacy-ios-12-safari (D8).
 */
export const IS_POINTER_EVENTS_SUPPORTED =
  typeof globalThis.PointerEvent === "function";
