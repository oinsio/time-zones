// FR9, UX2 of support-legacy-ios-12-safari: the drag sensor follows Pointer Events support.
import * as dndCore from "@dnd-kit/core";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  REORDER_POINTER_ACTIVATION_DISTANCE_PX,
  REORDER_TOUCH_ACTIVATION_DELAY_MS,
  REORDER_TOUCH_ACTIVATION_TOLERANCE_PX,
} from "@/constants";

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@dnd-kit/core")>();
  return { ...original, useSensor: vi.fn(original.useSensor) };
});

async function renderListWithSensors() {
  vi.mocked(dndCore.useSensor).mockClear();
  const { LocationList } = await import("./LocationList");
  render(
    <LocationList
      rows={[]}
      onMove={vi.fn()}
      onRemove={vi.fn()}
      onSelectTrackFraction={vi.fn()}
      onMoveTrack={vi.fn()}
    />,
  );
  return vi.mocked(dndCore.useSensor).mock.calls;
}

describe("LocationList sensors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("should use the touch sensor and the keyboard sensor without Pointer Events", async () => {
    vi.stubGlobal("PointerEvent", undefined);
    vi.resetModules();

    const calls = await renderListWithSensors();

    expect(calls[0]).toEqual([
      dndCore.TouchSensor,
      {
        activationConstraint: {
          delay: REORDER_TOUCH_ACTIVATION_DELAY_MS,
          tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX,
        },
      },
    ]);
    expect(calls[1][0]).toBe(dndCore.KeyboardSensor);
  });

  it("should use the pointer sensor and the keyboard sensor with Pointer Events", async () => {
    vi.resetModules();

    const calls = await renderListWithSensors();

    expect(calls[0]).toEqual([
      dndCore.PointerSensor,
      {
        activationConstraint: {
          distance: REORDER_POINTER_ACTIVATION_DISTANCE_PX,
        },
      },
    ]);
    expect(calls[1][0]).toBe(dndCore.KeyboardSensor);
  });
});
