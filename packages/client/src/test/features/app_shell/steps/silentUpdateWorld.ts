// Verifies FR3, FR5, FR6, FR7 of apply-data-updates-silently: the shared world of the unit scenarios of the update notice.
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react/pure";
import { createElement } from "react";
import { expect, vi } from "vitest";
import { AppShell } from "@/app";
import { APP_REVISION, MILLISECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { AppRevisionSource } from "@/ports";
import { fakeServiceWorker } from "@/test/fakeServiceWorker";
import { resetPageVisibility, setPageVisibility } from "@/test/pageVisibility";
import {
  createSwitchableClock,
  type SwitchableClock,
} from "@/test/switchableClock";

export const START_INSTANT = "2026-03-08T07:30:00Z";
export const RECHECK_MINUTES = 16;

export type SilentUpdateWorld = ReturnType<typeof createSilentUpdateWorld>;

/** What a scenario names `a1` is the running build's app revision; any other name stays as written. */
export function createSilentUpdateWorld() {
  let clock: SwitchableClock = createSwitchableClock(START_INSTANT);
  let runningName = "";
  const update = vi.fn().mockResolvedValue(undefined);
  return {
    update,
    reset: () => {
      cleanup();
      localStorage.clear();
      fakeServiceWorker.isUpdateAvailable = false;
      clock = createSwitchableClock(START_INSTANT);
      runningName = "";
      update.mockReset().mockResolvedValue(undefined);
    },
    finish: () => {
      resetPageVisibility();
      cleanup();
    },
    nameRunningRevision: (name: string) => {
      runningName = name;
    },
    revisionNamed: (name: string) =>
      name === runningName ? APP_REVISION : name,
    open: async (appRevisionSource: AppRevisionSource) => {
      render(createElement(AppShell, { clock, appRevisionSource }));
      await waitFor(() =>
        expect(
          screen.getByRole("main").querySelector("[aria-busy]"),
        ).toBeNull(),
      );
      await act(async () => {
        fakeServiceWorker.onRegisteredSW?.("sw.js", {
          update,
        } as unknown as ServiceWorkerRegistration);
      });
    },
    returnAfterMinutes: async (minutes: number) => {
      clock.moveTo(
        Temporal.Instant.fromEpochMilliseconds(
          clock.instant().epochMilliseconds + minutes * MILLISECONDS_PER_MINUTE,
        ).toString(),
      );
      await act(async () => setPageVisibility("visible"));
    },
    getNoticesRegion: () => {
      const region = screen
        .getAllByRole("status")
        .find((candidate) => candidate.closest("footer") !== null);
      if (region === undefined) throw new Error("no notices region");
      return region;
    },
  };
}
