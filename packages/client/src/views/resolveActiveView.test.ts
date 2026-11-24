// Verifies FR3, FR4, FR5, FR6 of add-view-mode-setting-and-grid-skeleton: the view follows the view mode only.
import type { ComponentType } from "react";
import { lazy } from "react";
import { resolveActiveView } from "./resolveActiveView";
import { DEFAULT_VIEW_ID, type ViewDefinition, ViewId } from "./viewDefinition";

const UNREGISTERED_VIEW_ID = "timeline";
const NEVER_LOADED = lazy(
  () => new Promise<{ default: ComponentType }>(() => {}),
);

const buildView = (id: string) =>
  ({
    id,
    titleKey: "app.title",
    icon: () => null,
    component: NEVER_LOADED,
  }) as unknown as ViewDefinition;

const cardsView = buildView(ViewId.CARDS);
const gridView = buildView(ViewId.GRID);
const registry = [cardsView, gridView];

describe("resolveActiveView", () => {
  it("should return the chosen registered view", () => {
    expect(resolveActiveView(registry, ViewId.GRID)).toBe(gridView);
  });

  it("should return Cards when no view is chosen", () => {
    expect(resolveActiveView([gridView, cardsView], null)).toBe(cardsView);
  });

  it("should return Cards when the chosen view is not registered", () => {
    expect(resolveActiveView(registry, UNREGISTERED_VIEW_ID)).toBe(cardsView);
  });

  it("should return the first view when Cards is not registered", () => {
    expect(resolveActiveView([gridView], null)).toBe(gridView);
  });

  it("should return undefined for an empty registry", () => {
    expect(resolveActiveView([], ViewId.GRID)).toBeUndefined();
  });

  it("should use Cards as the default view", () => {
    expect(DEFAULT_VIEW_ID).toBe(ViewId.CARDS);
  });
});

// Verifies FR17 of add-unix-time-converter-tool: the converter view registry shares the resolver.
describe("resolveActiveView with another registry", () => {
  const listView = { id: "list" };
  const otherView = { id: "other" };

  it("should return the view of the default id given", () => {
    expect(resolveActiveView([otherView, listView], null, "list")).toBe(
      listView,
    );
  });

  it("should return the first view when the default id is not registered", () => {
    expect(resolveActiveView([otherView, listView], null, "missing")).toBe(
      otherView,
    );
  });

  it("should return the chosen view", () => {
    expect(resolveActiveView([otherView, listView], "other", "list")).toBe(
      otherView,
    );
  });

  it("should return nothing for an empty registry", () => {
    expect(resolveActiveView([], null, "list")).toBeUndefined();
  });
});
