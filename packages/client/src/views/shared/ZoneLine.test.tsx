// Verifies FR9 of redesign-cards-grid-and-day-palettes.
import { render, screen } from "@testing-library/react";
import { ZONE_LINE_SEPARATOR } from "@/constants";
import { type ZoneLinePart, ZoneLinePartKind } from "@/presenter";
import { ZoneLine } from "./ZoneLine";

const PARTS: ZoneLinePart[] = [
  { kind: ZoneLinePartKind.PLACE, text: "Germany" },
  { kind: ZoneLinePartKind.ZONE_ABBREVIATION, text: "CET" },
  { kind: ZoneLinePartKind.UTC_OFFSET, text: "UTC+1" },
];

describe("ZoneLine", () => {
  it("should put a hidden middle dot before every part but the first", () => {
    const { container } = render(<ZoneLine parts={PARTS} />);

    const dots = container.querySelectorAll("[data-zone-line-dot]");
    expect(dots).toHaveLength(PARTS.length - 1);
    for (const dot of Array.from(dots)) {
      expect(dot).toHaveAttribute("aria-hidden", "true");
      expect(dot).toHaveTextContent(ZONE_LINE_SEPARATOR);
    }
  });

  it("should have no dot in the accessible text", () => {
    render(<ZoneLine parts={PARTS} isTextSeparated />);

    const line = document.querySelector("[data-zone-line]");
    expect(line?.textContent?.replace(ZONE_LINE_SEPARATOR, "")).toContain(
      "Germany",
    );
    expect(screen.getByText("CET")).toBeVisible();
  });

  it("should draw no dot for a single part", () => {
    const { container } = render(<ZoneLine parts={PARTS.slice(0, 1)} />);

    expect(container.querySelector("[data-zone-line-dot]")).toBeNull();
  });
});
