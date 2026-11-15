// Implements FR1, FR4 of add-city-coordinates-to-locations (M1, M3).
import { readFileSync } from "node:fs";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { COORDINATE_TENTHS_PER_DEGREE } from "@/constants";
import {
  buildInput,
  cityRow,
} from "@/test/cityData/compileCityData.fixtures.ts";
import { cityLine, runCompile } from "@/test/cityData/compileWorld.ts";
import type { CityDataset } from "../../../../../scripts/cityData/cityDataTypes.ts";
import { compileCityData } from "../../../../../scripts/cityData/compileCityData.ts";
import { DATASET_PATH } from "../../../../../scripts/cityData/constants.ts";

const feature = await loadFeature("../city_data_coordinates.feature");

const COMMITTED_CITY_DATA = readFileSync(DATASET_PATH, "utf8");
const NAME_COLUMN = 1;
const LATITUDE_COLUMN = 6;
const LONGITUDE_COLUMN = 7;

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
});
