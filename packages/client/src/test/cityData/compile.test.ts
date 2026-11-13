// Verifies FR1, FR11, FR12 of add-geonames-city-source (D8): the compile entry with stubbed I/O.
import { describe, expect, it } from "vitest";
import { cityLine, runCompile } from "./compileWorld.ts";

const KAZAN = cityLine(551487, "Kazan", "Europe/Moscow");

describe("runCityDataCompile", () => {
  it("should write the dataset once to the dataset path and return 0", async () => {
    const run = await runCompile({ cityLines: [KAZAN] });
    expect(run.exitCode).toBe(0);
    expect([...run.writes.keys()]).toEqual(["city-data/geonames-cities.json"]);
    const dataset = JSON.parse([...run.writes.values()][0]);
    expect(dataset.cities).toEqual([
      [551487, "Kazan", "Казань", "RU", 0, 500000],
    ]);
    expect(dataset.source.dumpDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should log the written path and the city count", async () => {
    const run = await runCompile({ cityLines: [KAZAN] });
    expect(run.log).toEqual([
      "Wrote city-data/geonames-cities.json with 1 cities",
    ]);
  });

  it("should return non-zero, log the dump and write nothing when a download fails", async () => {
    const run = await runCompile({
      cityLines: [KAZAN],
      failDownloadOf: "cities15000.zip",
    });
    expect(run.exitCode).not.toBe(0);
    expect(run.log.join("\n")).toMatch(/cities15000\.zip.*HTTP 503/);
    expect(run.writes.size).toBe(0);
  });

  it("should return non-zero, log the cause and write nothing when unzip fails", async () => {
    const run = await runCompile({ cityLines: [KAZAN], unzipExitCode: 9 });
    expect(run.exitCode).not.toBe(0);
    expect(run.log.join("\n")).toContain("unzip: bad archive");
    expect(run.writes.size).toBe(0);
  });

  it("should return non-zero naming the city and zone for a zone outside the release", async () => {
    const run = await runCompile({
      cityLines: [KAZAN, cityLine(7, "Olympus", "Mars/Olympus")],
    });
    expect(run.exitCode).not.toBe(0);
    expect(run.log.join("\n")).toMatch(/Olympus.*Mars\/Olympus/);
    expect(run.writes.size).toBe(0);
  });

  it("should return non-zero naming the line for a malformed city line", async () => {
    const run = await runCompile({ cityLines: [KAZAN, "broken"] });
    expect(run.exitCode).not.toBe(0);
    expect(run.log.join("\n")).toContain("line 2");
  });
});
