// Implements FR2, FR3, FR4 of add-city-coordinates-to-locations (M2, M3).
import { readFileSync } from "node:fs";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { COORDINATE_TENTHS_PER_DEGREE } from "@/constants";
import {
  type CompileRun,
  compile,
  VALID_SCENARIO,
} from "@/test/zoneRules/compileWorld";
import {
  ZONE_COORDINATES_FILE,
  ZONE_RULES_RELEASE_FILE,
} from "../../../../../app.config";
import { DATASET_PATH } from "../../../../../scripts/cityData/constants.ts";
import { loadCitySearchData } from "../../../../../scripts/zoneData/loadCitySearchData.ts";
import { loadZoneData } from "../../../../../scripts/zoneData/loadZoneData.ts";
import { checkZoneCoordinates } from "../../../../../scripts/zoneRules/checkZoneCoordinates.ts";

const feature = await loadFeature("../zone_rules_coordinates.feature");

const TENTHS_PER_DEGREE = COORDINATE_TENTHS_PER_DEGREE;
const BUNDLED_RELEASE = (
  JSON.parse(readFileSync(ZONE_RULES_RELEASE_FILE, "utf8")) as {
    release: string;
  }
).release;
const COMMITTED_TEXT = readFileSync(ZONE_COORDINATES_FILE, "utf8");
const BROKEN_ZONE_ID = "Europe/Moscow";
const OTHER_RELEASE = "2026e";
const LATITUDE_BELOW_RANGE_TENTHS = -910;

const tenthsOf = (degrees: number) =>
  Math.round(degrees * TENTHS_PER_DEGREE) + 0;
const readZones = (text: string) =>
  (JSON.parse(text) as { zones: Record<string, number[]> }).zones;
const zoneTable = (zoneId: string, coordinates: string) =>
  `# zone table\nXX\t${coordinates}\t${zoneId}\n`;

