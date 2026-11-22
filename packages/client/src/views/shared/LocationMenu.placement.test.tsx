// Verifies FR1, FR2, UX1, UX2, NFR-A2 of keep-location-menu-in-view-and-clear-range-after-share.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocationMenu } from "./LocationMenu";

const VIEWPORT_HEIGHT_PX = 600;
const MENU_HEIGHT_PX = 184;

function renderMenu(
  isMenuFixedToViewport: boolean,
  top: number,
  bottom: number,
) {
  render(
    <LocationMenu
      city="Moscow"
      isMenuFixedToViewport={isMenuFixedToViewport}
      items={[
        { label: "Move up", onSelect: vi.fn() },
        { label: "Remove", onSelect: vi.fn() },
      ]}
    />,
  );
  const trigger = screen.getByRole("button", { name: /Moscow/ });
  vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
    top,
    bottom,
    right: 300,
  } as DOMRect);
  return trigger;
}

describe("LocationMenu placement", () => {
  beforeEach(() => {
    vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(
      VIEWPORT_HEIGHT_PX,
    );
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(
      MENU_HEIGHT_PX,
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("should open under the button near the top", async () => {
    await userEvent.click(renderMenu(false, 100, 144));

    expect(screen.getByRole("menu")).toHaveClass("top-full");
  });

  it("should open above the button near the bottom", async () => {
    await userEvent.click(renderMenu(false, 550, 594));

    expect(screen.getByRole("menu")).toHaveClass("bottom-full");
  });

  it("should limit the height and scroll when it fits on neither side", async () => {
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(900);

    await userEvent.click(renderMenu(false, 300, 344));

    const menu = screen.getByRole("menu");
    expect(menu.style.maxHeight).not.toBe("");
    expect(menu.style.overflowY).toBe("auto");
  });

  it("should anchor a fixed menu above by its bottom edge", async () => {
    await userEvent.click(renderMenu(true, 550, 594));

    expect(screen.getByRole("menu").style.bottom).toBe(
      `${VIEWPORT_HEIGHT_PX - 550 + 4}px`,
    );
  });

  it("should still focus Remove on Arrow Up from the first item wraps to", async () => {
    await userEvent.click(renderMenu(false, 550, 594));

    await userEvent.keyboard("{ArrowUp}");

    expect(screen.getByRole("menuitem", { name: "Remove" })).toHaveFocus();
  });
});
