import { Suspense, useRef, useState } from "react";
import { useContainerWidth } from "@/controller";
import {
  AutoViewMode,
  resetLazyView,
  resolveActiveView,
  type ViewDefinition,
  type ViewMode,
  viewRegistry,
} from "@/views";
import { ViewErrorBoundary } from "./ViewErrorBoundary";
import { ViewErrorFallback } from "./ViewErrorFallback";
import { ViewSkeleton } from "./ViewSkeleton";

interface ViewHostProps {
  registry?: readonly ViewDefinition[];
  /** Until preferences exist the mode stays AUTO (NG3). */
  mode?: ViewMode;
}

/**
 * Content region: resolves the active view from the registry and the
 * container width, loads it lazily and isolates its failures.
 * Implements FR2, FR4, FR5, FR6 of add-main-page-scaffold (D1-D4); exposes
 * the active view id for add-locations-via-search (D12; view contract for
 * FR8, FR10, NFR-A1, NFR-A2, NFR-A3).
 */
export function ViewHost({
  registry = viewRegistry,
  mode = AutoViewMode.AUTO,
}: ViewHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const [retryCount, setRetryCount] = useState(0);
  const activeView = resolveActiveView(registry, mode, containerWidth);

  const retryActiveView = () => {
    if (activeView) resetLazyView(activeView.component);
    setRetryCount((previousCount) => previousCount + 1);
  };

  const ActiveViewComponent = activeView?.component;
  return (
    <div ref={containerRef} className="w-full" data-view-id={activeView?.id}>
      {ActiveViewComponent && (
        <ViewErrorBoundary
          key={`${activeView?.id}-${retryCount}`}
          renderFallback={() => <ViewErrorFallback onRetry={retryActiveView} />}
        >
          <Suspense fallback={<ViewSkeleton />}>
            <ActiveViewComponent />
          </Suspense>
        </ViewErrorBoundary>
      )}
    </div>
  );
}
