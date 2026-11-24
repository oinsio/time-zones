// Verifies FR4, UX3, NFR-A1 of add-unix-time-converter-tool.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Binary } from "lucide-react";
import { lazy } from "react";
import type { ToolDefinition } from "@/tools";
import { ToolButtons } from "./ToolButtons";

const Page = lazy(async () => ({ default: () => null }));
const toolA: ToolDefinition = {
  id: "a",
  titleKey: "tools.groupLabel",
  icon: Binary,
  page: Page,
};
const toolB: ToolDefinition = { ...toolA, id: "b", titleKey: "tools.back" };
const toolWithoutPage: ToolDefinition = { ...toolA, id: "c", page: undefined };

const renderButtons = (
  tools: readonly ToolDefinition[],
  onOpenTool = vi.fn(),
) =>
  render(
    <ToolButtons
      tools={tools}
      onOpenTool={onOpenTool}
      getOpenerRef={() => () => {}}
    />,
  );

describe("ToolButtons", () => {
  it("should show one button per tool in the order given", () => {
    renderButtons([toolA, toolB]);
    expect(
      screen
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Инструменты", "Назад"]);
  });

  it("should name each button and give it the name as its pointer hint", () => {
    renderButtons([toolA]);
    expect(screen.getByRole("button", { name: "Инструменты" })).toHaveAttribute(
      "title",
      "Инструменты",
    );
  });

  it("should show no button for a tool without a page", () => {
    renderButtons([toolWithoutPage]);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("should show nothing for no tool", () => {
    renderButtons([]);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("should open the tool the button belongs to", async () => {
    const onOpenTool = vi.fn();
    renderButtons([toolA, toolB], onOpenTool);
    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(onOpenTool).toHaveBeenCalledExactlyOnceWith("b");
  });
});
