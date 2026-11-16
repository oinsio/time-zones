import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { AppShell } from "./AppShell";
import { RecoveryScreen } from "./RecoveryScreen";

const reloadBrowserPage = () => window.location.reload();

/**
 * Mounts the app once the sun support has loaded. When that chunk fails to
 * load (network error, a cache without the new chunk), the recovery screen is
 * shown instead of a blank page.
 * Implements NFR-P2 of bind-day-periods-to-sun (D4).
 */
export async function mountApp(
  rootElement: HTMLElement,
  loadSunSupport: () => Promise<void>,
  reloadPage: () => void = reloadBrowserPage,
): Promise<void> {
  const root = createRoot(rootElement);
  try {
    await loadSunSupport();
  } catch {
    root.render(<RecoveryScreen onReload={reloadPage} />);
    return;
  }
  root.render(
    <StrictMode>
      <AppErrorBoundary>
        <AppShell />
      </AppErrorBoundary>
    </StrictMode>,
  );
}
