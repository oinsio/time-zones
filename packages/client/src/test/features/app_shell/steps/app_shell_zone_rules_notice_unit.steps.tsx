// Verifies FR7, UX1, UX2 of add-remote-zone-rules-updates and FR4, FR8, FR9, FR11 of apply-data-updates-silently: the shell's zone rules update notice.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import {
  createInMemoryAppRevisionSource,
  createInMemoryStoredReleaseRepository,
  createInMemoryZoneRulesVersionSource,
} from "@/adapters";
import { AppShell } from "@/app";
import { APP_REVISION } from "@/constants";
import { ANOTHER_APP_REVISION } from "@/test/anotherAppRevisionSource";
import { buildReleaseChangingZones } from "@/test/zoneRules/committedReleaseChanging";
import {
  LISBON_LOCATION,
  seedListedLocations,
} from "@/test/zoneRules/seedListedLocations";

const fakeServiceWorker = vi.hoisted(() => ({
  isUpdateAvailable: false,
  updateServiceWorker: vi.fn(),
}));

vi.mock("virtual:pwa-register/react", async () => {
  const { useState } = await import("react");
  return {
    useRegisterSW: () => ({
      offlineReady: useState(false),
      needRefresh: useState(fakeServiceWorker.isUpdateAvailable),
      updateServiceWorker: fakeServiceWorker.updateServiceWorker,
    }),
  };
});

const feature = await loadFeature(
  "../app_shell_zone_rules_notice_unit.feature",
);

const getNoticesRegion = () =>
  screen
    .getAllByRole("status")
    .find(
      (region) => region.getAttribute("aria-live") === "polite",
    ) as HTMLElement;

