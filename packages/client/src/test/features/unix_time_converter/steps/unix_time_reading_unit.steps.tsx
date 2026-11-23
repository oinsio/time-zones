// Verifies FR6, FR7, FR8, FR15, NFR-P3 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { createConverterWorld } from "./converterWorld";

const feature = await loadFeature("../unix_time_reading_unit.feature");
const ISO_LABEL = "ISO 8601";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createConverterWorld();

  f.BeforeEachScenario(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });
  f.AfterEachScenario(() => {
    vi.unstubAllGlobals();
  });

  const notationText = (label: string) => {
    const notations = screen.getByRole("region", { name: "Форматы" });
    const term = within(notations).getByText(label, { selector: "dt" });
    return term.nextElementSibling?.textContent ?? "";
  };
  const expectIso = (iso: string) =>
    expect(notationText(ISO_LABEL)).toContain(iso);

  // @add-unix-time-converter-tool @FR6
  f.Scenario("The page opens live", ({ When, Then, And }) => {
    When("the user opens the converter", world.open);
    Then(
      "the converter input shows {string} and the unit in force is {string}",
      (_ctx, text: string, unit: string) => {
        expect(world.input()).toHaveValue(text);
        expect(screen.getByText(`Единица: ${unit}`)).toBeInTheDocument();
      },
    );
    And("the Moscow row shows {string}", (_ctx, time: string) =>
      expect(world.timeOf("Moscow")).toBe(time),
    );
  });

  // @add-unix-time-converter-tool @FR7
  f.ScenarioOutline(
    "Texts the input reads",
    ({ When, Then, And }, variables) => {
      When('the user types "<text>" into the converter input', async () => {
        await world.open();
        await world.type(variables.text);
      });
      Then('the ISO 8601 notation is "<iso>"', () => expectIso(variables.iso));
      And('the converter input still shows "<text>"', () =>
        expect(world.input()).toHaveValue(variables.text),
      );
    },
  );

  // @add-unix-time-converter-tool @FR7
  f.Scenario(
    "A paste replaces a text the user did not type",
    ({ Given, When, Then }) => {
      Given("the converter is live", world.open);
      When(
        "the user pastes {string} into the converter input",
        async (_ctx, text: string) => {
          await userEvent.click(world.input());
          await userEvent.paste(text);
        },
      );
      Then(
        "the converter input shows {string} and the moment is pinned",
        (_ctx, text: string) => {
          expect(world.input()).toHaveValue(text);
          expect(screen.getByRole("button", { name: "Сейчас" })).toBeEnabled();
        },
      );
    },
  );

  // @add-unix-time-converter-tool @FR8
  f.ScenarioOutline("Detection by digit count", ({ When, Then }, variables) => {
    When('the user types "<text>" into the converter input', async () => {
      await world.open();
      await world.type(variables.text);
    });
    Then(
      'the unit in force is "<unit>" and the ISO 8601 notation is "<iso>"',
      () => {
        expect(
          screen.getByText(`Единица: ${variables.unit}`),
        ).toBeInTheDocument();
        expectIso(variables.iso);
      },
    );
  });

  // @add-unix-time-converter-tool @FR8
  f.Scenario(
    "A fixed unit reads a typed number again",
    ({ Given, When, Then }) => {
      Given("the user typed {string}", async (_ctx, text: string) => {
        await world.open();
        await world.type(text);
      });
      When("the user chooses the unit {string}", (_ctx, unit: string) =>
        world.chooseUnit(unit),
      );
      Then(
        "the ISO 8601 notation is {string} and the converter input still shows {string}",
        (_ctx, iso: string, text: string) => {
          expectIso(iso);
          expect(world.input()).toHaveValue(text);
        },
      );
      When("the user returns to the unit {string}", (_ctx, unit: string) =>
        world.chooseUnit(unit),
      );
      Then("the ISO 8601 notation is {string}", (_ctx, iso: string) =>
        expectIso(iso),
      );
    },
  );

  // @add-unix-time-converter-tool @FR8
  f.Scenario(
    "The unit choice does not touch an ISO 8601 text",
    ({ Given, When, Then }) => {
      Given("the user typed {string}", async (_ctx, text: string) => {
        await world.open();
        await world.type(text);
      });
      When("the user chooses the unit {string}", (_ctx, unit: string) =>
        world.chooseUnit(unit),
      );
      Then(
        "the converter input still shows {string} and the Moscow row shows {string}",
        (_ctx, text: string, time: string) => {
          expect(world.input()).toHaveValue(text);
          expect(world.timeOf("Moscow")).toBe(time);
        },
      );
    },
  );

  // @add-unix-time-converter-tool @FR8 @FR15
  f.ScenarioOutline(
    "Fraction digits follow the precision",
    ({ When, Then }, variables) => {
      When('the user types "<text>" into the converter input', async () => {
        await world.open();
        await world.type(variables.text);
      });
      Then('the Moscow row shows "<time>"', () =>
        expect(world.timeOf("Moscow")).toBe(variables.time),
      );
    },
  );

  // @add-unix-time-converter-tool @FR8
  f.Scenario("Before 1970", ({ When, And, Then }) => {
    When(
      "the user types {string} into the converter input",
      async (_ctx, text: string) => {
        await world.open();
        await world.type(text);
      },
    );
    And("the user chooses the unit {string}", (_ctx, unit: string) =>
      world.chooseUnit(unit),
    );
    Then("the ISO 8601 notation is {string}", (_ctx, iso: string) =>
      expectIso(iso),
    );
  });

  // @add-unix-time-converter-tool @FR15 @NFR-P3
  f.Scenario("The same digits without BigInt", ({ Given, When, Then, And }) => {
    Given("the engine has no BigInt", () => {
      vi.stubGlobal("BigInt", undefined);
    });
    When(
      "the user types {string} into the converter input",
      async (_ctx, text: string) => {
        await world.open();
        await world.type(text);
      },
    );
    Then("the Moscow row shows {string}", (_ctx, time: string) =>
      expect(world.timeOf("Moscow")).toBe(time),
    );
    And(
      "the notation {string} is {string}",
      (_ctx, label: string, text: string) =>
        expect(notationText(label)).toBe(text),
    );
  });
});
