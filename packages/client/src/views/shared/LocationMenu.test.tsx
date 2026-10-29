// Verifies FR11, NFR-A2 of set-home-location-and-show-differences (D7): the location menu.
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LocationMenu } from "./LocationMenu";

function renderMenu() {
  const onMakeHome = vi.fn();
  const onRemove = vi.fn();
  render(
    <div>
      <button type="button">Outside</button>
      <LocationMenu
        city="Moscow"
        items={[
          { label: "Make home", onSelect: onMakeHome },
          { label: "Remove", onSelect: onRemove },
        ]}
      />
    </div>,
  );
  const trigger = screen.getByRole("button", { name: "Действия: Moscow" });
  return { trigger, onMakeHome, onRemove };
}

describe("LocationMenu", () => {
  it("should be a closed menu button with the glyph", () => {
    const { trigger } = renderMenu();

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("⋯");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should open on click with the items as menu items", async () => {
    const { trigger } = renderMenu();

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Make home", "Remove"]);
  });

  it("should close on a second click of the button", async () => {
    const { trigger } = renderMenu();

    await userEvent.click(trigger);
    await userEvent.click(trigger);

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should open on Enter with focus on the first item", async () => {
    const { trigger } = renderMenu();
    trigger.focus();

    await userEvent.keyboard("{Enter}");

    expect(screen.getByRole("menuitem", { name: "Make home" })).toHaveFocus();
  });

  it("should open on Arrow Down on the first item and on Arrow Up on the last", async () => {
    const { trigger } = renderMenu();
    trigger.focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Make home" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{ArrowUp}");

    expect(screen.getByRole("menuitem", { name: "Remove" })).toHaveFocus();
  });

  it("should move between items with wrap-around, Home and End", async () => {
    const { trigger } = renderMenu();
    trigger.focus();
    await userEvent.keyboard("{Enter}");

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Remove" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Make home" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Remove" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Make home" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Remove" })).toHaveFocus();
  });

  it("should close on Escape and focus the button again", async () => {
    const { trigger } = renderMenu();
    await userEvent.click(trigger);

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("should close on Tab", async () => {
    const { trigger } = renderMenu();
    await userEvent.click(trigger);

    await userEvent.keyboard("{Tab}");

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should run the action of a clicked item and close", async () => {
    const { trigger, onRemove, onMakeHome } = renderMenu();
    await userEvent.click(trigger);

    await userEvent.click(screen.getByRole("menuitem", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onMakeHome).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should activate the focused item with Enter", async () => {
    const { trigger, onMakeHome } = renderMenu();
    trigger.focus();
    await userEvent.keyboard("{Enter}");

    await userEvent.keyboard("{Enter}");

    expect(onMakeHome).toHaveBeenCalledTimes(1);
  });

  it("should close when the pointer goes down outside", async () => {
    const { trigger } = renderMenu();
    await userEvent.click(trigger);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should stay open when the pointer goes down inside", async () => {
    const { trigger } = renderMenu();
    await userEvent.click(trigger);

    fireEvent.pointerDown(screen.getByRole("menu"));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("should close when focus moves outside the menu", async () => {
    const { trigger } = renderMenu();
    await userEvent.click(trigger);

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));

    expect(screen.queryByRole("menu")).toBeNull();
  });
});
