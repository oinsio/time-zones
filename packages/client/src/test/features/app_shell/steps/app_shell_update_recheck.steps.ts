import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react/pure";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import { AppShell } from "@/app";
import { MILLISECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";
import { fakeServiceWorker } from "@/test/fakeServiceWorker";
import { resetPageVisibility, setPageVisibility } from "@/test/pageVisibility";
import {
  createSwitchableClock,
  type SwitchableClock,
} from "@/test/switchableClock";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../app_shell_update_recheck.feature");

const START_INSTANT = "2026-03-08T07:30:00Z";
const NETWORK_ERROR_MESSAGE = "network unreachable";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let clock: SwitchableClock;
  let update: ReturnType<typeof vi.fn>;

  const openAppWithRegistration = async () => {
    render(createElement(AppShell, { clock }));
    await waitFor(() =>
      expect(screen.getByRole("main").querySelector("[aria-busy]")).toBeNull(),
    );
    const registration = { update } as unknown as ServiceWorkerRegistration;
    await act(async () => {
      fakeServiceWorker.onRegisteredSW?.("sw.js", registration);
    });
  };
  const moveClockByMinutes = (minutes: number) =>
    clock.moveTo(
      Temporal.Instant.fromEpochMilliseconds(
        clock.instant().epochMilliseconds + minutes * MILLISECONDS_PER_MINUTE,
      ).toString(),
    );
  const failureNote = () => i18n.t("mainPage.updateCheckFailed");

  f.BeforeEachScenario(async () => {
    cleanup();
    localStorage.clear();
    clock = createSwitchableClock(START_INSTANT);
    update = vi.fn().mockResolvedValue(undefined);
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(() => {
    resetPageVisibility();
    cleanup();
  });
  f.AfterAllScenarios(async () => {
    await i18n.changeLanguage("ru");
  });

  const thenCheckedTimes = (_ctx: unknown, times: number) =>
    expect(update).toHaveBeenCalledTimes(times);
  const whenReturnsAfter = async (_ctx: unknown, minutes: number) => {
    moveClockByMinutes(minutes);
    await act(async () => setPageVisibility("visible"));
  };

  // @support-legacy-ios-12-safari @FR10
  f.Scenario("Returning to the app checks again", ({ Given, When, Then }) => {
    Given(
      "the app was opened and checked for a new version",
      openAppWithRegistration,
    );
    When(
      "the user returns to the app after {number} minutes",
      whenReturnsAfter,
    );
    Then(
      "the app has checked for a new version {number} times",
      thenCheckedTimes,
    );
  });

  // @support-legacy-ios-12-safari @FR10
  f.Scenario(
    "Returning soon after a check does not check",
    ({ Given, When, Then }) => {
      Given(
        "the app was opened and checked for a new version",
        openAppWithRegistration,
      );
      When(
        "the user returns to the app after {number} minutes",
        whenReturnsAfter,
      );
      Then(
        "the app has checked for a new version {number} times",
        thenCheckedTimes,
      );
    },
  );

  // @support-legacy-ios-12-safari @FR10
  f.Scenario("Hiding the page does not check", ({ Given, When, Then }) => {
    Given(
      "the app was opened and checked for a new version",
      openAppWithRegistration,
    );
    When("the user leaves the app and {number} minutes pass", async () => {
      moveClockByMinutes(16);
      await act(async () => setPageVisibility("hidden"));
    });
    Then(
      "the app has checked for a new version {number} times",
      thenCheckedTimes,
    );
  });

  // @support-legacy-ios-12-safari @FR10
  f.Scenario(
    "A check on return fails offline",
    ({ Given, And, When, Then }) => {
      Given(
        "the app was opened and the next check will fail because the network is unreachable",
        async () => {
          update
            .mockResolvedValueOnce(undefined)
            .mockRejectedValue(new TypeError(NETWORK_ERROR_MESSAGE));
          await openAppWithRegistration();
        },
      );
      And("no update-check failure note is shown", () => {
        expect(screen.queryByText(failureNote())).toBeNull();
      });
      When(
        "the user returns to the app after {number} minutes",
        whenReturnsAfter,
      );
      Then("the update-check failure note is shown", async () => {
        expect(await screen.findByText(failureNote())).toBeInTheDocument();
      });
    },
  );
});
