// Verifies FR6 of add-main-page-scaffold (D4): a failed lazy import can be retried.
import { render, screen } from "@testing-library/react";
import { Component, lazy, type ReactNode, Suspense } from "react";
import {
  createRetryableLazyView,
  resetLazyView,
} from "./createRetryableLazyView";

const VIEW_TEXT = "loaded view";
const LoadedView = () => <p>{VIEW_TEXT}</p>;

class CatchingBoundary extends Component<
  { children: ReactNode },
  { hasFailed: boolean }
> {
  state = { hasFailed: false };
  static getDerivedStateFromError() {
    return { hasFailed: true };
  }
  render() {
    return this.state.hasFailed ? <p>failed</p> : this.props.children;
  }
}

const failingThenLoadingLoader = () =>
  vi
    .fn()
    .mockRejectedValueOnce(new Error("chunk failed"))
    .mockResolvedValueOnce({ default: LoadedView });

const mountView = (RetryableView: ReturnType<typeof createRetryableLazyView>) =>
  render(
    <CatchingBoundary>
      <Suspense fallback={<p>loading</p>}>
        <RetryableView />
      </Suspense>
    </CatchingBoundary>,
  );

describe("createRetryableLazyView", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the loaded view", async () => {
    const RetryableView = createRetryableLazyView(async () => ({
      default: LoadedView,
    }));
    mountView(RetryableView);
    expect(await screen.findByText(VIEW_TEXT)).toBeInTheDocument();
  });

  it("should load again after a remount when the first load failed", async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error("chunk failed"))
      .mockResolvedValueOnce({ default: LoadedView });
    const RetryableView = createRetryableLazyView(loader);
    const firstMount = mountView(RetryableView);
    await screen.findByText("failed");
    firstMount.unmount();
    resetLazyView(RetryableView);
    mountView(RetryableView);
    expect(await screen.findByText(VIEW_TEXT)).toBeInTheDocument();
  });

  it("should call the loader twice after one failure and one retry", async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error("chunk failed"))
      .mockResolvedValueOnce({ default: LoadedView });
    const RetryableView = createRetryableLazyView(loader);
    const firstMount = mountView(RetryableView);
    await screen.findByText("failed");
    firstMount.unmount();
    resetLazyView(RetryableView);
    mountView(RetryableView);
    await screen.findByText(VIEW_TEXT);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("should not load again after a remount without a reset", async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error("chunk failed"))
      .mockResolvedValueOnce({ default: LoadedView });
    const RetryableView = createRetryableLazyView(loader);
    const firstMount = mountView(RetryableView);
    await screen.findByText("failed");
    firstMount.unmount();
    mountView(RetryableView);
    expect(await screen.findByText("failed")).toBeInTheDocument();
  });

  describe("default page reload after a failed retry", () => {
    const reloadPage = vi.fn();
    const mountFailedRetry = async () => {
      const RetryableView = createRetryableLazyView(
        vi.fn().mockRejectedValue(new Error("chunk failed")),
      );
      const firstMount = mountView(RetryableView);
      await screen.findByText("failed");
      firstMount.unmount();
      resetLazyView(RetryableView);
      mountView(RetryableView);
      await screen.findByText("failed");
    };
    beforeEach(() => {
      reloadPage.mockClear();
      vi.stubGlobal("location", { reload: reloadPage });
    });
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("should reload the page when the browser is online", async () => {
      vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
      await mountFailedRetry();
      expect(reloadPage).toHaveBeenCalledTimes(1);
    });

    it("should keep the error and not reload the page when the browser is offline", async () => {
      vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
      await mountFailedRetry();
      expect(reloadPage).not.toHaveBeenCalled();
    });
  });

  it("should ignore a reset of a plain lazy component", () => {
    const plainView = lazy(async () => ({ default: LoadedView }));
    expect(() => resetLazyView(plainView)).not.toThrow();
  });

  it("should reload the page when the retried load fails again", async () => {
    const reloadPage = vi.fn();
    const RetryableView = createRetryableLazyView(
      () => Promise.reject(new Error("chunk failed")),
      reloadPage,
    );
    const firstMount = mountView(RetryableView);
    await screen.findByText("failed");
    firstMount.unmount();
    resetLazyView(RetryableView);
    mountView(RetryableView);
    await screen.findByText("failed");
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  it("should not reload the page when the first load fails", async () => {
    const reloadPage = vi.fn();
    const RetryableView = createRetryableLazyView(
      () => Promise.reject(new Error("chunk failed")),
      reloadPage,
    );
    mountView(RetryableView);
    await screen.findByText("failed");
    expect(reloadPage).not.toHaveBeenCalled();
  });

  it("should not reload the page when the retried load succeeds", async () => {
    const reloadPage = vi.fn();
    const RetryableView = createRetryableLazyView(
      failingThenLoadingLoader(),
      reloadPage,
    );
    const firstMount = mountView(RetryableView);
    await screen.findByText("failed");
    firstMount.unmount();
    resetLazyView(RetryableView);
    mountView(RetryableView);
    await screen.findByText(VIEW_TEXT);
    expect(reloadPage).not.toHaveBeenCalled();
  });

  it("should load only once when the first load succeeds", async () => {
    const loader = vi.fn().mockResolvedValue({ default: LoadedView });
    const RetryableView = createRetryableLazyView(loader);
    mountView(RetryableView).unmount();
    mountView(RetryableView);
    await screen.findByText(VIEW_TEXT);
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
