import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createElement } from "react";
import { expect } from "vitest";
import ru from "@/locales/ru.json";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { LocationList } from "@/views/shared";
import { idOf, splitLabels } from "./locationsReorderUnitWorld";

const feature = await loadFeature("../locations_reorder_menu_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  f.BeforeEachScenario(async () => {
    cleanup();
    await i18n.changeLanguage("en");
    vi.restoreAllMocks();
  });
  f.AfterAllScenarios(() => cleanup());

  /** A minimal day track: a row has one when its zone is known, which is what offers "Make home". */
  const KNOWN_ZONE_TRACK = {
    fraction: 0.5,
    valueMinutes: 720,
    maxMinutes: 1439,
    valueText: "12:00",
    stops: [],
    hourLabels: [],
  };
  const menuRows = (labels: string) =>
    splitLabels(labels).map((label) => ({
      id: idOf(label),
      cityLabel: label,
      countryName: "",
      utcOffsetLabel: "",
      zoneAbbreviationLabel: "",
      zoneLineParts: [],
      offsetDifferenceLabel: "",
      offsetDifferenceAccessibleLabel: "",
      localTimeLabel: "",
      localTimeParts: { digits: "", dayPeriodMarker: "" },
      localDateLabel: "",
      localIsoDate: "",
      wallTimeInputLabel: "",
      dayTrack: KNOWN_ZONE_TRACK,
    }));
  const onMoveSpy = vi.fn();
  const showList = (_ctx: unknown, labels: string) => {
    onMoveSpy.mockClear();
    render(
      createElement(LocationList, {
        rows: menuRows(labels),
        onRemove: vi.fn(),
        onSetHome: vi.fn(),
        onMove: onMoveSpy,
        onSelectTrackFraction: vi.fn(),
        onMoveTrack: vi.fn(),
        onConfirmWallTime: ignoreWallTime,
      }),
    );
  };
  const menuButtonOf = (label: string) =>
    screen.getByRole("button", {
      name: i18n.t("locations.locationMenu", { city: label }),
    });
  const openMenuOf = async (label: string) => {
    await userEvent.click(menuButtonOf(label));
  };
  const itemOf = (name: string) => screen.getByRole("menuitem", { name });
  const expectDisabledState = async (
    label: string,
    disabledName: string,
    enabledName: string,
  ) => {
    await openMenuOf(label);
    expect(itemOf(disabledName)).toHaveAttribute("aria-disabled", "true");
    expect(itemOf(enabledName)).not.toHaveAttribute("aria-disabled");
    await userEvent.keyboard("{Escape}");
  };

  // @reorder-locations-by-drag-and-drop @FR8
  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Russian interface", ({ Given, When, Then }) => {
    Given("the interface language is Russian", async () => {
      await i18n.changeLanguage("ru");
    });
    When("the list {string} is shown", showList);
    Then(
      "the menu of {string} offers the Russian move actions {string} and {string}",
      async (_ctx, label: string, moveUp: string, moveDown: string) => {
        await openMenuOf(label);
        expect(ru.locations.moveUp).toBe(moveUp);
        expect(ru.locations.moveDown).toBe(moveDown);
        expect(itemOf(moveUp)).toBeInTheDocument();
        expect(itemOf(moveDown)).toBeInTheDocument();
      },
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Move up from the menu", ({ Given, When, Then, And }) => {
    Given("the list {string} is shown", showList);
    When(
      "the user chooses {string} in the menu of {string}",
      async (_ctx, itemName: string, label: string) => {
        await openMenuOf(label);
        await userEvent.click(itemOf(itemName));
      },
    );
    Then(
      "the list was asked to move {string} to position {int}",
      (_ctx, label: string, position: number) =>
        expect(onMoveSpy).toHaveBeenCalledWith(idOf(label), position - 1),
    );
    And(
      "the focus stays on the menu button of {string}",
      (_ctx, label: string) => {
        expect(menuButtonOf(label)).toBeInTheDocument();
      },
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Move down with the keyboard only", ({ Given, When, Then }) => {
    Given("the list {string} is shown", showList);
    When(
      "the user opens the menu of {string} with the keyboard and chooses {string} with the arrow keys and Enter",
      async (_ctx, label: string) => {
        menuButtonOf(label).focus();
        await userEvent.keyboard("{Enter}{ArrowDown}{Enter}");
      },
    );
    Then(
      "the list was asked to move {string} to position {int}",
      (_ctx, label: string, position: number) =>
        expect(onMoveSpy).toHaveBeenCalledWith(idOf(label), position - 1),
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Items that cannot apply are disabled", ({ Given, Then, And }) => {
    Given("the list {string} is shown", showList);
    Then(
      "in the menu of {string} {string} is disabled and {string} is enabled",
      (_ctx, label: string, disabledName: string, enabledName: string) =>
        expectDisabledState(label, disabledName, enabledName),
    );
    And(
      "in the menu of {string} {string} is disabled and {string} is enabled",
      (_ctx, label: string, disabledName: string, enabledName: string) =>
        expectDisabledState(label, disabledName, enabledName),
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Menu order", ({ Given, Then }) => {
    Given("the list {string} is shown", showList);
    Then(
      "the menu of {string} offers {string} in that order",
      async (_ctx, label: string, names: string) => {
        await openMenuOf(label);
        expect(
          screen.getAllByRole("menuitem").map((item) => item.textContent),
        ).toEqual(names.split(", "));
      },
    );
  });
});
