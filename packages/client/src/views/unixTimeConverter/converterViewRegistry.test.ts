// Verifies FR17, G5 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { resolveActiveView } from "../resolveActiveView";
import {
  ConverterViewId,
  converterViewRegistry,
  DEFAULT_CONVERTER_VIEW_ID,
} from ".";

describe("converterViewRegistry", () => {
  it("should hold the list view first", () => {
    expect(converterViewRegistry[0].id).toBe(ConverterViewId.LIST);
  });

  it("should give every view a unique id, a title key, an icon and a component", () => {
    const ids = converterViewRegistry.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const view of converterViewRegistry) {
      expect(view.titleKey).not.toBe("");
      expect(typeof view.component).toBe("function");
      expect(view.icon).toBeDefined();
    }
  });

  it("should resolve the default view with no choice", () => {
    expect(
      resolveActiveView(converterViewRegistry, null, DEFAULT_CONVERTER_VIEW_ID)
        ?.id,
    ).toBe(ConverterViewId.LIST);
  });
});
