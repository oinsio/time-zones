// Verifies NFR-A2 of add-unix-time-converter-tool.
import { act, renderHook } from "@testing-library/react";
import { PRIMARY_POINTER_FINE_HOVER_MEDIA_QUERY } from "@/constants";
import { usePrimaryPointer } from "./usePrimaryPointer";

type ChangeListener = () => void;

function stubMatchMedia(initialMatches: boolean) {
  const listeners = new Set<ChangeListener>();
  const queryList = {
    matches: initialMatches,
    addEventListener: vi.fn((_type: string, listener: ChangeListener) =>
      listeners.add(listener),
    ),
    removeEventListener: vi.fn((_type: string, listener: ChangeListener) =>
      listeners.delete(listener),
    ),
  };
  const matchMedia = vi.fn(() => queryList);
  window.matchMedia = matchMedia as unknown as typeof window.matchMedia;
  const change = (matches: boolean) => {
    queryList.matches = matches;
    for (const listener of listeners) listener();
  };
  return { matchMedia, change, listeners, queryList };
}

describe("usePrimaryPointer", () => {
  const originalMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("should ask for the fine, hovering pointer query", () => {
    const { matchMedia } = stubMatchMedia(false);
    renderHook(() => usePrimaryPointer());
    expect(matchMedia).toHaveBeenCalledWith(
      PRIMARY_POINTER_FINE_HOVER_MEDIA_QUERY,
    );
    expect(PRIMARY_POINTER_FINE_HOVER_MEDIA_QUERY).toBe(
      "(hover: hover) and (pointer: fine)",
    );
  });

  it.each([true, false])("should report matches %s", (matches) => {
    stubMatchMedia(matches);
    const { result } = renderHook(() => usePrimaryPointer());
    expect(result.current.isFineAndHovering).toBe(matches);
  });

  it("should follow the query", () => {
    const { change } = stubMatchMedia(false);
    const { result } = renderHook(() => usePrimaryPointer());
    act(() => change(true));
    expect(result.current.isFineAndHovering).toBe(true);
  });

  it("should stop listening on unmount", () => {
    const { listeners } = stubMatchMedia(false);
    const { unmount } = renderHook(() => usePrimaryPointer());
    unmount();
    expect(listeners.size).toBe(0);
  });

  it("should count a browser with no matchMedia as touch", () => {
    // @ts-expect-error a browser without matchMedia
    window.matchMedia = undefined;
    const { result } = renderHook(() => usePrimaryPointer());
    expect(result.current.isFineAndHovering).toBe(false);
  });

  it("should listen to the change event of the query", () => {
    const { addEventListener } = stubMatchMedia(false).queryList;
    renderHook(() => usePrimaryPointer());
    expect(addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("should follow and release the query of an engine that only has addListener", () => {
    const listeners = new Set<ChangeListener>();
    const queryList = {
      matches: false,
      addListener: vi.fn((listener: ChangeListener) => listeners.add(listener)),
      removeListener: vi.fn((listener: ChangeListener) =>
        listeners.delete(listener),
      ),
    };
    window.matchMedia = vi.fn(
      () => queryList,
    ) as unknown as typeof window.matchMedia;
    const { result, unmount } = renderHook(() => usePrimaryPointer());
    queryList.matches = true;
    act(() => {
      for (const listener of listeners) listener();
    });
    expect(result.current.isFineAndHovering).toBe(true);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
