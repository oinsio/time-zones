// Verifies FR13, FR15, NFR-A2 of add-grid-meeting-range-and-share (D7).
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
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
const storeViewMode = (viewMode: ViewId) =>
  localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      payload: { ...DEFAULT_PREFERENCES, viewMode },
    }),
  );

async function openWithMeeting(
  textSharing = createInMemoryTextSharing({ canShare: false, canCopy: true }),
  viewMode = ViewId.GRID,
) {
  storeViewMode(viewMode);
  render(<AppShell clock={SAMPLE_CLOCK} textSharing={textSharing} />);
  const [firstStrip] = await screen.findAllByRole("slider");
  const cells = firstStrip.querySelectorAll("[data-hour-cell]");
  fireEvent.click(cells[9]);
  return textSharing;
}

describe("AppShell with a meeting range", () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage("en");
    stubZoneCitiesFetch();
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
    vi.unstubAllGlobals();
  });

  it("should replace the header by the meeting bar in Grid", async () => {
    await openWithMeeting();

    expect(screen.getByRole("banner")).toContainElement(
      screen.getByRole("heading", { level: 1, name: /^Meeting · / }),
    );
    expect(screen.queryByRole("button", { name: "Settings" })).toBeNull();
    expect(document.getElementById(ADD_LOCATION_BUTTON_ID)).toBeNull();
  });

  it("should keep the app title as the document title", async () => {
    await openWithMeeting();

    expect(document.title).toBe("Time Zones");
  });

  it("should have the bar title as the only heading", async () => {
    await openWithMeeting();

    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("should bring the header back and focus Add location on Clear", async () => {
    await openWithMeeting();

    await userEvent.click(
      screen.getByRole("button", { name: "Clear meeting" }),
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Time Zones",
    );
    expect(document.activeElement).toBe(
      document.getElementById(ADD_LOCATION_BUTTON_ID),
    );
  });

  it("should show the copied notice in the notices region without taking the focus", async () => {
    await openWithMeeting();
    const shareButton = screen.getByRole("button", { name: "Share meeting" });

    await userEvent.click(shareButton);

    const notice = await screen.findByText("Meeting text copied");
    expect(
      screen.getAllByRole("status").find((region) => region.contains(notice)),
    ).toHaveAttribute("aria-live", "polite");
    expect(document.activeElement).toBe(shareButton);
  });

  it("should dismiss the notice with Escape", async () => {
    await openWithMeeting();
    await userEvent.click(
      screen.getByRole("button", { name: "Share meeting" }),
    );
    await screen.findByText("Meeting text copied");

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByText("Meeting text copied")).toBeNull();
  });

  it("should dismiss the notice when the meeting is cleared", async () => {
    await openWithMeeting();
    await userEvent.click(
      screen.getByRole("button", { name: "Share meeting" }),
    );
    await screen.findByText("Meeting text copied");

    await userEvent.click(
      screen.getByRole("button", { name: "Clear meeting" }),
    );

    expect(screen.queryByText("Meeting text copied")).toBeNull();
  });

  it("should show no meeting bar in Cards", async () => {
    storeViewMode(ViewId.CARDS);
    render(<AppShell clock={SAMPLE_CLOCK} />);

    await screen.findByRole("main");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Time Zones",
    );
    expect(screen.queryByRole("button", { name: "Share meeting" })).toBeNull();
  });
});
