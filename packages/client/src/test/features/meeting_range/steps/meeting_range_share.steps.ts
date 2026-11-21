// Verifies FR14, FR15, FR16, UX3 of add-grid-meeting-range-and-share.
// Verifies FR3, FR4, FR6, FR7 of add-meeting-share-dialog.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup, renderHook } from "@testing-library/react/pure";
import i18n from "i18next";
import { createElement, type ReactNode } from "react";
import { expect } from "vitest";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
  createInMemoryTextSharing,
  type InMemoryTextSharingOptions,
} from "@/adapters";
import {
  LocationsProvider,
  MeetingShareNotice,
  PreferencesProvider,
  useMeetingRange,
  useMeetingShare,
} from "@/controller";
import { Temporal } from "@/lib/temporal";
import {
  LocationsLoadStatus,
  PreferencesLoadStatus,
  ShareDestinationId,
} from "@/ports";
import { DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { ALMATY_ZONE, idOf, SAMPLE_NOW } from "./meetingRangeWorld";
import {
  buildShareTextLines,
  cityLocation,
  createMeetingShareTextWorld,
  SHARE_LANGUAGE_CODES,
  SHARE_ZONE_LABEL_PARTS_BY_NAME,
  UTC_LOCATION,
} from "./meetingShareTextWorld";

const feature = await loadFeature("../meeting_range_share.feature");

const CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];
const SHARED_BEHAVIOUR = "shares the text";
const CLOSED_BEHAVIOUR = "reports that the user closed the sheet";
const NO_SHARE_BEHAVIOUR = "has no system share";
const FAILING_BEHAVIOUR = "fails to share for another reason";
const TWELVE_HOUR_MARKER = /\b(AM|PM)\b/;
const URL_PATTERN = /https?:|www\./;
const CYRILLIC_LETTER = /[\u0400-\u04FF]/;

