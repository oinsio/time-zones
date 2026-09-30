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

describe("usePwaUpdateStatus update check", () => {
  const registerWithUpdate = (update: () => Promise<void>) => {
    mockServiceWorker();
    const { result } = renderHook(() => usePwaUpdateStatus());
    const { onRegisteredSW } = vi.mocked(useRegisterSW).mock.calls[0][0] ?? {};
    return { result, onRegisteredSW, registration: { update } };
  };
  const registerAndCheck = async (update: () => Promise<void>) => {
    const registered = registerWithUpdate(update);
    await act(async () => {
      registered.onRegisteredSW?.(
        "sw.js",
        registered.registration as unknown as ServiceWorkerRegistration,
      );
    });
    return registered;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not report a failed check before any check ran", () => {
    mockServiceWorker();
    const { result } = renderHook(() => usePwaUpdateStatus());
    expect(result.current.isUpdateCheckFailed).toBe(false);
  });

  it("should check for an update once when the worker registers", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    await registerAndCheck(update);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("should not report a failure when the check succeeds", async () => {
    const { result } = await registerAndCheck(
      vi.fn().mockResolvedValue(undefined),
    );
    expect(result.current.isUpdateCheckFailed).toBe(false);
  });

  it("should report a failure when the check rejects", async () => {
    const { result } = await registerAndCheck(
      vi.fn().mockRejectedValue(new TypeError("network unreachable")),
    );
    expect(result.current.isUpdateCheckFailed).toBe(true);
  });

  it("should clear the failure when the connection returns", async () => {
    const { result } = await registerAndCheck(
      vi.fn().mockRejectedValue(new TypeError("network unreachable")),
    );
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current.isUpdateCheckFailed).toBe(false);
  });

  it("should keep the failure while the browser is offline", async () => {
    const { result } = await registerAndCheck(
      vi.fn().mockRejectedValue(new TypeError("network unreachable")),
    );
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.isUpdateCheckFailed).toBe(true);
  });

  it("should not fail when the worker registers without a registration", async () => {
    const { result, onRegisteredSW } = registerWithUpdate(vi.fn());
    await act(async () => {
      onRegisteredSW?.("sw.js", undefined);
    });
    expect(result.current.isUpdateCheckFailed).toBe(false);
  });
});
