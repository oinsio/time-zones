// Verifies NFR-P2 of add-unix-time-converter-tool (ADR-0008): the timing is reported, never asserted.
import i18n from "i18next";
import { bench, describe } from "vitest";
import { fakeClock } from "@/lib/temporal";
import {
  ConverterCommandType,
  createConverterState,
  reduceConverter,
} from "@/model/unixTime";
import { HourFormat, ZoneLabelPart } from "@/preferences";
import { presentConverter } from "@/presenter/unixTime";
import {
  BUDGET_ROW_COUNT,
  buildBudgetLocations,
} from "../features/locations/steps/rowBudgetWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;
const options = {
  warmupIterations: WARMUP_ITERATIONS,
  iterations: SAMPLE_ITERATIONS,
};

const now = fakeClock("2026-11-23T11:23:07Z").instant();
const locations = buildBudgetLocations(BUDGET_ROW_COUNT);
const context = {
  now,
  language: "en" as const,
  hourFormat: HourFormat.H24,
  zoneLabelParts: Object.values(ZoneLabelPart),
  translate: i18n.getFixedT("en"),
  deviceTimeZoneId: "Asia/Almaty",
  homeLocationId: null,
};
const liveState = createConverterState(now);
const tickedState = reduceConverter(liveState, {
  type: ConverterCommandType.TICK,
  nowEpochMilliseconds: now.epochMilliseconds + 1000,
});

describe("the Unix time converter presenting the rows", () => {
  bench(
    "presents the rows the first time",
    () => {
      presentConverter(liveState, locations, context);
    },
    options,
  );
  bench(
    "presents the rows again on a second tick",
    () => {
      presentConverter(tickedState, locations, context);
    },
    options,
  );
});
