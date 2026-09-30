// Verifies D12 of add-locations-via-search (ADR-0005: the view contract runs
// for every registered view).
import { getContractViewportWidth } from "./viewContractViewport";

const buildView = (id: string, autoMinWidth: number) => ({ id, autoMinWidth });

describe("getContractViewportWidth", () => {
  it.each([
    {
      description: "the widest viewport for a single view",
      views: [buildView("cards", 0)],
      viewId: "cards",
      expectedWidth: 1280,
    },
    {
      description:
        "one less than the next view's minimum for the narrower view",
      views: [buildView("cards", 0), buildView("grid", 768)],
      viewId: "cards",
      expectedWidth: 767,
    },
    {
      description: "the widest viewport for the widest view",
      views: [buildView("cards", 0), buildView("grid", 768)],
      viewId: "grid",
      expectedWidth: 1280,
    },
    {
      description: "the narrowest viewport when the next view starts close by",
      views: [buildView("cards", 200), buildView("grid", 250)],
      viewId: "cards",
      expectedWidth: 320,
    },
    {
      description: "the widest viewport when the next view starts beyond it",
      views: [buildView("cards", 0), buildView("wall", 3000)],
      viewId: "cards",
      expectedWidth: 1280,
    },
    {
      description: "the same width for views sharing a minimum",
      views: [buildView("cards", 500), buildView("list", 500)],
      viewId: "list",
      expectedWidth: 1280,
    },
  ])("should give $description", ({ views, viewId, expectedWidth }) => {
    const view = views.find((candidate) => candidate.id === viewId);
    if (!view) throw new Error(`No view ${viewId}`);
    expect(getContractViewportWidth(view, views)).toBe(expectedWidth);
  });
});
