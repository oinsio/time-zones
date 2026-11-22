// Verifies FR5, FR6, FR7, NFR-A3 of keep-location-menu-in-view-and-clear-range-after-share.
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInMemoryTextSharing } from "@/adapters";
import {
  ADD_LOCATION_BUTTON_ID,
  PREFERENCES_SCHEMA_VERSION,
  STORAGE_KEYS,
} from "@/constants";
import { fakeClock } from "@/lib/temporal";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { ViewId } from "@/views";
import { AppShell } from "./AppShell";

const SAMPLE_CLOCK = fakeClock("2026-03-08T07:30:00Z", "Asia/Almaty");
const MEETING_TITLE = /^Meeting · /;
const SHARE_NOTICES = /Meeting text copied|Could not share the meeting/;

async function openShareDialogWithMeeting(
  sharing: Parameters<typeof createInMemoryTextSharing>[0],
) {
  localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      payload: { ...DEFAULT_PREFERENCES, viewMode: ViewId.GRID },
    }),
  );
  render(
    <AppShell
      clock={SAMPLE_CLOCK}
      textSharing={createInMemoryTextSharing(sharing)}
    />,
  );
  const [firstStrip] = await screen.findAllByRole("slider");
  fireEvent.click(firstStrip.querySelectorAll("[data-hour-cell]")[9]);
  const meetingTitle = screen.getByRole("heading", {
    name: MEETING_TITLE,
  }).textContent;
  await userEvent.click(screen.getByRole("button", { name: "Share meeting" }));
  const dialog = await screen.findByRole("dialog", { name: "Share meeting" });
  return { dialog, meetingTitle };
}

describe("AppShell after a share", () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage("en");
    stubZoneCitiesFetch();
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
    vi.unstubAllGlobals();
  });

  it("should clear the meeting and focus Add location when the text is shared", async () => {
    const { dialog } = await openShareDialogWithMeeting({
      canShare: true,
      canCopy: true,
    });

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Share" }),
    );

    await vi.waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole("heading", { name: MEETING_TITLE })).toBeNull();
    expect(
      screen.getByRole("heading", { level: 1, name: "Time Zones" }),
    ).toBeInTheDocument();
    expect(document.getElementById(ADD_LOCATION_BUTTON_ID)).toHaveFocus();
    expect(screen.queryByText(SHARE_NOTICES)).toBeNull();
  });

  it.each([
    { outcome: "COPIED", sharing: { canShare: false, canCopy: true } },
    { outcome: "FAILED", sharing: { canShare: false, canCopy: false } },
  ])("should keep the meeting on the outcome $outcome", async ({ sharing }) => {
    const { dialog, meetingTitle } = await openShareDialogWithMeeting(sharing);

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Share" }),
    );

    await vi.waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("heading", { name: MEETING_TITLE }),
    ).toHaveTextContent(meetingTitle ?? "");
  });

  it("should keep the meeting when the dialog is closed with the close button", async () => {
    const { dialog, meetingTitle } = await openShareDialogWithMeeting({
      canShare: true,
      canCopy: true,
    });

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close" }),
    );

    await vi.waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("heading", { name: MEETING_TITLE }),
    ).toHaveTextContent(meetingTitle ?? "");
  });
});
