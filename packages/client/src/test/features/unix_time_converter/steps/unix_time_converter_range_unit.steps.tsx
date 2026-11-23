// Verifies FR9, FR11, FR16, FR18 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { createConverterWorld, readInputMessage } from "./converterWorld";

const feature = await loadFeature("../unix_time_converter_range_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createConverterWorld();

  f.BeforeEachScenario(async () => {
    cleanup();
    world.clock.moveTo("2026-11-23T11:23:07Z", "Asia/Almaty");
    await i18n.changeLanguage("ru");
  });

  const typeText = async (text: string) => {
    await world.open();
    await world.type(text);
  };
  const expectMessage = (message: string) =>
    expect(readInputMessage(world.input())).toBe(message);

  // @add-unix-time-converter-tool @FR16
  f.Scenario("Range", ({ Given, When, Then }) => {
    Given("the user chose the unit {string}", async (_ctx, unit: string) => {
      await world.open();
      await world.chooseUnit(unit);
    });
    When(
      "the user types {string} into the converter input",
      (_ctx, text: string) => world.type(text),
    );
    Then("no message is shown", () =>
      expect(readInputMessage(world.input())).toBeUndefined(),
    );
    When(
      "the user types the value {string} past the range",
      (_ctx, text: string) => world.type(text),
    );
    Then(
      "the message of a value out of range {string} is shown",
      (_ctx, message: string) => expectMessage(message),
    );
  });

  // @add-unix-time-converter-tool @FR9
  f.Scenario("Empty list", ({ Given, When, Then }) => {
    Given("the location list is empty", () => undefined);
    When("the user opens the converter", () => world.openWith([]));
    Then(
      "exactly one row is shown, for the device time zone, with the time {string}",
      (_ctx, time: string) => {
        expect(screen.getAllByRole("listitem")).toHaveLength(1);
        expect(
          screen.getByRole("button", { name: /^Время — / }).textContent,
        ).toBe(time);
      },
    );
  });

  // @add-unix-time-converter-tool @FR11
  f.Scenario("Another day in one location", ({ Given, When, Then, And }) => {
    Given(
      "the user typed {string} into the converter input",
      (_ctx, text: string) => typeText(text),
    );
    When(
      "the user chooses 24 November 2026 in the calendar of the New York row",
      async () => {
        await userEvent.click(
          screen.getByRole("button", { name: /^Выбрать дату — New York,/ }),
        );
        await userEvent.click(
          await screen.findByRole("button", { name: /24/ }),
        );
      },
    );
    Then(
      "the New York row shows the date {string} and the time {string}",
      (_ctx, date: string, time: string) => {
        expect(
          screen.getByRole("button", { name: /^Выбрать дату — New York,/ })
            .textContent,
        ).toContain(date);
        expect(world.timeOf("New York")).toBe(time);
      },
    );
    And("the converter input shows {string}", (_ctx, text: string) =>
      expect(world.input()).toHaveValue(text),
    );
  });

  // @add-unix-time-converter-tool @FR18
  f.Scenario("English interface", ({ Given, When, Then, And }) => {
    Given("the interface language is English", async () => {
      await i18n.changeLanguage("en");
    });
    When(
      "the user types {string} into the converter input",
      async (_ctx, text: string) => {
        await world.open();
        await world.type(text);
      },
    );
    Then("the message {string} is shown", (_ctx, message: string) =>
      expect(readInputMessage(world.input())).toBe(message),
    );
    And(
      "the unit options are {string}, {string}, {string}, {string}, {string}",
      (_ctx: unknown, ...expected: string[]) =>
        expect(
          within(screen.getByRole("combobox", { name: "Unix time unit" }))
            .getAllByRole("option")
            .map((option) => option.textContent),
        ).toEqual(expected.slice(0, 5)),
    );
  });
});
