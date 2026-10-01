// Verifies NFR-A4 of reorder-locations-by-drag-and-drop (D3).
import { act, renderHook } from "@testing-library/react";
import { REDUCED_MOTION_MEDIA_QUERY } from "@/constants";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

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
  return { queryList, matchMedia, change, listeners };
}

describe("usePrefersReducedMotion", () => {
  const originalMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("should ask for the reduced-motion media query", () => {
    const { matchMedia } = stubMatchMedia(false);
    renderHook(() => usePrefersReducedMotion());
    expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_MEDIA_QUERY);
  });

  it.each([true, false])(
    "should return %s when the query matches %s",
    (matches) => {
      stubMatchMedia(matches);
      const { result } = renderHook(() => usePrefersReducedMotion());
      expect(result.current).toBe(matches);
    },
  );

  it("should listen to the change event", () => {
    const { queryList } = stubMatchMedia(false);
    renderHook(() => usePrefersReducedMotion());
    expect(queryList.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("should update on the change event", () => {
    const { change } = stubMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    act(() => change(true));
    expect(result.current).toBe(true);
  });

  it("should remove its listener on unmount", () => {
    const { listeners } = stubMatchMedia(false);
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });

  it("should return false when matchMedia is undefined", () => {
    // @ts-expect-error simulating an environment without matchMedia
    window.matchMedia = undefined;
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});
