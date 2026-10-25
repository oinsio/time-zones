// Verifies FR3 of show-local-time-and-date-on-location-cards (D4).
import { describe, expect, it, vi } from "vitest";
import { timeoutTickScheduler } from "./tickScheduler";

const waitForTimer = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("timeoutTickScheduler", () => {
  it("should run the callback after the delay", async () => {
    const callback = vi.fn();
    timeoutTickScheduler.schedule(callback, 0);
    await waitForTimer();
    expect(callback).toHaveBeenCalledOnce();
  });

  it("should not run the callback after it was cancelled", async () => {
    const callback = vi.fn();
    const cancel = timeoutTickScheduler.schedule(callback, 0);
    cancel();
    await waitForTimer();
    expect(callback).not.toHaveBeenCalled();
  });
});
