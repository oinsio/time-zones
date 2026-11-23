// Verifies FR5, NFR-A2 of add-unix-time-converter-tool.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolPageFrame } from "./ToolPageFrame";

describe("ToolPageFrame", () => {
  it("should focus its heading on mount", () => {
    render(<ToolPageFrame title="Tool" notices={null} onBack={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Tool" })).toHaveFocus();
  });

  it("should leave the focus alone when asked", () => {
    render(
      <ToolPageFrame
        title="Tool"
        notices={null}
        onBack={vi.fn()}
        shouldFocusHeading={false}
      />,
    );
    expect(screen.getByRole("heading", { name: "Tool" })).not.toHaveFocus();
  });

  it("should call onBack from the back button", async () => {
    const onBack = vi.fn();
    render(<ToolPageFrame title="Tool" notices={null} onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("should show the notices in a polite status region and the children in main", () => {
    render(
      <ToolPageFrame title="Tool" notices={<p>a notice</p>} onBack={vi.fn()}>
        <p>content</p>
      </ToolPageFrame>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("a notice");
    expect(screen.getByRole("main")).toHaveTextContent("content");
  });
});
