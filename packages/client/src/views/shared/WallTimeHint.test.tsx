// Verifies FR7, NFR-A3, UX3 of add-wall-time-input-with-hint (D6).
import { render, screen } from "@testing-library/react";
import { WallTimeHint } from "./WallTimeHint";

const TEXT =
  "02:30 не существует в этот день — часы переведены вперёд. Показано 03:30";

describe("WallTimeHint", () => {
  it("is announced politely as a status", () => {
    render(<WallTimeHint text={TEXT} />);
    expect(screen.getByRole("status")).toHaveTextContent(TEXT);
  });

  it("uses the notice colours", () => {
    render(<WallTimeHint text={TEXT} />);
    expect(screen.getByRole("status")).toHaveClass(
      "bg-notice",
      "text-notice-foreground",
    );
  });

  it("hides its icon from assistive technology", () => {
    const { container } = render(<WallTimeHint text={TEXT} />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
