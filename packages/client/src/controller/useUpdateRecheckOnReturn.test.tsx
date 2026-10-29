// FR10 of support-legacy-ios-12-safari: a new version is looked for when the page returns.
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UPDATE_RECHECK_INTERVAL_MS } from "@/constants";
import { createSwitchableClock } from "@/test/switchableClock";
import { resetPageVisibility, setPageVisibility } from "@/test/pageVisibility";
import { useUpdateRecheckOnReturn } from "./useUpdateRecheckOnReturn";

const START = "2026-03-08T07:30:00Z";
const MINUTES_16 = "2026-03-08T07:46:00Z";
const MINUTES_32 = "2026-03-08T08:02:00Z";
const MINUTES_5 = "2026-03-08T07:35:00Z";
const JUST_BEFORE_INTERVAL = "2026-03-08T07:44:59Z";
const EXACTLY_INTERVAL = "2026-03-08T07:45:00Z";

function setup() {
  const clock = createSwitchableClock(START);
  const update = vi.fn().mockResolvedValue(undefined);
  const registration = { update } as unknown as ServiceWorkerRegistration;
  const onCheckFailed = vi.fn();
  const rendered = renderHook(() =>
    useUpdateRecheckOnReturn(registration, clock, onCheckFailed),
  );
  const returnToPage = (instant: string) => {
    clock.moveTo(instant);
    act(() => setPageVisibility("visible"));
  };
  return { clock, update, onCheckFailed, returnToPage, ...rendered };
}

describe("useUpdateRecheckOnReturn", () => {
  afterEach(() => {
    resetPageVisibility();
  });

  it("should check once when the page is visible after 16 minutes", () => {
    const { update, returnToPage } = setup();

    returnToPage(MINUTES_16);

    expect(update).toHaveBeenCalledTimes(1);
  });

  it("should not check when the page is visible after 5 minutes", () => {
    const { update, returnToPage } = setup();

    returnToPage(MINUTES_5);

    expect(update).not.toHaveBeenCalled();
  });

  it("should not check just before the interval ends", () => {
    const { update, returnToPage } = setup();

    returnToPage(JUST_BEFORE_INTERVAL);

    expect(update).not.toHaveBeenCalled();
  });

  it("should check when exactly the interval has passed", () => {
    const { update, returnToPage } = setup();

    returnToPage(EXACTLY_INTERVAL);

    expect(UPDATE_RECHECK_INTERVAL_MS).toBe(15 * 60 * 1000);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("should not check while the page is hidden", () => {
    const { clock, update } = setup();
    clock.moveTo(MINUTES_16);

    act(() => setPageVisibility("hidden"));

    expect(update).not.toHaveBeenCalled();
  });

  it("should check again after another 16 minutes", () => {
    const { update, returnToPage } = setup();

    returnToPage(MINUTES_16);
    returnToPage(MINUTES_32);

    expect(update).toHaveBeenCalledTimes(2);
  });

  it("should not check twice within the interval", () => {
    const { update, returnToPage } = setup();

    returnToPage(MINUTES_16);
    returnToPage(MINUTES_16);

    expect(update).toHaveBeenCalledTimes(1);
  });

  it("should report a failed check", async () => {
    const { update, onCheckFailed, returnToPage } = setup();
    update.mockRejectedValueOnce(new TypeError("network unreachable"));

    returnToPage(MINUTES_16);

    await vi.waitFor(() => expect(onCheckFailed).toHaveBeenCalledTimes(1));
  });

  it("should not report a successful check", async () => {
    const { update, onCheckFailed, returnToPage } = setup();

    returnToPage(MINUTES_16);
    await Promise.resolve();

    expect(update).toHaveBeenCalledTimes(1);
    expect(onCheckFailed).not.toHaveBeenCalled();
  });

  it("should remove its listener on unmount", () => {
    const { update, unmount, returnToPage } = setup();

    unmount();
    returnToPage(MINUTES_16);

    expect(update).not.toHaveBeenCalled();
  });

  it("should do nothing before a registration exists", () => {
    const clock = createSwitchableClock(START);
    renderHook(() => useUpdateRecheckOnReturn(undefined, clock, vi.fn()));
    clock.moveTo(MINUTES_16);

    const reportedErrors: ErrorEvent[] = [];
    const collectError = (event: ErrorEvent) => {
      event.preventDefault();
      reportedErrors.push(event);
    };
    window.addEventListener("error", collectError);

    act(() => setPageVisibility("visible"));

    window.removeEventListener("error", collectError);
    expect(reportedErrors).toEqual([]);
  });
});

describe("useUpdateRecheckOnReturn across renders", () => {
  afterEach(() => {
    resetPageVisibility();
  });

  it("should keep counting from the start-up check when the callback changes", () => {
    const clock = createSwitchableClock(START);
    const update = vi.fn().mockResolvedValue(undefined);
    const registration = { update } as unknown as ServiceWorkerRegistration;
    const { rerender } = renderHook(
      ({ onCheckFailed }) =>
        useUpdateRecheckOnReturn(registration, clock, onCheckFailed),
      { initialProps: { onCheckFailed: vi.fn() as () => void } },
    );
    clock.moveTo(MINUTES_16);
    rerender({ onCheckFailed: vi.fn() });

    act(() => setPageVisibility("visible"));

    expect(update).toHaveBeenCalledTimes(1);
  });
});
