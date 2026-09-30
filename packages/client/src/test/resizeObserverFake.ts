import { act } from "@testing-library/react";

type ResizeCallback = (entries: ResizeObserverEntry[]) => void;

interface FakeObservation {
  callback: ResizeCallback;
  target: Element;
}

/**
 * Controllable `ResizeObserver` for width-driven tests. The global no-op stub
 * in `setup.ts` never reports a width; install this one with
 * `vi.stubGlobal("ResizeObserver", ...)` and restore with `vi.unstubAllGlobals()`.
 */
export const createResizeObserverFake = () => {
  const observations: FakeObservation[] = [];

  class ResizeObserverFake {
    constructor(private readonly callback: ResizeCallback) {}
    observe(target: Element) {
      observations.push({ callback: this.callback, target });
    }
    unobserve(target: Element) {
      this.removeWhere((observation) => observation.target === target);
    }
    disconnect() {
      this.removeWhere((observation) => observation.callback === this.callback);
    }
    private removeWhere(
      shouldRemove: (observation: FakeObservation) => boolean,
    ) {
      for (let index = observations.length - 1; index >= 0; index--) {
        if (shouldRemove(observations[index])) observations.splice(index, 1);
      }
    }
  }

  return {
    ResizeObserverFake: ResizeObserverFake as unknown as typeof ResizeObserver,
    observedCount: () => observations.length,
    /** Reports a new content width to every observer of the page. */
    reportWidth: (width: number) => {
      act(() => {
        for (const { callback, target } of [...observations]) {
          callback([
            {
              target,
              contentRect: { width },
            } as unknown as ResizeObserverEntry,
          ]);
        }
      });
    },
  };
};

/** Installs the fake as the global `ResizeObserver` and returns its controls. */
export const installResizeObserverFake = () => {
  const fake = createResizeObserverFake();
  vi.stubGlobal("ResizeObserver", fake.ResizeObserverFake);
  return fake;
};
