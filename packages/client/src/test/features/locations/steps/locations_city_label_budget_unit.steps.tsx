// Verifies NFR-P1, M3 of show-city-labels-in-interface-language.

import zoneCities from "virtual:zone-cities";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react/pure";
import i18n from "i18next";
import type { ReactNode } from "react";
import { expect, type MockInstance, vi } from "vitest";
import {
  createCompositeCitySearch,
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import { type CitySearch, LocationsLoadStatus } from "@/ports";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { BUDGET_ROW_COUNT, buildBudgetLocations } from "./rowBudgetWorld";

const feature = await loadFeature(
  "../locations_city_label_budget_unit.feature",
);

const FIRST_MOMENT = "2026-07-15T12:00:00Z";
const NEXT_MINUTE = "2026-07-15T12:01:00Z";
const BUDGET_ZONE = "UTC";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let workCount: WorkCount | undefined;
  let getCityLabelSpy: MockInstance<CitySearch["getCityLabel"]>;
  let latestLocations: ReturnType<typeof useLocations>;
  let clock: ReturnType<typeof createSwitchableClock>;
  let tickScheduler: ReturnType<typeof createManualTickScheduler>;

  f.BeforeEachScenario(async () => {
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(() => {
    workCount?.stop();
    cleanup();
    vi.restoreAllMocks();
  });
  f.AfterAllScenarios(async () => {
    await i18n.changeLanguage("ru");
  });

  const presentFiftyLoaded = async () => {
    const search = createCompositeCitySearch(zoneCities);
    getCityLabelSpy = vi.spyOn(search, "getCityLabel");
    clock = createSwitchableClock(FIRST_MOMENT, BUDGET_ZONE);
    tickScheduler = createManualTickScheduler();
    const backend = createInMemoryLocationBackend({
      status: LocationsLoadStatus.LOADED,
      locations: buildBudgetLocations(BUDGET_ROW_COUNT),
      homeLocationId: null,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocationsProvider
        repository={createInMemoryLocationRepository({ backend })}
        writeScheduler={immediateWriteScheduler}
        clock={clock}
        tickScheduler={tickScheduler}
        loadCitySearch={() => Promise.resolve(search)}
      >
        {children}
      </LocationsProvider>
    );
    renderHook(
      () => {
        latestLocations = useLocations();
      },
      { wrapper },
    );
    await waitFor(() =>
      expect(getCityLabelSpy).toHaveBeenCalledTimes(BUDGET_ROW_COUNT),
    );
    expect(latestLocations.rows).toHaveLength(BUDGET_ROW_COUNT);
    getCityLabelSpy.mockClear();
  };

  // @show-city-labels-in-interface-language @NFR-P1 @M3
  f.Scenario(
    "A minute tick asks for no city label",
    ({ Given, When, Then, And }) => {
      Given(
        "50 city locations have been presented with the zone cities data loaded",
        presentFiftyLoaded,
      );
      When("the same rows are presented again for the next minute tick", () => {
        workCount = startWorkCount();
        clock.moveTo(NEXT_MINUTE, BUDGET_ZONE);
        act(() => tickScheduler.runPending());
      });
      Then("the city search was asked for no city label", () => {
        expect(getCityLabelSpy).not.toHaveBeenCalled();
      });
      And("no formatter is built", () => {
        expect(workCount?.formatters()).toBe(0);
      });
    },
  );

  // @show-city-labels-in-interface-language @NFR-P1 @M3
  f.Scenario("A switch asks once per location", ({ Given, When, Then }) => {
    Given(
      "50 city locations have been presented with the zone cities data loaded",
      presentFiftyLoaded,
    );
    When("the interface language is switched", async () => {
      await act(async () => {
        await i18n.changeLanguage("ru");
      });
    });
    Then("the city search was asked for at most 50 city labels", () => {
      expect(getCityLabelSpy.mock.calls.length).toBeLessThanOrEqual(
        BUDGET_ROW_COUNT,
      );
      expect(getCityLabelSpy).toHaveBeenCalled();
    });
  });
});
