// Verifies FR6 of refine-meeting-range-entry-and-handles: a confirmed typed time carries its separator.
// Verifies FR8, UX3 of fix-grid-meeting-range-lock-and-layering (D6): the surface background lies behind the glyphs only.
// Verifies FR8, UX1 of add-grid-meeting-range-and-share.
// Verifies FR2, FR6, UX1, UX2, NFR-A2 of show-local-time-and-date-on-location-cards (D5).
// Verifies FR1, FR5, NFR-A2, UX1 of add-wall-time-input-with-hint (D6).
// Verifies FR8, FR17 of redesign-cards-grid-and-day-palettes: the time sizes and the day period marker.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WallTimeInputOutcome } from "@/controller";
import { LocalDateTime } from "./LocalDateTime";
import { LocationRowVariant } from "./locationRowVariant";

const NAME = "Ввести время — Алматы, 12:30";
const MEETING_NAME = "Ввести время встречи — Moscow, 23:00–01:00";

const renderTime = (
  localTimeLabel = "12:30",
  onConfirmWallTime = vi.fn(() => WallTimeInputOutcome.CLOSED),
  dayPeriodMarker = "",
) =>
  render(
    <LocalDateTime
      localTimeLabel={localTimeLabel}
      localTimeParts={{ digits: localTimeLabel, dayPeriodMarker }}
      localIsoDate="2026-03-08"
      wallTimeInputLabel={NAME}
      onConfirmWallTime={onConfirmWallTime}
    />,
  );

describe("LocalDateTime", () => {
  it("should show the time bold with tabular figures", () => {
    renderTime();
    expect(screen.getByRole("button", { name: NAME })).toHaveClass(
      "font-bold",
      "tabular-nums",
    );
  });

  it("should size the Cards time 26 px, 28 px from 411 px and 24 px up to 360 px", () => {
    renderTime();
    expect(screen.getByRole("button", { name: NAME })).toHaveClass(
      "text-card-time-small",
      "min-[361px]:text-card-time",
      "min-[411px]:text-card-time-large",
    );
  });

  it("should render nothing when the time label is empty", () => {
    const { container } = renderTime("");
    expect(container).toBeEmptyDOMElement();
  });

  it("should not be a live region", () => {
    const { container } = renderTime();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("should show the time as a button named by the city and the time", () => {
    renderTime();
    expect(screen.getByRole("button", { name: NAME })).toHaveTextContent(
      "12:30",
    );
  });

  it("should show the day period marker small and bold after the digits", () => {
    renderTime("12:30", undefined, "PM");
    const marker = screen.getByText("PM");
    expect(marker).toHaveClass("text-card-marker", "font-bold", "ml-1");
    expect(screen.getByRole("button", { name: NAME })).toHaveTextContent(
      "12:30PM",
    );
  });

  it("should show no marker in the 24-hour format", () => {
    renderTime();
    expect(screen.queryByText("PM")).toBeNull();
  });

  it("should open on a click, confirm with the opening date and return the focus after Enter", async () => {
    const onConfirmWallTime = vi.fn(() => WallTimeInputOutcome.CLOSED);
    renderTime("12:30", onConfirmWallTime);
    await userEvent.click(screen.getByRole("button", { name: NAME }));
    const field = screen.getByRole("textbox", { name: NAME });
    await userEvent.clear(field);
    await userEvent.type(field, "1040{Enter}");
    expect(onConfirmWallTime).toHaveBeenCalledWith("10:40", "2026-03-08");
    expect(screen.getByRole("button", { name: NAME })).toHaveFocus();
  });

  it("should return the focus to the button after Escape", async () => {
    renderTime();
    await userEvent.click(screen.getByRole("button", { name: NAME }));
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: NAME })).toHaveFocus();
  });
});

// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
describe("LocalDateTime row variants", () => {
  const renderGridRow = (meetingRange?: {
    startTimeLabel: string;
    endTimeLabel: string;
    spanLabel: string;
  }) =>
    render(
      <LocalDateTime
        localTimeLabel="12:30"
        localTimeParts={{ digits: "12:30", dayPeriodMarker: "" }}
        localIsoDate="2026-03-08"
        wallTimeInputLabel={NAME}
        onConfirmWallTime={() => WallTimeInputOutcome.CLOSED}
        rowVariant={LocationRowVariant.GRID_ROW}
        cityLabel="Moscow"
        meetingRange={meetingRange}
      />,
    );

  it("should size the Grid time 24 px and 26 px from 768 px", () => {
    renderGridRow();
    expect(screen.getByRole("button", { name: NAME })).toHaveClass(
      "text-grid-time",
      "md:text-grid-time-wide",
    );
  });

  it("should show the span in the time button in the meeting time colour", () => {
    renderGridRow({
      startTimeLabel: "23:00",
      endTimeLabel: "01:00",
      spanLabel: "23:00–01:00",
    });
    expect(
      screen.getByRole("button", { name: MEETING_NAME }),
    ).toHaveTextContent("23:00–01:00");
    expect(screen.getByRole("button", { name: MEETING_NAME })).toHaveClass(
      "text-meeting-text",
    );
  });
});

describe("LocalDateTime glyph backgrounds", () => {
  it("should paint only the time label with the surface, not the button box", () => {
    renderTime();
    const timeButton = screen.getByRole("button", { name: NAME });
    expect(timeButton).not.toHaveClass("bg-surface");
    expect(screen.getByText("12:30")).toHaveClass("bg-surface");
  });

  it("should paint only the span label with the surface while a meeting range is set", () => {
    render(
      <LocalDateTime
        localTimeLabel="12:30"
        localTimeParts={{ digits: "12:30", dayPeriodMarker: "" }}
        localIsoDate="2026-03-08"
        wallTimeInputLabel={NAME}
        onConfirmWallTime={() => WallTimeInputOutcome.CLOSED}
        rowVariant={LocationRowVariant.GRID_ROW}
        cityLabel="Moscow"
        meetingRange={{
          startTimeLabel: "23:00",
          endTimeLabel: "01:00",
          spanLabel: "23:00–01:00",
        }}
      />,
    );
    expect(screen.getByRole("button", { name: MEETING_NAME })).not.toHaveClass(
      "bg-surface",
    );
    expect(screen.getByText("23:00–01:00")).toHaveClass("bg-surface");
  });
});
