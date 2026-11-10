// Verifies FR8, UX1 of add-grid-meeting-range-and-share.
// Verifies FR2, FR6, UX1, UX2, NFR-A2 of show-local-time-and-date-on-location-cards (D5).
// Verifies FR1, FR5, NFR-A2, UX1 of add-wall-time-input-with-hint (D6).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WallTimeInputOutcome } from "@/controller";
import { LocalDateTime } from "./LocalDateTime";
import { LocationRowVariant } from "./locationRowVariant";

const NAME = "Ввести время — Алматы, 12:30";

const renderDateTime = (
  localTimeLabel = "12:30",
  onConfirmWallTime = vi.fn(() => WallTimeInputOutcome.CLOSED),
) =>
  render(
    <LocalDateTime
      localTimeLabel={localTimeLabel}
      localDateLabel="Sun, Mar 8"
      localIsoDate="2026-03-08"
      wallTimeInputLabel={NAME}
      onConfirmWallTime={onConfirmWallTime}
    />,
  );

describe("LocalDateTime", () => {
  it("should show the time bold with tabular figures", () => {
    renderDateTime();
    expect(screen.getByText("12:30")).toHaveClass("font-bold", "tabular-nums");
  });

  it("should show the time larger than the city text", () => {
    renderDateTime();
    expect(screen.getByText("12:30")).toHaveClass("text-2xl", "md:text-4xl");
  });

  it("should show the date as muted text in a time element with the ISO date", () => {
    renderDateTime();
    const dateElement = screen.getByText("Sun, Mar 8");
    expect(dateElement.tagName).toBe("TIME");
    expect(dateElement).toHaveAttribute("datetime", "2026-03-08");
    expect(dateElement).toHaveClass("text-muted-foreground");
  });

  it("should render nothing when the time label is empty", () => {
    const { container } = renderDateTime("");
    expect(container).toBeEmptyDOMElement();
  });

  it("should not be a live region", () => {
    const { container } = renderDateTime();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("should show the time as a button named by the city and the time", () => {
    renderDateTime();
    expect(screen.getByRole("button", { name: NAME })).toHaveTextContent(
      "12:30",
    );
  });

  it("should open on a click, confirm with the opening date and return the focus after Enter", async () => {
    const onConfirmWallTime = vi.fn(() => WallTimeInputOutcome.CLOSED);
    renderDateTime("12:30", onConfirmWallTime);
    await userEvent.click(screen.getByRole("button", { name: NAME }));
    const field = screen.getByRole("textbox", { name: NAME });
    await userEvent.clear(field);
    await userEvent.type(field, "1040{Enter}");
    expect(onConfirmWallTime).toHaveBeenCalledWith("1040", "2026-03-08");
    expect(screen.getByRole("button", { name: NAME })).toHaveFocus();
  });

  it("should return the focus to the button after Escape", async () => {
    renderDateTime();
    await userEvent.click(screen.getByRole("button", { name: NAME }));
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: NAME })).toHaveFocus();
  });
});

// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
describe("LocalDateTime row variants", () => {
  it("should put the time button before the date without a row variant", () => {
    renderDateTime();
    expect(
      screen
        .getByRole("button", { name: NAME })
        .compareDocumentPosition(screen.getByText("Sun, Mar 8")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should keep the fixed column width without a row variant", () => {
    renderDateTime();
    expect(screen.getByText("Sun, Mar 8").parentElement).toHaveClass("md:w-44");
  });

  it("should put the date before the time button for a grid row", () => {
    render(
      <LocalDateTime
        localTimeLabel="12:30"
        localDateLabel="Sun, Mar 8"
        localIsoDate="2026-03-08"
        wallTimeInputLabel={NAME}
        onConfirmWallTime={() => WallTimeInputOutcome.CLOSED}
        rowVariant={LocationRowVariant.GRID_ROW}
      />,
    );
    expect(
      screen
        .getByText("Sun, Mar 8")
        .compareDocumentPosition(screen.getByRole("button", { name: NAME })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should lay the date and the time in one row from 768 px for a grid row", () => {
    render(
      <LocalDateTime
        localTimeLabel="12:30"
        localDateLabel="Sun, Mar 8"
        localIsoDate="2026-03-08"
        wallTimeInputLabel={NAME}
        onConfirmWallTime={() => WallTimeInputOutcome.CLOSED}
        rowVariant={LocationRowVariant.GRID_ROW}
      />,
    );
    expect(screen.getByText("Sun, Mar 8").parentElement).toHaveClass(
      "md:flex-row",
    );
  });

  describe("with a meeting range", () => {
    const renderMeeting = (dayShiftLabel?: string) =>
      render(
        <LocalDateTime
          localTimeLabel="12:30"
          localDateLabel="Sat, Mar 7"
          localIsoDate="2026-03-07"
          wallTimeInputLabel={NAME}
          onConfirmWallTime={() => WallTimeInputOutcome.CLOSED}
          rowVariant={LocationRowVariant.GRID_ROW}
          meetingRange={{ spanLabel: "23:00–01:00", dayShiftLabel }}
        />,
      );

    it("should show the span in the time button in the meeting time colour", () => {
      renderMeeting();
      expect(screen.getByRole("button", { name: NAME })).toHaveTextContent(
        "23:00–01:00",
      );
      expect(screen.getByText("23:00–01:00")).toHaveClass("text-meeting-text");
    });

    it("should show the day shift mark bold in the danger colour before the date", () => {
      renderMeeting("днём раньше");
      const mark = screen.getByText("днём раньше");
      expect(mark).toHaveClass("font-bold", "text-danger");
      expect(
        mark.compareDocumentPosition(screen.getByText("Sat, Mar 7")) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("should show no mark without a day shift", () => {
      renderMeeting();
      expect(screen.queryByText("днём раньше")).toBeNull();
    });

    it("should open the wall-time input with the local time", async () => {
      renderMeeting();
      await userEvent.click(screen.getByRole("button", { name: NAME }));
      expect(screen.getByRole("textbox", { name: NAME })).toHaveValue("12:30");
    });
  });
});
