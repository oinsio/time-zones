// Verifies FR1, FR3, FR4, UX1, UX2 of fix-grid-meeting-range-lock-and-layering.
// Verifies FR3 of refine-meeting-range-entry-and-handles.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingRangeInputOutcome, WallTimeInputOutcome } from "@/controller";
import type { PresentedLocationMeetingRange } from "@/presenter";
import { LocalDateTime } from "./LocalDateTime";
import { LocationRowVariant } from "./locationRowVariant";

const TIME_NAME = "Ввести время — Moscow, 10:30";
const SPAN_NAME = "Ввести время встречи — Moscow, 07:00–09:00";
const MEETING_RANGE: PresentedLocationMeetingRange = {
  startTimeLabel: "07:00",
  endTimeLabel: "09:00",
  spanLabel: "07:00–09:00",
};

const dateTime = (
  meetingRange: PresentedLocationMeetingRange | undefined,
  onConfirmWallTime = vi.fn(() => WallTimeInputOutcome.CLOSED),
  onConfirmMeetingRange = vi.fn(() => MeetingRangeInputOutcome.CLOSED),
) => (
  <LocalDateTime
    localTimeLabel="10:30"
    localDateLabel="Sun, Mar 8"
    localIsoDate="2026-03-08"
    wallTimeInputLabel={TIME_NAME}
    cityLabel="Moscow"
    onConfirmWallTime={onConfirmWallTime}
    onConfirmMeetingRange={onConfirmMeetingRange}
    rowVariant={LocationRowVariant.GRID_ROW}
    meetingRange={meetingRange}
  />
);

describe("LocalDateTime with a meeting range", () => {
  it("should name the span button after the meeting range input", () => {
    render(dateTime(MEETING_RANGE));
    expect(screen.getByRole("button", { name: SPAN_NAME })).toBeInTheDocument();
  });

  it("should open the meeting range input, not the wall-time input", async () => {
    render(dateTime(MEETING_RANGE));

    await userEvent.click(screen.getByRole("button", { name: SPAN_NAME }));

    expect(
      screen.getByRole("textbox", { name: "Время начала — Moscow" }),
    ).toHaveValue("07:00");
    expect(
      screen.getByRole("textbox", { name: "Время окончания — Moscow" }),
    ).toHaveValue("09:00");
    expect(screen.queryByRole("textbox", { name: TIME_NAME })).toBeNull();
  });

  it("should confirm the texts with the date the row showed when the input opened", async () => {
    const onConfirmMeetingRange = vi.fn(() => MeetingRangeInputOutcome.CLOSED);
    render(dateTime(MEETING_RANGE, undefined, onConfirmMeetingRange));
    await userEvent.click(screen.getByRole("button", { name: SPAN_NAME }));

    await userEvent.keyboard("{Enter}");

    expect(onConfirmMeetingRange).toHaveBeenCalledWith(
      "07:00",
      "09:00",
      "2026-03-08",
    );
  });

  it("should return the focus to the span button after a confirmation", async () => {
    render(dateTime(MEETING_RANGE));
    await userEvent.click(screen.getByRole("button", { name: SPAN_NAME }));

    await userEvent.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: SPAN_NAME })).toHaveFocus();
  });

  it("should keep the input open with an error for a refused range", async () => {
    render(
      dateTime(
        MEETING_RANGE,
        undefined,
        vi.fn(() => MeetingRangeInputOutcome.OUTSIDE_REFERENCE_DAY),
      ),
    );
    await userEvent.click(screen.getByRole("button", { name: SPAN_NAME }));

    await userEvent.keyboard("{Enter}");

    expect(
      screen.getByText("Встреча должна быть внутри дня"),
    ).toBeInTheDocument();
  });

  it("should close an open wall-time input without confirming when the meeting range appears", async () => {
    const onConfirmWallTime = vi.fn(() => WallTimeInputOutcome.CLOSED);
    const { rerender } = render(dateTime(undefined, onConfirmWallTime));
    await userEvent.click(screen.getByRole("button", { name: TIME_NAME }));
    await userEvent.type(screen.getByRole("textbox"), "5");

    rerender(dateTime(MEETING_RANGE, onConfirmWallTime));

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(onConfirmWallTime).not.toHaveBeenCalled();
  });

  it("should offer the wall-time input again after the meeting range is removed", async () => {
    const { rerender } = render(dateTime(MEETING_RANGE));

    rerender(dateTime(undefined));
    await userEvent.click(screen.getByRole("button", { name: TIME_NAME }));

    expect(screen.getByRole("textbox", { name: TIME_NAME })).toHaveValue(
      "10:30",
    );
  });
});
