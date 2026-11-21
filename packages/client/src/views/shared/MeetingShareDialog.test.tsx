// Verifies FR1, FR2, FR4, FR5, FR6, FR8, FR9, FR11, FR12, UX5, NFR-A1, NFR-A2 of add-meeting-share-dialog.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MeetingShareSession } from "@/controller";
import { ShareDestinationId } from "@/ports";
import { ZoneLabelPart } from "@/preferences";
import { MeetingShareDialog } from "./MeetingShareDialog";

const SESSION: MeetingShareSession = {
  isShareDialogOpen: true,
  title: "Meeting · 2 h",
  referenceLine: "Sunday, March 8, 2026 · Almaty time",
  rows: [
    {
      id: "almaty",
      cityLabel: "Almaty",
      isIncluded: true,
      zoneParts: [],
      spanLabel: "09:00–11:00",
      localDateLabel: "Sun, Mar 8",
    },
    {
      id: "moscow",
      cityLabel: "Moscow",
      isIncluded: true,
      zoneParts: [],
      spanLabel: "07:00–09:00",
      localDateLabel: "Sun, Mar 8",
    },
  ],
  text: "Meeting on Sunday, March 8, 2026, 2 h\nAlmaty: 09:00–11:00",
  shareLanguage: "en",
  isShareLanguagePinned: false,
  shareZoneLabelParts: [
    ZoneLabelPart.UTC_OFFSET,
    ZoneLabelPart.ZONE_ABBREVIATION,
  ],
  destinations: [{ id: ShareDestinationId.TEXT, label: "Share" }],
  closeShareDialog: vi.fn(),
  toggleLocation: vi.fn(),
  chooseShareLanguage: vi.fn(),
  toggleShareLanguagePin: vi.fn(),
  toggleShareZoneLabelPart: vi.fn(),
  share: vi.fn(),
};

const renderDialog = (overrides: Partial<MeetingShareSession> = {}) => {
  const session = {
    ...SESSION,
    closeShareDialog: vi.fn(),
    share: vi.fn(),
    toggleLocation: vi.fn(),
    ...overrides,
  };
  render(
    <MeetingShareDialog session={session} returnFocusRef={{ current: null }} />,
  );
  return session;
};

describe("MeetingShareDialog", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should be a modal dialog named Share meeting", () => {
    renderDialog();

    expect(
      screen.getByRole("dialog", { name: "Share meeting" }),
    ).toBeInTheDocument();
  });

  it("should show the title and the reference line", () => {
    renderDialog();

    expect(screen.getByText("Meeting · 2 h")).toBeInTheDocument();
    expect(
      screen.getByText("Sunday, March 8, 2026 · Almaty time"),
    ).toBeInTheDocument();
  });

  it("should show the captions in English", () => {
    renderDialog();

    for (const caption of [
      "Send to",
      "Language of the invitation",
      "Timezone label",
      "Text of the invitation",
    ]) {
      expect(screen.getByText(caption)).toBeInTheDocument();
    }
  });

  it("should list every location as a checkbox", () => {
    renderDialog();

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("should report a toggled location", async () => {
    const session = renderDialog();

    await userEvent.click(screen.getByRole("checkbox", { name: "Moscow" }));

    expect(session.toggleLocation).toHaveBeenCalledWith("moscow");
  });

  it("should name the language button by the share language", () => {
    renderDialog();

    expect(
      screen.getByRole("button", {
        name: "Language of the invitation: English",
      }),
    ).toBeInTheDocument();
  });

  it("should show the pin beside the language button", () => {
    renderDialog({ isShareLanguagePinned: true });

    expect(
      screen.getByRole("button", { name: "Remember the share language" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("should group the abbreviation and UTC offset toggles without the country", () => {
    renderDialog();

    const group = screen.getByRole("group", { name: "Timezone label" });
    expect(
      within(group)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Abbreviation", "UTC offset"]);
  });

  it("should report a toggled zone label part", async () => {
    const session = renderDialog();

    await userEvent.click(screen.getByRole("button", { name: "UTC offset" }));

    expect(session.toggleShareZoneLabelPart).toHaveBeenCalledWith(
      ZoneLabelPart.UTC_OFFSET,
    );
  });

  it("should show one Share button with the Share2 icon", () => {
    renderDialog();

    const shareButton = screen.getByRole("button", { name: "Share" });
    expect(shareButton.querySelector("svg.lucide-share-2")).not.toBeNull();
  });

  it("should hand the destination id to the session on Share", async () => {
    const session = renderDialog();

    await userEvent.click(screen.getByRole("button", { name: "Share" }));

    expect(session.share).toHaveBeenCalledWith(ShareDestinationId.TEXT);
  });

  it("should make Share inactive with no text", () => {
    renderDialog({ text: undefined });

    expect(screen.getByRole("button", { name: "Share" })).toBeDisabled();
  });

  it("should close on the close button", async () => {
    const session = renderDialog();

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(session.closeShareDialog).toHaveBeenCalledTimes(1);
  });

  it("should close on Escape", async () => {
    const session = renderDialog();

    await userEvent.keyboard("{Escape}");

    expect(session.closeShareDialog).toHaveBeenCalledTimes(1);
  });

  it("should only collapse the open language list on Escape", async () => {
    const session = renderDialog();
    const languageButton = screen.getByRole("button", {
      name: "Language of the invitation: English",
    });
    await userEvent.click(languageButton);
    expect(languageButton).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");

    expect(languageButton).toHaveAttribute("aria-expanded", "false");
    expect(session.closeShareDialog).not.toHaveBeenCalled();
    expect(languageButton).toHaveFocus();
  });

  it("should report a chosen share language", async () => {
    const session = renderDialog();
    await userEvent.click(
      screen.getByRole("button", {
        name: "Language of the invitation: English",
      }),
    );

    await userEvent.click(screen.getByRole("button", { name: /Русский/ }));

    expect(session.chooseShareLanguage).toHaveBeenCalledWith("ru");
  });
});
