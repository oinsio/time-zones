import { useTranslation } from "react-i18next";
import type { UnixTimeUnitChoice } from "@/model/unixTime";
import type { PresentedUnitOption } from "@/presenter/unixTime";

type UnitChoiceProps = {
  options: readonly PresentedUnitOption[];
  unitInForceLabel: string;
  onChoose: (choice: UnixTimeUnitChoice) => void;
};

/**
 * The unit choice: Auto and the four Unix time units, with the unit in force
 * named beside it.
 * Implements FR7, NFR-A3 of add-unix-time-converter-tool (D7).
 */
export function UnitChoice({
  options,
  unitInForceLabel,
  onChoose,
}: UnitChoiceProps) {
  const { t } = useTranslation();
  const selected = options.find(({ isSelected }) => isSelected);
  return (
    <div className="flex flex-col gap-1">
      <select
        aria-label={t("unixTime.unitGroupLabel")}
        value={selected?.choice}
        onChange={(event) => onChoose(event.target.value as UnixTimeUnitChoice)}
        className="min-h-11 rounded-md border border-control-border bg-surface px-2 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {options.map(({ choice, label }) => (
          <option key={choice} value={choice}>
            {label}
          </option>
        ))}
      </select>
      <p className="text-sm text-muted-foreground">{unitInForceLabel}</p>
    </div>
  );
}
