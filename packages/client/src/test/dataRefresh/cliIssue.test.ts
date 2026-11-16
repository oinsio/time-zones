// Verifies FR3, FR5, FR6, FR7, FR8 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import { runDataRefreshCli } from "../../../scripts/dataRefresh/cli.ts";
import { createHarness } from "./cliHarness.ts";

describe("issue", () => {
  it("writes the title and the body file", async () => {
    const harness = createHarness();
    const exitCode = await runDataRefreshCli(
      ["issue", "zone-rules", "Compile the release", "https://run"],
      harness.dependencies,
    );
    expect([exitCode, harness.outputs, harness.files["issue.md"]]).toEqual([
      0,
      {
        title: "Data refresh failed: zone rules",
        "body-file": "/tmp/issue.md",
        "recovery-file": "/tmp/recovery.md",
      },
      "Failed step: Compile the release\nRun: https://run",
    ]);
    expect(harness.files["recovery.md"]).toContain("https://run");
  });

  it("rejects an unknown source", async () => {
    const harness = createHarness();
    expect(
      await runDataRefreshCli(
        ["issue", "nope", "step", "url"],
        harness.dependencies,
      ),
    ).toBe(1);
  });
});

describe("usage", () => {
  it.each([[[]], [["bogus"]], [["verdict", "cldr"]]])(
    "prints the usage and exits 1 for %j",
    async (argumentsList) => {
      const harness = createHarness();
      expect(await runDataRefreshCli(argumentsList, harness.dependencies)).toBe(
        1,
      );
      expect(harness.lines[0]).toMatch(/^Usage:/);
    },
  );
});
