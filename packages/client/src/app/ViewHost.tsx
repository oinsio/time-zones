import { Suspense, useState } from "react";
import { useViewMode } from "@/controller";
import {
  resetLazyView,
  resolveActiveView,
  type ViewDefinition,
  viewRegistry,
} from "@/views";
import { ViewErrorBoundary } from "./ViewErrorBoundary";
import { ViewErrorFallback } from "./ViewErrorFallback";
import { ViewSkeleton } from "./ViewSkeleton";

interface ViewHostProps {
  registry?: readonly ViewDefinition[];
}

/**
 * Content region: shows the view of the view mode, loads it lazily and
 * isolates its failures. The width never chooses the view.
 * Implements FR2, FR4, FR5, FR6 of add-main-page-scaffold (D1-D4); exposes
 * the active view id for add-locations-via-search (D12; view contract for
 * FR8, FR10, NFR-A1, NFR-A2, NFR-A3).
 * Implements FR3, FR4, FR5, FR6 of add-view-mode-setting-and-grid-skeleton (D3).
 */
export function ViewHost({ registry = viewRegistry }: ViewHostProps) {
  const viewMode = useViewMode();
  const [retryCount, setRetryCount] = useState(0);
  const activeView = resolveActiveView(registry, viewMode);

  const retryActiveView = () => {
    if (activeView) resetLazyView(activeView.component);
    setRetryCount((previousCount) => previousCount + 1);
  };

  const ActiveViewComponent = activeView?.component;
  return (
    <div className="w-full" data-view-id={activeView?.id}>
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
