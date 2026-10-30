// Verifies FR3 of add-wall-time-input-with-hint (D5).
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWallTimeInput } from "./useWallTimeInput";

describe("useWallTimeInput outside a provider", () => {
  it("names the missing provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useWallTimeInput())).toThrow(
      "useWallTimeInput must be used inside a LocationsProvider",
    );
  });
});
