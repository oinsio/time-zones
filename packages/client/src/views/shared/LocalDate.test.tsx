// Verifies FR2, UX1 of show-local-time-and-date-on-location-cards (D5).
// Verifies FR8, UX1 of add-grid-meeting-range-and-share (D8): the day shift mark before the date.
// Verifies FR7, FR8 of redesign-cards-grid-and-day-palettes: the date of a row.
import { render, screen } from "@testing-library/react";
import { LocalDate } from "./LocalDate";
import { LocationRowVariant } from "./locationRowVariant";

describe("LocalDate", () => {
  it("should show the date as muted text in a time element with the ISO date", () => {
    render(<LocalDate localDateLabel="вс, 8 мар." localIsoDate="2026-03-08" />);

    const dateElement = screen.getByText("вс, 8 мар.");
    expect(dateElement.tagName).toBe("TIME");
    expect(dateElement).toHaveAttribute("datetime", "2026-03-08");
    expect(dateElement.parentElement).toHaveClass("text-muted-foreground");
  });

  it("should size the Cards date 13, 14 and 15 px by the width and the Grid date 14 px", () => {
    const { rerender } = render(
      <LocalDate localDateLabel="Sun" localIsoDate="2026-03-08" />,
    );
    expect(screen.getByText("Sun").parentElement).toHaveClass(
      "text-card-meta-small",
      "min-[411px]:text-card-meta-large",
    );

    rerender(
      <LocalDate
        localDateLabel="Sun"
        localIsoDate="2026-03-08"
        rowVariant={LocationRowVariant.GRID_ROW}
      />,
    );
    expect(screen.getByText("Sun").parentElement).toHaveClass("text-grid-meta");
  });

  it("should show the day shift mark bold in the danger colour before the date", () => {
    render(
      <LocalDate
        localDateLabel="Sat, Mar 7"
        localIsoDate="2026-03-07"
        meetingRange={{
          startTimeLabel: "23:00",
          endTimeLabel: "01:00",
          spanLabel: "23:00–01:00",
          dayShiftLabel: "днём раньше",
        }}
      />,
    );

    const mark = screen.getByText("днём раньше");
    expect(mark).toHaveClass("font-bold", "text-danger");
    expect(
      mark.compareDocumentPosition(screen.getByText("Sat, Mar 7")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should show no mark without a day shift", () => {
    render(<LocalDate localDateLabel="Sat, Mar 7" localIsoDate="2026-03-07" />);

    expect(screen.queryByText("днём раньше")).toBeNull();
  });
});
