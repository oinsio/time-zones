import { Component, type ReactNode } from "react";
import { RecoveryScreen } from "./RecoveryScreen";

interface AppErrorBoundaryProps {
  children: ReactNode;
  /** Injected so tests never touch the real location. */
  reloadPage?: () => void;
}

interface AppErrorBoundaryState {
  hasRenderingError: boolean;
}

const reloadBrowserPage = () => window.location.reload();

/**
 * Replaces the page with the recovery screen when rendering throws.
 * A class component because React has no hook for error boundaries.
 * Implements FR8 of setup-app-shell-and-pages-deploy.
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasRenderingError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasRenderingError: true };
  }

  render() {
    const { children, reloadPage = reloadBrowserPage } = this.props;
    if (this.state.hasRenderingError) {
      return <RecoveryScreen onReload={reloadPage} />;
    }
    return children;
  }
}
