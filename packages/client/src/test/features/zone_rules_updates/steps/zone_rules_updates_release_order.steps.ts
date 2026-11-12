// Verifies FR5 of add-remote-zone-rules-updates: executable scenarios of the release order.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  compareReleaseNames,
  isNewerRelease,
  parseReleaseName,
} from "@/lib/zoneRules";

const feature = await loadFeature(
  "../zone_rules_updates_release_order.feature",
);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let earlier = "";
  let later = "";
  let readName = "";

  // @add-remote-zone-rules-updates @FR5
  f.ScenarioOutline("Ordered pairs", ({ When, Then }, variables) => {
    When('"<earlier>" and "<later>" are compared', () => {
      earlier = String(variables.earlier);
      later = String(variables.later);
    });
    Then(
      '"<earlier>" is older than "<later>", "<later>" is newer than "<earlier>", and each equals itself',
      () => {
        expect(compareReleaseNames(earlier, later)).toBeLessThan(0);
        expect(isNewerRelease(later, earlier)).toBe(true);
        expect(compareReleaseNames(earlier, earlier)).toBe(0);
        expect(compareReleaseNames(later, later)).toBe(0);
      },
    );
  });

  // @add-remote-zone-rules-updates @FR5
  f.ScenarioOutline("Invalid names", ({ When, Then }, variables) => {
    When('"<name>" is read as a release name', () => {
      readName = String(variables.name);
    });
    Then("it is invalid", () => {
      expect(parseReleaseName(readName)).toBeUndefined();
    });
  });
});
