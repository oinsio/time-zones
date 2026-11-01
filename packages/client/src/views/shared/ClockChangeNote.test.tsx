// Verifies NFR-A1, UX1 of show-clock-change-note-on-location-cards (D6).
import { render, screen } from "@testing-library/react";
import { ClockChangeNote } from "./ClockChangeNote";

const TEXT = "On Oct 25 at 03:00 clocks will go back 1 h";

describe("ClockChangeNote", () => {
  it("renders the text", () => {
    render(<ClockChangeNote text={TEXT} />);

    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });

  it("is not a status message", () => {
    render(<ClockChangeNote text={TEXT} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("is not a live region", () => {
    const { container } = render(<ClockChangeNote text={TEXT} />);

    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("has no role", () => {
    const { container } = render(<ClockChangeNote text={TEXT} />);

    expect(container.querySelector("p")).not.toHaveAttribute("role");
  });

  it("uses the notice colours and hides its icon", () => {
    const { container } = render(<ClockChangeNote text={TEXT} />);

    expect(container.querySelector("p")).toHaveClass(
      "bg-notice",
      "text-notice-foreground",
      "order-last",
    );
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
