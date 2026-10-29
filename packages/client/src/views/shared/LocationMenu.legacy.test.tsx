// Verifies FR14 of set-home-location-and-show-differences (D7): the menu without Pointer Events.
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

async function renderLegacyMenu() {
  vi.stubGlobal("PointerEvent", undefined);
  vi.resetModules();
  const { LocationMenu } = await import("./LocationMenu");
  const onRemove = vi.fn();
  render(
    <div>
      <button type="button">Outside</button>
      <LocationMenu
        city="Moscow"
        items={[{ label: "Remove", onSelect: onRemove }]}
      />
    </div>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Действия: Moscow" }));
  return { onRemove };
}

describe("LocationMenu without Pointer Events", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("should open on click", async () => {
    await renderLegacyMenu();

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("should call remove on a click of the item", async () => {
    const { onRemove } = await renderLegacyMenu();

    fireEvent.click(screen.getByRole("menuitem", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("should close on a touch outside", async () => {
    await renderLegacyMenu();

    fireEvent.touchStart(screen.getByRole("button", { name: "Outside" }));

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should ignore a pointerdown outside, which such an engine never sends", async () => {
    await renderLegacyMenu();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("should stay open and still remove when the item loses focus without a target", async () => {
    const { onRemove } = await renderLegacyMenu();
    const item = screen.getByRole("menuitem", { name: "Remove" });

    fireEvent.focusOut(item, { relatedTarget: null });
    fireEvent.click(item);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("should stay open when focus is lost without a target", async () => {
    await renderLegacyMenu();

    fireEvent.focusOut(screen.getByRole("menuitem"), { relatedTarget: null });

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("should close when focus moves to an element outside the menu", async () => {
    await renderLegacyMenu();

    fireEvent.focusOut(screen.getByRole("menuitem"), {
      relatedTarget: screen.getByRole("button", { name: "Outside" }),
    });

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should make the menu container focusable by script only", async () => {
    await renderLegacyMenu();

    expect(screen.getByRole("menu")).toHaveAttribute("tabindex", "-1");
  });
});
