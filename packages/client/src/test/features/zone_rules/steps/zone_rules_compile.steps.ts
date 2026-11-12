// Implements FR7 of add-zone-rules-from-iana: executable scenarios of the release compiler.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  parseZoneRulesRelease,
  SECONDS_PER_HOUR,
  ZoneRulesReleaseError,
} from "@/lib/zoneRules";
import {
  type CompileRun,
  compile,
  logsMention,
  VALID_SCENARIO,
  VALID_STATUS,
} from "@/test/zoneRules/compileWorld";
import type { TzifZone } from "../../../../../scripts/zoneRules/readTzif.ts";
import { TZ_COORDINATOR_KEY_FINGERPRINT } from "../../../../../scripts/zoneRules/signing.ts";
import { truncateToCutoff } from "../../../../../scripts/zoneRules/truncateToCutoff.ts";

const feature = await loadFeature("../zone_rules_compile.feature");

const OTHER_FINGERPRINT = "0000000000000000000000000000000000000000";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let run: CompileRun;
  let scenarioOverrides = {};

  const compileRelease = async (_ctx: unknown, release: string) => {
    run = await compile({ ...VALID_SCENARIO, ...scenarioOverrides }, [release]);
  };

  // @add-zone-rules-from-iana @FR7
  f.Scenario("A valid archive compiles", ({ Given, When, Then }) => {
    Given(
      "a tzdata archive and a signature that verifies against the pinned fingerprint",
      () => undefined,
    );
    When("the release {string} is compiled", compileRelease);
    Then(
      "a release named {string} is written with the zone rules of every zone id of the archive",
      (_ctx, release: string) => {
        const [[, text]] = [...run.writtenFiles];
        const written = parseZoneRulesRelease(JSON.parse(text));
        if (written instanceof ZoneRulesReleaseError) throw written;
        expect(run.exitCode).toBe(0);
        expect(written.release).toBe(release);
        expect(written.zones.size).toBeGreaterThan(0);
      },
    );
  });

  // @add-zone-rules-from-iana @FR7
  f.Scenario(
    "The archive comes from the release address",
    ({ When, Then, And }) => {
      When("the release {string} is compiled", compileRelease);
      Then(
        "the compiler downloads {string} and {string}",
        (_ctx, archiveUrl: string, signatureUrl: string) => {
          expect(run.urls).toEqual([archiveUrl, signatureUrl]);
        },
      );
      And("no address it requests contains {string}", (_ctx, text: string) => {
        expect(run.urls.some((url) => url.includes(text))).toBe(false);
      });
    },
  );

  const expectCompilerStopped = () => {
    expect(run.exitCode).not.toBe(0);
    expect(run.writtenFiles.size).toBe(0);
  };

  // @add-zone-rules-from-iana @FR7
  f.Scenario("A bad signature stops the compiler", ({ Given, When, Then }) => {
    Given("an archive whose signature does not verify", () => {
      scenarioOverrides = {
        verifyStatus: "[GNUPG:] BADSIG ED97E90E62AA7E34 Paul\n",
      };
    });
    When("the release {string} is compiled", compileRelease);
    Then(
      "the compiler stops without writing a release and names the failed check",
      () => {
        expectCompilerStopped();
        expect(logsMention(run, "no valid signature")).toBe(true);
      },
    );
  });

  // @add-zone-rules-from-iana @FR7
  f.Scenario(
    "A signature by another key stops the compiler",
    ({ Given, When, Then }) => {
      Given(
        "an archive whose signature verifies, but by a key whose fingerprint is not the pinned one",
        () => {
          scenarioOverrides = {
            verifyStatus: VALID_STATUS.split(
              TZ_COORDINATOR_KEY_FINGERPRINT,
            ).join(OTHER_FINGERPRINT),
          };
        },
      );
      When("the release {string} is compiled", compileRelease);
      Then(
        "the compiler stops without writing a release and names both fingerprints",
        () => {
          expectCompilerStopped();
          expect(logsMention(run, OTHER_FINGERPRINT)).toBe(true);
          expect(logsMention(run, TZ_COORDINATOR_KEY_FINGERPRINT)).toBe(true);
        },
      );
    },
  );

  // @add-zone-rules-from-iana @FR7
  f.Scenario(
    "A version mismatch stops the compiler",
    ({ Given, When, Then }) => {
      Given(
        "an archive whose version file reads {string}",
        (_ctx, version: string) => {
          scenarioOverrides = { archiveVersion: version };
        },
      );
      When("the release {string} is compiled", compileRelease);
      Then(
        "the compiler stops without writing a release and names both versions",
        () => {
          expectCompilerStopped();
          expect(logsMention(run, "2026e")).toBe(true);
          expect(logsMention(run, "2026f")).toBe(true);
        },
      );
    },
  );

  // @add-zone-rules-from-iana @FR7
  f.Scenario("Truncation keeps the cutoff type", ({ Given, When, Then }) => {
    let zone: TzifZone;
    let truncated: ReturnType<typeof truncateToCutoff>;
    const lmt = {
      utcOffsetSeconds: 9017,
      designation: "LMT",
      isDaylightSavingTime: false,
    };
    const msk = {
      utcOffsetSeconds: 10800,
      designation: "MSK",
      isDaylightSavingTime: false,
    };
    const mskSummer = {
      utcOffsetSeconds: 14400,
      designation: "MSK",
      isDaylightSavingTime: false,
    };
    Given(
      "a TZif file of {string} with clock changes before and after {string}",
      () => {
        zone = {
          types: [lmt, msk, mskSummer],
          transitions: [
            [-1688265017, 1],
            [938916000, 1],
            [1301180400, 2],
            [1414276800, 1],
          ],
          footer: "MSK-3",
        };
      },
    );
    When("it is truncated to the cutoff", () => {
      truncated = truncateToCutoff(zone);
    });
    Then(
      "the cutoff type is UTC plus 3 {string} and no clock change before the cutoff is kept",
      (_ctx, designation: string) => {
        const [cutoffOffset, cutoffDesignation] =
          truncated.types[truncated.cutoffType];
        expect([cutoffOffset, cutoffDesignation]).toEqual([
          3 * SECONDS_PER_HOUR,
          designation,
        ]);
        // A listed change is stored as seconds after the cutoff: a change before it would be negative.
        for (const [secondsAfterCutoff] of truncated.changes) {
          expect(secondsAfterCutoff).toBeGreaterThan(0);
        }
      },
    );
  });
});
