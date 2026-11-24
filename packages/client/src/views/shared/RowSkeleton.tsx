const PLACEHOLDER_ROW_COUNT = 3;
const PLACEHOLDER_ROWS = Array.from(
  { length: PLACEHOLDER_ROW_COUNT },
  // Stryker disable next-line ArrowFunction,StringLiteral: equivalent — keys only silence React's list warning
  (_, rowNumber) => `placeholder-row-${rowNumber}`,
);

/**
 * The placeholder rows shown in place of the location rows while they load.
 * Implements FR5, UX1 of add-main-page-scaffold; reused by the converter list view (FR9 of add-unix-time-converter-tool).
 */
export function RowSkeleton() {
  return (
    <>
      {PLACEHOLDER_ROWS.map((rowKey) => (
        <div
          key={rowKey}
          aria-hidden="true"
          className="h-16 animate-pulse rounded-lg bg-muted-foreground/20"
        />
      ))}
    </>
  );
}
