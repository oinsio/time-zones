import { describe, expect, it } from "vitest";
import { formatUtcOffset } from "./utcOffset";

describe("formatUtcOffset", () => {
  // FR3, UX2: label format
  it.each([
    [180, "UTC+3"],
    [330, "UTC+5:30"],
    [345, "UTC+5:45"],
    [-240, "UTC−4"],
    [-330, "UTC−5:30"],
    [0, "UTC"],
    [600, "UTC+10"],
    [-60, "UTC−1"],
  ])("should format %i minutes as %s", (minutes, label) => {
    expect(formatUtcOffset(minutes, "UTC")).toBe(label);
  });

  it("should use the real minus sign U+2212 for negative offsets", () => {
    const label = formatUtcOffset(-330, "UTC");
    expect(label).toContain("−");
    expect(label).not.toContain("-");
  });

  it("should use the given prefix as is", () => {
    expect(formatUtcOffset(180, "XYZ")).toBe("XYZ+3");
  });
});