const SILENT_RELEASE = "2999a";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const reloadPage = vi.fn();
  let publishedAppRevision = APP_REVISION;

  const openApp = async (release: string, changedZoneIds: string[]) => {
    render(
      <AppShell
        appRevisionSource={createInMemoryAppRevisionSource(
          publishedAppRevision,
        )}
        zoneRulesVersionSource={createInMemoryZoneRulesVersionSource({
          version: { release },
          releases: {
            [release]: buildReleaseChangingZones(release, changedZoneIds),
          },
        })}
        storedReleases={createInMemoryStoredReleaseRepository()}
        reloadPage={reloadPage}
      />,
    );
  };
  const openAppAndAwaitNotice = async (release: string) => {
    await openApp(release, [LISBON_LOCATION.timeZoneId]);
    await screen.findByText(new RegExp(release));
  };
  const chooseReloadOfZoneRulesNotice = async (
    _ctx: unknown,
    release: string,
  ) => {
    await openAppAndAwaitNotice(release);
    const reloadButtons = screen.getAllByRole("button", { name: "Reload" });
    await userEvent.click(reloadButtons[reloadButtons.length - 1]);
  };
  const givenListHoldsLisbon = () => seedListedLocations([LISBON_LOCATION]);
  const givenListHoldsLisbonAndWaitingBuild =
    (revision: () => string) => () => {
      seedListedLocations([LISBON_LOCATION]);
      fakeServiceWorker.isUpdateAvailable = true;
      publishedAppRevision = revision();
    };
  const whenCheckFinds = async (
    _ctx: unknown,
    release: string,
    zoneId: string,
  ) => {
    await openApp(release, [zoneId]);
  };
  const expectNoticeText = async (_ctx: unknown, text: string) => {
    await screen.findByText(text);
    expect(getNoticesRegion()).toHaveTextContent(text);
  };

  f.BeforeEachScenario(async () => {
    cleanup();
    localStorage.clear();
    reloadPage.mockClear();
    fakeServiceWorker.updateServiceWorker.mockClear();
    fakeServiceWorker.isUpdateAvailable = false;
    publishedAppRevision = APP_REVISION;
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(cleanup);

  // @add-remote-zone-rules-updates @FR7 @UX1 @apply-data-updates-silently @FR8
  f.Scenario("Notice names the release", ({ Given, When, Then }) => {
    Given("the list holds Lisbon", givenListHoldsLisbon);
    When(
      "a check finds the newer release {string}, which changes the rules of {string}",
      whenCheckFinds,
    );
    Then("the notice reads {string}", expectNoticeText);
  });

  // @apply-data-updates-silently @FR8 @FR9
  f.Scenario(
    "A release that changes no watched zone",
    ({ Given, When, Then }) => {
      Given("the list holds Lisbon", givenListHoldsLisbon);
      When(
        "a check finds the newer release {string}, which changes only the rules of {string}",
        whenCheckFinds,
      );
      Then("the notices region stays empty", async () => {
        await screen.findByRole("main");
        await vi.waitFor(() =>
          expect(getNoticesRegion()).toBeEmptyDOMElement(),
        );
      });
    },
  );

  // @add-remote-zone-rules-updates @FR7 @UX1
  f.Scenario("User reloads", ({ Given, When, Then }) => {
    Given("the list holds Lisbon", givenListHoldsLisbon);
    When(
      "the user chooses Reload on the zone rules update notice for the release {string}",
      chooseReloadOfZoneRulesNotice,
    );
    Then("the page reloads once", () => {
      expect(reloadPage).toHaveBeenCalledTimes(1);
    });
  });

  // @add-remote-zone-rules-updates @FR7 @UX1 @apply-data-updates-silently @FR11
  f.Scenario("User reloads with a waiting update", ({ Given, When, Then }) => {
    Given(
      "the list holds Lisbon and a build with another app revision is waiting",
      givenListHoldsLisbonAndWaitingBuild(() => ANOTHER_APP_REVISION),
    );
    When(
      "the user chooses Reload on the zone rules update notice for the release {string}",
      chooseReloadOfZoneRulesNotice,
    );
    Then(
      "the waiting update is applied and the page is not reloaded separately",
      () => {
        expect(fakeServiceWorker.updateServiceWorker).toHaveBeenCalledWith(
          true,
        );
        expect(reloadPage).not.toHaveBeenCalled();
      },
    );
  });

  // @add-remote-zone-rules-updates @FR7 @UX2
  f.Scenario("User dismisses", ({ Given, When, Then }) => {
    let release = "";
    Given("the list holds Lisbon", givenListHoldsLisbon);
    When(
      "the user dismisses the zone rules update notice for the release {string}",
      async (_ctx, name: string) => {
        release = name;
        await openAppAndAwaitNotice(name);
        await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      },
    );
    Then("the zone rules update notice is gone", () => {
      expect(screen.queryByText(new RegExp(release))).not.toBeInTheDocument();
    });
  });

  // @add-remote-zone-rules-updates @FR7 @UX2 @apply-data-updates-silently @FR4 @FR11
  f.Scenario("Both notices at once", ({ Given, When, Then }) => {
    Given(
      "the list holds Lisbon and a build with another app revision is waiting",
      givenListHoldsLisbonAndWaitingBuild(() => ANOTHER_APP_REVISION),
    );
    When(
      "a check finds the newer release {string}, which changes the rules of {string}",
      async (_ctx, release: string, zoneId: string) => {
        await openApp(release, [zoneId]);
        await screen.findByText(new RegExp(release));
        await screen.findByText(i18n.t("app.updateAvailable"));
      },
    );
    Then(
      "both notices are shown, each with its own Reload, the zone rules one after the update notice",
      () => {
        expect(screen.getAllByRole("button", { name: "Reload" })).toHaveLength(
          2,
        );
        expect(getNoticesRegion().textContent).toMatch(
          /A new version is available\..*Time zone rules/,
        );
      },
    );
  });

  // @apply-data-updates-silently @FR11
  f.Scenario(
    "Reload applies a silent update too",
    ({ Given, And, When, Then }) => {
      Given(
        "the list holds Lisbon and a build with the running build's app revision is waiting",
        givenListHoldsLisbonAndWaitingBuild(() => APP_REVISION),
      );
      And("the update notice is not shown", async () => {
        await openAppAndAwaitNotice(SILENT_RELEASE);
        expect(screen.queryByText(i18n.t("app.updateAvailable"))).toBeNull();
      });
      When(
        "the user chooses Reload on the zone rules update notice for the release {string}",
        async () => {
          await userEvent.click(screen.getByRole("button", { name: "Reload" }));
        },
      );
      Then(
        "the waiting update is applied and the page is not reloaded separately",
        () => {
          expect(screen.queryByText(i18n.t("app.updateAvailable"))).toBeNull();
          expect(fakeServiceWorker.updateServiceWorker).toHaveBeenCalledWith(
            true,
          );
          expect(reloadPage).not.toHaveBeenCalled();
        },
      );
    },
  );

  // @add-remote-zone-rules-updates @FR7 @UX1 @apply-data-updates-silently @FR8
  f.Scenario("Russian notice", ({ Given, When, Then }) => {
    Given(
      "the interface language is Russian and the list holds Lisbon",
      async () => {
        seedListedLocations([LISBON_LOCATION]);
        await i18n.changeLanguage("ru");
      },
    );
    When(
      "a check finds the newer release {string}, which changes the rules of {string}",
      whenCheckFinds,
    );
    Then("the notice reads {string}", expectNoticeText);
  });
});
