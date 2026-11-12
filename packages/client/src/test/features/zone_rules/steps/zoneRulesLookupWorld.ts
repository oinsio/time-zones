// Implements FR1, FR4 of add-zone-rules-from-iana: helpers of the lookup scenarios.
import i18n from "i18next";
import { Temporal } from "@/lib/temporal";
import {
  getLocalTimeType,
  type LocalTimeType,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "@/lib/zoneRules";
import { DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import { committedRelease } from "@/test/installZoneRules";
import type { FreshModules } from "@/test/staleEngineWorld";

export const MILLISECONDS_PER_SECOND = 1000;
export const MINUS_SIGN = "−";
export const LANGUAGE = "en";
export const ALMATY_ZONE_ID = "Asia/Almaty";
export const SHOWN_TIME = "13:00";
export const REQUESTED_TIME = "12:30";

export function readLocalTimeType(
  zoneId: string,
  instant: string,
): LocalTimeType {
  const zoneRules = committedRelease.zones.get(zoneId);
  if (!zoneRules) throw new Error(`The release lacks ${zoneId}`);
  return getLocalTimeType(
    zoneRules,
    Temporal.Instant.from(instant).epochMilliseconds / MILLISECONDS_PER_SECOND,
  );
}

/** Seconds east of UTC of a text such as `−04:00` or `+05:30`. */
export function readOffsetSeconds(offsetText: string): number {
  const sign = offsetText.startsWith(MINUS_SIGN) ? -1 : 1;
  const [hours, minutes] = offsetText.slice(1).split(":").map(Number);
  return sign * (hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE);
}

export function presentAlmaty(modules: FreshModules, instantText: string) {
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
