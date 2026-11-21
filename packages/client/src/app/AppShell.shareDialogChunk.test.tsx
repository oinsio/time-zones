// Verifies NFR-P2 of add-meeting-share-dialog: the share dialog chunk loads only when Share meeting is chosen.
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PREFERENCES_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { fakeClock } from "@/lib/temporal";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { ViewId } from "@/views";
import { AppShell } from "./AppShell";

const SAMPLE_CLOCK = fakeClock("2026-03-08T07:30:00Z", "Asia/Almaty");

const { shareDialogChunkLoads } = vi.hoisted(() => ({
  shareDialogChunkLoads: vi.fn(),
}));

vi.mock("@/views/shared/MeetingShareDialog", () => {
  shareDialogChunkLoads();
  return { MeetingShareDialog: () => <p>share dialog stub</p> };
});

describe("AppShell share dialog chunk", () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage("en");
    stubZoneCitiesFetch();
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
    vi.unstubAllGlobals();
  });

  it("should load the chunk only when Share meeting is chosen", async () => {
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        payload: { ...DEFAULT_PREFERENCES, viewMode: ViewId.GRID },
      }),
    );
    render(<AppShell clock={SAMPLE_CLOCK} />);
    const [firstStrip] = await screen.findAllByRole("slider");
    fireEvent.click(firstStrip.querySelectorAll("[data-hour-cell]")[9]);
    await screen.findByRole("button", { name: "Share meeting" });
    expect(shareDialogChunkLoads).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Share meeting" }),
    );

    await vi.waitFor(() => expect(shareDialogChunkLoads).toHaveBeenCalled());
  });
});
