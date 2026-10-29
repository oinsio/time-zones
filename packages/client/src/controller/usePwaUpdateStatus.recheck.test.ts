import { useRegisterSW } from "virtual:pwa-register/react";
import { act, renderHook } from "@testing-library/react";
import { resetPageVisibility, setPageVisibility } from "@/test/pageVisibility";
import { createSwitchableClock } from "@/test/switchableClock";
import { usePwaUpdateStatus } from "./usePwaUpdateStatus";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const mockServiceWorker = () => {
  vi.mocked(useRegisterSW).mockReturnValue({
    offlineReady: [false, vi.fn()],
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  } as unknown as ReturnType<typeof useRegisterSW>);
};

// FR10 of support-legacy-ios-12-safari: the hook asks again when the page returns.
describe("usePwaUpdateStatus recheck on return", () => {
  beforeEach(() => {
    vi.mocked(useRegisterSW).mockClear();
  });

  afterEach(() => {
    resetPageVisibility();
  });

  it("should check a second time when the page is visible 16 minutes later", async () => {
    mockServiceWorker();
    const clock = createSwitchableClock("2026-03-08T07:30:00Z");
    const update = vi.fn().mockResolvedValue(undefined);
    renderHook(() => usePwaUpdateStatus(clock));
    const { onRegisteredSW } = vi.mocked(useRegisterSW).mock.calls[0][0] ?? {};
    await act(async () => {
      onRegisteredSW?.("sw.js", {
        update,
      } as unknown as ServiceWorkerRegistration);
    });

    clock.moveTo("2026-03-08T07:46:00Z");
    act(() => setPageVisibility("visible"));

    expect(update).toHaveBeenCalledTimes(2);
  });

  it("should report the failure of the check on return", async () => {
    mockServiceWorker();
    const clock = createSwitchableClock("2026-03-08T07:30:00Z");
    const update = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValue(new TypeError("network unreachable"));
    const { result } = renderHook(() => usePwaUpdateStatus(clock));
    const { onRegisteredSW } = vi.mocked(useRegisterSW).mock.calls[0][0] ?? {};
    await act(async () => {
      onRegisteredSW?.("sw.js", {
        update,
      } as unknown as ServiceWorkerRegistration);
    });

    clock.moveTo("2026-03-08T07:46:00Z");
    act(() => setPageVisibility("visible"));

    await vi.waitFor(() =>
      expect(result.current.isUpdateCheckFailed).toBe(true),
    );
  });
});
