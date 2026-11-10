// Verifies FR13, NFR-A1, NFR-R1 of add-grid-meeting-range-and-share (D7).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingBar } from "./MeetingBar";

const BAR = {
  title: "Meeting · 2 h",
  shareLabel: "Share meeting",
  clearLabel: "Clear meeting",
};

const renderBar = (onShare = vi.fn(), onClear = vi.fn()) =>
  render(<MeetingBar bar={BAR} onShare={onShare} onClear={onClear} />);

describe("MeetingBar", () => {
  it("should show the title as the heading", () => {
    renderBar();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Meeting · 2 h",
    );
  });

  it.each(["Share meeting", "Clear meeting"])(
    "should give %s a 44 by 44 px button in the meeting colour",
    (name) => {
      renderBar();
      expect(screen.getByRole("button", { name })).toHaveClass(
        "h-11",
        "w-11",
        "text-meeting",
      );
    },
  );

  it("should order Share before Clear", () => {
    renderBar();
    const [first, second] = screen.getAllByRole("button");
    expect(first).toHaveAccessibleName("Share meeting");
    expect(second).toHaveAccessibleName("Clear meeting");
  });

  it("should call onShare and onClear", async () => {
    const onShare = vi.fn();
    const onClear = vi.fn();
    renderBar(onShare, onClear);

    await userEvent.click(
      screen.getByRole("button", { name: "Share meeting" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Clear meeting" }),
    );

    expect([onShare.mock.calls.length, onClear.mock.calls.length]).toEqual([
      1, 1,
    ]);
  });

  it("should hide the icons from assistive technology", () => {
    const { container } = renderBar();
    for (const icon of container.querySelectorAll("svg")) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });
});
