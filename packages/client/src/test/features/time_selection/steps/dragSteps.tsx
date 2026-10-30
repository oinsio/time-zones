// Implements FR1, FR3, FR4 of fix-day-track-drag-continuity-and-smoothness: drives a rendered DayTrack for the unit BDD.

import { fireEvent, render, screen } from "@testing-library/react/pure";
import { vi } from "vitest";
import type { createTimeSelectionWorld } from "./timeSelectionWorld";

export const TRACK_WIDTH_PX = 400;
const FINGER_SLOP_STEP_PX = 20;
const FINGER_ID = 1;

export enum DragPointer {
  MOUSE = "mouse",
  FINGER = "finger",
  FINGER_WITHOUT_POINTER_EVENTS = "finger on an engine without Pointer Events",
}

type World = ReturnType<typeof createTimeSelectionWorld>;

/** Renders the DayTrack of a city, re-rendered with the current presented track after each input. */
export function createDragDriver(world: World) {
  let city = "";
  let rerender: ReturnType<typeof render>["rerender"];
  let slider: HTMLElement;
  let pointerKind = DragPointer.MOUSE;

  let DayTrack: typeof import("@/views/shared/DayTrack").DayTrack;
  const element = () => (
    <DayTrack
      track={world.trackOf(city)}
      city={city}
      onSelectFraction={world.selectFraction}
      onMoveTrack={world.moveTrack}
    />
  );
  const refresh = () => rerender(element());
  const measure = () => {
    const bar = slider.querySelector<HTMLElement>(
      "[data-day-track-bar]",
    ) as HTMLElement;
    bar.getBoundingClientRect = () =>
      ({ left: 0, width: TRACK_WIDTH_PX }) as DOMRect;
  };
  const touch = (clientX: number, clientY: number) => ({
    changedTouches: [{ identifier: FINGER_ID, clientX, clientY }],
  });
  const pointer = (clientX: number, clientY: number) => ({
    pointerType: pointerKind === DragPointer.MOUSE ? "mouse" : "touch",
    pointerId: FINGER_ID,
    clientX,
    clientY,
  });
  const point = (fraction: number) => fraction * TRACK_WIDTH_PX;

  const mount = async (targetCity: string, kind: DragPointer) => {
    if (kind === DragPointer.FINGER_WITHOUT_POINTER_EVENTS) {
      vi.stubGlobal("PointerEvent", undefined);
    }
    vi.resetModules();
    ({ DayTrack } = await import("@/views/shared/DayTrack"));
    city = targetCity;
    pointerKind = kind;
    ({ rerender } = render(element()));
    slider = screen.getByRole("slider", { name: new RegExp(targetCity) });
    measure();
    slider.setPointerCapture = () => undefined;
    slider.releasePointerCapture = () => undefined;
    slider.hasPointerCapture = () => true;
  };

  const press = (fraction: number) => {
    const x = point(fraction);
    if (pointerKind === DragPointer.FINGER_WITHOUT_POINTER_EVENTS) {
      fireEvent.touchStart(slider, touch(x, 0));
    } else fireEvent.pointerDown(slider, pointer(x, 0));
    refresh();
  };
  const moveTo = (fraction: number, offsetY: number) => {
    const x = point(fraction);
    if (pointerKind === DragPointer.FINGER_WITHOUT_POINTER_EVENTS) {
      fireEvent.touchMove(slider, touch(x, offsetY));
    } else fireEvent.pointerMove(slider, pointer(x, offsetY));
    refresh();
  };
  const release = (fraction: number, offsetY: number) => {
    const x = point(fraction);
    if (pointerKind === DragPointer.FINGER_WITHOUT_POINTER_EVENTS) {
      fireEvent.touchEnd(slider, touch(x, offsetY));
    } else fireEvent.pointerUp(slider, pointer(x, offsetY));
    refresh();
  };

  return {
    mount,
    press,
    moveTo,
    release,
    clickAfterLift: (fraction: number) => {
      fireEvent.click(slider, { clientX: point(fraction) });
      refresh();
    },
    /** A short first move along the bar, so a finger drag starts before the long one. */
    startFingerDrag: (fraction: number) => {
      moveTo(fraction + FINGER_SLOP_STEP_PX / TRACK_WIDTH_PX, 0);
    },
    handleLeft: () =>
      (slider.querySelector("[data-day-track-handle]") as HTMLElement).style
        .left,
  };
}
