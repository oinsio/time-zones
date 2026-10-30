// Verifies FR2, FR6, UX1, UX2, NFR-A2 of show-local-time-and-date-on-location-cards (D5).
// Verifies FR1, FR5, NFR-A2, UX1 of add-wall-time-input-with-hint (D6).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WallTimeInputOutcome } from "@/controller";
import { LocalDateTime } from "./LocalDateTime";

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
