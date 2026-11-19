// FR9, UX2 of support-legacy-ios-12-safari: the drag sensors.
// Verifies FR15, NFR-A3 of redesign-cards-grid-and-day-palettes (D6): a mouse and a touch sensor on every engine, no keyboard sensor.

import * as dndCore from "@dnd-kit/core";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  REORDER_POINTER_ACTIVATION_DISTANCE_PX,
  REORDER_TOUCH_ACTIVATION_DELAY_MS,
  REORDER_TOUCH_ACTIVATION_TOLERANCE_PX,
} from "@/constants";
import { ignoreWallTime } from "@/test/ignoreWallTime";

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
      onSetHome={() => undefined}
      onSelectTrackFraction={vi.fn()}
      onMoveTrack={vi.fn()}
      onConfirmWallTime={ignoreWallTime}
    />,
  );
  return vi.mocked(dndCore.useSensor).mock.calls;
}

const EXPECTED_SENSORS = [
  [
    dndCore.MouseSensor,
    {
      activationConstraint: {
        distance: REORDER_POINTER_ACTIVATION_DISTANCE_PX,
      },
    },
  ],
  [
    dndCore.TouchSensor,
    {
      activationConstraint: {
        delay: REORDER_TOUCH_ACTIVATION_DELAY_MS,
        tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX,
      },
    },
  ],
];

describe("LocationList sensors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("should use the mouse sensor and the touch sensor without Pointer Events, and no keyboard sensor", async () => {
    vi.stubGlobal("PointerEvent", undefined);
    vi.resetModules();

    const calls = await renderListWithSensors();

    expect(calls).toEqual(EXPECTED_SENSORS);
  });

  it("should use the mouse sensor and the touch sensor with Pointer Events, and no keyboard sensor", async () => {
    vi.resetModules();

    const calls = await renderListWithSensors();

    expect(calls).toEqual(EXPECTED_SENSORS);
  });
});
