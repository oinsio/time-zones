// Implements FR5 of add-zone-rules-from-iana: executable scenarios of the known zones.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { afterEach, expect } from "vitest";
import { DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import {
  type FreshModules,
  startOnStaleEngine,
  stopStaleEngine,
} from "@/test/staleEngineWorld";

const feature = await loadFeature("../zone_rules_known_zones.feature");

const LANGUAGE = "en";
const DEVICE_ZONE_ID = "Asia/Almaty";
const COUNTRY_CODES_BY_LABEL: Record<string, string> = {
  "Ciudad Juárez": "MX",
  Kyiv: "UA",
};

type AddOutcome = ReturnType<FreshModules["model"]["reduceLocations"]>;

/** The one row a location shows at an instant, presented the way the list does. */
function presentRow(
  modules: FreshModules,
  outcome: AddOutcome,
  instant: string,
) {
  if (!outcome.ok) throw new Error("the location was not added");
  const { model, presenter, temporal } = modules;
  const momentInstant = temporal.Temporal.Instant.from(instant);
  const [row] = presenter.presentLocationRows(outcome.state.locations, {
    language: LANGUAGE,
    hourFormat: HourFormat.H24,
    zoneLabelParts: DEFAULT_PREFERENCES.zoneLabelParts,
    instant: momentInstant,
    translate: i18n.getFixedT(LANGUAGE),
    deviceTimeZoneId: DEVICE_ZONE_ID,
    homeLocationId: null,
    referenceOffsetMinutes: model.getReferenceOffsetMinutes(
      outcome.state,
      momentInstant,
    ),
    referenceDay: model.getReferenceDay(outcome.state, momentInstant),
  });
  return row;
}

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let modules: FreshModules;
  let addOutcome: AddOutcome;

  afterEach(stopStaleEngine);

  const givenEngineRejects = async (_ctx: unknown, zoneId: string) => {
    modules = (
      await startOnStaleEngine({ staleZones: {}, rejectedZones: [zoneId] })
    ).modules;
  };
  const addLocation = (_ctx: unknown, label: string, zoneId: string) => {
    addOutcome = modules.model.reduceLocations(
      modules.model.INITIAL_WORLD_CLOCK_STATE,
      {
        type: modules.model.LocationCommandType.ADD_LOCATION,
        label,
        timeZoneId: zoneId,
        countryCode: COUNTRY_CODES_BY_LABEL[label] ?? "",
      },
    );
  };
  const expectRowShows = (
    _ctx: unknown,
    instant: string,
    time: string,
    offset: string,
  ) => {
    const row = presentRow(modules, addOutcome, instant);
    expect([row.localTimeLabel, row.utcOffsetLabel]).toEqual([time, offset]);
  };

  // @add-zone-rules-from-iana @FR5 @M3
  f.Scenario(
    "A zone the engine rejects is known",
    ({ Given, When, Then, And }) => {
      Given("the engine rejects {string}", givenEngineRejects);
      When("the user adds {string} with the zone {string}", addLocation);
      Then(
        "the location is added with the zone {string}",
        (_ctx, zoneId: string) => {
          if (!addOutcome.ok) throw new Error("the location was not added");
          expect(addOutcome.state.locations.map((l) => l.timeZoneId)).toEqual([
            zoneId,
          ]);
        },
      );
      And("at {string} its row shows {string} and {string}", expectRowShows);
    },
  );

  // @add-zone-rules-from-iana @FR5 @M3
  f.Scenario("A legacy name stays canonical", ({ Given, When, Then, And }) => {
    Given("the engine rejects {string}", givenEngineRejects);
    When("the user adds {string} with the zone {string}", addLocation);
    Then(
      "the location is stored with the zone {string}",
      (_ctx, zoneId: string) => {
        if (!addOutcome.ok) throw new Error("the location was not added");
        const parsed = modules.model.parseStoredLocations({
          locations: addOutcome.state.locations,
        });
        expect(parsed.ok && parsed.locations.map((l) => l.timeZoneId)).toEqual([
          zoneId,
        ]);
      },
    );
    And("at {string} its row shows {string} and {string}", expectRowShows);
  });

  // @add-zone-rules-from-iana @FR5
  f.Scenario("A name in neither is unknown", ({ When, Then }) => {
    When(
      "a location with the zone {string} is added",
      async (_ctx, zoneId: string) => {
        modules = (await startOnStaleEngine()).modules;
        addLocation(_ctx, "Olympus", zoneId);
      },
    );
    Then("the location is rejected as an unknown time zone", () => {
      expect(addOutcome).toEqual({
        ok: false,
        error: modules.model.LocationErrorCode.UNKNOWN_TIME_ZONE,
      });
    });
  });
});