function buildBrokenText(defect: string): string {
  const document = JSON.parse(COMMITTED_TEXT);
  if (defect.includes("name the release")) {
    document.release = OTHER_RELEASE;
  } else if (defect.includes("latitude -91")) {
    document.zones[BROKEN_ZONE_ID] = [LATITUDE_BELOW_RANGE_TENTHS, 0];
  } else {
    delete document.zones[BROKEN_ZONE_ID];
  }
  return JSON.stringify(document);
}

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const checkText = (text: string) =>
    checkZoneCoordinates(text, BUNDLED_RELEASE, loadZoneData().zoneCities);

  // @add-city-coordinates-to-locations @FR2 @M3
  f.Scenario(
    "A zone carries the coordinates of its principal place",
    ({ Given, When, Then, And }) => {
      let zoneTableText = "";
      let run: CompileRun;
      Given(
        "a release archive whose zone table lists {string} at {string}",
        (_ctx, zoneId: string, coordinates: string) => {
          zoneTableText = zoneTable(zoneId, coordinates);
        },
      );
      When("the zone rules compile command runs", async () => {
        run = await compile({ ...VALID_SCENARIO, zoneTable: zoneTableText });
      });
      Then(
        "the zone coordinates hold {string} at 55.8, 37.6",
        (_ctx, zoneId: string) => {
          const text = run.writtenFiles.get(ZONE_COORDINATES_FILE) as string;
          expect(readZones(text)[zoneId]).toEqual([
            tenthsOf(55.8),
            tenthsOf(37.6),
          ]);
        },
      );
      And("the file names the release of the archive", () => {
        const text = run.writtenFiles.get(ZONE_COORDINATES_FILE) as string;
        expect(JSON.parse(text).release).toBe(BUNDLED_RELEASE);
      });
    },
  );

  // @add-city-coordinates-to-locations @FR2 @M3
  f.Scenario(
    "Coordinates written in degrees and minutes",
    ({ Given, When, Then }) => {
      let zoneTableText = "";
      let run: CompileRun;
      Given(
        "a release archive whose zone table lists {string} at {string}",
        (_ctx, zoneId: string, coordinates: string) => {
          zoneTableText = zoneTable(zoneId, coordinates);
        },
      );
      When("the zone rules compile command runs", async () => {
        run = await compile({ ...VALID_SCENARIO, zoneTable: zoneTableText });
      });
      Then(
        "the zone coordinates hold {string} at 22.5, 88.4",
        (_ctx, zoneId: string) => {
          const text = run.writtenFiles.get(ZONE_COORDINATES_FILE) as string;
          expect(readZones(text)[zoneId]).toEqual([
            tenthsOf(22.5),
            tenthsOf(88.4),
          ]);
        },
      );
    },
  );

  // @add-city-coordinates-to-locations @FR2 @M3
  f.ScenarioOutline(
    "Sample zone cities of the committed zone coordinates",
    ({ When, Then }, variables) => {
      let zones: Record<string, number[]> = {};
      When(
        "the committed zone coordinates of the release 2026f are read",
        () => {
          zones = readZones(COMMITTED_TEXT);
        },
      );
      Then(
        "<zone> carries exactly the coordinates <latitude>, <longitude>",
        () => {
          expect(zones[variables.zone]).toEqual([
            tenthsOf(Number(variables.latitude)),
            tenthsOf(Number(variables.longitude)),
          ]);
        },
      );
    },
  );

  // @add-city-coordinates-to-locations @FR3
  f.Scenario("A failed compile writes nothing", ({ Given, When, Then }) => {
    let run: CompileRun;
    let verifyStatus = VALID_SCENARIO.verifyStatus;
    Given("a release archive whose signature does not verify", () => {
      verifyStatus = "";
    });
    When("the zone rules compile command runs", async () => {
      run = await compile({ ...VALID_SCENARIO, verifyStatus });
    });
    Then(
      "neither the release file nor the zone coordinates file is changed",
      () => {
        expect(run.exitCode).not.toBe(0);
        expect(run.writtenFiles.size).toBe(0);
      },
    );
  });

  // @add-city-coordinates-to-locations @FR3
  f.Scenario("No network at build time", ({ When, Then, And }) => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;
    let zoneCities: ReturnType<typeof loadCitySearchData>["zoneCities"] = [];
    When("the search data is loaded without network access", () => {
      fetchSpy = vi.spyOn(globalThis, "fetch");
      zoneCities = loadCitySearchData(DATASET_PATH).zoneCities;
    });
    Then("no request is made", () => {
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
    And("the search data holds the coordinates of the zone cities", () => {
      const moscow = zoneCities.find(
        (record) => record.timeZoneId === BROKEN_ZONE_ID,
      );
      expect([moscow?.latitudeTenths, moscow?.longitudeTenths]).toEqual(
        readZones(COMMITTED_TEXT)[BROKEN_ZONE_ID],
      );
    });
  });

  // @add-city-coordinates-to-locations @FR4 @M2
  f.Scenario("The committed zone coordinates pass", ({ When, Then }) => {
    let errors: string[] = [];
    When(
      "the zone coordinates check runs on the committed files without network access",
      () => {
        errors = checkText(COMMITTED_TEXT);
      },
    );
    Then("it passes", () => {
      expect(errors).toEqual([]);
    });
  });

  // @add-city-coordinates-to-locations @FR4 @M2
  f.ScenarioOutline(
    "A broken zone coordinates file fails",
    ({ Given, When, Then }, variables) => {
      let text = "";
      let errors: string[] = [];
      Given("committed zone coordinates with <defect>", () => {
        text = buildBrokenText(variables.defect);
      });
      When("the zone coordinates check runs", () => {
        errors = checkText(text);
      });
      Then("it fails with an error that names <named>", () => {
        expect(errors).toHaveLength(1);
        const [error] = errors as [string];
        if (variables.named === "both releases") {
          expect(error).toContain(OTHER_RELEASE);
          expect(error).toContain(BUNDLED_RELEASE);
        } else if (variables.named === "the zone and the latitude") {
          expect(error).toContain(BROKEN_ZONE_ID);
          expect(error).toContain("latitude");
        } else {
          expect(error).toContain(BROKEN_ZONE_ID);
        }
      });
    },
  );

  // @add-city-coordinates-to-locations @FR4
  f.Scenario("UTC needs no coordinates", ({ Given, When, Then }) => {
    let text = "";
    let errors: string[] = [];
    Given(
      "the zone coordinates hold no entry for {string}",
      (_ctx, zoneId: string) => {
        const document = JSON.parse(COMMITTED_TEXT);
        delete document.zones[zoneId];
        text = JSON.stringify(document);
      },
    );
    When("the zone coordinates check runs", () => {
      errors = checkText(text);
    });
    Then("it passes", () => {
      expect(errors).toEqual([]);
    });
  });
});
