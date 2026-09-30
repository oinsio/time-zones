import {
  type ComponentType,
  createElement,
  type LazyExoticComponent,
  lazy,
} from "react";

type ViewModule = { default: ComponentType };
type LazyView = LazyExoticComponent<ComponentType>;

const reloadBrowserPage = () => window.location.reload();

const resetActions = new WeakMap<LazyView, () => void>();

/**
 * `React.lazy` remembers a rejected import forever, so a plain lazy view can
 * never be retried. This wrapper is itself lazy (ADR-0005 keeps `component` a
 * `LazyExoticComponent`) and renders an inner lazy view. `resetLazyView` swaps
 * that inner view for a fresh one, so the next mount loads the view again.
 * Browsers also remember a failed dynamic import of the same URL, so when the
 * retried load fails again the page is reloaded, which clears that memory.
 * Implements FR6 of add-main-page-scaffold (D4).
 */
export function createRetryableLazyView(
  loader: () => Promise<ViewModule>,
  reloadPage: () => void = reloadBrowserPage,
): LazyView {
  const loadAfterFailure = () =>
    loader().catch((failure: unknown) => {
      reloadPage();
      throw failure;
    });
  let currentInnerView = lazy(loader);
  const RetryableView = () => createElement(currentInnerView);
  const retryableView = lazy(() => Promise.resolve({ default: RetryableView }));
  resetActions.set(retryableView, () => {
    currentInnerView = lazy(loadAfterFailure);
  });
  return retryableView;
}

/**
 * Makes the next mount of a view from `createRetryableLazyView` load it again.
 * Does nothing for any other component.
 * Implements FR6 of add-main-page-scaffold (D4).
 */
export function resetLazyView(view: LazyView): void {
  resetActions.get(view)?.();
}
