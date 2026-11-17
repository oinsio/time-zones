// Verifies FR3, FR5, FR6, FR7 of apply-data-updates-silently: the update notice follows the app revision.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, waitFor } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import {
  createFetchAppRevisionSource,
  createInMemoryAppRevisionSource,
} from "@/adapters";
import { AppRevisionFailure } from "@/ports";
import { fakeServiceWorker } from "@/test/fakeServiceWorker";
import { createSilentUpdateWorld, RECHECK_MINUTES } from "./silentUpdateWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../app_shell_silent_update_unit.feature");

const SHORT_RETURN_MINUTES = 5;
const ANOTHER_REVISION = "b2";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSilentUpdateWorld();
  let source = createInMemoryAppRevisionSource();
  let requestCountBefore = 0;
  let fetchFile = vi.fn<typeof fetch>();
  let isDeviceOffline = false;
  const respondWith = (body: BodyInit, status = 200) =>
    fetchFile.mockImplementation(async () => new Response(body, { status }));

  f.BeforeEachScenario(async () => {
    world.reset();
    source = createInMemoryAppRevisionSource();
    fetchFile = vi.fn<typeof fetch>();
    isDeviceOffline = false;
    vi.spyOn(navigator, "onLine", "get").mockImplementation(
      () => !isDeviceOffline,
    );
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(() => {
    world.finish();
    vi.restoreAllMocks();
  });
  f.AfterAllScenarios(async () => {
    await i18n.changeLanguage("ru");
  });

  const waitUntilNoticeShown = (isShown: boolean) =>
    waitFor(() =>
      expect(screen.queryByText(i18n.t("app.updateAvailable")) !== null).toBe(
        isShown,
      ),
    );
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

  // @apply-data-updates-silently @FR6 @UX2
  f.ScenarioOutline(
    "The app revision cannot be read",
    ({ Given, When, Then, And }, variables) => {
      Given("a build is waiting and <failure>", async () => {
        fakeServiceWorker.isUpdateAvailable = true;
        const failure = String(variables.failure);
        if (failure === "the device is offline") isDeviceOffline = true;
        if (failure === "the request fails") {
          fetchFile.mockRejectedValue(new TypeError("network unreachable"));
        }
        if (failure === "the file returns status 404") respondWith("", 404);
        if (failure === "the file is not JSON") respondWith("<html></html>");
        if (failure === "the file names no revision") respondWith("{}");
        await world.open(
          createFetchAppRevisionSource({ baseUrl: "/", fetchFile }),
        );
      });
      When("the app reads the app revision file", async () => {
        await world.returnAfterMinutes(RECHECK_MINUTES);
      });
      Then("the notices region stays empty", () => {
        expect(world.getNoticesRegion()).toBeEmptyDOMElement();
      });
      And("the next check reads the file again", async () => {
        const callsBefore = fetchFile.mock.calls.length;
        isDeviceOffline = false;
        if (callsBefore === 0) respondWith("{}");
        await world.returnAfterMinutes(RECHECK_MINUTES);
        expect(fetchFile.mock.calls.length).toBeGreaterThan(callsBefore);
      });
    },
  );

  // @apply-data-updates-silently @FR6 @UX2
  f.Scenario(
    "A shown notice survives a failed read",
    ({ Given, When, Then }) => {
      Given("the update notice is shown", async () => {
        await openWithWaitingBuild(ANOTHER_REVISION);
        await waitUntilNoticeShown(true);
      });
      When("a later read of the app revision file fails", async () => {
        source.setAnswer(AppRevisionFailure.REQUEST_FAILED);
        await world.returnAfterMinutes(RECHECK_MINUTES);
      });
      Then("the update notice stays shown", () => waitUntilNoticeShown(true));
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
