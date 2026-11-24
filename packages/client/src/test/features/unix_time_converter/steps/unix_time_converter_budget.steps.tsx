// Verifies NFR-P2 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup } from "@testing-library/react/pure";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import { createConverterWorld, SAMPLE_NOW } from "./converterWorld";

const feature = await loadFeature("../unix_time_converter_budget.feature");
const LOCATION_COUNT = 20;
const SECONDS_PASSED = 10;
const FIRST_SECOND = Temporal.Instant.from(SAMPLE_NOW);
const LOCATION_ZONES = [
  "Almaty",
  "Moscow",
  "Kolkata",
  "New York",
  "Kyiv",
  "Tokyo",
  "Cairo",
] as const;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createConverterWorld();
  let workCount: WorkCount | undefined;

  f.BeforeEachScenario(() => cleanup());
  f.AfterEachScenario(() => workCount?.stop());

  // @add-unix-time-converter-tool @NFR-P2
  f.Scenario("Ticks build no formatter", ({ Given, When, Then }) => {
    Given(
      "the converter is live with 20 locations and was presented once",
      async () => {
        expect(LOCATION_COUNT).toBe(20);
        await world.openWith(
          Array.from(
            { length: LOCATION_COUNT },
            (_, index) => LOCATION_ZONES[index % LOCATION_ZONES.length],
          ),
        );
        workCount = startWorkCount();
      },
    );
    When("10 seconds pass", () => {
      for (let second = 1; second <= SECONDS_PASSED; second += 1) {
        world.clock.moveTo(FIRST_SECOND.add({ seconds: second }).toString());
        act(() => world.tickScheduler.runPending());
      }
    });
    Then("no Intl formatter was built", () =>
      expect(workCount?.formatters()).toBe(0),
    );
  });
});
