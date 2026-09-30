// Verifies FR2 of add-main-page-scaffold: AUTO resolution of the active view.
import type { ComponentType } from "react";
import { lazy } from "react";
import { resolveActiveView } from "./resolveActiveView";
import { AutoViewMode, type ViewDefinition, ViewId } from "./viewDefinition";

const NARROW_MIN_WIDTH = 0;
const WIDE_MIN_WIDTH = 768;
const UNREGISTERED_VIEW_ID = "unregistered" as ViewId;
const NEVER_LOADED = lazy(
  () => new Promise<{ default: ComponentType }>(() => {}),
);

const buildView = (id: string, autoMinWidth: number) =>
  ({
    id,
    titleKey: "app.title",
    icon: () => null,
    component: NEVER_LOADED,
    autoMinWidth,
  }) as unknown as ViewDefinition;

const narrowView = buildView("narrow", NARROW_MIN_WIDTH);
const wideView = buildView("wide", WIDE_MIN_WIDTH);
const registry = [narrowView, wideView];

describe("resolveActiveView", () => {
  it.each([
    { containerWidth: 1024, expected: wideView, caseName: "widest fit" },
    { containerWidth: 768, expected: wideView, caseName: "exact minimum" },
    { containerWidth: 767, expected: narrowView, caseName: "just below" },
    { containerWidth: 320, expected: narrowView, caseName: "narrow" },
  ])(
    "should pick the $caseName view at $containerWidth px in AUTO mode",
    ({ containerWidth, expected }) => {
      expect(
        resolveActiveView(registry, AutoViewMode.AUTO, containerWidth),
      ).toBe(expected);
    },
  );

  it("should pick the view with the smallest minimum width when none fits", () => {
    const tooWideViews = [buildView("b", 900), buildView("a", 500)];
    expect(resolveActiveView(tooWideViews, AutoViewMode.AUTO, 100)).toBe(
      tooWideViews[1],
    );
  });

  it("should not depend on registry order", () => {
    expect(
      resolveActiveView([wideView, narrowView], AutoViewMode.AUTO, 1024),
    ).toBe(wideView);
  });

  it("should pick the widest fit among three views in descending order", () => {
    const views = [
      buildView("c", 900),
      buildView("b", 500),
      buildView("a", 100),
    ];
    expect(resolveActiveView(views, AutoViewMode.AUTO, 600)).toBe(views[1]);
  });

  it("should pick the only registered view", () => {
    expect(resolveActiveView([narrowView], AutoViewMode.AUTO, 320)).toBe(
      narrowView,
    );
  });

  it("should return the view with the requested id", () => {
    const requestedView = buildView(ViewId.CARDS, WIDE_MIN_WIDTH);
    expect(
      resolveActiveView([narrowView, requestedView], ViewId.CARDS, 100),
    ).toBe(requestedView);
  });

  it("should behave as AUTO when the requested id is not registered", () => {
    expect(resolveActiveView(registry, UNREGISTERED_VIEW_ID, 1024)).toBe(
      wideView,
    );
  });

  it("should return undefined for an empty registry", () => {
    expect(resolveActiveView([], AutoViewMode.AUTO, 1024)).toBeUndefined();
  });
});
