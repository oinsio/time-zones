// Verifies FR6, FR7 of setup-app-shell-and-pages-deploy: offline-ready and
// update-available state from the service worker, reload only on request.

import { useRegisterSW } from "virtual:pwa-register/react";
import { act, renderHook } from "@testing-library/react";
import { usePwaUpdateStatus } from "./usePwaUpdateStatus";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

type RegisterSwState = ReturnType<typeof useRegisterSW>;

const mockServiceWorker = ({
  isOfflineReady = false,
  isUpdateAvailable = false,
} = {}) => {
  const setOfflineReady = vi.fn();
  const setNeedRefresh = vi.fn();
  const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useRegisterSW).mockReturnValue({
    offlineReady: [isOfflineReady, setOfflineReady],
    needRefresh: [isUpdateAvailable, setNeedRefresh],
    updateServiceWorker,
  } as RegisterSwState);
  return { setOfflineReady, setNeedRefresh, updateServiceWorker };
};

describe("usePwaUpdateStatus", () => {
  it.each([true, false])(
    "should expose isOfflineReady as %s from the service worker",
    (isOfflineReady) => {
      mockServiceWorker({ isOfflineReady });
      const { result } = renderHook(() => usePwaUpdateStatus());
      expect(result.current.isOfflineReady).toBe(isOfflineReady);
    },
  );

  it.each([true, false])(
    "should expose isUpdateAvailable as %s from the service worker",
    (isUpdateAvailable) => {
      mockServiceWorker({ isUpdateAvailable });
      const { result } = renderHook(() => usePwaUpdateStatus());
      expect(result.current.isUpdateAvailable).toBe(isUpdateAvailable);
    },
  );

  it("should not reload into the new version by itself", () => {
    const { updateServiceWorker } = mockServiceWorker({
      isUpdateAvailable: true,
    });
    renderHook(() => usePwaUpdateStatus());
    expect(updateServiceWorker).not.toHaveBeenCalled();
  });

  it("should reload into the new version when applyUpdate is called", async () => {
    const { updateServiceWorker } = mockServiceWorker({
      isUpdateAvailable: true,
    });
    const { result } = renderHook(() => usePwaUpdateStatus());
    await act(() => result.current.applyUpdate());
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it("should clear the offline-ready state when dismissed", () => {
    const { setOfflineReady } = mockServiceWorker({ isOfflineReady: true });
    const { result } = renderHook(() => usePwaUpdateStatus());
    act(() => result.current.dismiss());
    expect(setOfflineReady).toHaveBeenCalledWith(false);
  });

  it("should clear the update-available state when dismissed", () => {
    const { setNeedRefresh } = mockServiceWorker({ isUpdateAvailable: true });
    const { result } = renderHook(() => usePwaUpdateStatus());
    act(() => result.current.dismiss());
    expect(setNeedRefresh).toHaveBeenCalledWith(false);
  });
});
