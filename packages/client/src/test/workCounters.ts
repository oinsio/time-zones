// Implements FR1–FR4 of replace-wall-clock-row-budgets-with-deterministic-checks (D2).
// Counts the work our code asks for, so budgets fail on extra work, never on a slow runner.
import { type MockInstance, vi } from "vitest";
import { Temporal } from "@/lib/temporal";

/** Work bounds of the budget scenarios (D4). Test thresholds, not product constants. */
export const MAX_FORMATTERS_PER_ZONE = 3;
export const MAX_TRANSITION_LOOKUPS_PER_ZONE = 2;
export const MAX_COLLATORS_PER_QUERY = 1;
export const NORMALIZATIONS_PER_QUERY = 1;

export type WorkCount = {
  formatters(): number;
  formattersByZone(): ReadonlyMap<string, number>;
  displayNames(): number;
  collators(): number;
  transitionLookups(): number;
  normalizations(): number;
  stop(): void;
};

const TEMPORAL_FORMATTING_CLASSES = [
  Temporal.ZonedDateTime,
  Temporal.Instant,
  Temporal.PlainDate,
  Temporal.PlainTime,
  Temporal.PlainDateTime,
];

type CountedConstructor = "DateTimeFormat" | "DisplayNames" | "Collator";

export function startWorkCount(): WorkCount {
  const buildsByConstructor: Record<CountedConstructor, number> = {
    DateTimeFormat: 0,
    DisplayNames: 0,
    Collator: 0,
  };
  const formattersByZone = new Map<string, number>();
  let temporalFormatCalls = 0;
  const restores: Array<() => void> = [];

  const countConstructor = (name: CountedConstructor) => {
    const original = Intl[name];
    const counted = new Proxy(original, {
      construct(target, args, newTarget) {
        buildsByConstructor[name] += 1;
        const timeZone = args[1]?.timeZone;
        if (name === "DateTimeFormat" && timeZone !== undefined) {
          formattersByZone.set(
            timeZone,
            (formattersByZone.get(timeZone) ?? 0) + 1,
          );
        }
        return Reflect.construct(target, args, newTarget);
      },
    });
    Object.defineProperty(Intl, name, {
      value: counted,
      configurable: true,
      writable: true,
    });
    restores.push(() =>
      Object.defineProperty(Intl, name, {
        value: original,
        configurable: true,
        writable: true,
      }),
    );
  };
  countConstructor("DateTimeFormat");
  countConstructor("DisplayNames");
  countConstructor("Collator");

  let transitionLookups = 0;
  let normalizations = 0;
  const spies: MockInstance[] = [];
  for (const temporalClass of TEMPORAL_FORMATTING_CLASSES) {
    const prototype = temporalClass.prototype as {
      toLocaleString: (...args: never[]) => string;
    };
    const original = prototype.toLocaleString;
    spies.push(
      vi.spyOn(prototype, "toLocaleString").mockImplementation(function (
        this: unknown,
        ...args
      ) {
        temporalFormatCalls += 1;
        return original.apply(this, args);
      }),
    );
  }

  const originalGetTimeZoneTransition =
    Temporal.ZonedDateTime.prototype.getTimeZoneTransition;
  spies.push(
    vi
      .spyOn(Temporal.ZonedDateTime.prototype, "getTimeZoneTransition")
      .mockImplementation(function (this: Temporal.ZonedDateTime, ...args) {
        transitionLookups += 1;
        return originalGetTimeZoneTransition.apply(this, args);
      }),
  );
  const originalNormalize = String.prototype.normalize;
  spies.push(
    vi.spyOn(String.prototype, "normalize").mockImplementation(function (
      this: string,
      ...args
    ) {
      normalizations += 1;
      return originalNormalize.apply(this, args);
    }),
  );

  return {
    formatters: () => buildsByConstructor.DateTimeFormat + temporalFormatCalls,
    formattersByZone: () => formattersByZone,
    displayNames: () => buildsByConstructor.DisplayNames,
    collators: () => buildsByConstructor.Collator,
    transitionLookups: () => transitionLookups,
    normalizations: () => normalizations,
    stop() {
      for (const restore of restores) restore();
      for (const spy of spies) spy.mockRestore();
    },
  };
}
