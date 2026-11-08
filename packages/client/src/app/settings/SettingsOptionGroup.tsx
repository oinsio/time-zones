import type { ComponentType, SVGProps } from "react";
import { useId } from "react";
import {
  SETTINGS_GROUP_CAPTION_CLASS_NAME,
  SETTINGS_GROUP_ROW_CLASS_NAME,
} from "@/constants";
import { cn } from "@/shared/lib/cn";

export type SettingsOption<Value extends string> = {
  value: Value;
  /** Accessible name and pointer hint; shown as text only without Icon and pictogram. */
  label: string;
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Short language-neutral text shown instead of the label. */
  pictogram?: string;
};

type SettingsOptionGroupProps<Value extends string> = {
  caption: string;
  options: readonly SettingsOption<Value>[];
  selectedValue: Value;
  onSelect: (value: Value) => void;
};

function OptionFace<Value extends string>({
  option: { label, Icon, pictogram },
}: {
  option: SettingsOption<Value>;
}) {
  if (Icon === undefined && pictogram === undefined) {
    return <span>{label}</span>;
  }
  return (
    <>
      {Icon === undefined ? (
        <span aria-hidden="true">{pictogram}</span>
      ) : (
        <Icon aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </>
  );
}

/**
 * A compact settings group in one row: a caption and mutually exclusive
 * options joined in one track, drawn as icons or pictograms. Native radio
 * inputs in a `radiogroup` named by the caption, so arrow keys move the
 * choice in display order. The checked option is filled with the accent
 * colour, which moves nothing when the choice changes.
 * Implements FR5, FR6, NFR-A1, NFR-A2, NFR-A3, UX2, UX3 of compact-settings-controls (D1, D4, D5, D6).
 */
export function SettingsOptionGroup<Value extends string>({
  caption,
  options,
  selectedValue,
  onSelect,
}: SettingsOptionGroupProps<Value>) {
  const groupName = useId();
  const captionId = useId();
  return (
    <div
      role="radiogroup"
      aria-labelledby={captionId}
      className={SETTINGS_GROUP_ROW_CLASS_NAME}
    >
      <span id={captionId} className={SETTINGS_GROUP_CAPTION_CLASS_NAME}>
        {caption}
      </span>
      <div className="flex flex-nowrap rounded-md border border-border bg-surface">
        {options.map((option) => {
          const isChecked = option.value === selectedValue;
          return (
            <label
              key={option.value}
              title={option.label}
              className={cn(
                "flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-md px-2 py-2 text-sm font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-accent",
                isChecked
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface text-accent",
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={isChecked}
                onChange={() => onSelect(option.value)}
                className="sr-only"
              />
              <OptionFace option={option} />
            </label>
          );
        })}
      </div>
    </div>
  );
}
