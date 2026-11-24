// Verifies FR9, FR10, FR11, M4 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { HourFormat } from "@/preferences";
import { createConverterWorld } from "./converterWorld";

const feature = await loadFeature("../unix_time_converter_rows_unit.feature");
const NEW_YORK_TIME_NAME = /^Время — New York,/;
const GAP_HINT_PATTERN = /не существует в этот день/;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createConverterWorld();

  f.BeforeEachScenario(async () => {
    cleanup();
    world.reset();
    world.clock.moveTo("2026-11-23T11:23:07Z", "Asia/Almaty");
    await i18n.changeLanguage("ru");
  });

  const typeText = async (text: string) => {
    await world.open();
    await world.type(text);
  };
  const confirmInNewYork = async (text: string) => {
    await userEvent.click(
      screen.getByRole("button", { name: NEW_YORK_TIME_NAME }),
    );
    const field = screen.getByRole("textbox", { name: NEW_YORK_TIME_NAME });
    await userEvent.clear(field);
    await userEvent.type(field, `${text}{Enter}`);
  };
  const notationText = (label: string) =>
    within(screen.getByRole("region", { name: "Форматы" })).getByText(label, {
      selector: "dt",
    }).nextElementSibling?.textContent ?? "";
  const newYorkRow = () =>
    screen
      .getByText("New York", { selector: "*" })
      .closest("li") as HTMLElement;
  const typedInput = (_ctx: unknown, text: string) => typeText(text);
  const confirmedInNewYork = (_ctx: unknown, text: string) =>
    confirmInNewYork(text);

  // @add-unix-time-converter-tool @FR9
  f.Scenario("12-hour format", ({ Given, When, And, Then }) => {
    Given("the hour format is 12-hour", () =>
      world.setHourFormat(HourFormat.H12),
    );
    When("the user opens the converter", world.open);
    And("the user types {string} into the converter input", (_ctx, text) =>
      world.type(text),
    );
    Then("the Moscow row shows the time {string}", (_ctx, time: string) =>
      expect(world.timeOf("Moscow")).toBe(time),
    );
  });

  // @add-unix-time-converter-tool @FR9
  f.Scenario("The zone line follows the moment", ({ When, And, Then }) => {
    When("the user opens the converter", world.open);
    And("the user types {string} into the converter input", (_ctx, text) =>
      world.type(text),
    );
    Then(
      "the zone line of the New York row names {string} and {string}",
      (_ctx, abbreviation: string, offset: string) => {
        const rowText = newYorkRow().textContent ?? "";
        expect(rowText).toContain(abbreviation);
        expect(rowText).toContain(offset);
      },
    );
  });

  // @add-unix-time-converter-tool @FR10
  f.Scenario("A time in a DST gap", ({ Given, When, Then }) => {
    Given("the user typed {string} into the converter input", typedInput);
    When(
      "the user types {string} into the time of the New York row and confirms",
      (_ctx, text: string) => confirmInNewYork(text),
    );
    Then(
      "the New York row shows the time {string} and the wall-time hint for a DST gap",
      (_ctx, time: string) => {
        expect(world.timeOf("New York")).toBe(time);
        expect(
          within(newYorkRow()).getByText(GAP_HINT_PATTERN),
        ).toBeInTheDocument();
      },
    );
  });

  // @add-unix-time-converter-tool @FR10 @M4
  f.Scenario("Round trip to the nanosecond", ({ Given, And, When, Then }) => {
    Given("the user typed {string} into the converter input", typedInput);
    And("the user confirmed {string} in the New York row", confirmedInNewYork);
    When(
      "the user types the nanoseconds notation into the converter input",
      () => world.type(notationText("Наносекунды")),
    );
    Then("the New York row shows the time {string}", (_ctx, time: string) =>
      expect(world.timeOf("New York")).toBe(time),
    );
  });

  // @add-unix-time-converter-tool @FR11
  f.Scenario(
    "A row change rewrites the input",
    ({ Given, When, Then, And }) => {
      Given("the user typed {string} into the converter input", typedInput);
      When(
        "the user confirms {string} in the New York row",
        confirmedInNewYork,
      );
      Then(
        "the converter input shows {string}, not an ISO 8601 text",
        (_ctx, text: string) => expect(world.input()).toHaveValue(text),
      );
      And("the seconds notation is {string}", (_ctx, text: string) =>
        expect(notationText("Секунды")).toBe(text),
      );
    },
  );
});
