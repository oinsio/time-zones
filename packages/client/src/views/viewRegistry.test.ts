// Verifies FR3 of add-main-page-scaffold: the registry holds the lazy Cards view.

import i18n from "i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { ViewId, viewRegistry } from ".";

describe("viewRegistry", () => {
  it("should contain exactly one view", () => {
    expect(viewRegistry).toHaveLength(1);
  });

  it("should register the Cards view", () => {
    expect(viewRegistry[0].id).toBe(ViewId.CARDS);
  });

  it("should let AUTO pick Cards at any width", () => {
    expect(viewRegistry[0].autoMinWidth).toBe(0);
  });

  it("should load the component lazily", () => {
    expect(viewRegistry[0].component).toHaveProperty("_payload");
  });

  it.each(SUPPORTED_LANGUAGES)(
    "should have the title key in the %s locale",
    (languageCode) => {
      expect(i18n.exists(viewRegistry[0].titleKey, { lng: languageCode })).toBe(
        true,
      );
    },
  );
});
