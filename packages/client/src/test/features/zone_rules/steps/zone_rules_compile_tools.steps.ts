// Verifies FR1, FR2, FR3, FR5 of build-zic-from-tzcode: the compiler builds and uses the zone tools of the release.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import type { FakeScenario } from "@/test/zoneRules/compileFakes";
import {
  type CompileRun,
  compile,
  isProgram,
  logsMention,
  VALID_SCENARIO,
} from "@/test/zoneRules/compileWorld";

const feature = await loadFeature("../zone_rules_compile_tools.feature");

const BAD_SIGNATURE_STATUS = "[GNUPG:] BADSIG ED97E90E62AA7E34 Paul\n";
const MAKE_ERROR_TEXT = "cc: not found";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let run: CompileRun;
  let scenarioOverrides: Partial<FakeScenario> = {};

  f.BeforeEachScenario(() => {
    scenarioOverrides = {};
  });

  const compileRelease = async (_ctx: unknown, release: string) => {
    run = await compile({ ...VALID_SCENARIO, ...scenarioOverrides }, [release]);
  };

  const expectStoppedNaming = (...texts: string[]) => {
    expect(run.exitCode).not.toBe(0);
    expect(run.writtenFiles.size).toBe(0);
    expect(run.calls.some((call) => isProgram(call, "zic"))).toBe(false);
    for (const text of texts) expect(logsMention(run, text)).toBe(true);
  };

  // @build-zic-from-tzcode @FR1
  f.Scenario(
    "A bad code signature stops the compiler",
    ({ Given, When, Then }) => {
      Given(
        "a tzdata archive whose signature verifies and a tzcode archive whose signature does not",
        () => {
          scenarioOverrides = { codeVerifyStatus: BAD_SIGNATURE_STATUS };
        },
      );
      When("the release {string} is compiled", compileRelease);
      Then(
        "the compiler stops without writing a release and names {string}",
        (_ctx, archiveName: string) => expectStoppedNaming(archiveName),
      );
    },
  );

  // @build-zic-from-tzcode @FR2
  f.Scenario(
    "A code version mismatch stops the compiler",
    ({ Given, When, Then }) => {
      Given(
        "a tzcode archive whose version file reads {string}",
        (_ctx, version: string) => {
          scenarioOverrides = { codeArchiveVersion: version };
        },
      );
      When("the release {string} is compiled", compileRelease);
      Then(
        "the compiler stops without writing a release and names {string} and {string}",
        (_ctx, found: string, requested: string) =>
          expectStoppedNaming(found, requested),
      );
    },
  );

  // @build-zic-from-tzcode @FR3
  f.Scenario("The release's own zic compiles", ({ When, Then, And }) => {
    When("the release {string} is compiled", compileRelease);
    Then(
      "the zic that compiles it was built from {string}",
      (_ctx, codeArchive: string) => {
        const toolsDirectory = run.calls
          .find((call) => call.command === "make")
          ?.args.at(1);
        const unpackedCode = run.calls.find(
          (call) =>
            call.command === "tar" &&
            call.args[1]?.endsWith(codeArchive) &&
            call.args[3] === toolsDirectory,
        );
        const zicCall = run.calls.find((call) => isProgram(call, "zic"));
        expect(run.exitCode).toBe(0);
        expect(unpackedCode).toBeDefined();
        expect(zicCall?.command.startsWith(`${toolsDirectory}`)).toBe(true);
      },
    );
    And("no zic or zdump of the operating system is run", () => {
      const programs = run.calls.map((call) => call.command);
      expect(programs).not.toContain("zic");
      expect(programs).not.toContain("zdump");
    });
  });

  // @build-zic-from-tzcode @FR5
  f.Scenario(
    "A failed build of the zone tools stops the compiler",
    ({ Given, When, Then }) => {
      Given(
        "a tzcode archive whose make fails with exit code {int}",
        (_ctx, exitCode: number) => {
          scenarioOverrides = {
            makeFailure: { exitCode, stderr: MAKE_ERROR_TEXT },
          };
        },
      );
      When("the release {string} is compiled", compileRelease);
      Then(
        "the compiler stops without writing a release and names {string}",
        (_ctx, message: string) => expectStoppedNaming(message),
      );
    },
  );
});
