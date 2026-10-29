import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react/pure";
import i18n from "i18next";
import { useState } from "react";
import { expect, vi } from "vitest";
import { buildLocation } from "@/test/factories/buildLocation";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import { createHomeLocationWorld } from "./homeLocationWorld";

const feature = await loadFeature("../home_location_menu_unit.feature");

const UNKNOWN_ZONE_LABEL = "Olympus";
const UNKNOWN_ZONE_ID = "Nowhere/Olympus";
const CITY_SEPARATOR = " and ";
const OUTSIDE_BUTTON_NAME = "Outside";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const home = createHomeLocationWorld();
  const { world } = home;
  const { givenList, givenHome, givenOpen, whenOpensMenu, thenMenuOffers } =
    home.steps;

  f.BeforeEachScenario(async () => {
    vi.restoreAllMocks();
    await home.reset();
  });
  f.AfterEachScenario(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.resetModules();
  });
  f.AfterAllScenarios(world.finish);

  let initialCities: string[] = [];
  const givenNoPointerEvents = () => {
    vi.stubGlobal("PointerEvent", undefined);
  };
  /** Renders the menu of every city on an engine without Pointer Events. */
  const renderLegacyList = async (cities: string[]) => {
    initialCities = cities;
    vi.resetModules();
    const { LocationMenu } = await import("@/views/shared/LocationMenu");
    const LegacyList = () => {
      const [shownCities, setShownCities] = useState(cities);
      return (
        <div>
          <button type="button">{OUTSIDE_BUTTON_NAME}</button>
          <ul>
            {shownCities.map((city) => (
              <li key={city}>
                <span>{city}</span>
                <LocationMenu
                  city={city}
                  items={[
                    {
                      label: i18n.t("locations.remove"),
                      onSelect: () =>
                        setShownCities(
                          shownCities.filter((shownCity) => shownCity !== city),
                        ),
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        </div>
      );
    };
    render(<LegacyList />);
  };
  const legacyMenuButton = (city: string) =>
    screen.getByRole("button", {
      name: i18n.t("locations.locationMenu", { city }),
    });
  const shownCities = () =>
    screen.queryAllByRole("listitem").map((row) => row.firstChild?.textContent);

  // @set-home-location-and-show-differences @FR11
  f.Scenario("Menu of a row that is not home", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    When("the user opens the location menu of {string}", whenOpensMenu);
    Then("the menu offers {string}", thenMenuOffers);
  });

  // @set-home-location-and-show-differences @FR11
  f.Scenario("Menu of the home row", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    And("the app is open", givenOpen);
    When("the user opens the location menu of {string}", whenOpensMenu);
    Then("the menu offers {string}", thenMenuOffers);
  });

  // @set-home-location-and-show-differences @FR11
  f.Scenario(
    "No home item for an unknown zone",
    ({ Given, And, When, Then }) => {
      Given(
        "the list holds Moscow and a location whose zone the browser does not know",
        () =>
          world.setStoredLocations([
            buildLocation(cityEntry("Moscow")),
            buildLocation({
              label: UNKNOWN_ZONE_LABEL,
              timeZoneId: UNKNOWN_ZONE_ID,
              countryCode: "",
            }),
          ]),
      );
      And("the app is open", givenOpen);
      When("the user opens the location menu of {string}", whenOpensMenu);
      Then("the menu offers {string}", thenMenuOffers);
    },
  );

  // @set-home-location-and-show-differences @FR14
  f.Scenario("Remove without Pointer Events", ({ Given, And, When, Then }) => {
    Given("the engine has no Pointer Events", givenNoPointerEvents);
    And("the list is Almaty and Moscow", () =>
      renderLegacyList("Almaty and Moscow".split(CITY_SEPARATOR)),
    );
    When(
      "the user taps Moscow's location menu button and then {string}",
      () => {
        fireEvent.click(legacyMenuButton("Moscow"));
        fireEvent.click(
          screen.getByRole("menuitem", { name: i18n.t("locations.remove") }),
        );
      },
    );
    Then("the list is Almaty", () => expect(shownCities()).toEqual(["Almaty"]));
  });

  // @set-home-location-and-show-differences @FR14
  f.Scenario("Close by tapping outside", ({ Given, And, When, Then }) => {
    Given("the engine has no Pointer Events", givenNoPointerEvents);
    And("Moscow's location menu is open", async () => {
      await renderLegacyList(["Moscow"]);
      fireEvent.click(legacyMenuButton("Moscow"));
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
    When("the user taps outside the menu", () => {
      fireEvent.touchStart(
        screen.getByRole("button", { name: OUTSIDE_BUTTON_NAME }),
      );
    });
    Then("the menu is closed and the list is unchanged", () => {
      expect(screen.queryByRole("menu")).toBeNull();
      expect(shownCities()).toEqual(initialCities);
    });
  });
});
