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
import {
  buildInput,
  cityRow,
} from "@/test/cityData/compileCityData.fixtures.ts";
import { cityLine, runCompile } from "@/test/cityData/compileWorld.ts";
import { runCityDataCheck } from "../../../../../scripts/cityData/check.ts";
import { checkCityData } from "../../../../../scripts/cityData/checkCityData.ts";
import type { CityDataset } from "../../../../../scripts/cityData/cityDataTypes.ts";
import { compileCityData } from "../../../../../scripts/cityData/compileCityData.ts";
import { DATASET_PATH } from "../../../../../scripts/cityData/constants.ts";

const feature = await loadFeature("../city_data_coordinates.feature");

const COMMITTED_CITY_DATA = readFileSync(DATASET_PATH, "utf8");
const NAME_COLUMN = 1;
const LATITUDE_COLUMN = 6;
const LONGITUDE_COLUMN = 7;
const TOWN_ID = 6001;
const BROKEN_CITY_NAME = "Brokenville";

function tenthsOf(degrees: number): number {
  return Math.round(degrees * COORDINATE_TENTHS_PER_DEGREE) + 0;
}

function parseCityTuples(text: string): CityDataset["cities"] {
  return (JSON.parse(text) as CityDataset).cities;
}

function findCity(cities: CityDataset["cities"], name: string) {
  const city = cities.find((tuple) => tuple[NAME_COLUMN] === name);
  if (city === undefined) throw new Error(`No city ${name}`);
  return city;
}

function expectCoordinates(
  cities: CityDataset["cities"],
  name: string,
  latitude: number,
  longitude: number,
) {
  const city = findCity(cities, name);
  expect([city[LATITUDE_COLUMN], city[LONGITUDE_COLUMN]]).toEqual([
    tenthsOf(latitude),
    tenthsOf(longitude),
  ]);
}

function compileOneCity(name: string, latitude: number, longitude: number) {
  return compileCityData(
    buildInput({
      cityRows: [cityRow({ geonameId: 1, name, latitude, longitude })],
    }),
  ).cities;
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
  // @add-city-coordinates-to-locations @FR1 @M3
  f.Scenario("A city carries its coordinates", ({ When, Then }) => {
    let cities: CityDataset["cities"] = [];
    When(
      'the city data is compiled from a dump in which "Kazan" stands at 55.78874, 49.12214',
      () => {
        cities = compileOneCity("Kazan", 55.78874, 49.12214);
      },
    );
    Then('"Kazan" carries the coordinates 55.8, 49.1', () => {
      expectCoordinates(cities, "Kazan", 55.8, 49.1);
    });
  });

  // @add-city-coordinates-to-locations @FR1 @M3
  f.Scenario(
    "Southern and western coordinates are negative",
    ({ When, Then }) => {
      let cities: CityDataset["cities"] = [];
      When(
        'the city data is compiled from a dump in which "Quito" stands at -0.22985, -78.52495',
        () => {
          cities = compileOneCity("Quito", -0.22985, -78.52495);
        },
      );
      Then('"Quito" carries the coordinates -0.2, -78.5', () => {
        expectCoordinates(cities, "Quito", -0.2, -78.5);
      });
    },
  );

  // @add-city-coordinates-to-locations @FR1 @M3
  f.ScenarioOutline(
    "Sample cities of the committed city data",
    ({ When, Then }, variables) => {
      let cities: CityDataset["cities"] = [];
      When("the committed city data is read", () => {
        cities = parseCityTuples(COMMITTED_CITY_DATA);
      });
      Then(
        "<city> carries exactly the coordinates <latitude>, <longitude>",
        () => {
          expectCoordinates(
            cities,
            variables.city,
            Number(variables.latitude),
            Number(variables.longitude),
          );
        },
      );
    },
  );

  // @add-city-coordinates-to-locations @FR1 @FR4
  f.Scenario(
    "A row without coordinates stops the compile",
    ({ Given, When, Then, And }) => {
      let run: Awaited<ReturnType<typeof runCompile>> | undefined;
      let cityLines: string[] = [];
      Given("a dump in which one city row has an empty latitude", () => {
        cityLines = [
          cityLine(1, "Kazan", "Europe/Moscow", 500_000, { latitude: "" }),
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
