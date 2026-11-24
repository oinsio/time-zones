import {
  type ComponentType,
  createElement,
  type LazyExoticComponent,
  lazy,
} from "react";

// biome-ignore lint/complexity/noBannedTypes: a view takes no props by default.
type NoProps = {};
type ViewModule<Props extends object> = { default: ComponentType<Props> };
type LazyView<Props extends object = NoProps> = LazyExoticComponent<
  ComponentType<Props>
>;

const reloadBrowserPage = () => {
  if (navigator.onLine) window.location.reload();
};

/** Any lazy view, whatever its props, is a key. */
const resetActions = new WeakMap<object, () => void>();

/**
 * `React.lazy` remembers a rejected import forever, so a plain lazy view can
 * never be retried. This wrapper is itself lazy (ADR-0005 keeps `component` a
 * `LazyExoticComponent`) and renders an inner lazy view. `resetLazyView` swaps
 * that inner view for a fresh one, so the next mount loads the view again.
 * Browsers also remember a failed dynamic import of the same URL, so when the
 * retried load fails again the page is reloaded, which clears that memory —
 * but only online, so an offline retry shows the error again instead of the
 * browser's offline page.

 * Generic over the props of the view so a tool page can take props too.
 * Implements FR6 of add-main-page-scaffold (D4); FR4 of add-unix-time-converter-tool (D2).
 */
export function createRetryableLazyView<Props extends object = NoProps>(
  loader: () => Promise<ViewModule<Props>>,
  reloadPage: () => void = reloadBrowserPage,
): LazyView<Props> {
  const loadAfterFailure = () =>
    loader().catch((failure: unknown) => {
      reloadPage();
      throw failure;
    });
  let currentInnerView = lazy(loader);
  const RetryableView = (props: Props) =>
    createElement(currentInnerView as unknown as ComponentType<Props>, props);
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
export function resetLazyView(view: object): void {
  resetActions.get(view)?.();
}
