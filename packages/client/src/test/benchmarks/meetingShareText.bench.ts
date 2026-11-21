// Verifies NFR-P1 of add-meeting-share-dialog (ADR-0008): the timing is reported, never asserted.
import i18n from "i18next";
import { bench, describe } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getMeetingInvitation, INITIAL_WORLD_CLOCK_STATE } from "@/model";
import { HourFormat, SHARE_ZONE_LABEL_PARTS } from "@/preferences";
import { presentMeetingShareText } from "@/presenter";
import {
  BUDGET_ROW_COUNT,
  buildBudgetLocations,
} from "../features/locations/steps/rowBudgetWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;
const SHARED_LOCATION_COUNT = 20;
const SHARE_LANGUAGE = "en";
const REFERENCE_ZONE = "Asia/Almaty";
const options = {
  warmupIterations: WARMUP_ITERATIONS,
  iterations: SAMPLE_ITERATIONS,
};

const invitation = getMeetingInvitation(
  {
    ...INITIAL_WORLD_CLOCK_STATE,
    locations: buildBudgetLocations(BUDGET_ROW_COUNT).slice(
      0,
      SHARED_LOCATION_COUNT,
    ),
    meeting: {
      start: Temporal.Instant.from("2026-03-08T04:00:00Z"),
      end: Temporal.Instant.from("2026-03-08T06:00:00Z"),
    },
  },
  [],
);

const buildText = () => {
  if (invitation === undefined) return;
  presentMeetingShareText({
    invitation,
    referenceZoneId: REFERENCE_ZONE,
    hourFormat: HourFormat.H24,
    shareZoneLabelParts: SHARE_ZONE_LABEL_PARTS,
    language: SHARE_LANGUAGE,
    translate: i18n.getFixedT(SHARE_LANGUAGE),
    getCityLabel: ({ label }) => label,
  });
};

describe("meeting share text", () => {
  bench("build the text for 20 locations, first", buildText, {
    warmupIterations: 0,
    iterations: 1,
  });
  bench("build the text for 20 locations again", buildText, options);
});
