import type { ComponentType } from "react";
import {
  createRetryableLazyView,
  type ViewDefinition,
  type ViewId,
} from "@/views";

/** Builds a registry entry whose component loads through `loadComponent`. */
export const buildTestView = (
  id: string,
  loadComponent: () => Promise<ComponentType>,
  reloadPage: () => void = () => undefined,
): ViewDefinition => ({
  id: id as ViewId,
  titleKey: "app.title",
  icon: () => null,
  component: createRetryableLazyView(
    async () => ({ default: await loadComponent() }),
    reloadPage,
  ),
});

/** A view that renders `text` once loaded. */
export const buildTextView = (id: string, text: string) =>
  buildTestView(id, async () => () => <p>{text}</p>);

/** A loader that rejects on its first `failureCount` calls, then resolves. */
export const failingThenLoading = (
  component: ComponentType,
  failureCount: number,
) => {
  let remainingFailures = failureCount;
  return () =>
    remainingFailures-- > 0
      ? Promise.reject(new Error("chunk failed"))
      : Promise.resolve(component);
};
