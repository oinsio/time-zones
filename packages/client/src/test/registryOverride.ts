import type { ViewDefinition } from "@/views";

/** Lets BDD steps replace the view registry the app reads. */
export const registryOverride = {
  views: undefined as readonly ViewDefinition[] | undefined,
};

/** Builds the `@/views` module with the overridable registry. */
export const withRegistryOverride = (
  viewsModule: typeof import("@/views"),
): typeof import("@/views") => ({
  ...viewsModule,
  get viewRegistry() {
    return registryOverride.views ?? viewsModule.viewRegistry;
  },
});
