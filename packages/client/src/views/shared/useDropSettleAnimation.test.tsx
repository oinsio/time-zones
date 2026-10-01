// Verifies UX1, NFR-A4 of reorder-locations-by-drag-and-drop: the dropped card
// settles into its slot. jsdom has no layout, so card positions are stubbed.
import { act, renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import {
  REORDER_TRANSITION_DURATION_MS,
  REORDER_TRANSITION_EASING,
} from "@/constants";
import { useDropSettleAnimation } from "./useDropSettleAnimation";

const RELEASED_TOP_PX = 120;
const SLOT_TOP_PX = 80;

function buildCard(initialTop: number) {
  const element = document.createElement("li");
  let top = initialTop;
  element.getBoundingClientRect = () => ({ top }) as DOMRect;
  return {
    nodeRef: { current: element } as RefObject<HTMLElement>,
    moveTo: (nextTop: number) => {
      top = nextTop;
    },
  };
}

type Props = { isDragging: boolean; isSorting: boolean };

type Styles = { transform?: string; transition?: string };

const renderSettle = (prefersReducedMotion = false) => {
  const card = buildCard(RELEASED_TOP_PX);
  const renderedStyles: Styles[] = [];
  const rendered = renderHook(
    ({ isDragging, isSorting }: Props) => {
      const settle = useDropSettleAnimation(
        card.nodeRef,
        isDragging,
        isSorting,
        prefersReducedMotion,
      );
      renderedStyles.push({
        transform: settle.transform,
        transition: settle.transition,
      });
      return settle;
    },
    { initialProps: { isDragging: true, isSorting: true } },
  );
  const drop = () => {
    card.moveTo(SLOT_TOP_PX);
    rendered.rerender({ isDragging: false, isSorting: false });
  };
  return { ...rendered, card, drop, renderedStyles };
};

describe("useDropSettleAnimation", () => {
  it("should add nothing while the card is dragged", () => {
    const { result } = renderSettle();
    expect(result.current.transform).toBeUndefined();
    expect(result.current.transition).toBeUndefined();
  });

  it("should start the dropped card where it was released, without a transition", () => {
    const { drop, renderedStyles } = renderSettle();
    drop();
    expect(renderedStyles).toContainEqual({
      transform: "translate3d(0, 40px, 0)",
      transition: "none",
    });
  });

  it("should then move it to its slot with the reorder transition", () => {
    const { result, drop } = renderSettle();
    drop();
    expect(result.current.transform).toBe("translate3d(0, 0px, 0)");
    expect(result.current.transition).toBe(
      `transform ${REORDER_TRANSITION_DURATION_MS}ms ${REORDER_TRANSITION_EASING}`,
    );
  });

  it("should give the card back to the sortable styles when the transition ends", () => {
    const { result, drop, card } = renderSettle();
    drop();
    act(() => {
      result.current.onTransitionEnd({
        propertyName: "transform",
        target: card.nodeRef.current,
        currentTarget: card.nodeRef.current,
      } as never);
    });
    expect(result.current.transform).toBeUndefined();
    expect(result.current.transition).toBeUndefined();
  });

  it("should ignore the end of other transitions", () => {
    const { result, drop, card } = renderSettle();
    drop();
    act(() => {
      result.current.onTransitionEnd({
        propertyName: "opacity",
        target: card.nodeRef.current,
        currentTarget: card.nodeRef.current,
      } as never);
    });
    expect(result.current.transform).toBe("translate3d(0, 0px, 0)");
  });

  it("should ignore a transform transition that ends on a child element", () => {
    const { result, drop, card } = renderSettle();
    drop();
    act(() => {
      result.current.onTransitionEnd({
        propertyName: "transform",
        target: document.createElement("span"),
        currentTarget: card.nodeRef.current,
      } as never);
    });
    expect(result.current.transform).toBe("translate3d(0, 0px, 0)");
  });

  it("should add nothing when the card is dropped in the same place", () => {
    const { result, card, rerender } = renderSettle();
    card.moveTo(RELEASED_TOP_PX);
    rerender({ isDragging: false, isSorting: false });
    expect(result.current.transform).toBeUndefined();
  });

  it("should add nothing when motion is reduced", () => {
    const { result, drop } = renderSettle(true);
    drop();
    expect(result.current.transform).toBeUndefined();
    expect(result.current.transition).toBeUndefined();
  });

  it("should give way to the sortable styles when the next drag starts", () => {
    const { result, drop, rerender } = renderSettle();
    drop();
    rerender({ isDragging: false, isSorting: true });
    expect(result.current.transform).toBeUndefined();
  });
});
