// Verifies FR7, UX1, UX2 of add-remote-zone-rules-updates: the shell's zone rules update notice.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import {
  createInMemoryStoredReleaseRepository,
  createInMemoryZoneRulesVersionSource,
} from "@/adapters";
import { AppShell } from "@/app";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";

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

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const reloadPage = vi.fn();
  let release = "";

  const openApp = async () => {
    render(
      <AppShell
        zoneRulesVersionSource={createInMemoryZoneRulesVersionSource({
          version: { release },
          releases: { [release]: buildReleaseDocument(release) },
        })}
        storedReleases={createInMemoryStoredReleaseRepository()}
        reloadPage={reloadPage}
      />,
    );
    await screen.findByText(new RegExp(release));
  };
  const chooseReloadOfZoneRulesNotice = async () => {
    await openApp();
    const reloadButtons = screen.getAllByRole("button", { name: "Reload" });
    await userEvent.click(reloadButtons[reloadButtons.length - 1]);
  };

  f.BeforeEachScenario(async () => {
    cleanup();
    reloadPage.mockClear();
    fakeServiceWorker.updateServiceWorker.mockClear();
    fakeServiceWorker.isUpdateAvailable = false;
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(cleanup);

  // @add-remote-zone-rules-updates @FR7 @UX1
  f.Scenario("Notice names the release", ({ Given, When, Then }) => {
    Given(
      "a newer zone rules release {string} is stored",
      (_ctx, name: string) => {
        release = name;
      },
    );
    When("the app shows the zone rules update notice", openApp);
    Then("the notice reads {string}", (_ctx, text: string) => {
      expect(getNoticesRegion()).toHaveTextContent(text);
    });
  });

  // @add-remote-zone-rules-updates @FR7 @UX1
  f.Scenario("User reloads", ({ Given, When, Then }) => {
    Given(
      "a newer zone rules release {string} is stored",
      (_ctx, name: string) => {
        release = name;
      },
    );
    When(
      "the user chooses Reload on the zone rules update notice",
      chooseReloadOfZoneRulesNotice,
    );
    Then("the page reloads once", () => {
      expect(reloadPage).toHaveBeenCalledTimes(1);
    });
  });

  // @add-remote-zone-rules-updates @FR7 @UX1
  f.Scenario("User reloads with a waiting update", ({ Given, When, Then }) => {
    Given(
      "a new version is waiting and a newer zone rules release {string} is stored",
      (_ctx, name: string) => {
        release = name;
        fakeServiceWorker.isUpdateAvailable = true;
      },
    );
    When(
      "the user chooses Reload on the zone rules update notice",
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
    Given(
      "a newer zone rules release {string} is stored",
      (_ctx, name: string) => {
        release = name;
      },
    );
    When("the user dismisses the zone rules update notice", async () => {
      await openApp();
      await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    });
    Then("the zone rules update notice is gone", () => {
      expect(screen.queryByText(new RegExp(release))).not.toBeInTheDocument();
    });
  });

  // @add-remote-zone-rules-updates @FR7 @UX2
  f.Scenario("Both notices at once", ({ Given, When, Then }) => {
    Given(
      "a new version is waiting and a newer zone rules release {string} is stored",
      (_ctx, name: string) => {
        release = name;
        fakeServiceWorker.isUpdateAvailable = true;
      },
    );
    When("the app shows the zone rules update notice", openApp);
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

  // @add-remote-zone-rules-updates @FR7 @UX1
  f.Scenario("Russian notice", ({ Given, When, Then }) => {
    Given(
      "the interface language is Russian and a newer zone rules release {string} is stored",
      async (_ctx, name: string) => {
        release = name;
        await i18n.changeLanguage("ru");
      },
    );
    When("the app shows the zone rules update notice", openApp);
    Then("the notice reads {string}", (_ctx, text: string) => {
      expect(getNoticesRegion()).toHaveTextContent(text);
    });
  });
});
