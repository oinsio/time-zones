// Verifies FR14, FR15 of add-grid-meeting-range-and-share.
// Verifies FR1, FR3, FR4, FR5, FR6, FR8, FR9, FR10, FR11 of add-meeting-share-dialog.
import zoneCities from "virtual:zone-cities";
import { act, renderHook, waitFor } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
  createInMemoryTextSharing,
  type InMemoryTextSharingOptions,
} from "@/adapters";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { buildDeviceTimeLocation, type Location, LocationKind } from "@/model";
import {
  LocationsLoadStatus,
  PreferencesLoadStatus,
  ShareDestinationId,
} from "@/ports";
import {
  DEFAULT_PREFERENCES,
  type Preferences,
  ZoneLabelPart,
} from "@/preferences";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { useMeetingRange } from "./useMeetingRange";
import { MeetingShareNotice, useMeetingShare } from "./useMeetingShare";

const citySearch = createCompositeCitySearch(zoneCities);
const loadCitySearch = async () => citySearch;

const cityRow = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });
const almaty = cityRow("Almaty");
const moscow = cityRow("Moscow");
const kolkata = cityRow("Kolkata");
const newYork = cityRow("New York");

const ENGLISH_SAMPLE_LINES = [
  "Meeting on Sunday, March 8, 2026, 2 h",
  "Almaty (UTC+5): 09:00–11:00",
  "Moscow (MSK, UTC+3): 07:00–09:00",
  "New York (EST, UTC−5): 23:00–01:00 (a day earlier, Sat, Mar 7)",
];

type SetupOptions = {
  sharing?: InMemoryTextSharingOptions;
  locations?: readonly Location[];
  homeLocationId?: string | null;
  preferences?: Partial<Preferences>;
};

function setup({
  sharing = { canShare: true, canCopy: true },
  locations = [almaty, moscow, newYork],
  homeLocationId = almaty.id,
  preferences = {},
}: SetupOptions = {}) {
  const textSharing = createInMemoryTextSharing(sharing);
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty");
  const locationRepository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations,
      homeLocationId,
    },
  });
  const preferencesRepository = createInMemoryPreferencesRepository({
    initialDocument: {
      status: PreferencesLoadStatus.LOADED,
      preferences: { ...DEFAULT_PREFERENCES, ...preferences },
    },
  });
  const rendered = renderHook(
    () => ({
      range: useMeetingRange(),
      share: useMeetingShare(textSharing),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PreferencesProvider
          repository={preferencesRepository}
          writeScheduler={createManualWriteScheduler()}
        >
          <LocationsProvider
            repository={locationRepository}
            writeScheduler={createManualWriteScheduler()}
            clock={clock}
            loadCitySearch={loadCitySearch}
            tickScheduler={createManualTickScheduler()}
          >
            {children}
          </LocationsProvider>
        </PreferencesProvider>
      ),
    },
  );
  act(() => rendered.result.current.range.selectCells(9, 10));
  return { ...rendered, textSharing, preferencesRepository };
}

type Harness = ReturnType<typeof setup>["result"];
const openDialog = (result: Harness) =>
  act(() => result.current.share.openShareDialog());
const shareText = (result: Harness) =>
  act(() => result.current.share.share(ShareDestinationId.TEXT));

