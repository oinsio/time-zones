// Verifies FR2, FR6, UX1, UX2, NFR-A2 of show-local-time-and-date-on-location-cards (D5).
import { render, screen } from "@testing-library/react";
import { LocalDateTime } from "./LocalDateTime";

const renderDateTime = (localTimeLabel = "12:30") =>
  render(
    <LocalDateTime
      localTimeLabel={localTimeLabel}
      localDateLabel="Sun, Mar 8"
      localIsoDate="2026-03-08"
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
});
