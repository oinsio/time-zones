// Verifies FR3 of add-remote-zone-rules-updates (D4): the shared recheck on return.
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetPageVisibility, setPageVisibility } from "@/test/pageVisibility";
import { createSwitchableClock } from "@/test/switchableClock";
import { useRecheckOnReturn } from "./useRecheckOnReturn";

const START = "2026-03-08T07:30:00Z";
const MINUTES_16 = "2026-03-08T07:46:00Z";
const MINUTES_5 = "2026-03-08T07:35:00Z";

function setup(isEnabled = true) {
  const clock = createSwitchableClock(START);
  const onRecheck = vi.fn();
  const rendered = renderHook(
    (props: { isEnabled: boolean }) =>
      useRecheckOnReturn({ onRecheck, clock, isEnabled: props.isEnabled }),
    { initialProps: { isEnabled } },
  );
  const returnToPage = (instant: string) => {
    clock.moveTo(instant);
    act(() => setPageVisibility("visible"));
  };
  return { clock, onRecheck, returnToPage, ...rendered };
}

describe("useRecheckOnReturn", () => {
  afterEach(() => {
    resetPageVisibility();
  });

  it("should recheck once when the page returns after 16 minutes", () => {
    const { onRecheck, returnToPage } = setup();
    returnToPage(MINUTES_16);
    expect(onRecheck).toHaveBeenCalledTimes(1);
  });

  it("should not recheck when the page returns after 5 minutes", () => {
    const { onRecheck, returnToPage } = setup();
    returnToPage(MINUTES_5);
    expect(onRecheck).not.toHaveBeenCalled();
  });

  it("should not recheck while it is not enabled", () => {
    const { onRecheck, returnToPage } = setup(false);
    returnToPage(MINUTES_16);
    expect(onRecheck).not.toHaveBeenCalled();
  });

  it("should count the interval from the moment it becomes enabled", () => {
    const { clock, onRecheck, rerender, returnToPage } = setup(false);
    clock.moveTo(MINUTES_16);
    rerender({ isEnabled: true });
    returnToPage("2026-03-08T07:50:00Z");
    expect(onRecheck).not.toHaveBeenCalled();
  });
});
