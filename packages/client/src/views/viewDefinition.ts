import type { ComponentType, LazyExoticComponent } from "react";

/** Identifiers of registered views; a member is added with each new view. */
export enum ViewId {
  CARDS = "cards",
  GRID = "grid",
}

/**
 * The view shown when the user has chosen none, or the chosen one is not registered.
 * Implements FR3 of add-view-mode-setting-and-grid-skeleton (D1).
 */
export const DEFAULT_VIEW_ID = ViewId.CARDS;

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
  /**
   * The view shows the meeting range (ADR-0011). It decides the meeting bar in
   * the header and which view-contract scenarios the view runs (`@meeting-range`).
   * Implements FR13, FR17 of add-grid-meeting-range-and-share (D7, D11).
   */
  showsMeetingRange?: boolean;
}
