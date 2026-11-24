// Verifies FR7, FR14 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { createConverterWorld } from "./converterWorld";

const feature = await loadFeature("../unix_time_converter_moment_unit.feature");
const MOSCOW_TIME_NAME = /^Время — Moscow,/;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createConverterWorld();

  f.BeforeEachScenario(async () => {
    cleanup();
    world.reset();
    world.clock.moveTo("2026-11-23T11:23:07Z", "Asia/Almaty");
    await i18n.changeLanguage("ru");
  });

  // @add-unix-time-converter-tool @FR14
  f.Scenario("The reference moment is not read", ({ Given, When, Then }) => {
    Given("the reference moment is pinned to {string}", (_ctx, isoDate) =>
      world.pinReferenceDate(isoDate),
    );
    When("the user opens the converter", world.open);
    Then("the converter input shows {string}", (_ctx, text: string) =>
      expect(world.input()).toHaveValue(text),
    );
  });

  // @add-unix-time-converter-tool @FR7
  f.Scenario(
    "A fixed unit converts a text the user did not type",
    ({ Given, When, Then }) => {
      Given(
        "the user set the Moscow row to {string} on the current day, so the converter input shows {string}",
        async (_ctx, time: string, unix: string) => {
          await world.open();
          await userEvent.click(
            screen.getByRole("button", { name: MOSCOW_TIME_NAME }),
          );
          const field = screen.getByRole("textbox", { name: MOSCOW_TIME_NAME });
          await userEvent.clear(field);
          await userEvent.type(field, `${time}{Enter}`);
          expect(world.input()).toHaveValue(unix);
        },
      );
      When("the user chooses the unit {string}", (_ctx, unit: string) =>
        world.chooseUnit(unit),
      );
      Then(
        "the converter input shows {string} and the Moscow row shows {string}",
        (_ctx, text: string, time: string) => {
          expect(world.input()).toHaveValue(text);
          expect(world.timeOf("Moscow")).toBe(time);
        },
      );
    },
  );
});
