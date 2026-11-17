// Verifies FR3, FR4, FR5, FR6, FR7 of apply-data-updates-silently: the update notice follows the app revision.
import { useRegisterSW } from "virtual:pwa-register/react";
import { act, renderHook } from "@testing-library/react";
import { createInMemoryAppRevisionSource } from "@/adapters";
import { APP_REVISION } from "@/constants";
import { AppRevisionFailure } from "@/ports";
import { resetPageVisibility, setPageVisibility } from "@/test/pageVisibility";
import { createSwitchableClock } from "@/test/switchableClock";
import { usePwaUpdateStatus } from "./usePwaUpdateStatus";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const START = "2026-03-08T07:30:00Z";
const SIXTEEN_MINUTES_LATER = "2026-03-08T07:46:00Z";
const FIVE_MINUTES_AFTER_THAT = "2026-03-08T07:51:00Z";
const OTHER_REVISION = "another-app-revision";

const mockWaitingBuild = (isBuildWaiting: boolean) => {
  const setNeedRefresh = vi.fn();
  vi.mocked(useRegisterSW).mockReturnValue({
    offlineReady: [false, vi.fn()],
    needRefresh: [isBuildWaiting, setNeedRefresh],
    updateServiceWorker: vi.fn().mockResolvedValue(undefined),
  } as unknown as ReturnType<typeof useRegisterSW>);
  return { setNeedRefresh };
};

const setOnline = (isOnline: boolean) =>
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(isOnline);

const startApp = async (
  answer: string | AppRevisionFailure,
  isBuildWaiting = true,
) => {
  const setters = mockWaitingBuild(isBuildWaiting);
  const source = createInMemoryAppRevisionSource(answer);
  const clock = createSwitchableClock(START);
  const update = vi.fn().mockResolvedValue(undefined);
  const hook = renderHook(() => usePwaUpdateStatus(clock, source));
  const { onRegisteredSW } = vi.mocked(useRegisterSW).mock.calls[0][0] ?? {};
  await act(async () => {
    onRegisteredSW?.("sw.js", {
      update,
    } as unknown as ServiceWorkerRegistration);
  });
  const returnToPage = async (instant: string) => {
    clock.moveTo(instant);
    await act(async () => setPageVisibility("visible"));
  };
  return { ...hook, source, clock, update, returnToPage, ...setters };
};

describe("usePwaUpdateStatus app revision", () => {
  beforeEach(() => {
    vi.mocked(useRegisterSW).mockClear();
    setOnline(true);
  });

  afterEach(() => {
    resetPageVisibility();
    vi.restoreAllMocks();
  });

  it("should offer the update when the site names another app revision", async () => {
    const { result } = await startApp(OTHER_REVISION);
    expect(result.current.isUpdateAvailable).toBe(true);
  });

  it("should keep the build waiting known when the notice is not shown", async () => {
    const { result } = await startApp(APP_REVISION);
    expect(result.current.isBuildWaiting).toBe(true);
    expect(result.current.isUpdateAvailable).toBe(false);
  });

  it("should offer nothing while no build is waiting", async () => {
    const { result } = await startApp(OTHER_REVISION, false);
    expect(result.current.isBuildWaiting).toBe(false);
    expect(result.current.isUpdateAvailable).toBe(false);
  });

  it("should not request the file while no build is waiting", async () => {
    const { source, returnToPage } = await startApp(OTHER_REVISION, false);
    await returnToPage(SIXTEEN_MINUTES_LATER);
    expect(source.requestCount()).toBe(0);
  });

  it("should not offer the update before the file was read", async () => {
    const { result } = await startApp(AppRevisionFailure.REQUEST_FAILED);
    expect(result.current.isUpdateAvailable).toBe(false);
  });

  it("should not request the file while offline", async () => {
    setOnline(false);
    const { source, result } = await startApp(OTHER_REVISION);
    expect(source.requestCount()).toBe(0);
    expect(result.current.isUpdateAvailable).toBe(false);
  });

  it("should read the file once per check while a build is waiting", async () => {
    const { source, returnToPage } = await startApp(APP_REVISION);
    expect(source.requestCount()).toBe(1);
    await returnToPage(SIXTEEN_MINUTES_LATER);
    expect(source.requestCount()).toBe(2);
    await returnToPage(FIVE_MINUTES_AFTER_THAT);
    expect(source.requestCount()).toBe(2);
  });

  it("should offer the update when a later check finds another app revision", async () => {
    const { result, source, returnToPage } = await startApp(APP_REVISION);
    source.setAnswer(OTHER_REVISION);
    await returnToPage(SIXTEEN_MINUTES_LATER);
    expect(result.current.isUpdateAvailable).toBe(true);
  });

  it("should keep the notice when a later read fails", async () => {
    const { result, source, returnToPage } = await startApp(OTHER_REVISION);
    source.setAnswer(AppRevisionFailure.UNPARSABLE);
    await returnToPage(SIXTEEN_MINUTES_LATER);
    expect(result.current.isUpdateAvailable).toBe(true);
    expect(source.requestCount()).toBe(2);
  });

  it("should hide the notice after a dismissal but keep the build waiting known", async () => {
    const { result, setNeedRefresh } = await startApp(OTHER_REVISION);
    act(() => result.current.dismiss());
    expect(result.current.isUpdateAvailable).toBe(false);
    expect(result.current.isBuildWaiting).toBe(true);
    expect(setNeedRefresh).not.toHaveBeenCalled();
  });

  it.each([
    [OTHER_REVISION, false],
    ["yet-another-revision", true],
  ])(
    "should show the dismissed notice again for the revision %s: %s",
    async (revision, isShown) => {
      const { result, source, returnToPage } = await startApp(OTHER_REVISION);
      act(() => result.current.dismiss());
      source.setAnswer(revision);
      await returnToPage(SIXTEEN_MINUTES_LATER);
      expect(result.current.isUpdateAvailable).toBe(isShown);
    },
  );
});
