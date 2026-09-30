// D3 of add-locations-via-search: framework-agnostic store (ADR-0002).
import { describe, expect, it, vi } from "vitest";
import { createStore } from "./store";

type Result = { ok: true; state: number } | { ok: false; error: string };
const reducer = (state: number, command: "inc" | "noop" | "fail"): Result => {
  if (command === "fail") return { ok: false, error: "nope" };
  return { ok: true, state: command === "inc" ? state + 1 : state };
};

describe("createStore", () => {
  it("should expose the initial snapshot", () => {
    expect(createStore(reducer, 5).getSnapshot()).toBe(5);
  });

  it("should update the snapshot and notify subscribers on change", () => {
    const store = createStore(reducer, 0);
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch("inc");
    expect(store.getSnapshot()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should not notify when the reducer returns the same state", () => {
    const store = createStore(reducer, 0);
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch("noop");
    expect(listener).not.toHaveBeenCalled();
  });

  it("should not notify or change state when the command fails", () => {
    const store = createStore(reducer, 3);
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch("fail");
    expect(listener).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toBe(3);
  });

  it("should stop notifying after unsubscribe", () => {
    const store = createStore(reducer, 0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.dispatch("inc");
    expect(listener).not.toHaveBeenCalled();
  });

  it("should return the reducer result from dispatch", () => {
    const store = createStore(reducer, 0);
    expect(store.dispatch("inc")).toEqual({ ok: true, state: 1 });
    expect(store.dispatch("fail")).toEqual({ ok: false, error: "nope" });
  });

  it("should notify every subscriber", () => {
    const store = createStore(reducer, 0);
    const first = vi.fn();
    const second = vi.fn();
    store.subscribe(first);
    store.subscribe(second);
    store.dispatch("inc");
    expect([first.mock.calls.length, second.mock.calls.length]).toEqual([1, 1]);
  });
});
