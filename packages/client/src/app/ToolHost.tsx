import { type ReactNode, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type ToolDefinition,
  ToolPageFrame,
  type ToolServices,
  type ToolSession,
} from "@/tools";
import { resetLazyView } from "@/views";
import { ViewErrorBoundary } from "./ViewErrorBoundary";
import { ViewErrorFallback } from "./ViewErrorFallback";
import { ViewSkeleton } from "./ViewSkeleton";

type ToolHostProps = {
  tool: ToolDefinition;
  notices: ReactNode;
  onBack: () => void;
  session: ToolSession;
  services: ToolServices;
};

/**
 * Shows the lazy page of a tool, isolating its failures: the skeleton and the
 * error fallback with Retry sit in the page frame, so the heading and the back
 * button are there while the page loads or after it failed.
 * Implements FR4, FR5, NFR-P1 of add-unix-time-converter-tool (D2).
 */
export function ToolHost({
  tool,
  notices,
  onBack,
  session,
  services,
}: ToolHostProps) {
  const { t } = useTranslation();
  const [retryCount, setRetryCount] = useState(0);
  const { page: ToolPage } = tool;
  if (ToolPage === undefined) return null;

  const frame = (content: ReactNode) => (
    <ToolPageFrame title={t(tool.titleKey)} notices={notices} onBack={onBack}>
      {content}
    </ToolPageFrame>
  );
  const retryPage = () => {
    resetLazyView(ToolPage);
    setRetryCount((previousCount) => previousCount + 1);
  };
  return (
    <ViewErrorBoundary
      key={`${tool.id}-${retryCount}`}
      renderFallback={() => frame(<ViewErrorFallback onRetry={retryPage} />)}
    >
      <Suspense fallback={frame(<ViewSkeleton />)}>
        <ToolPage
          notices={notices}
          onBack={onBack}
          session={session}
          services={services}
        />
      </Suspense>
    </ViewErrorBoundary>
  );
}