describe("useMeetingShare", () => {
  beforeEach(() => i18n.changeLanguage("ru"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should offer the text destination with its label in the interface language", () => {
    const { result } = setup();

    expect(result.current.share.destinations).toEqual([
      { id: ShareDestinationId.TEXT, label: "Поделиться" },
    ]);
  });

  it("should not have a shareMeeting command", () => {
    const { result } = setup();

    expect("shareMeeting" in result.current.share).toBe(false);
  });

  it("should open the session and dismiss a shown notice", async () => {
    const { result } = setup({ sharing: { canShare: false, canCopy: true } });
    openDialog(result);
    await shareText(result);
    expect(result.current.share.notice).toBe(MeetingShareNotice.COPIED);

    openDialog(result);

    expect(result.current.share.isShareDialogOpen).toBe(true);
    expect(result.current.share.notice).toBeUndefined();
  });

  it("should write the title and the reference line with the home city", async () => {
    const { result } = setup();
    openDialog(result);

    expect(result.current.share.title).toBe("Встреча · 2 ч");
    await waitFor(() =>
      expect(result.current.share.referenceLine).toBe(
        "воскресенье, 8 марта 2026 г. · по времени Алматы",
      ),
    );
  });

  it("should name the exemplar city of the device time zone without a home location", async () => {
    const { result } = setup({
      locations: [moscow, kolkata, newYork],
      homeLocationId: null,
    });
    openDialog(result);

    await waitFor(() =>
      expect(result.current.share.referenceLine).toBe(
        "воскресенье, 8 марта 2026 г. · по времени Алматы",
      ),
    );
  });

  it("should keep the reference line in the interface language whatever the share language is", async () => {
    const { result } = setup({
      locations: [moscow, kolkata, newYork],
      homeLocationId: null,
    });
    openDialog(result);

    act(() => result.current.share.chooseShareLanguage("en"));

    await waitFor(() =>
      expect(result.current.share.referenceLine).toContain("по времени Алматы"),
    );
  });

  it("should list the dialog rows with their zone parts, span and day shift", () => {
    const { result } = setup();
    openDialog(result);

    const [almatyRow, moscowRow, newYorkRow] = result.current.share.rows;
    expect(almatyRow.zoneParts.map(({ text }) => text)).toEqual(["UTC+5"]);
    expect(moscowRow.zoneParts.map(({ text }) => text)).toEqual([
      "МСК",
      "UTC+3",
    ]);
    expect(moscowRow).toMatchObject({
      spanLabel: "07:00–09:00",
      isIncluded: true,
      dayShiftLabel: undefined,
    });
    expect(newYorkRow).toMatchObject({
      spanLabel: "23:00–01:00",
      dayShiftLabel: "днём раньше",
      localDateLabel: "сб, 7 мар.",
    });
  });

  it("should include every location on opening and reset the ticks", () => {
    const { result } = setup();
    openDialog(result);
    act(() => result.current.share.toggleLocation(moscow.id));
    expect(result.current.share.rows[1].isIncluded).toBe(false);

    act(() => result.current.share.closeShareDialog());
    openDialog(result);

    expect(
      result.current.share.rows.every(({ isIncluded }) => isIncluded),
    ).toBe(true);
  });

  it("should open in the interface language with no pin", () => {
    const { result } = setup();
    openDialog(result);

    expect(result.current.share.shareLanguage).toBe("ru");
    expect(result.current.share.isShareLanguagePinned).toBe(false);
  });

  it("should open in the pinned language", () => {
    const { result } = setup({ preferences: { shareLanguage: "en" } });
    openDialog(result);

    expect(result.current.share.shareLanguage).toBe("en");
    expect(result.current.share.isShareLanguagePinned).toBe(true);
  });

  it("should treat a pinned language the registry lacks as no pin", () => {
    const { result } = setup({ preferences: { shareLanguage: "de" } });
    openDialog(result);

    expect(result.current.share.shareLanguage).toBe("ru");
    expect(result.current.share.isShareLanguagePinned).toBe(false);
  });

  it("should rebuild the text for the ticks, the language and the parts", () => {
    const { result } = setup();
    openDialog(result);
    act(() => result.current.share.chooseShareLanguage("en"));
    expect(result.current.share.text?.split("\n")).toEqual(
      ENGLISH_SAMPLE_LINES,
    );

    act(() => result.current.share.toggleLocation(moscow.id));
    act(() =>
      result.current.share.toggleShareZoneLabelPart(ZoneLabelPart.UTC_OFFSET),
    );

    expect(result.current.share.text?.split("\n")).toEqual([
      ENGLISH_SAMPLE_LINES[0],
      "Almaty: 09:00–11:00",
      "New York (EST): 23:00–01:00 (a day earlier, Sat, Mar 7)",
    ]);
  });

  it("should give no text when every location is unticked", () => {
    const { result } = setup({ locations: [almaty] });
    openDialog(result);

    act(() => result.current.share.toggleLocation(almaty.id));

    expect(result.current.share.text).toBeUndefined();
  });

  it("should name the exemplar city in the share language on the device time line while its row keeps the interface language", async () => {
    const deviceTimeLocation = buildDeviceTimeLocation(
      UNIT_TEST_DEVICE_TIME_ZONE,
    );
    const { result } = setup({
      locations: [deviceTimeLocation, moscow],
      homeLocationId: null,
    });
    openDialog(result);

    act(() => result.current.share.chooseShareLanguage("en"));

    expect(deviceTimeLocation.kind).toBe(LocationKind.DEVICE_TIME);
    await waitFor(() =>
      expect(result.current.share.rows[0].cityLabel).toBe("Алматы"),
    );
    expect(result.current.share.text?.split("\n")[1]).toMatch(/^Almaty /);
  });

  it("should pin the current language and unpin it keeping the language of the opening", () => {
    const { result } = setup();
    openDialog(result);
    act(() => result.current.share.chooseShareLanguage("en"));

    act(() => result.current.share.toggleShareLanguagePin());
    expect(result.current.share.isShareLanguagePinned).toBe(true);

    act(() => result.current.share.toggleShareLanguagePin());
    expect(result.current.share.isShareLanguagePinned).toBe(false);
    expect(result.current.share.shareLanguage).toBe("en");
  });

  it("should keep the new language pinned when another one is chosen", () => {
    const { result } = setup({ preferences: { shareLanguage: "en" } });
    openDialog(result);

    act(() => result.current.share.chooseShareLanguage("ru"));

    expect(result.current.share.isShareLanguagePinned).toBe(true);
    expect(result.current.share.shareLanguage).toBe("ru");
  });

  it("should write nothing to the preferences while only opening and closing", () => {
    const { result, preferencesRepository } = setup();
    openDialog(result);
    act(() => result.current.share.closeShareDialog());

    expect(preferencesRepository.load().status).toBe(
      PreferencesLoadStatus.LOADED,
    );
    expect(result.current.share.shareZoneLabelParts).toEqual(
      DEFAULT_PREFERENCES.shareZoneLabelParts,
    );
  });

  it("should hand the previewed text to the system share and close without a notice", async () => {
    const { result, textSharing } = setup();
    openDialog(result);
    act(() => result.current.share.chooseShareLanguage("en"));
    const previewedText = result.current.share.text;

    await shareText(result);

    expect(textSharing.sharedTexts).toEqual([previewedText]);
    expect(result.current.share.isShareDialogOpen).toBe(false);
    expect(result.current.share.notice).toBeUndefined();
  });

  it("should keep the session when the user closes the sheet", async () => {
    const { result } = setup({
      sharing: { canShare: true, isCancelled: true, canCopy: true },
    });
    openDialog(result);
    act(() => result.current.share.toggleLocation(moscow.id));

    await shareText(result);

    expect(result.current.share.isShareDialogOpen).toBe(true);
    expect(result.current.share.rows[1].isIncluded).toBe(false);
    expect(result.current.share.notice).toBeUndefined();
  });

  it("should close with the copied notice when there is no system share", async () => {
    const { result, textSharing } = setup({
      sharing: { canShare: false, canCopy: true },
    });
    openDialog(result);

    await shareText(result);

    expect(textSharing.copiedTexts).toHaveLength(1);
    expect(result.current.share.isShareDialogOpen).toBe(false);
    expect(result.current.share.notice).toBe(MeetingShareNotice.COPIED);
  });

  it("should close with the failed notice when nothing works", async () => {
    const { result } = setup({ sharing: { canShare: false, canCopy: false } });
    openDialog(result);

    await shareText(result);

    expect(result.current.share.isShareDialogOpen).toBe(false);
    expect(result.current.share.notice).toBe(MeetingShareNotice.FAILED);
  });

  it("should dismiss the notice", async () => {
    const { result } = setup({ sharing: { canShare: false, canCopy: true } });
    openDialog(result);
    await shareText(result);

    act(() => result.current.share.dismissNotice());

    expect(result.current.share.notice).toBeUndefined();
  });

  it("should clear the notice when the range changes or is cleared", async () => {
    const { result } = setup({ sharing: { canShare: false, canCopy: true } });
    openDialog(result);
    await shareText(result);

    act(() => result.current.range.selectCells(8, 8));

    expect(result.current.share.notice).toBeUndefined();
  });

  it("should close the dialog when the meeting range is removed", () => {
    const { result } = setup();
    openDialog(result);

    act(() => result.current.range.clearMeetingRange());

    expect(result.current.share.isShareDialogOpen).toBe(false);
  });

  it("should do nothing when sharing without a meeting range", async () => {
    const { result, textSharing } = setup();
    openDialog(result);
    act(() => result.current.range.clearMeetingRange());

    await shareText(result);

    expect(textSharing.sharedTexts).toEqual([]);
  });
});
