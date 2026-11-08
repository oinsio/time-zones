import { Check } from "lucide-react";
import { type ReactNode, useId } from "react";
import {
  SETTINGS_GROUP_CAPTION_CLASS_NAME,
  SETTINGS_GROUP_ROW_CLASS_NAME,
} from "@/constants";
import { cn } from "@/shared/lib/cn";

export type SettingsToggleOption<Value extends string> = {
  value: Value;
  label: string;
};

type SettingsToggleGroupProps<Value extends string> = {
  caption: string;
  options: readonly SettingsToggleOption<Value>[];
  selectedValues: readonly Value[];
  onToggle: (value: Value, isSelected: boolean) => void;
  /** Shown under the toggles and read as the group's description. */
  description?: ReactNode;
};

/**
 * A compact settings group in one row: a caption and independent toggle
 * buttons, each on or off. Below the width that fits all of it the toggles
 * move under the caption together. A pressed toggle shows a check icon whose
 * slot keeps its size when the toggle is off, so toggling moves nothing.
 * Implements FR16, NFR-A1, NFR-R2, UX2 of show-zone-abbreviations-and-zone-label-setting (D7).
 * Implements FR6 of compact-settings-controls (D5).
 */
export function SettingsToggleGroup<Value extends string>({
  caption,
  options,
  selectedValues,
  onToggle,
  description,
}: SettingsToggleGroupProps<Value>) {
  const captionId = useId();
  const descriptionId = useId();
  return (
    <div
      role="group"
      aria-labelledby={captionId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      className="flex flex-col gap-2"
    >
      <div className={SETTINGS_GROUP_ROW_CLASS_NAME}>
        <span id={captionId} className={SETTINGS_GROUP_CAPTION_CLASS_NAME}>
          {caption}
        </span>
        <div className="flex flex-nowrap gap-2">
          {options.map(({ value, label }) => {
            const isSelected = selectedValues.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggle(value, !isSelected)}
                className={cn(
                  "flex min-h-11 min-w-11 items-center gap-1 rounded-md border bg-surface px-2 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
                  isSelected ? "border-accent" : "border-border",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center">
                  {isSelected && (
                    <Check aria-hidden="true" className="size-5 text-accent" />
                  )}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {description !== undefined && (
        <div id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </div>
      )}
    </div>
  );
}