const SHARING_BY_BEHAVIOUR: Record<string, InMemoryTextSharingOptions> = {
  [SHARED_BEHAVIOUR]: { canShare: true, canCopy: true },
  [CLOSED_BEHAVIOUR]: { canShare: true, isCancelled: true, canCopy: true },
  [NO_SHARE_BEHAVIOUR]: { canShare: false, canCopy: true },
  [FAILING_BEHAVIOUR]: { canShare: true, isShareFailing: true, canCopy: true },
  "has neither share nor clipboard": { canShare: false, canCopy: false },
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let hourFormat = HourFormat.H24;
  let sharing = createInMemoryTextSharing({ canShare: true, canCopy: true });
  let app: ReturnType<typeof renderApp>;
  let world = createMeetingShareTextWorld();
  let textLines: string[] = [];

  const renderApp = (options: InMemoryTextSharingOptions) => {
    sharing = createInMemoryTextSharing(options);
    return renderHook(
      () => ({ range: useMeetingRange(), share: useMeetingShare(sharing) }),
      {
        wrapper: ({ children }: { children?: ReactNode }) =>
          createElement(
            PreferencesProvider,
            {
              repository: createInMemoryPreferencesRepository({
                initialDocument: {
                  status: PreferencesLoadStatus.LOADED,
                  preferences: { ...DEFAULT_PREFERENCES, hourFormat },
                },
              }),
              writeScheduler: immediateWriteScheduler,
            },
            createElement(
              LocationsProvider,
              {
                repository: createInMemoryLocationRepository({
                  initialDocument: {
                    status: LocationsLoadStatus.LOADED,
                    locations: CITIES.map((label) =>
                      buildLocation({ label, ...KNOWN_CITIES[label] }),
                    ),
                    homeLocationId: idOf("Almaty"),
                  },
                }),
                writeScheduler: immediateWriteScheduler,
                clock: createSwitchableClock(SAMPLE_NOW, ALMATY_ZONE),
                tickScheduler: createManualTickScheduler(),
              },
              children,
            ),
          ),
      },
    );
  };
  const buildOutcome = async (options: InMemoryTextSharingOptions) => {
    app = renderApp(options);
    act(() => app.result.current.range.selectCells(9, 10));
    act(() => app.result.current.share.openShareDialog());
    await act(() => app.result.current.share.share(ShareDestinationId.TEXT));
  };

  f.BeforeEachScenario(async () => {
    world = createMeetingShareTextWorld();
    textLines = [];
    hourFormat = HourFormat.H24;
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  f.Background(({ Given, And }) => {
    Given(
      "the home location is Almaty and the list is Almaty, Moscow, Kolkata, New York",
      () => {},
    );
    And("the meeting range is 09:00–11:00 in Almaty on 2026-03-08", () => {});
  });

  const givenLanguage = (_ctx: unknown, language: string) => {
    world.language = SHARE_LANGUAGE_CODES[language as "English" | "Russian"];
  };
  const givenHourFormat = (_ctx: unknown, format: string) => {
    world.hourFormat = format === "12-hour" ? HourFormat.H12 : HourFormat.H24;
  };
  const givenEveryLocation = () => {
    world.includedLabels = undefined;
  };
  const buildTextLines = () => {
    textLines = buildShareTextLines(world);
  };
  const expectLines = (_ctx: unknown, table: { line: string }[]) =>
    expect(textLines).toEqual(table.map(({ line }) => line));

  // @add-grid-meeting-range-and-share @FR14 @FR16 @UX3
  // @add-meeting-share-dialog @FR3 @FR6 @FR7
  f.Scenario(
    "English text of the sample meeting",
    ({ Given, When, Then, And }) => {
      Given("the share language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And("every location is included", givenEveryLocation);
      When("the meeting share text is built", buildTextLines);
      Then("it is exactly these lines:", expectLines);
      And("no line holds a link", () => {
        expect(textLines.join("\n")).not.toMatch(URL_PATTERN);
      });
    },
  );

  // @add-meeting-share-dialog @FR3 @FR4 @FR6 @FR7
  f.Scenario(
    "Russian text of the sample meeting",
    ({ Given, And, When, Then }) => {
      Given("the share language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And("every location is included", givenEveryLocation);
      When("the meeting share text is built", buildTextLines);
      Then("it is exactly these lines:", expectLines);
    },
  );

  // @add-grid-meeting-range-and-share @FR14 @add-meeting-share-dialog @FR3
  f.Scenario(
    "The text follows the hour format",
    ({ Given, And, When, Then }) => {
      Given("the share language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And("every location is included", givenEveryLocation);
      When("the meeting share text is built", buildTextLines);
      Then(
        "every span is written in the 12-hour format, as the rows show their times",
        () => {
          const spanLines = textLines.slice(1);
          expect(spanLines).toHaveLength(world.locations.length);
          for (const line of spanLines)
            expect(line).toMatch(TWELVE_HOUR_MARKER);
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR3
  f.Scenario(
    "Only included locations get a line",
    ({ Given, And, When, Then }) => {
      Given("the share language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And(
        "only {string} and {string} are included",
        (_ctx: unknown, first: string, second: string) => {
          world.includedLabels = [first, second];
        },
      );
      When("the meeting share text is built", buildTextLines);
      Then(
        "it has the heading and exactly two more lines, for Almaty and then New York",
        () => {
          expect(textLines).toHaveLength(3);
          expect(textLines[1]).toMatch(/^Almaty /);
          expect(textLines[2]).toMatch(/^New York /);
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR4
  f.Scenario(
    "The share language differs from the interface language",
    ({ Given, When, Then, And }) => {
      Given("the interface language is Russian", async () => {
        await i18n.changeLanguage("ru");
      });
      And("the share language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And("every location is included", givenEveryLocation);
      When("the meeting share text is built", buildTextLines);
      Then("it is the English text of the sample meeting", () => {
        expect(textLines[0]).toBe("Meeting on Sunday, March 8, 2026, 2 h");
        expect(textLines[2]).toBe("Moscow (MSK, UTC+3): 07:00–09:00");
      });
      And("no line contains a Cyrillic letter", () => {
        expect(textLines.join("\n")).not.toMatch(CYRILLIC_LETTER);
      });
    },
  );

  // @add-meeting-share-dialog @FR6
  f.ScenarioOutline(
    "Zone parts follow the share zone label",
    ({ Given, And, When, Then }, variables) => {
      Given("the share language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And("every location is included", givenEveryLocation);
      And('the share zone label is "<parts>"', () => {
        world.zoneLabelParts = SHARE_ZONE_LABEL_PARTS_BY_NAME[variables.parts];
      });
      When("the meeting share text is built", buildTextLines);
      Then(
        'the Moscow line is "<moscow>" and the Almaty line is "<almaty>"',
        () => {
          expect(textLines[2]).toBe(variables.moscow);
          expect(textLines[1]).toBe(variables.almaty);
        },
      );
    },
  );

  // @add-meeting-share-dialog @FR6
  f.Scenario(
    "A UTC location does not repeat UTC",
    ({ Given, And, When, Then }) => {
      Given("the list is Almaty and the UTC location", () => {
        world.locations = [cityLocation("Almaty"), UTC_LOCATION];
      });
      And("the share language is {string}", givenLanguage);
      And("every location is included", givenEveryLocation);
      When("the meeting share text is built", buildTextLines);
      Then("the UTC line is {string}", (_ctx: unknown, line: string) => {
        expect(textLines[2]).toBe(line);
      });
    },
  );

  // @add-meeting-share-dialog @FR6
  f.ScenarioOutline(
    "Zone parts are those at the start of the meeting",
    ({ Given, And, When, Then }, variables) => {
      Given("the home location is Belgrade", () => {
        world.locations = [cityLocation("Belgrade")];
        world.referenceZoneId = "Europe/Belgrade";
      });
      And("the share language is {string}", givenLanguage);
      When(
        "the meeting share text is built for a meeting range that starts on <date> at 10:00 in Belgrade",
        () => {
          const start = Temporal.PlainDate.from(variables.date).toZonedDateTime(
            {
              timeZone: "Europe/Belgrade",
              plainTime: "10:00",
            },
          );
          world.start = start.toInstant().toString();
          world.end = start.add({ hours: 2 }).toInstant().toString();
          buildTextLines();
        },
      );
      Then('the Belgrade line starts with "<prefix>"', () => {
        expect(textLines[1].startsWith(variables.prefix)).toBe(true);
      });
    },
  );

  // @add-meeting-share-dialog @FR7
  f.ScenarioOutline(
    "Russian heading by weekday",
    ({ Given, And, When, Then }, variables) => {
      Given("the home location is Almaty", () => {});
      And("the share language is {string}", givenLanguage);
      When(
        "the meeting share text is built for a two-hour meeting range that starts on <date>",
        () => {
          const start = Temporal.PlainDate.from(variables.date).toZonedDateTime(
            {
              timeZone: ALMATY_ZONE,
              plainTime: "09:00",
            },
          );
          world.start = start.toInstant().toString();
          world.end = start.add({ hours: 2 }).toInstant().toString();
          buildTextLines();
        },
      );
      Then('the heading is "<heading>"', () => {
        expect(textLines[0]).toBe(variables.heading);
      });
    },
  );

  // @add-grid-meeting-range-and-share @FR15 @UX3
  f.ScenarioOutline("Outcomes of sharing", ({ When, Then, And }, variables) => {
    When("the user shares the meeting and the browser <behaves>", () =>
      buildOutcome(SHARING_BY_BEHAVIOUR[variables.behaves]),
    );
    Then("the outcome is <outcome>", () => {
      const { notice } = app.result.current.share;
      const expectedNotice = {
        shared: undefined,
        cancelled: undefined,
        copied: MeetingShareNotice.COPIED,
        failed: MeetingShareNotice.FAILED,
      }[variables.outcome as "shared" | "cancelled" | "copied" | "failed"];
      expect(notice).toBe(expectedNotice);
      expect(sharing.sharedTexts.length > 0).toBe(
        variables.outcome === "shared",
      );
    });
    And("the clipboard holds <clipboard>", () => {
      const copiesText = variables.clipboard === "the meeting share text";
      expect(sharing.copiedTexts).toHaveLength(copiesText ? 1 : 0);
      if (copiesText) expect(sharing.copiedTexts[0]).toMatch(/^Meeting on /);
    });
  });
});
