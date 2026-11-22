// Verifies FR17, NFR-P1, UX2 of move-meeting-range-and-extend-past-midnight.
import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MoveHandleCssVariable } from "@/constants";
import { useMoveHandlePlacement } from "./useMoveHandlePlacement";

const BAR_BOTTOM_PX = 85;
const FRAME_LEFT_PX = 100;
const FRAME_WIDTH_PX = 80;

let frameTopPx = 90;
let frameReads = 0;
let frameCallbacks: FrameRequestCallback[] = [];

function Harness({ rangeKey }: { rangeKey: string }) {
  const handle = useRef<HTMLLIElement | null>(null);
  useMoveHandlePlacement(handle, rangeKey);
  return (
    <ul data-testid="panel">
      <li data-meeting-frame-columns="9-10" />
      <li data-testid="handle" ref={handle} />
    </ul>
  );
}

const flushFrame = () =>
  act(() => {
    const pending = frameCallbacks;
    frameCallbacks = [];
    for (const callback of pending) callback(0);
  });

describe("useMoveHandlePlacement", () => {
  let bar: HTMLElement;
  beforeEach(() => {
    frameTopPx = 90;
    frameReads = 0;
    frameCallbacks = [];
    bar = document.createElement("header");
    bar.setAttribute("data-meeting-bar", "");
    document.body.append(bar);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        if (this === bar) return { bottom: BAR_BOTTOM_PX } as DOMRect;
        if (this.hasAttribute("data-meeting-frame-columns")) {
          frameReads += 1;
          return {
            left: FRAME_LEFT_PX,
            width: FRAME_WIDTH_PX,
            top: frameTopPx,
          } as DOMRect;
        }
        return {} as DOMRect;
      },
    );
  });
  afterEach(() => {
    bar.remove();
    vi.restoreAllMocks();
  });

  const readCentre = (handle: HTMLElement) => [
    handle.style.getPropertyValue(MoveHandleCssVariable.CENTRE_X),
    handle.style.getPropertyValue(MoveHandleCssVariable.CENTRE_Y),
  ];

  it("should write the centre of the handle on mount", () => {
    const { getByTestId } = render(<Harness rangeKey="a" />);

    expect(readCentre(getByTestId("handle"))).toEqual(["140px", "91.5px"]);
  });

  it("should measure once for three scroll events before one frame", () => {
    render(<Harness rangeKey="a" />);
    frameReads = 0;

    for (let event = 0; event < 3; event += 1) {
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }
    flushFrame();

    expect(frameReads).toBe(1);
  });

  it("should follow the frame after a scroll", () => {
    const { getByTestId } = render(<Harness rangeKey="a" />);

    frameTopPx = 83;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    flushFrame();

    expect(readCentre(getByTestId("handle"))[1]).toBe("84.5px");
  });

  it("should follow the strips when the panel scrolls", () => {
    const { getByTestId } = render(<Harness rangeKey="a" />);

    act(() => {
      getByTestId("panel").dispatchEvent(new Event("scroll"));
    });

    expect(frameCallbacks).toHaveLength(1);
  });

  it("should measure again when the range changes", () => {
    const { rerender } = render(<Harness rangeKey="a" />);
    frameReads = 0;

    rerender(<Harness rangeKey="b" />);

    expect(frameReads).toBe(1);
  });
});
