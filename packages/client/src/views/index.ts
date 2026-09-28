import type { ViewDefinition } from "./viewDefinition";

export type { ViewDefinition } from "./viewDefinition";
export { ViewId } from "./viewDefinition";

/**
 * Every view the app can show (ADR-0005). Empty until the first view change.
 * Implements FR11 of setup-app-shell-and-pages-deploy.
 */
export const viewRegistry: readonly ViewDefinition[] = [];
