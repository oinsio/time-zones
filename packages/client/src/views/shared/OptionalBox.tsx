import type { ReactNode } from "react";

/**
 * Wraps its children in a `div` of the given classes; without classes the
 * children stay direct children of their parent, so Cards keeps its markup.
 * Implements FR10 of add-grid-hour-cells-and-hour-frame (D5).
 */
export function OptionalBox({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return className === undefined ? (
    children
  ) : (
    <div className={className}>{children}</div>
  );
}
