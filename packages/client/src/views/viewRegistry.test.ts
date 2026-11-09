// Verifies FR3, FR6, NFR-P1 of add-view-mode-setting-and-grid-skeleton: the registry holds the lazy Cards and Grid views.

import i18n from "i18next";
import { SUPPORTED_LANGUAGES } from "@/locales";
import { DEFAULT_VIEW_ID, ViewId, viewRegistry } from ".";

describe("viewRegistry", () => {
  it("should register Cards, then Grid", () => {
    expect(viewRegistry.map((view) => view.id)).toEqual([
      ViewId.CARDS,
      ViewId.GRID,
    ]);
  });

  it("should make Cards the default view", () => {
    expect(DEFAULT_VIEW_ID).toBe(ViewId.CARDS);
  });

  it.each(viewRegistry)("should load $id lazily", (view) => {
    expect(view.component).toHaveProperty("_payload");
  });

  it.each(viewRegistry)("should carry no choice by width for $id", (view) => {
    expect(Object.keys(view).sort()).toEqual([
      "component",
      "icon",
      "id",
      "titleKey",
    ]);
  });

  describe.each(SUPPORTED_LANGUAGES)("in the %s locale", (languageCode) => {
    it.each(viewRegistry)("should have the title key of $id", (view) => {
      expect(i18n.exists(view.titleKey, { lng: languageCode })).toBe(true);
    });
  });
});
