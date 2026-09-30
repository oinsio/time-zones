import { Component, type ReactNode } from "react";

interface ViewErrorBoundaryProps {
  children: ReactNode;
  renderFallback: () => ReactNode;
}

interface ViewErrorBoundaryState {
  hasViewFailed: boolean;
}

/**
 * Keeps a failing view from taking the header and notices down with it; the
 * host remounts it (by key) to retry. Separate from `AppErrorBoundary`, which
 * replaces the whole page.
 * Implements FR6 of add-main-page-scaffold (D4).
 */
export class ViewErrorBoundary extends Component<
  ViewErrorBoundaryProps,
  ViewErrorBoundaryState
> {
  // Stryker disable next-line ObjectLiteral: equivalent — a missing flag is falsy too
  state: ViewErrorBoundaryState = { hasViewFailed: false };

  static getDerivedStateFromError(): ViewErrorBoundaryState {
    return { hasViewFailed: true };
  }

  render() {
    return this.state.hasViewFailed
      ? this.props.renderFallback()
      : this.props.children;
  }
}
