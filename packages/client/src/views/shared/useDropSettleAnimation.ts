import {
  type RefObject,
  type TransitionEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  REORDER_TRANSITION_DURATION_MS,
  REORDER_TRANSITION_EASING,
} from "@/constants";

const TRANSFORM_PROPERTY = "transform";
const NO_TRANSITION = "none";
const MOVING_TRANSITION = `${TRANSFORM_PROPERTY} ${REORDER_TRANSITION_DURATION_MS}ms ${REORDER_TRANSITION_EASING}`;

type Settle = { offsetPx: number; isMoving: boolean };

const translateY = (offsetPx: number) => `translate3d(0, ${offsetPx}px, 0)`;

/**
 * Styles that slide a dropped card from where it was released into its new
 * slot. The card itself is dragged (no overlay), so after the drop it would
 * jump; this starts it at the release point and lets a CSS transform
 * transition carry it to the slot. Nothing is added when motion is reduced.
 * Implements UX1, NFR-A4 of reorder-locations-by-drag-and-drop (D5).
 */
export function useDropSettleAnimation(
  nodeRef: RefObject<HTMLElement | null>,
  isDragging: boolean,
  isSorting: boolean,
  prefersReducedMotion: boolean,
) {
  const releasedTop = useRef<number | undefined>(undefined);
  const [settle, setSettle] = useState<Settle | null>(null);

  // Runs after every render so the last render while dragged is remembered.
  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const currentTop = node.getBoundingClientRect().top;
    if (isDragging) {
      releasedTop.current = currentTop;
      return;
    }
    if (releasedTop.current === undefined) return;
    const offsetPx = releasedTop.current - currentTop;
    releasedTop.current = undefined;
    if (!prefersReducedMotion && offsetPx !== 0) {
      setSettle({ offsetPx, isMoving: false });
    }
  });

  useEffect(() => {
    if (isSorting && settle) setSettle(null);
  }, [isSorting, settle]);

  useEffect(() => {
    if (!settle || settle.isMoving) return;
    nodeRef.current?.getBoundingClientRect(); // commit the start before the target
    setSettle({ offsetPx: 0, isMoving: true });
  }, [settle, nodeRef]);

  const onTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    const isOwnTransform =
      event.target === event.currentTarget &&
      event.propertyName === TRANSFORM_PROPERTY;
    if (isOwnTransform) setSettle(null);
  };

  return {
    transform: settle ? translateY(settle.offsetPx) : undefined,
    transition: settle
      ? settle.isMoving
        ? MOVING_TRANSITION
        : NO_TRANSITION
      : undefined,
    onTransitionEnd,
  };
}
