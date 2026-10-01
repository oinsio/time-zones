// Verifies FR1, FR2, FR3, FR4, UX1 of open-location-search-with-slash-shortcut
import { renderHook } from "@testing-library/react";
import { KeyboardKey } from "@/constants";
import { useSearchShortcut } from "./useSearchShortcut";

/** Dispatches a "/" keydown; returns false when its default was prevented. */
const pressSlashOn = (target: EventTarget, options: KeyboardEventInit = {}) =>
  target.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: KeyboardKey.SLASH,
      bubbles: true,
      cancelable: true,
      ...options,
    }),
  );

const createTextInput = () => {
  const input = document.createElement("input");
  input.type = "text";
  return input;
};
const createContentEditable = () => {
  const div = document.createElement("div");
  div.setAttribute("contenteditable", "true");
  return div;
};

describe("useSearchShortcut", () => {
  let appendedElements: Element[] = [];

  afterEach(() => {
    for (const element of appendedElements) element.remove();
    appendedElements = [];
  });

  it("should call onShortcut once and prevent the default on a slash", () => {
    const onShortcut = vi.fn();
    renderHook(() => useSearchShortcut({ isEnabled: true, onShortcut }));
    const wasNotPrevented = pressSlashOn(document.body);
    expect(onShortcut).toHaveBeenCalledTimes(1);
    expect(wasNotPrevented).toBe(false);
  });

  it("should not handle or prevent the slash while disabled", () => {
    const onShortcut = vi.fn();
    renderHook(() => useSearchShortcut({ isEnabled: false, onShortcut }));
    const wasNotPrevented = pressSlashOn(document.body);
    expect(onShortcut).not.toHaveBeenCalled();
    expect(wasNotPrevented).toBe(true);
  });

  it("should stop handling after it becomes disabled", () => {
    const onShortcut = vi.fn();
    const { rerender } = renderHook(
      ({ isEnabled }) => useSearchShortcut({ isEnabled, onShortcut }),
      { initialProps: { isEnabled: true } },
    );
    rerender({ isEnabled: false });
    pressSlashOn(document.body);
    expect(onShortcut).not.toHaveBeenCalled();
  });

  it("should stop handling after unmount", () => {
    const onShortcut = vi.fn();
    const { unmount } = renderHook(() =>
      useSearchShortcut({ isEnabled: true, onShortcut }),
    );
    unmount();
    pressSlashOn(document.body);
    expect(onShortcut).not.toHaveBeenCalled();
  });

  it.each([
    ["input", createTextInput],
    ["textarea", () => document.createElement("textarea")],
    ["contenteditable element", createContentEditable],
  ])("should leave the slash alone in a focused %s", (_name, createTarget) => {
    const onShortcut = vi.fn();
    renderHook(() => useSearchShortcut({ isEnabled: true, onShortcut }));
    const target = createTarget();
    document.body.appendChild(target);
    appendedElements.push(target);
    const wasNotPrevented = pressSlashOn(target);
    expect(onShortcut).not.toHaveBeenCalled();
    expect(wasNotPrevented).toBe(true);
  });

  it.each(["ctrlKey", "metaKey", "altKey"])(
    "should leave the slash alone with %s held",
    (modifier) => {
      const onShortcut = vi.fn();
      renderHook(() => useSearchShortcut({ isEnabled: true, onShortcut }));
      const wasNotPrevented = pressSlashOn(document.body, { [modifier]: true });
      expect(onShortcut).not.toHaveBeenCalled();
      expect(wasNotPrevented).toBe(true);
    },
  );
});
