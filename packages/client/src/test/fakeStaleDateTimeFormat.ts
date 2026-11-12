// Implements FR1, FR5, FR6 of add-zone-rules-from-iana (design D10).
// A fake native `Intl.DateTimeFormat` of a stale engine: it shows the old data of some zones
// (`Asia/Almaty` as UTC+6) and rejects the zones it does not know (`America/Ciudad_Juarez`,
// `Europe/Kyiv`). It delegates to the real native constructor, never to the wrapper.
import { realNativeDateTimeFormat } from "./installZoneRules";

type DateTimeFormatConstructor = typeof Intl.DateTimeFormat;

export type StaleEngineConfig = {
  /** Zone id the engine knows with the data of another zone, such as `Etc/GMT-6`. */
  staleZones: Readonly<Record<string, string>>;
  /** Zone ids the engine rejects with a `RangeError`. */
  rejectedZones: readonly string[];
};

export type StaleEngineCall = {
  timeZone: string | undefined;
  isRejected: boolean;
};

export const DEFAULT_STALE_ENGINE: StaleEngineConfig = {
  staleZones: { "Asia/Almaty": "Etc/GMT-6" },
  rejectedZones: ["America/Ciudad_Juarez", "Europe/Kyiv"],
};

function indexByLowerCase<Value>(
  entries: Iterable<[string, Value]>,
): Map<string, Value> {
  return new Map(
    [...entries].map(([zoneId, value]) => [zoneId.toLowerCase(), value]),
  );
}

/** The fake constructor and the log of every zone it was asked for. */
export function createStaleDateTimeFormat(
  config: StaleEngineConfig = DEFAULT_STALE_ENGINE,
): {
  staleDateTimeFormat: DateTimeFormatConstructor;
  calls: StaleEngineCall[];
} {
  const calls: StaleEngineCall[] = [];
  const staleZones = indexByLowerCase(Object.entries(config.staleZones));
  const rejectedZones = new Set(
    config.rejectedZones.map((zoneId) => zoneId.toLowerCase()),
  );
  function StaleDateTimeFormat(
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ) {
    const timeZone = options?.timeZone;
    const lowerCaseZone = timeZone?.toLowerCase();
    const isRejected =
      lowerCaseZone !== undefined && rejectedZones.has(lowerCaseZone);
    calls.push({ timeZone, isRejected });
    if (isRejected)
      throw new RangeError(`Invalid time zone specified: ${timeZone}`);
    const substitute =
      lowerCaseZone === undefined ? undefined : staleZones.get(lowerCaseZone);
    return new realNativeDateTimeFormat(
      locales,
      substitute === undefined ? options : { ...options, timeZone: substitute },
    );
  }
  Object.defineProperty(StaleDateTimeFormat, "prototype", {
    value: realNativeDateTimeFormat.prototype,
  });
  const staleDateTimeFormat = Object.assign(StaleDateTimeFormat, {
    supportedLocalesOf: realNativeDateTimeFormat.supportedLocalesOf,
  }) as unknown as DateTimeFormatConstructor;
  return { staleDateTimeFormat, calls };
}

let constructorBeforeInstall: DateTimeFormatConstructor | undefined;

/** Puts the stale engine in place of `Intl.DateTimeFormat`; `restoreEngine` undoes it. */
export function installStaleEngine(
  config: StaleEngineConfig = DEFAULT_STALE_ENGINE,
): {
  staleDateTimeFormat: DateTimeFormatConstructor;
  calls: StaleEngineCall[];
} {
  constructorBeforeInstall ??= Intl.DateTimeFormat;
  const engine = createStaleDateTimeFormat(config);
  Intl.DateTimeFormat = engine.staleDateTimeFormat;
  return engine;
}

/** Puts back the constructor that was in place before the first `installStaleEngine`. */
export function restoreEngine(): void {
  if (constructorBeforeInstall === undefined) return;
  Intl.DateTimeFormat = constructorBeforeInstall;
  constructorBeforeInstall = undefined;
}
