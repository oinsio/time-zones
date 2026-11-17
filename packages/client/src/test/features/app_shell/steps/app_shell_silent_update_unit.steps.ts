// Verifies FR3, FR5, FR6, FR7 of apply-data-updates-silently: the update notice follows the app revision.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { createInMemoryAppRevisionSource } from "@/adapters";
import { fakeServiceWorker } from "@/test/fakeServiceWorker";
import { createSilentUpdateWorld, RECHECK_MINUTES } from "./silentUpdateWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../app_shell_silent_update_unit.feature");

const SHORT_RETURN_MINUTES = 5;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSilentUpdateWorld();
  let source = createInMemoryAppRevisionSource();
  let requestCountBefore = 0;

  f.BeforeEachScenario(async () => {
    world.reset();
    source = createInMemoryAppRevisionSource();
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(() => {
    world.finish();
    vi.restoreAllMocks();
  });
  f.AfterAllScenarios(async () => {
    await i18n.changeLanguage("ru");
  });

  const waitUntilNoticeShown = world.waitUntilNoticeShown;
  const openWithWaitingBuild = async (fileRevisionName: string) => {
    fakeServiceWorker.isUpdateAvailable = true;
    source.setAnswer(world.revisionNamed(fileRevisionName));
    await world.open(source);
  };
  const givenRunning = (_ctx: unknown, name: string) =>
    world.nameRunningRevision(name);
  const givenWaitingNaming = (_ctx: unknown, name: string) =>
    openWithWaitingBuild(name);

  // @apply-data-updates-silently @FR3 @UX1
  f.Scenario("A data-only build is waiting", ({ Given, When, Then, And }) => {
    Given("the running build has the app revision {string}", givenRunning);
    When(
      "a build is waiting and the app revision file names {string}",
      givenWaitingNaming,
    );
    Then("the notices region stays empty", () => {
      expect(world.getNoticesRegion()).toBeEmptyDOMElement();
    });
    And("the page keeps working without reloading", () => {
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.queryByText(i18n.t("app.updateAvailable"))).toBeNull();
    });
  });

  // @apply-data-updates-silently @FR3 @FR5
  f.Scenario(
    "An app change arrives after a silent update",
    ({ Given, And, When, Then }) => {
      Given("the running build has the app revision {string}", givenRunning);
      And(
        "a build is waiting and the app revision file names {string}",
        givenWaitingNaming,
      );
      When(
        "a later check finds that the app revision file names {string}",
        async (_ctx, name: string) => {
          source.setAnswer(world.revisionNamed(name));
          await world.returnAfterMinutes(RECHECK_MINUTES);
        },
      );
      Then("the update notice is shown", () => waitUntilNoticeShown(true));
    },
  );

  // @apply-data-updates-silently @FR5 @NFR-P1 @M4
  f.Scenario("No build is waiting", ({ Given, When, Then }) => {
    Given("no build is waiting", async () => {
      await world.open(source);
    });
    When(
      "the app starts and later returns to the screen after {number} minutes",
      (_ctx, minutes: number) => world.returnAfterMinutes(minutes),
    );
    Then("the app revision file was not requested", () => {
      expect(source.requestCount()).toBe(0);
    });
  });

  // @apply-data-updates-silently @FR5 @NFR-P1 @M4
  f.Scenario(
    "The app revision is read once per check",
    ({ Given, And, When, Then }) => {
      Given("the running build has the app revision {string}", givenRunning);
      And(
        "a build is waiting and the app revision file names {string}",
        async (_ctx, name: string) => {
          await openWithWaitingBuild(name);
          requestCountBefore = source.requestCount();
        },
      );
      When(
        "the page becomes visible after {number} minutes",
        (_ctx, minutes: number) => world.returnAfterMinutes(minutes),
      );
      Then(
        "the app revision file is requested exactly once for that check",
        () => {
          expect(source.requestCount() - requestCountBefore).toBe(1);
        },
      );
      And(
        "a return {number} minutes after that requests nothing",
        async (_ctx, minutes: number) => {
          expect(minutes).toBe(SHORT_RETURN_MINUTES);
          const countBefore = source.requestCount();
          await world.returnAfterMinutes(minutes);
          expect(source.requestCount()).toBe(countBefore);
        },
      );
    },
  );

  // @apply-data-updates-silently @FR7
  f.ScenarioOutline(
    "A dismissed notice returns for yet another revision",
    ({ Given, When, Then }, variables) => {
      Given(
        "the user dismissed the update notice while the app revision file named {string}",
        async (_ctx, name: string) => {
          await openWithWaitingBuild(name);
          await waitUntilNoticeShown(true);
          await userEvent.click(
            screen.getByRole("button", { name: i18n.t("app.dismiss") }),
          );
        },
      );
      When('a later check finds that the file names "<revision>"', async () => {
        source.setAnswer(String(variables.revision));
        await world.returnAfterMinutes(RECHECK_MINUTES);
      });
      Then("the update notice is <shown>", () => {
        return waitUntilNoticeShown(variables.shown === "shown");
      });
    },
  );
});
