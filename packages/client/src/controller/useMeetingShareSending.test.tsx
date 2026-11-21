// Verifies FR14, FR15 of add-grid-meeting-range-and-share.
// Verifies FR1, FR3, FR4, FR5, FR6, FR8, FR9, FR10, FR11 of add-meeting-share-dialog.

import { act } from "@testing-library/react";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MeetingShareNotice } from "./useMeetingShare";
import {
  moscow,
  openDialog,
  setup,
  shareText,
} from "./useMeetingShare.harness";

describe("useMeetingShare sending", () => {
  beforeEach(() => i18n.changeLanguage("ru"));
  afterEach(() => i18n.changeLanguage("ru"));

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
