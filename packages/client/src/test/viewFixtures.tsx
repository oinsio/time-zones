import type { ComponentType } from "react";
import {
  createRetryableLazyView,
  type ViewDefinition,
  type ViewId,
} from "@/views";

/** Builds a registry entry whose component loads through `loadComponent`. */
export const buildTestView = (
  id: string,
  autoMinWidth: number,
  loadComponent: () => Promise<ComponentType>,
): ViewDefinition => ({
  id: id as ViewId,
  titleKey: "app.title",
  icon: () => null,
  component: createRetryableLazyView(async () => ({
    default: await loadComponent(),
  })),
  autoMinWidth,
});

/** A view that renders `text` once loaded. */
export const buildTextView = (id: string, autoMinWidth: number, text: string) =>
  buildTestView(id, autoMinWidth, async () => () => <p>{text}</p>);

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
