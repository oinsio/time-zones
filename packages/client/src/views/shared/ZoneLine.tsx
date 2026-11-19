import { type HTMLAttributes, useLayoutEffect, useRef } from "react";
import { ZONE_LINE_SEPARATOR } from "@/constants";
import { type ZoneLinePart, ZoneLinePartKind } from "@/presenter";
import { getZoneLinePartLineStarts } from "./zoneLineBreaks";

const LINE_START_ATTRIBUTE = "data-line-start";
const PART_SELECTOR = "[data-zone-line-part]";

/** Marks the parts that start a visual line, measured with every dot shown. */
function markLineStarts(lineElement: HTMLElement): void {
  const partElements = Array.from(
    lineElement.querySelectorAll<HTMLElement>(PART_SELECTOR),
  );
  for (const partElement of partElements) {
    partElement.removeAttribute(LINE_START_ATTRIBUTE);
  }
  const lineStarts = getZoneLinePartLineStarts(
    partElements.map((partElement) => partElement.offsetTop),
  );
  partElements.forEach((partElement, partIndex) => {
    if (lineStarts[partIndex]) {
      partElement.setAttribute(LINE_START_ATTRIBUTE, "");
    }
  });
}

type ZoneLineProps = {
  parts: readonly ZoneLinePart[];
  className?: string;
  isTextSeparated?: boolean;
} & Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children">;

/**
 * The zone line: country, zone abbreviation and UTC offset as separate
 * elements joined by middle dots that wrap only between each other. A part
 * that starts a wrapped line hides its leading dot, so a line never starts or
 * ends with a dot; the dots are not read. `isTextSeparated` adds a space text
 * node after each part so the line reads as one phrase in an accessible
 * description. Extra props (the grab area's pointer listeners) go to the line.
 * Implements FR5, FR14, NFR-R1 of show-zone-abbreviations-and-zone-label-setting (D7).
 * Implements FR9 of redesign-cards-grid-and-day-palettes (D5).
 */
export function ZoneLine({
  parts,
  className,
  isTextSeparated = false,
  ...lineProps
}: ZoneLineProps) {
  const lineRef = useRef<HTMLSpanElement | null>(null);
  useLayoutEffect(() => {
    const lineElement = lineRef.current;
    if (lineElement === null) return;
    markLineStarts(lineElement);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => markLineStarts(lineElement));
    observer.observe(lineElement);
    return () => observer.disconnect();
  }, [parts]);
  return (
    <span
      {...lineProps}
      ref={lineRef}
      data-zone-line
      className={`flex flex-wrap gap-x-1.5${className ? ` ${className}` : ""}`}
    >
      {parts.map((part, partIndex) => (
        <span
          key={part.kind}
          data-zone-line-part
          className={`bg-surface [&[data-line-start]>[data-zone-line-dot]]:hidden${
            part.kind === ZoneLinePartKind.PLACE ? "" : " whitespace-nowrap"
          }`}
        >
          {partIndex > 0 && (
            <span aria-hidden="true" data-zone-line-dot className="mr-1.5">
              {ZONE_LINE_SEPARATOR}
            </span>
          )}
          {part.text}
          {isTextSeparated && " "}
        </span>
      ))}
    </span>
  );
}
