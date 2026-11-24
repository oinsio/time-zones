import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RowSkeleton } from "../../shared";
import type { ConverterViewProps } from "../converterViewDefinition";
import { ConverterInputField } from "./ConverterInputField";
import { ConverterRow } from "./ConverterRow";
import { MomentNotations } from "./MomentNotations";
import { UnitChoice } from "./UnitChoice";

const NOW_ICON_SIZE_PX = 18;

/**
 * The first converter view: the input with the unit choice and Now, the
 * relative time, the rows, the notations and Show on main page, one under
 * the other in the content column.
 * Implements FR9, FR11, FR12, FR13, FR14, FR16, FR17, UX1, UX6, NFR-R1, NFR-R2 of add-unix-time-converter-tool (D7, D9).
 */
export function ListConverterView({
  converter,
  commands,
  shouldFocusInput,
  isListLoading,
}: ConverterViewProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-2 rounded-card border border-card-border bg-surface px-4 py-3">
        <ConverterInputField
          input={converter.input}
          onTypeInput={commands.typeInput}
          shouldFocusOnMount={shouldFocusInput}
        />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <UnitChoice
            options={converter.unitOptions}
            unitInForceLabel={converter.unitInForceLabel}
            onChoose={commands.chooseUnit}
          />
          <button
            type="button"
            disabled={!converter.isNowActive}
            onClick={commands.returnToNow}
            className="flex h-11 items-center gap-1.5 rounded-now border border-control-border px-2.5 text-base font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:border-control-border-inactive disabled:text-muted-foreground"
          >
            <Clock aria-hidden="true" size={NOW_ICON_SIZE_PX} />
            {t("unixTime.now")}
          </button>
        </div>
        <p
          aria-label={t("unixTime.relativeLabel")}
          className="text-base text-muted-foreground"
        >
          {converter.relativeTime}
        </p>
      </div>
      {isListLoading ? (
        <div aria-busy="true" className="flex min-w-0 flex-col gap-3">
          <span className="sr-only">{t("mainPage.loading")}</span>
          <RowSkeleton />
        </div>
      ) : (
        <ul
          aria-label={t("unixTime.rowsLabel")}
          className="flex min-w-0 flex-col gap-3"
        >
          {converter.rows.map((row) => (
            <ConverterRow
              key={row.id}
              row={row}
              onConfirmTime={(text) => commands.setRowWallTime(row.id, text)}
              onSelectDate={(isoDate) => commands.setRowDate(row.id, isoDate)}
            />
          ))}
        </ul>
      )}
      <MomentNotations
        notations={converter.notations}
        onCopy={commands.copyNotation}
      />
      <button
        type="button"
        disabled={!converter.isShowOnMainPageActive}
        onClick={commands.showOnMainPage}
        className="min-h-11 self-start rounded-md border border-control-border px-4 text-base font-semibold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default disabled:border-control-border-inactive disabled:text-muted-foreground"
      >
        {t("unixTime.showOnMainPage")}
      </button>
    </div>
  );
}
