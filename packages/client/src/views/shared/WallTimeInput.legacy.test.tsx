// Verifies FR13, M8 of add-wall-time-input-with-hint (D6): a tap without Pointer Events.
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const NAME = "Ввести время — Нью-Йорк, 03:30";

describe("the wall-time input without Pointer Events", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("opens the field on a plain click", async () => {
    vi.stubGlobal("PointerEvent", undefined);
    vi.resetModules();
    const { WallTimeInputOutcome } = await import("@/controller");
    const { LocalDateTime } = await import("./LocalDateTime");
    render(
      <LocalDateTime
        localTimeLabel="03:30"
        localDateLabel="Sun, Mar 8"
        localIsoDate="2026-03-08"
        wallTimeInputLabel={NAME}
        onConfirmWallTime={() => WallTimeInputOutcome.CLOSED}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: NAME }));

    expect(screen.getByRole("textbox", { name: NAME })).toHaveAttribute(
      "inputmode",
      "numeric",
    );
  });
});
