// Implements FR1, FR5 of add-zone-rules-from-iana (design D10): an engine with stale zone data
// and the zone rules wrapper over it, with fresh copies of the modules that keep the
// `Intl.DateTimeFormat` they first see.
import { vi } from "vitest";
import {
  DEFAULT_STALE_ENGINE,
  installStaleEngine,
  restoreEngine,
  type StaleEngineConfig,
} from "./fakeStaleDateTimeFormat";
import { committedRelease } from "./installZoneRules";

/** The wrapper the test setup installed over the real engine. */
const setupDateTimeFormat = Intl.DateTimeFormat;

/** The modules that keep the `Intl.DateTimeFormat` they first see, imported as they are. */
export const importModules = async () => {
  const [adapters, model, presenter, temporal] = await Promise.all([
    import("@/adapters"),
    import("@/model"),
    import("@/presenter"),
    import("@/lib/temporal"),
  ]);
  return { adapters, model, presenter, temporal };
};

export type FreshModules = Awaited<ReturnType<typeof importModules>>;

/** Fresh copies of the modules, evaluated against the current `Intl.DateTimeFormat`. */
export const importFreshModules = async () => {
  vi.resetModules();
  return importModules();
};

/** The stale-engine fake, the wrapper over it with the committed release, fresh modules and the fake's call log. */
export async function startOnStaleEngine(
  config: StaleEngineConfig = DEFAULT_STALE_ENGINE,
) {
  vi.resetModules();
  const { calls } = installStaleEngine(config);
  const zoneRules = await import("@/lib/zoneRules");
  zoneRules.installZoneRulesDateTimeFormat(committedRelease);
  return { calls, modules: await importModules() };
}

/** Puts back the wrapper of the test setup and forgets the fresh modules. */
export function stopStaleEngine(): void {
  restoreEngine();
  Intl.DateTimeFormat = setupDateTimeFormat;
  vi.resetModules();
}
