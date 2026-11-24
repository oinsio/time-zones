// Verifies FR1, FR2 of add-unix-time-converter-tool.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Binary, Clock } from "lucide-react";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { PreferencesProvider } from "@/controller";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import type { ToolDefinition } from "@/tools";
import { ToolsGroup } from "./ToolsGroup";

const toolA: ToolDefinition = { id: "a", titleKey: "tools.back", icon: Binary };
const toolB: ToolDefinition = {
  id: "b",
  titleKey: "tools.groupLabel",
  icon: Clock,
};

const renderGroup = (registry: readonly ToolDefinition[]) =>
  render(
    <PreferencesProvider
      repository={createInMemoryPreferencesRepository()}
      writeScheduler={immediateWriteScheduler}
    >
      <ToolsGroup registry={registry} />
    </PreferencesProvider>,
  );

describe("ToolsGroup", () => {
  it("should show one toggle per tool in registry order", () => {
    renderGroup([toolA, toolB]);
    expect(
      screen
        .getAllByRole("button")
        .map((button) => button.getAttribute("title")),
    ).toEqual(["Назад", "Инструменты"]);
  });

  it("should show every tool off at first", () => {
    renderGroup([toolA]);
    expect(screen.getByRole("button", { name: "Назад" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("should turn a tool on and off without touching another", async () => {
    renderGroup([toolA, toolB]);
    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    await userEvent.click(screen.getByRole("button", { name: "Инструменты" }));
    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByRole("button", { name: "Назад" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Инструменты" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("should render nothing for an empty registry", () => {
    renderGroup([]);
    expect(screen.queryByRole("group")).toBeNull();
  });
});
