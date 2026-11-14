// Verifies FR12, M1, M4 of add-geonames-city-source (D8): the check entry with a stubbed readFile.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runCityDataCheck } from "../../../scripts/cityData/check.ts";

const DATASET_PATH = "city-data/geonames-cities.json";
const RELEASE_PATH = "zone-rules/release.json";

async function check(datasetText: string) {
  const readPaths: string[] = [];
  const log: string[] = [];
  const exitCode = await runCityDataCheck({
    readFile: async (path) => {
      readPaths.push(path);
      return path === DATASET_PATH ? datasetText : readFileSync(path, "utf8");
    },
    log: (line) => log.push(line),
  });
  return { exitCode, readPaths, log };
}

const COMMITTED = readFileSync(DATASET_PATH, "utf8");

describe("runCityDataCheck", () => {
  it("should read exactly the dataset and the release file", async () => {
    const run = await check(COMMITTED);
    expect(run.readPaths).toEqual([DATASET_PATH, RELEASE_PATH]);
  });

  it("should log the city count and return 0 for the committed file", async () => {
    const run = await check(COMMITTED);
    expect(run.exitCode).toBe(0);
    expect(run.log).toHaveLength(1);
    expect(run.log[0]).toMatch(
      /^city-data\/geonames-cities\.json is valid: \d+ cities$/,
    );
  });

  it("should log every error and return non-zero for an invalid dataset", async () => {
    const dataset = JSON.parse(COMMITTED);
    dataset.zones[0] = "Mars/Olympus";
    dataset.cities.push([dataset.cities[0][0], "", "", "xx", 0, 1]);
    const run = await check(JSON.stringify(dataset));
    expect(run.exitCode).not.toBe(0);
    expect(run.log.length).toBeGreaterThan(1);
    expect(run.log.some((line) => line.includes("Mars/Olympus"))).toBe(true);
  });

  it("should name the path for a file that is not JSON", async () => {
    const run = await check("not json");
    expect(run.exitCode).not.toBe(0);
    expect(run.log.join("\n")).toContain(`${DATASET_PATH} is not valid JSON`);
  });

  it("should name the path for an unreadable file", async () => {
    const log: string[] = [];
    const exitCode = await runCityDataCheck({
      readFile: async () => {
        throw new Error("ENOENT");
      },
      log: (line) => log.push(line),
    });
    expect(exitCode).not.toBe(0);
    expect(log.join("\n")).toContain(`${DATASET_PATH}`);
    expect(log.join("\n")).toContain("ENOENT");
  });
});
