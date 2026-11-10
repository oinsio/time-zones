// Verifies FR14, FR15, FR16, UX3 of add-grid-meeting-range-and-share.
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
import { LocationsLoadStatus, PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { ALMATY_ZONE, idOf, SAMPLE_NOW } from "./meetingRangeWorld";

const feature = await loadFeature("../meeting_range_share.feature");

const CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];
const SHARED_BEHAVIOUR = "shares the text";
const CLOSED_BEHAVIOUR = "reports that the user closed the sheet";
const NO_SHARE_BEHAVIOUR = "has no system share";
const FAILING_BEHAVIOUR = "fails to share for another reason";
const TWELVE_HOUR_MARKER = /\b(AM|PM)\b/;
const URL_PATTERN = /https?:|www\./;

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
  const buildText = async (options: InMemoryTextSharingOptions) => {
    app = renderApp(options);
    act(() => app.result.current.range.selectCells(9, 10));
    await act(() => app.result.current.share.shareMeeting());
  };
  const sharedText = () => [...sharing.sharedTexts, ...sharing.copiedTexts][0];

  f.BeforeEachScenario(async () => {
    hourFormat = HourFormat.H24;
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  f.Background(({ Given, And }) => {
    Given(
      "the interface language is English, the hour format is 24-hour, the home location is Almaty and the list is Almaty, Moscow, Kolkata, New York",
      () => {
        hourFormat = HourFormat.H24;
      },
    );
    And("the meeting range is 09:00–11:00 in Almaty on 2026-03-08", () => {});
  });

  // @add-grid-meeting-range-and-share @FR14 @FR16 @UX3
  f.Scenario("English text of the sample meeting", ({ When, Then, And }) => {
    When("the meeting share text is built", () =>
      buildText({ canShare: true, canCopy: true }),
    );
    Then("it is exactly these lines:", (_ctx, table: { line: string }[]) => {
      expect(sharedText().split("\n")).toEqual(table.map(({ line }) => line));
    });
    And("no line holds a link", () => {
      expect(sharedText()).not.toMatch(URL_PATTERN);
    });
  });

  // @add-grid-meeting-range-and-share @FR14
  f.Scenario("The text follows the hour format", ({ Given, When, Then }) => {
    Given("the hour format is 12-hour", () => {
      hourFormat = HourFormat.H12;
    });
    When("the meeting share text is built", () =>
      buildText({ canShare: true, canCopy: true }),
    );
    Then(
      "every span is written in the 12-hour format, as the rows show their times",
      () => {
        const spanLines = sharedText().split("\n").slice(1);
        expect(spanLines).toHaveLength(CITIES.length);
        for (const line of spanLines) expect(line).toMatch(TWELVE_HOUR_MARKER);
      },
    );
  });

  // @add-grid-meeting-range-and-share @FR15 @UX3
  f.ScenarioOutline("Outcomes of sharing", ({ When, Then, And }, variables) => {
    When("the user shares the meeting and the browser <behaves>", () =>
      buildText(SHARING_BY_BEHAVIOUR[variables.behaves]),
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
