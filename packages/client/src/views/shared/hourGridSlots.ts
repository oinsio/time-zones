import type { CSSProperties, ReactNode, RefCallback } from "react";
import type { LocationRow } from "@/presenter";

/**
 * What the Grid view hands to the shared view location list: the hour strip
 * of a row, the hour frame, and the panel's ref and style (CSS variables of
 * the hour cell layout). `views/shared` never imports `views/grid`.
 * Implements FR1, FR8, NFR-R2 of add-grid-hour-cells-and-hour-frame (D5).
 */
export type HourGridSlots = {
  renderHourStrip: (row: LocationRow) => ReactNode;
  frame: ReactNode;
  panelRef: RefCallback<HTMLUListElement>;
  panelStyle: CSSProperties;
};
