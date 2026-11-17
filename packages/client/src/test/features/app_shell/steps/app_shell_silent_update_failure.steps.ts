// Verifies FR6, UX2 of apply-data-updates-silently: a failed read of the app revision file raises no notice.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
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

const feature = await loadFeature("../app_shell_silent_update_failure.feature");

const ANOTHER_REVISION = "b2";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSilentUpdateWorld();
  let source = createInMemoryAppRevisionSource();
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

  const openWithWaitingBuild = async (fileRevisionName: string) => {
    fakeServiceWorker.isUpdateAvailable = true;
    source.setAnswer(world.revisionNamed(fileRevisionName));
    await world.open(source);
  };

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
        await world.waitUntilNoticeShown(true);
      });
      When("a later read of the app revision file fails", async () => {
        source.setAnswer(AppRevisionFailure.REQUEST_FAILED);
        await world.returnAfterMinutes(RECHECK_MINUTES);
      });
      Then("the update notice stays shown", () =>
        world.waitUntilNoticeShown(true),
      );
    },
  );
});
