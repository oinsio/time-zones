// Verifies FR1, FR2, UX1, FR7 of fix-grid-meeting-range-lock-and-layering.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LocationMenu } from "./LocationMenu";

const ITEMS = [{ label: "Remove", onSelect: () => undefined }];
const TRIGGER_NAME = "Действия: Moscow";

const renderMenu = (props: {
  isDisabled?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}) => {
  const menu = (isDisabled: boolean | undefined) => (
    <div>
      <button type="button">Outside</button>
      <LocationMenu
        city="Moscow"
        items={ITEMS}
        isDisabled={isDisabled}
        onOpenChange={props.onOpenChange}
      />
    </div>
  );
  const rendered = render(menu(props.isDisabled));
  return {
    lock: () => rendered.rerender(menu(true)),
    trigger: screen.getByRole("button", { name: TRIGGER_NAME }),
  };
};

describe("LocationMenu open state", () => {
  it("should report true when it opens", async () => {
    const onOpenChange = vi.fn();
    const { trigger } = renderMenu({ onOpenChange });

    await userEvent.click(trigger);

    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it("should report false on Escape", async () => {
    const onOpenChange = vi.fn();
    const { trigger } = renderMenu({ onOpenChange });
    await userEvent.click(trigger);

    await userEvent.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("should report false on a press outside", async () => {
    const onOpenChange = vi.fn();
    const { trigger } = renderMenu({ onOpenChange });
    await userEvent.click(trigger);

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

describe("LocationMenu locked", () => {
  it("should disable the button with the dimmed style", () => {
    const { trigger } = renderMenu({ isDisabled: true });

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveClass("disabled:opacity-40");
  });

  it("should open nothing on a click", async () => {
    const { trigger } = renderMenu({ isDisabled: true });

    await userEvent.click(trigger);

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should stay enabled without the lock", () => {
    const { trigger } = renderMenu({});

    expect(trigger).toBeEnabled();
  });

  it("should close an open menu when the lock appears", async () => {
    const { trigger, lock } = renderMenu({});
    await userEvent.click(trigger);

    lock();

    expect(screen.queryByRole("menu")).toBeNull();
  });
});
