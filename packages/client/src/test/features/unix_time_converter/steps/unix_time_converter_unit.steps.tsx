// Verifies FR9, FR10, FR12, FR13, FR14, FR16 of add-unix-time-converter-tool.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { CopyOutcome } from "@/ports";
import { createConverterWorld, readInputMessage } from "./converterWorld";

const feature = await loadFeature("../unix_time_converter_unit.feature");
const NEXT_SECOND = "2026-11-23T11:23:08Z";
const NOW_BUTTON_NAME = "Сейчас";
const RELATIVE_LABEL = "Относительно текущего времени";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createConverterWorld();

  f.BeforeEachScenario(async () => {
    cleanup();
    world.clock.moveTo("2026-11-23T11:23:07Z", "Asia/Almaty");
    await i18n.changeLanguage("ru");
  });

  const notationText = (label: string) =>
    within(screen.getByRole("region", { name: "Форматы" })).getByText(label, {
      selector: "dt",
    }).nextElementSibling?.textContent ?? "";
  const typeText = async (text: string) => {
    await world.open();
    await world.type(text);
  };
  const expectMessage = (message: string) =>
    expect(readInputMessage(world.input())).toBe(message);
  const copyButton = (label: string) =>
    screen.getByRole("button", { name: `Копировать: ${label}` });
  const nowButton = () => screen.getByRole("button", { name: NOW_BUTTON_NAME });

  // @add-unix-time-converter-tool @FR9
  f.Scenario("Rows of the sample", ({ When, And, Then }) => {
    When("the user opens the converter", world.open);
    And(
      "the user types {string} into the converter input",
      (_ctx, text: string) => world.type(text),
    );
    Then(
      "the rows are, in order:",
      (_ctx, rows: { city: string; time: string }[]) => {
        expect(rows.map(({ city }) => world.timeOf(city))).toEqual(
          rows.map(({ time }) => time),
        );
      },
    );
  });

  // @add-unix-time-converter-tool @FR10
  f.ScenarioOutline(
    "A time typed in a row",
    ({ Given, When, Then }, variables) => {
      Given(
        "the user typed {string} into the converter input",
        (_ctx, text: string) => typeText(text),
      );
      When(
        'the user types "<text>" into the time of the New York row and confirms',
        async () => {
          await userEvent.click(
            screen.getByRole("button", { name: /^Время — New York,/ }),
          );
          const field = screen.getByRole("textbox", {
            name: /^Время — New York,/,
          });
          await userEvent.clear(field);
          await userEvent.type(field, `${variables.text}{Enter}`);
        },
      );
      Then(
        'the converter input shows "<unix>" and the Moscow row shows "<moscow>"',
        () => {
          expect(world.input()).toHaveValue(variables.unix);
          expect(world.timeOf("Moscow")).toBe(variables.moscow);
        },
      );
    },
  );

  // @add-unix-time-converter-tool @FR12
  f.Scenario("Notations of the sample", ({ When, Then }) => {
    When(
      "the user types {string} into the converter input",
      (_ctx, text: string) => typeText(text),
    );
    Then(
      "the notations are:",
      (_ctx, rows: { notation: string; text: string }[]) => {
        expect(rows.map(({ notation }) => notationText(notation))).toEqual(
          rows.map(({ text }) => text),
        );
      },
    );
  });

  // @add-unix-time-converter-tool @FR12
  f.Scenario("Dropping digits towards the past", ({ When, And, Then }) => {
    When(
      "the user types {string} into the converter input",
      (_ctx, text: string) => typeText(text),
    );
    And("the user chooses the unit {string}", (_ctx, unit: string) =>
      world.chooseUnit(unit),
    );
    Then(
      "the seconds notation is {string} and the ISO 8601 notation is {string}",
      (_ctx, seconds: string, iso: string) => {
        expect(notationText("Секунды")).toBe(seconds);
        expect(notationText("ISO 8601")).toBe(iso);
      },
    );
  });

  // @add-unix-time-converter-tool @FR12
  f.Scenario("Copy", ({ Given, When, Then, And }) => {
    Given(
      "the user typed {string} into the converter input",
      (_ctx, text: string) => typeText(text),
    );
    When(
      "the user chooses the copy action of {string}",
      (_ctx, label: string) => userEvent.click(copyButton(label)),
    );
    Then(
      "the clipboard holds {string} and {string} is announced",
      async (_ctx, text: string, announcement: string) => {
        expect(world.textCopying.copiedTexts).toEqual([text]);
        expect(await screen.findByText(announcement)).toBeInTheDocument();
      },
    );
    When("the browser refuses a copy", () => {
      world.textCopying.copyText = async () => CopyOutcome.FAILED;
    });
    And(
      "the user tries the copy action of {string} again",
      (_ctx, label: string) => userEvent.click(copyButton(label)),
    );
    Then(
      "{string} is shown beside the action",
      async (_ctx, failure: string) => {
        expect(await screen.findByText(failure)).toBeInTheDocument();
        expect(screen.queryByRole("dialog")).toBeNull();
      },
    );
  });

  // @add-unix-time-converter-tool @FR13
  f.ScenarioOutline("Past and future", ({ When, Then }, variables) => {
    When('the user types "<text>" into the converter input', () =>
      typeText(variables.text),
    );
    Then('the relative time is "<russian>"', () =>
      expect(screen.getByLabelText(RELATIVE_LABEL)).toHaveTextContent(
        variables.russian,
      ),
    );
  });

  // @add-unix-time-converter-tool @FR14
  f.Scenario("Ticking", ({ When, And, Then }) => {
    When("the user opens the converter", world.open);
    And("one second passes", () => {
      world.clock.moveTo(NEXT_SECOND);
      act(() => world.tickScheduler.runPending());
    });
    Then(
      "the converter input shows {string} and the Moscow row shows {string}",
      (_ctx, text: string, time: string) => {
        expect(world.input()).toHaveValue(text);
        expect(world.timeOf("Moscow")).toBe(time);
      },
    );
  });

  // @add-unix-time-converter-tool @FR14
  f.Scenario("Pinned, then live again", ({ When, And, Then }) => {
    When("the user opens the converter", world.open);
    And(
      "the user types {string} into the converter input",
      (_ctx, text: string) => world.type(text),
    );
    And("one second passes", () => {
      world.clock.moveTo(NEXT_SECOND);
      act(() => world.tickScheduler.runPending());
    });
    Then(
      "the converter input shows {string} and {string} is active",
      (_ctx, text: string, name: string) => {
        expect(world.input()).toHaveValue(text);
        expect(name).toBe(NOW_BUTTON_NAME);
        expect(nowButton()).toBeEnabled();
      },
    );
    When("the user chooses {string}", () => userEvent.click(nowButton()));
    Then(
      "the converter input shows {string} and {string} is inactive",
      (_ctx, text: string, name: string) => {
        expect(world.input()).toHaveValue(text);
        expect(name).toBe(NOW_BUTTON_NAME);
        expect(nowButton()).toBeDisabled();
      },
    );
  });

  // @add-unix-time-converter-tool @FR14
  f.Scenario("Live in a fixed unit", ({ When, And, Then }) => {
    When("the user opens the converter", world.open);
    And("the user chooses the unit {string}", (_ctx, unit: string) =>
      world.chooseUnit(unit),
    );
    Then(
      "the converter input shows {string} and {string} is inactive",
      (_ctx, text: string) => {
        expect(world.input()).toHaveValue(text);
        expect(nowButton()).toBeDisabled();
      },
    );
  });

  // @add-unix-time-converter-tool @FR15
  f.ScenarioOutline(
    "Unreadable texts",
    ({ Given, When, Then, And }, variables) => {
      Given(
        "the user typed {string} into the converter input",
        (_ctx, text: string) => typeText(text),
      );
      When('the user types "<text>" into the converter input', () =>
        world.type(variables.text),
      );
      Then("the message {string} is shown", (_ctx, message: string) =>
        expectMessage(message),
      );
      And("the Moscow row shows {string}", (_ctx, time: string) =>
        expect(world.timeOf("Moscow")).toBe(time),
      );
    },
  );

  // @add-unix-time-converter-tool @FR15
  f.Scenario("A fraction under a fixed unit", ({ Given, When, Then }) => {
    Given("the user chose the unit {string}", async (_ctx, unit: string) => {
      await world.open();
      await world.chooseUnit(unit);
    });
    When(
      "the user types {string} into the converter input",
      (_ctx, text: string) => world.type(text),
    );
    Then("the message {string} is shown", (_ctx, message: string) =>
      expectMessage(message),
    );
  });
});
