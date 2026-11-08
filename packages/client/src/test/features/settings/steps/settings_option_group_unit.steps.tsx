// Verifies FR3, FR6 of compact-settings-controls.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
import { SettingsOptionGroup } from "@/app/settings";
import { createSettingsWorld } from "./settingsWorld";

const feature = await loadFeature("../settings_option_group_unit.feature");
const SAMPLE_CAPTION = "Sample";
const SAMPLE_VALUES = ["A", "B", "C"] as const;
const CHECKED_VALUE = "B";
const PLAIN_VALUE = "Plain";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSettingsWorld();
  const onSelect = vi.fn();

  f.BeforeEachScenario(() => {
    cleanup();
    onSelect.mockClear();
    return world.reset();
  });
  f.AfterAllScenarios(world.finish);

  // @compact-settings-controls @FR6
  f.Scenario("A group with three options", ({ Given, When, Then, And }) => {
    Given(
      "an option group with the caption {string} and the options A, B and C, of which B is checked",
      (_ctx, caption: string) => {
        render(
          <SettingsOptionGroup
            caption={caption}
            options={SAMPLE_VALUES.map((value) => ({ value, label: value }))}
            selectedValue={CHECKED_VALUE}
            onSelect={onSelect}
          />,
        );
      },
    );
    When("the user chooses A", () =>
      userEvent.click(screen.getByRole("radio", { name: "A" })),
    );
    Then("the group reports A", () =>
      expect(onSelect).toHaveBeenCalledExactlyOnceWith("A"),
    );
    And("the options are A, B and C, in this order", () =>
      expect(
        screen
          .getAllByRole("radio")
          .map((radio) => radio.getAttribute("value")),
      ).toEqual([...SAMPLE_VALUES]),
    );
  });

  // @compact-settings-controls @FR6
  f.Scenario(
    "An option without an icon or a pictogram shows its name",
    ({ Given, When, Then }) => {
      Given(
        "an option group with the caption {string} and an option named {string} that has neither an icon nor a pictogram",
        (_ctx, caption: string, label: string) => {
          expect(label).toBe(PLAIN_VALUE);
          render(
            <SettingsOptionGroup
              caption={caption}
              options={[{ value: label, label }]}
              selectedValue={label}
              onSelect={onSelect}
            />,
          );
        },
      );
      When("the group is shown", () =>
        expect(
          screen.getByRole("radiogroup", { name: SAMPLE_CAPTION }),
        ).toBeVisible(),
      );
      Then("the option shows the text {string}", (_ctx, text: string) =>
        expect(screen.getByRole("radio").closest("label")).toHaveTextContent(
          text,
        ),
      );
    },
  );

  // @compact-settings-controls @FR3
  f.Scenario("The stored theme is unchanged", ({ Given, When, Then }) => {
    Given("no preferences are stored", world.givenNoPreferencesStored);
    When(
      "the user chooses the theme Dark and the preferences are written",
      async () => {
        const opened = world.openPage();
        await world.chooseTheme("Dark", opened.container);
        await world.runPendingWrite(opened);
      },
    );
    Then(
      "the stored preferences hold the theme {string} and the hour format {string}",
      (_ctx, theme: string, hourFormat: string) => {
        const stored = JSON.parse(world.storedDocument() ?? "{}");
        expect(stored.payload).toMatchObject({ theme, hourFormat });
      },
    );
  });
});
