import { type RefObject, useEffect, useState } from "react";

const UNMEASURED_WIDTH = 0;

/**
 * Width in px of the referenced element, kept current with `ResizeObserver`.
 * Measures the container, not the viewport (ADR-0005).
 * Implements FR4 of add-main-page-scaffold.
 */
export function useContainerWidth(
  containerRef: RefObject<HTMLElement>,
): number {
  const [containerWidth, setContainerWidth] = useState(UNMEASURED_WIDTH);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;
    const resizeObserver = new ResizeObserver(([latestEntry]) => {
      setContainerWidth(latestEntry.contentRect.width);
    });
    resizeObserver.observe(containerElement);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return containerWidth;
}
