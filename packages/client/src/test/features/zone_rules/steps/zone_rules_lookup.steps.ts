// Implements FR1, FR4 of add-zone-rules-from-iana: executable scenarios of the lookup.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { afterEach, expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  getLocalTimeType,
  type LocalTimeType,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "@/lib/zoneRules";
import { DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import { committedRelease } from "@/test/installZoneRules";
import {
  type FreshModules,
  startOnStaleEngine,
  stopStaleEngine,
} from "@/test/staleEngineWorld";

const feature = await loadFeature("../zone_rules_lookup.feature");

const MILLISECONDS_PER_SECOND = 1000;
const MINUS_SIGN = "−";
const LANGUAGE = "en";
const ALMATY_ZONE_ID = "Asia/Almaty";
const SHOWN_TIME = "13:00";
const REQUESTED_TIME = "12:30";

function readLocalTimeType(zoneId: string, instant: string): LocalTimeType {
  const zoneRules = committedRelease.zones.get(zoneId);
  if (!zoneRules) throw new Error(`The release lacks ${zoneId}`);
  return getLocalTimeType(
    zoneRules,
    Temporal.Instant.from(instant).epochMilliseconds / MILLISECONDS_PER_SECOND,
  );
}

/** Seconds east of UTC of a text such as `−04:00` or `+05:30`. */
function readOffsetSeconds(offsetText: string): number {
  const sign = offsetText.startsWith(MINUS_SIGN) ? -1 : 1;
  const [hours, minutes] = offsetText.slice(1).split(":").map(Number);
  return sign * (hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE);
}

function presentAlmaty(modules: FreshModules, instantText: string) {
  const { model, presenter, temporal } = modules;
  const almaty = {
    id: "Asia/Almaty|Almaty",
    kind: model.LocationKind.CITY,
    timeZoneId: ALMATY_ZONE_ID,
    label: "Almaty",
    countryCode: "KZ",
  };
  const state = {
    ...model.INITIAL_WORLD_CLOCK_STATE,
    deviceTimeZoneId: ALMATY_ZONE_ID,
    locations: [almaty],
  };
  const instant = temporal.Temporal.Instant.from(instantText);
  const referenceDay = model.getReferenceDay(state, instant);
  const requestedWallTime = temporal.Temporal.PlainTime.from(REQUESTED_TIME);
  const [row] = presenter.presentLocationRows([almaty], {
    language: LANGUAGE,
    hourFormat: HourFormat.H24,
    zoneLabelParts: DEFAULT_PREFERENCES.zoneLabelParts,
    instant,
    translate: i18n.getFixedT(LANGUAGE),
    deviceTimeZoneId: ALMATY_ZONE_ID,
    homeLocationId: null,
    referenceOffsetMinutes: model.getReferenceOffsetMinutes(state, instant),
    referenceDay,
    wallClockNote: {
      placement: model.WallClockNotePlacement.ROW,
      target: {
        kind: model.WallTimeTargetKind.LOCATION,
        locationId: almaty.id,
      },
      status: model.WallClockStatus.GAP,
      requestedWallTime,
    },
  });
  const { cells } = presenter.presentHourStrip(ALMATY_ZONE_ID, {
    day: referenceDay,
    referenceZoneId: ALMATY_ZONE_ID,
    language: LANGUAGE,
    hourFormat: HourFormat.H24,
  });
  const hourCell = cells.find((cell) => cell.key === instant.toString());
  const dateBar = presenter.presentDateBar({
    effectiveDate: instant.toZonedDateTimeISO(ALMATY_ZONE_ID).toPlainDate(),
    today: instant.toZonedDateTimeISO(ALMATY_ZONE_ID).toPlainDate(),
    isPinned: true,
    gap: {
      requestedWallTime,
      shownWallTime: temporal.Temporal.PlainTime.from(SHOWN_TIME),
    },
    language: LANGUAGE,
    hourFormat: HourFormat.H24,
    translate: i18n.getFixedT(LANGUAGE),
  });
  return { row, hourCell, dateBar };
}

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let localTimeType: LocalTimeType;
  let modules: FreshModules;

  afterEach(stopStaleEngine);

  const givenStaleAlmaty = async () => {
    modules = (await startOnStaleEngine()).modules;
  };

  // @add-zone-rules-from-iana @FR4 @M3
  f.ScenarioOutline(
    "Lookup across the three ranges",
    ({ When, Then }, variables: Record<string, string>) => {
      When("the local time type of <zone> at <instant> is read", () => {
        localTimeType = readLocalTimeType(variables.zone, variables.instant);
      });
      Then(
        "the offset is <offset> and the designation is <designation>",
        () => {
          expect(localTimeType.utcOffsetSeconds).toBe(
            readOffsetSeconds(variables.offset),
          );
          expect(localTimeType.designation).toBe(variables.designation);
        },
      );
    },
  );

  // @add-zone-rules-from-iana @FR4
  f.Scenario("Before the cutoff the cutoff type holds", ({ When, Then }) => {
    When(
      "the local time type of {string} at {string} is read",
      (_ctx, zoneId: string, instant: string) => {
        localTimeType = readLocalTimeType(zoneId, instant);
      },
    );
    Then(
      "it is the type in force at {string}, UTC+3 {string}",
      (_ctx, cutoffInstant: string, designation: string) => {
        expect(localTimeType).toEqual(
          readLocalTimeType("Europe/Moscow", cutoffInstant),
        );
        expect(localTimeType.utcOffsetSeconds).toBe(3 * SECONDS_PER_HOUR);
        expect(localTimeType.designation).toBe(designation);
      },
    );
  });

  // @add-zone-rules-from-iana @FR1 @UX1 @M3
  f.Scenario(
    "A stale engine shows the current rules",
    ({ Given, And, When, Then }) => {
      let rowTexts: string[] = [];
      Given("the engine's own data places {string} at UTC+6", givenStaleAlmaty);
      And("the list contains Almaty", () => undefined);
      When("the rows are presented at {string}", (_ctx, instant: string) => {
        const { row } = presentAlmaty(modules, instant);
        rowTexts = [row.localTimeLabel, row.utcOffsetLabel];
      });
      Then(
        "the Almaty row shows {string} and {string}",
        (_ctx, time: string, offset: string) => {
          expect(rowTexts).toEqual([time, offset]);
        },
      );
    },
  );

  // @add-zone-rules-from-iana @FR1 @UX1 @M3
  f.Scenario("Temporal and the presenter agree", ({ Given, When, Then }) => {
    let presented: ReturnType<typeof presentAlmaty>;
    Given("the engine's own data places {string} at UTC+6", givenStaleAlmaty);
    When(
      "the local time, the hour labels, the wall-time hint and the date bar of Almaty are presented at {string}",
      (_ctx, instant: string) => {
        presented = presentAlmaty(modules, instant);
      },
    );
    Then(
      "every one of them shows the {string} local time of UTC+5",
      (_ctx, time: string) => {
        const [hourText] = time.split(":");
        expect(presented.row.localTimeLabel).toBe(time);
        expect(presented.hourCell?.hourText).toBe(hourText);
        expect(presented.row.wallTimeHint).toContain(time);
        expect(presented.dateBar.gapNote).toContain(time);
      },
    );
  });

  // @add-zone-rules-from-iana @FR1 @UX1
  f.Scenario(
    "Wall-clock resolution uses the rules",
    ({ Given, When, Then }) => {
      let resolved: ReturnType<FreshModules["model"]["resolveWallClock"]>;
      Given("the engine's own data places {string} at UTC+6", givenStaleAlmaty);
      When(
        "the wall-clock time {string} in {string} is resolved",
        (_ctx, wallClock: string, zoneId: string) => {
          const { model, temporal } = modules;
          resolved = model.resolveWallClock(
            zoneId,
            temporal.Temporal.PlainDateTime.from(wallClock),
          );
        },
      );
      Then(
        "it resolves to {string} with the status {string}",
        (_ctx, instant: string, status: string) => {
          expect(resolved.instant.toString()).toBe(
            Temporal.Instant.from(instant).toString(),
          );
          expect(resolved.status).toBe(status);
        },
      );
    },
  );
});
