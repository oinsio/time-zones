// Verifies FR6, NFR-P2 of add-remote-zone-rules-updates: the active release at start.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { createLocalStorageStoredReleaseRepository } from "@/adapters/storedRelease";
import { STORAGE_KEYS } from "@/constants";
import {
  getInstalledRelease,
  installZoneRulesDateTimeFormat,
  loadZoneRules,
} from "@/lib/zoneRules";
import { committedRelease } from "@/test/installZoneRules";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";
import {
  ALMATY_EIGHT_UTC,
  ALMATY_UTC_PLUS_FOUR_CLOCK,
  BUNDLED_DOCUMENT,
  envelopeOf,
  NEWER_DOCUMENT,
  nativeDateTimeFormat,
  RELEASE_URL,
  UNREADABLE_DOCUMENTS,
} from "./zoneRulesActiveReleaseWorld";

const feature = await loadFeature(
  "../zone_rules_updates_active_release.feature",
);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let fetchRelease = vi.fn();
  let storageReads = 0;
  let errorLogs: unknown[] = [];

  const respondWithBundled = () =>
    vi.fn(
      async () =>
        ({ ok: true, json: async () => BUNDLED_DOCUMENT }) as Response,
    );
  const storedReleases = createLocalStorageStoredReleaseRepository({
    getStorage: () => ({
      ...localStorage,
      getItem: (key: string) => {
        storageReads += 1;
        return localStorage.getItem(key);
      },
      removeItem: (key: string) => localStorage.removeItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
    }),
  });
  const start = () =>
    loadZoneRules(RELEASE_URL, { storedReleases, fetchRelease });
  const readStored = () => localStorage.getItem(STORAGE_KEYS.ZONE_RULES);
  const readAlmatyClock = () =>
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Almaty",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(ALMATY_EIGHT_UTC);

  f.BeforeEachScenario(() => {
    localStorage.clear();
    fetchRelease = respondWithBundled();
    storageReads = 0;
    errorLogs = [];
    vi.spyOn(console, "error").mockImplementation((...logged) => {
      errorLogs.push(logged);
    });
  });

  f.AfterEachScenario(() => {
    vi.restoreAllMocks();
    Intl.DateTimeFormat = nativeDateTimeFormat;
    installZoneRulesDateTimeFormat(committedRelease);
    Intl.DateTimeFormat = nativeDateTimeFormat;
  });

  // @add-remote-zone-rules-updates @FR6
  f.Scenario("Stored release is newer", ({ Given, When, Then, And }) => {
    Given(
      'the bundled release is "2026f" and the stored release is "2026g", whose rule for "Asia/Almaty" is UTC+4',
      () =>
        localStorage.setItem(
          STORAGE_KEYS.ZONE_RULES,
          envelopeOf(NEWER_DOCUMENT),
        ),
    );
    When("the app starts", start);
    Then('the active release is "2026g"', () => {
      expect(getInstalledRelease()?.release).toBe("2026g");
    });
    And('the offset of "Asia/Almaty" is UTC+4', () => {
      expect(readAlmatyClock()).toBe(ALMATY_UTC_PLUS_FOUR_CLOCK);
    });
  });

  // @add-remote-zone-rules-updates @FR6
  f.ScenarioOutline(
    "Stored release is older or equal",
    ({ Given, When, Then, And }, variables) => {
      Given(
        'the bundled release is "2026f" and the stored release is "<stored>"',
        () =>
          localStorage.setItem(
            STORAGE_KEYS.ZONE_RULES,
            envelopeOf(buildReleaseDocument(String(variables.stored))),
          ),
      );
      When("the app starts", start);
      Then('the active release is "2026f"', () => {
        expect(getInstalledRelease()?.release).toBe("2026f");
      });
      And("the stored release is removed", () => {
        expect(readStored()).toBeNull();
      });
    },
  );

  // @add-remote-zone-rules-updates @FR6
  f.ScenarioOutline(
    "Stored release is unreadable",
    ({ Given, When, Then, And }, variables) => {
      Given('the stored release document is "<document>"', () =>
        localStorage.setItem(
          STORAGE_KEYS.ZONE_RULES,
          UNREADABLE_DOCUMENTS[String(variables.document)],
        ),
      );
      When("the app starts", start);
      Then("the active release is the bundled one", () => {
        expect(getInstalledRelease()?.release).toBe("2026f");
      });
      And("the stored document is removed", () => {
        expect(readStored()).toBeNull();
      });
      And("no error is shown", () => {
        expect(errorLogs).toEqual([]);
      });
    },
  );

  // @add-remote-zone-rules-updates @FR6 @NFR-P2
  f.Scenario("No stored release", ({ Given, When, Then }) => {
    Given("nothing is stored", () => undefined);
    When("the app starts", start);
    Then(
      "the active release is the bundled one, storage is read once and only the bundled release is requested",
      () => {
        expect(getInstalledRelease()?.release).toBe("2026f");
        expect(storageReads).toBe(1);
        expect(fetchRelease).toHaveBeenCalledTimes(1);
        expect(fetchRelease).toHaveBeenCalledWith(RELEASE_URL);
      },
    );
  });

  // @add-remote-zone-rules-updates @FR6
  f.Scenario(
    "The bundled release cannot be loaded",
    ({ Given, When, Then }) => {
      Given(
        'the request for the bundled release fails and the stored release "2026g" is valid',
        () => {
          localStorage.setItem(
            STORAGE_KEYS.ZONE_RULES,
            envelopeOf(NEWER_DOCUMENT),
          );
          fetchRelease = vi.fn(async () => {
            throw new Error("offline");
          });
        },
      );
      When("the app starts", start);
      Then('the active release is "2026g"', () => {
        expect(getInstalledRelease()?.release).toBe("2026g");
      });
    },
  );
});
