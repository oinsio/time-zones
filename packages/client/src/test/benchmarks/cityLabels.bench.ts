// Verifies NFR-P1 of show-city-labels-in-interface-language.
import zoneCities from "virtual:zone-cities";
import { bench, describe } from "vitest";
import { createCompositeCitySearch } from "@/adapters";
import {
  BUDGET_ROW_COUNT,
  buildBudgetLocations,
} from "../features/locations/steps/rowBudgetWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;
const options = {
  warmupIterations: WARMUP_ITERATIONS,
  iterations: SAMPLE_ITERATIONS,
};

const search = createCompositeCitySearch(zoneCities);
const locations = buildBudgetLocations(BUDGET_ROW_COUNT);
let isRussianNext = false;

describe("city labels", () => {
  bench(
    "build the city labels of 50 locations after a language switch",
    () => {
      isRussianNext = !isRussianNext;
      const language = isRussianNext ? "ru" : "en";
      new Map(
        locations.map((location) => [
          location.id,
          search.getCityLabel(location.timeZoneId, location.label, language),
        ]),
      );
    },
    options,
  );
});
