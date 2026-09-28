import type { ComponentType, LazyExoticComponent } from "react";

/** Identifiers of registered views; a member is added with each new view. */
export enum ViewId {}

/**
 * Describes one swappable view (ADR-0005).
 * Implements FR11 of setup-app-shell-and-pages-deploy.
 */
export interface ViewDefinition {
  id: ViewId;
  /** i18n key of the view name shown in settings. */
  titleKey: string;
  icon: ComponentType;
  component: LazyExoticComponent<ComponentType>;
  /** Minimum container width in px at which AUTO may pick this view. */
  autoMinWidth: number;
}
