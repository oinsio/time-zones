// Verifies FR4 of build-zic-from-tzcode: the zone rules check runs the zone tools of the committed release.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  buildReleaseText,
  check,
  createCompiledDirectory,
} from "@/test/zoneRules/checkWorld";

const feature = await loadFeature("../zone_rules_check.feature");

const WITH_COMPILED_DIRECTORY = "with a compiled directory";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let run: Awaited<ReturnType<typeof check>>;

  // @build-zic-from-tzcode @FR4
  f.ScenarioOutline(
    "The release's own zdump checks",
    ({ Given, When, Then, And }, variables: Record<string, string>) => {
      Given("the committed release is {string}", (_ctx, release: string) => {
        expect(JSON.parse(buildReleaseText()).release).toBe(release);
      });
      When("the zone rules check runs <mode>", async () => {
        const argv =
          variables.mode === WITH_COMPILED_DIRECTORY
            ? ["--compiled", createCompiledDirectory()]
            : [];
        run = await check(argv);
      });
      Then(
        "the zdump it runs was built from {string}",
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
          expect(unpackedCode).toBeDefined();
          expect(run.zdumpCommands).toEqual([`${toolsDirectory}/zdump`]);
          expect(run.logLines).toContain("0 differences");
        },
      );
      And("no zic or zdump of the operating system is run", () => {
        const programs = [
          ...run.calls.map((call) => call.command),
          ...run.zdumpCommands,
        ];
        expect(programs).not.toContain("zic");
        expect(programs).not.toContain("zdump");
      });
    },
  );
});
