// Verifies FR7, FR8 of bind-day-periods-to-sun.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterEach, expect, vi } from "vitest";
import {
  buildDeviceTimeLocation,
  getSunCoordinates,
  getZoneCoordinates,
  LocationKind,
} from "@/model";
import { buildLocation } from "@/test/factories/buildLocation";

const feature = await loadFeature("../day_periods_coordinates_unit.feature");

const KAZAN = { latitude: 55.8, longitude: 49.1 };
const MOSCOW_ZONE = "Europe/Moscow";
const ZONE_WITHOUT_COORDINATES = "Etc/GMT-5";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let location: Parameters<typeof getSunCoordinates> | undefined;
  let deviceZoneId = "";
  const geolocationSpy = vi.fn();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // @bind-day-periods-to-sun @FR7
  f.Scenario("A city with its own coordinates", ({ Given, When, Then }) => {
    Given("the location Kazan holds the coordinates 55.8, 49.1", () => {
      location = [
        buildLocation({
          label: "Kazan",
          timeZoneId: MOSCOW_ZONE,
          coordinates: KAZAN,
        }),
      ];
    });
    When("its day periods are computed", () => undefined);
    Then(
      "they are those of 55.8, 49.1, not those of the zone city Moscow",
      () => {
        expect(
          getSunCoordinates(...(location as NonNullable<typeof location>)),
        ).toEqual(KAZAN);
        expect(
          getSunCoordinates(...(location as NonNullable<typeof location>)),
        ).not.toEqual(getZoneCoordinates(MOSCOW_ZONE));
      },
    );
  });

  // @bind-day-periods-to-sun @FR7
  f.Scenario("A city stored before coordinates", ({ Given, When, Then }) => {
    Given(
      "the location Kazan in {string} holds no coordinates",
      (_ctx, zone: string) => {
        location = [buildLocation({ label: "Kazan", timeZoneId: zone })];
        expect(location[0].coordinates).toBeUndefined();
      },
    );
    When("its day periods are computed", () => undefined);
    Then(
      "they are those of the zone coordinates of {string}",
      (_ctx, zone: string) => {
        expect(
          getSunCoordinates(...(location as NonNullable<typeof location>)),
        ).toEqual(getZoneCoordinates(zone));
      },
    );
  });

  // @bind-day-periods-to-sun @FR7
  f.Scenario("The device time location", ({ Given, When, Then, And }) => {
    Given("the device time zone is {string}", (_ctx, zone: string) => {
      deviceZoneId = zone;
      vi.stubGlobal("navigator", {
        geolocation: { getCurrentPosition: geolocationSpy },
      });
    });
    When("the day periods of the device time location are computed", () => {
      location = [buildDeviceTimeLocation(deviceZoneId)];
    });
    Then(
      "they are those of the zone coordinates of {string}",
      (_ctx, zone: string) => {
        expect(
          getSunCoordinates(...(location as NonNullable<typeof location>)),
        ).toEqual(getZoneCoordinates(zone));
        expect((location as NonNullable<typeof location>)[0].kind).toBe(
          LocationKind.DEVICE_TIME,
        );
      },
    );
    And("the device's coordinates were not requested", () => {
      expect(geolocationSpy).not.toHaveBeenCalled();
    });
  });

  // @bind-day-periods-to-sun @FR8
  f.ScenarioOutline("No coordinates", ({ Given, When, Then }, variables) => {
    Given("<location>", () => {
      const byDescription: Record<
        string,
        Parameters<typeof getSunCoordinates>
      > = {
        UTC: [buildLocation({ label: "UTC", timeZoneId: "UTC" })],
        "a city location in a zone without zone coordinates and without its own coordinates":
          [
            buildLocation({
              label: "Nowhere",
              timeZoneId: ZONE_WITHOUT_COORDINATES,
            }),
          ],
        "the device time location while the device time zone has no zone coordinates":
          [buildDeviceTimeLocation(ZONE_WITHOUT_COORDINATES)],
      };
      location = byDescription[variables.location];
      expect(location).toBeDefined();
    });
    When("its day periods are computed", () => undefined);
    Then("it has no day periods", () => {
      expect(
        getSunCoordinates(...(location as NonNullable<typeof location>)),
      ).toBeUndefined();
    });
  });
});
