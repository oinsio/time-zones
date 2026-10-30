import { Check } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useId } from "react";
import { cn } from "@/shared/lib/cn";

export type SettingsOption<Value extends string> = {
  value: Value;
  label: string;
  /** Icon drawn before the label; absent for text-only options. */
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

type SettingsOptionGroupProps<Value extends string> = {
  legend: string;
  options: readonly SettingsOption<Value>[];
  selectedValue: Value;
  onSelect: (value: Value) => void;
};

/**
 * One group of mutually exclusive settings: native radio inputs in a
 * `radiogroup`, so arrow keys move the choice. The checked option shows a
 * check icon next to its label.
 * Implements FR3, FR5, NFR-A1 of add-settings-page-and-device-time-location (D10).
 */
export function SettingsOptionGroup<Value extends string>({
  legend,
  options,
  selectedValue,
  onSelect,
}: SettingsOptionGroupProps<Value>) {
  const groupName = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-muted-foreground">
        {legend}
      </legend>
      <div
        role="radiogroup"
        aria-label={legend}
        className="flex flex-col gap-2"
      >
        {options.map(({ value, label, Icon }) => {
          const isChecked = value === selectedValue;
          return (
            <label
              key={value}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border bg-surface px-4 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                isChecked ? "border-accent" : "border-border",
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={value}
                checked={isChecked}
                onChange={() => onSelect(value)}
                className="sr-only"
              />
              {Icon && <Icon aria-hidden="true" className="text-accent" />}
              <span className="flex-1 font-semibold">{label}</span>
              {isChecked && (
                <Check aria-hidden="true" className="text-accent" />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
