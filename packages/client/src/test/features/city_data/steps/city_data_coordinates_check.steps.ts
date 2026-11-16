// Implements FR1, FR4 of add-city-coordinates-to-locations (M1, M3).
import { readFileSync } from "node:fs";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { COORDINATE_TENTHS_PER_DEGREE } from "@/constants";
import {
  buildCity,
  buildDataset,
  RELEASE_ZONES,
} from "@/test/cityData/checkCityData.fixtures.ts";
import { cityLine, runCompile } from "@/test/cityData/compileWorld.ts";
import { runCityDataCheck } from "../../../../../scripts/cityData/check.ts";
import { checkCityData } from "../../../../../scripts/cityData/checkCityData.ts";
import type { CityDataset } from "../../../../../scripts/cityData/cityDataTypes.ts";

const feature = await loadFeature("../city_data_coordinates_check.feature");

const TOWN_ID = 6001;
const BROKEN_CITY_NAME = "Brokenville";

function tenthsOf(degrees: number): number {
  return Math.round(degrees * COORDINATE_TENTHS_PER_DEGREE) + 0;
}

function buildBrokenDataset(defect: string): CityDataset {
  const dataset = buildDataset();
  const [, english, russian, countryCode, zoneIndex, population] = buildCity(
    TOWN_ID,
    {
      english: BROKEN_CITY_NAME,
    },
  );
  const coordinates: Record<string, number[]> = {
    "a GeoNames city without coordinates": [],
    "a GeoNames city with the latitude 91": [tenthsOf(91), 0],
    "a GeoNames city with the longitude -181": [0, tenthsOf(-181)],
  };
  dataset.cities.push([
    TOWN_ID,
    english,
    russian,
    countryCode,
    zoneIndex,
    population,
    ...coordinates[defect],
  ] as CityDataset["cities"][number]);
  return dataset;
}

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  // @add-city-coordinates-to-locations @FR1 @FR4
  f.ScenarioOutline(
    "A row out of range stops the compile",
    ({ Given, When, Then, And }, variables) => {
      let run: Awaited<ReturnType<typeof runCompile>> | undefined;
      let cityLines: string[] = [];
      Given("a dump in which one city row has <value>", () => {
        const coordinates = variables.value.includes("latitude")
          ? { latitude: "91" }
          : { longitude: "-181" };
        cityLines = [
          cityLine(1, "Kazan", "Europe/Moscow", 500_000, coordinates),
        ];
      });
      When("the city data compile command runs", async () => {
        run = await runCompile({ cityLines });
      });
      Then("it fails and names the line", () => {
        expect(run?.exitCode).not.toBe(0);
        expect(run?.log.join("\n")).toContain("line 1");
      });
      And("the committed city data is not changed", () => {
        expect(run?.writes.size).toBe(0);
      });
    },
  );

  // @add-city-coordinates-to-locations @FR4 @M1
  f.Scenario("The committed city data passes", ({ When, Then }) => {
    let exitCode = -1;
    When("the city data check runs on the committed file", async () => {
      exitCode = await runCityDataCheck({
        readFile: async (path) => readFileSync(path, "utf8"),
        log: () => {},
      });
    });
    Then("it passes", () => {
      expect(exitCode).toBe(0);
    });
  });

  // @add-city-coordinates-to-locations @FR4 @M1
  f.ScenarioOutline(
    "A broken city data file fails",
    ({ Given, When, Then }, variables) => {
      let dataset: CityDataset | undefined;
      let errors: string[] = [];
      Given("committed city data with <defect>", () => {
        dataset = buildBrokenDataset(variables.defect);
      });
      When("the check of the city data runs", () => {
        errors = checkCityData(dataset, RELEASE_ZONES, []);
      });
      Then("it fails with an error that names <named>", () => {
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain(BROKEN_CITY_NAME);
        if (variables.named.includes("latitude"))
          expect(errors[0]).toContain("latitude");
        if (variables.named.includes("longitude"))
          expect(errors[0]).toContain("longitude");
      });
    },
  );
});
