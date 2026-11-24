// Verifies FR4, UX3, NFR-A1 of add-unix-time-converter-tool.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Binary } from "lucide-react";
import { createRef } from "react";
import type { ToolDefinition } from "@/tools";
import { ToolButton } from "./ToolButton";

const tool: ToolDefinition = {
  id: "sample",
  titleKey: "tools.unixTimeConverter",
  icon: Binary,
  page: undefined,
};
const TOOL_NAME = "Конвертер Unix-времени";

describe("ToolButton", () => {
  it("should be named by the tool name", () => {
    render(<ToolButton tool={tool} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: TOOL_NAME })).toBeInTheDocument();
  });

  it("should give the tool name as its pointer hint", () => {
    render(<ToolButton tool={tool} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: TOOL_NAME })).toHaveAttribute(
      "title",
      TOOL_NAME,
    );
  });

  it("should show an icon and no visible text", () => {
    render(<ToolButton tool={tool} onClick={vi.fn()} />);
    const button = screen.getByRole("button", { name: TOOL_NAME });
    expect(button.textContent).toBe("");
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("should call onClick when chosen", async () => {
    const onClick = vi.fn();
    render(<ToolButton tool={tool} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: TOOL_NAME }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("should hand its button element to the ref", () => {
    const buttonRef = createRef<HTMLButtonElement>();
    render(<ToolButton ref={buttonRef} tool={tool} onClick={vi.fn()} />);
    expect(buttonRef.current).toBe(
      screen.getByRole("button", { name: TOOL_NAME }),
    );
  });
});
