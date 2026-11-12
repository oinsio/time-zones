// Verifies FR3, FR4 of add-remote-zone-rules-updates: the in-memory source counts and scripts.
import { ZoneRulesSourceFailure } from "@/ports";
import { createInMemoryZoneRulesVersionSource } from "./inMemoryZoneRulesVersionSource";

describe("in-memory zone rules version source", () => {
  it("should fail every request by default", async () => {
    const source = createInMemoryZoneRulesVersionSource();
    expect([
      await source.fetchVersion(),
      await source.fetchRelease("2026g"),
    ]).toEqual([
      ZoneRulesSourceFailure.REQUEST_FAILED,
      ZoneRulesSourceFailure.REQUEST_FAILED,
    ]);
  });

  it("should count version requests and list requested releases", async () => {
    const source = createInMemoryZoneRulesVersionSource();
    await source.fetchVersion();
    await source.fetchVersion();
    await source.fetchRelease("2026g");
    expect(source.versionRequestCount()).toBe(2);
    expect(source.requestedReleases()).toEqual(["2026g"]);
  });

  it("should answer what is set later", async () => {
    const source = createInMemoryZoneRulesVersionSource();
    source.setVersion({ release: "2026h" });
    source.setRelease("2026h", { release: "2026h" });
    expect(await source.fetchVersion()).toEqual({ release: "2026h" });
    expect(await source.fetchRelease("2026h")).toEqual({ release: "2026h" });
  });
});
