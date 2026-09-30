// Verifies FR8 of add-main-page-scaffold: connectivity follows the browser.
import { act, renderHook } from "@testing-library/react";
import { useOnlineStatus } from "./useOnlineStatus";

const setNavigatorOnLine = (isOnline: boolean) =>
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(isOnline);

describe("useOnlineStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([true, false])(
    "should start as %s when the browser reports navigator.onLine as %s",
    (isOnline) => {
      setNavigatorOnLine(isOnline);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current).toBe(isOnline);
    },
  );

  it("should become offline on the offline event", () => {
    setNavigatorOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);
  });

  it("should become online on the online event", () => {
    setNavigatorOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });

  it("should stop listening when unmounted", () => {
    setNavigatorOnLine(true);
    const { result, unmount } = renderHook(() => useOnlineStatus());
    unmount();
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(true);
  });
});
