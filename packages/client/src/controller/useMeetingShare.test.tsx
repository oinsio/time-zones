// Verifies FR14, FR15 of add-grid-meeting-range-and-share.
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createInMemoryLocationRepository,
  createInMemoryTextSharing,
  type InMemoryTextSharingOptions,
} from "@/adapters";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { useMeetingRange } from "./useMeetingRange";
import { MeetingShareNotice, useMeetingShare } from "./useMeetingShare";

const cityRow = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });
const almaty = cityRow("Almaty");
const SAMPLE_TEXT = [
  "Meeting on Sunday, March 8, 2026, 2 h",
  "Almaty: 09:00–11:00",
  "Moscow: 07:00–09:00",
  "New York: 23:00–01:00 (a day earlier, Sat, Mar 7)",
].join("\n");

function setup(options: InMemoryTextSharingOptions) {
  const textSharing = createInMemoryTextSharing(options);
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty");
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [almaty, cityRow("Moscow"), cityRow("New York")],
      homeLocationId: almaty.id,
    },
  });
  const rendered = renderHook(
    () => ({
      range: useMeetingRange(),
      share: useMeetingShare(textSharing),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={repository}
          writeScheduler={createManualWriteScheduler()}
          clock={clock}
          tickScheduler={createManualTickScheduler()}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
  act(() => rendered.result.current.range.selectCells(9, 10));
  return { ...rendered, textSharing };
}

const share = (result: {
  current: { share: { shareMeeting: () => Promise<void> } };
}) => act(() => result.current.share.shareMeeting());

describe("useMeetingShare", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should hand the meeting share text to the system share without a notice", async () => {
    const { result, textSharing } = setup({ canShare: true, canCopy: true });

    await share(result);

    expect(textSharing.sharedTexts).toEqual([SAMPLE_TEXT]);
    expect(result.current.share.notice).toBeUndefined();
  });

  it("should show no notice when the user closes the sheet", async () => {
    const { result } = setup({
      canShare: true,
      isCancelled: true,
      canCopy: true,
    });

    await share(result);

    expect(result.current.share.notice).toBeUndefined();
  });

  it("should copy the text and show the copied notice", async () => {
    const { result, textSharing } = setup({ canShare: false, canCopy: true });

    await share(result);

    expect(textSharing.copiedTexts).toEqual([SAMPLE_TEXT]);
    expect(result.current.share.notice).toBe(MeetingShareNotice.COPIED);
  });

  it("should show the failed notice when nothing works", async () => {
    const { result } = setup({ canShare: false, canCopy: false });

    await share(result);

    expect(result.current.share.notice).toBe(MeetingShareNotice.FAILED);
  });

  it("should dismiss the notice", async () => {
    const { result } = setup({ canShare: false, canCopy: true });
    await share(result);

    act(() => result.current.share.dismissNotice());

    expect(result.current.share.notice).toBeUndefined();
  });

  it("should clear the notice when the range changes", async () => {
    const { result } = setup({ canShare: false, canCopy: true });
    await share(result);

    act(() => result.current.range.selectCells(8, 8));

    expect(result.current.share.notice).toBeUndefined();
  });

  it("should clear the notice when the range is cleared", async () => {
    const { result } = setup({ canShare: false, canCopy: true });
    await share(result);

    act(() => result.current.range.clearMeetingRange());

    expect(result.current.share.notice).toBeUndefined();
  });

  it("should do nothing without a meeting range", async () => {
    const { result, textSharing } = setup({ canShare: true, canCopy: true });
    act(() => result.current.range.clearMeetingRange());

    await share(result);

    expect(textSharing.sharedTexts).toEqual([]);
  });
});
