import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import {
  act,
  cleanup,
  render,
  screen,
  within,
} from "@testing-library/react/pure";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import { AppShell } from "@/app";
import { STORAGE_KEYS } from "@/constants";
import { fakeServiceWorker } from "@/test/fakeServiceWorker";
import { registryOverride } from "@/test/registryOverride";
import { buildTestView, failingThenLoading } from "@/test/viewFixtures";
import { NOT_JSON } from "../../locations/steps/locationsPersistenceWorld";
import {
  createDateSelectionWorld,
  ENGLISH_LANGUAGE,
} from "./dateSelectionWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

vi.mock("@/views", async (importOriginal) =>
  (await import("@/test/registryOverride")).withRegistryOverride(
    await importOriginal<typeof import("@/views")>(),
  ),
);

const feature = await loadFeature("../date_selection_date_bar.feature");

/** The viewport width from which the bar writes the full weekday (Tailwind `md`). */
const LONG_LABEL_MIN_WIDTH_PX = 768;
const SHORT_LABEL = "short";
const LONG_LABEL = "long";

const BAR_STATES: Record<string, () => Promise<void> | void> = {
  "view loading": () => {
    registryOverride.views = [
      buildTestView("pending", 0, () => new Promise(() => {})),
    ];
  },
  "view error": () => {
    registryOverride.views = [
      buildTestView(
        "failing",
        0,
        failingThenLoading(() => null, 1),
      ),
    ];
  },
  empty: () => undefined,
  unreadable: () => localStorage.setItem(STORAGE_KEYS.LOCATIONS, NOT_JSON),
  "storage unavailable": () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
  },
  offline: () => undefined,
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDateSelectionWorld();
  let shownWidth = LONG_LABEL_MIN_WIDTH_PX;

  f.BeforeEachScenario(async () => {
    await world.reset();
    localStorage.clear();
    fakeServiceWorker.isUpdateAvailable = false;
    fakeServiceWorker.shouldUpdateCheckFail = false;
    registryOverride.views = undefined;
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  f.AfterEachScenario(() => {
    vi.restoreAllMocks();
  });
  f.AfterAllScenarios(world.finish);

  const labelOf = (kind: string) =>
    world.barElement().querySelector(`[data-date-label="${kind}"]`)
      ?.textContent;
  const labelAtWidth = (width: number) =>
    labelOf(width < LONG_LABEL_MIN_WIDTH_PX ? SHORT_LABEL : LONG_LABEL);
  const givenZone = (_ctx: unknown, zone: string) => world.setDeviceZone(zone);
  const givenInstant = (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp);
  const givenAppOpen = () => world.openApp();

  // @select-date-with-calendar-and-now @FR7 @FR9 @M4
  f.ScenarioOutline(
    "Date text by screen width and language",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the interface language is <language>", () =>
        world.setLanguage(variables.language),
      );
      And("the app is open", givenAppOpen);
      When("the bar is shown at <width> px", () => {
        shownWidth = Number(variables.width);
      });
      Then("the shown date reads <text>", () =>
        expect(labelAtWidth(shownWidth)).toBe(variables.text),
      );
    },
  );

  // @select-date-with-calendar-and-now @FR7
  f.Scenario("Another year", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the app is open", givenAppOpen);
    When("the user picks the date {string}", (_ctx, isoDate: string) =>
      world.pickDate(isoDate),
    );
    Then(
      "the shown date reads {string} at 375 px in English",
      (_ctx, text: string) => {
        expect(i18n.language).toBe(ENGLISH_LANGUAGE);
        expect(labelOf(SHORT_LABEL)).toBe(text);
      },
    );
  });

  // @select-date-with-calendar-and-now @FR7
  f.Scenario("Live date changes at midnight", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And(
      "the app was opened at {string}, so the bar shows {string}",
      async (_ctx, timestamp: string, text: string) => {
        world.setInstant(timestamp);
        await world.openApp();
        expect(labelOf(SHORT_LABEL)).toBe(text);
      },
    );
    When(
      "the next minute starts at {string}",
      async (_ctx, timestamp: string) => {
        world.setInstant(timestamp);
        await world.runTick();
      },
    );
    Then("the bar shows {string}", (_ctx, text: string) =>
      expect(labelOf(SHORT_LABEL)).toBe(text),
    );
  });

  // @select-date-with-calendar-and-now @FR8 @M4
  // @keep-now-button-visible-when-live @FR1
  f.ScenarioOutline("Bar in each state", ({ When, Then }, variables) => {
    When("the main page is in the <state> state", async () => {
      await BAR_STATES[variables.state]?.();
      render(createElement(AppShell));
      if (variables.state === "offline") {
        act(() => {
          window.dispatchEvent(new Event("offline"));
        });
      }
      if (variables.state === "view error") await screen.findByRole("alert");
    });
    Then(
      "the date bar is shown with the previous-day, date and next-day buttons and an inactive Now",
      () => {
        const bar = screen.getByRole("group", {
          name: i18n.t("date.barLabel"),
        });
        for (const name of [
          i18n.t("date.previousDay"),
          i18n.t("date.nextDay"),
        ]) {
          expect(within(bar).getByRole("button", { name })).toBeInTheDocument();
        }
        expect(
          within(bar).getByRole("button", { name: /^Choose date/ }),
        ).toBeInTheDocument();
        expect(
          within(bar).getByRole("button", { name: i18n.t("date.now") }),
        ).toBeDisabled();
        cleanup();
      },
    );
  });
});
