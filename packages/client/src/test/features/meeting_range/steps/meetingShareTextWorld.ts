// Implements FR3, FR4, FR6, FR7 of add-meeting-share-dialog: builds the meeting share text from the model and the presenter.
import i18n from "i18next";
import { Temporal } from "@/lib/temporal";
import {
  getMeetingInvitation,
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
} from "@/model";
import {
  HourFormat,
  SHARE_ZONE_LABEL_PARTS,
  ZoneLabelPart,
} from "@/preferences";
import { presentMeetingShareText } from "@/presenter";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { ALMATY_ZONE, SAMPLE_END, SAMPLE_START } from "./meetingRangeWorld";

export const SHARE_LANGUAGE_CODES = { English: "en", Russian: "ru" } as const;

const CITY_LABELS_BY_LANGUAGE: Record<string, Record<string, string>> = {
  en: {},
  ru: {
    Almaty: "Алматы",
    Moscow: "Москва",
    Kolkata: "Калькутта",
    "New York": "Нью-Йорк",
  },
};

export const SHARE_ZONE_LABEL_PARTS_BY_NAME: Record<string, ZoneLabelPart[]> = {
  "abbreviation and UTC offset": [...SHARE_ZONE_LABEL_PARTS].reverse(),
  "abbreviation only": [ZoneLabelPart.ZONE_ABBREVIATION],
  "UTC offset only": [ZoneLabelPart.UTC_OFFSET],
  neither: [],
};

export const cityLocation = (label: string): Location =>
  buildLocation({ label, ...KNOWN_CITIES[label] });

export const UTC_LOCATION: Location = buildLocation({
  label: "UTC",
  timeZoneId: "UTC",
  countryCode: "",
});

export type MeetingShareTextWorld = {
  locations: Location[];
  includedLabels: string[] | undefined;
  language: string;
  hourFormat: HourFormat;
  zoneLabelParts: readonly ZoneLabelPart[];
  referenceZoneId: string;
  start: string;
  end: string;
};

export const createMeetingShareTextWorld = (): MeetingShareTextWorld => ({
  locations: ["Almaty", "Moscow", "Kolkata", "New York"].map(cityLocation),
  includedLabels: undefined,
  language: "en",
  hourFormat: HourFormat.H24,
  zoneLabelParts: SHARE_ZONE_LABEL_PARTS,
  referenceZoneId: ALMATY_ZONE,
  start: SAMPLE_START,
  end: SAMPLE_END,
});

/** The meeting share text of the world, line by line. */
export function buildShareTextLines(world: MeetingShareTextWorld): string[] {
  const excludedLocationIds = world.locations
    .filter(
      ({ label }) =>
        world.includedLabels !== undefined &&
        !world.includedLabels.includes(label),
    )
    .map(({ id }) => id);
  const invitation = getMeetingInvitation(
    {
      ...INITIAL_WORLD_CLOCK_STATE,
      locations: world.locations,
      meeting: {
        start: Temporal.Instant.from(world.start),
        end: Temporal.Instant.from(world.end),
      },
    },
    excludedLocationIds,
  );
  if (invitation === undefined) return [];
  return presentMeetingShareText({
    invitation,
    referenceZoneId: world.referenceZoneId,
    hourFormat: world.hourFormat,
    shareZoneLabelParts: world.zoneLabelParts,
    language: world.language,
    translate: i18n.getFixedT(world.language),
    getCityLabel: ({ label }) =>
      CITY_LABELS_BY_LANGUAGE[world.language][label] ?? label,
  }).split("\n");
}
