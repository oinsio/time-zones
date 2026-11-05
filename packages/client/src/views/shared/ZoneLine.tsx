import { Fragment } from "react";
import { type ZoneLinePart, ZoneLinePartKind } from "@/presenter";

/**
 * The zone line: country, zone abbreviation and UTC offset as separate
 * elements that wrap only between each other; the place wraps by words.
 * `isTextSeparated` adds a space text node after each part so the line reads
 * as one phrase in an accessible description.
 * Implements FR5, FR14, NFR-R1 of show-zone-abbreviations-and-zone-label-setting (D7).
 */
export function ZoneLine({
  parts,
  className,
  isTextSeparated = false,
}: {
  parts: readonly ZoneLinePart[];
  className?: string;
  isTextSeparated?: boolean;
}) {
  return (
    <span
      data-zone-line
      className={`flex flex-wrap gap-x-2${className ? ` ${className}` : ""}`}
    >
      {parts.map((part) => (
        <Fragment key={part.kind}>
          <span
            className={
              part.kind === ZoneLinePartKind.PLACE
                ? undefined
                : "whitespace-nowrap"
            }
          >
            {part.text}
          </span>
          {isTextSeparated && " "}
        </Fragment>
      ))}
    </span>
  );
}
