import type { LucideIcon } from "lucide-react";
import { forwardRef } from "react";
import { HEADER_ICON_SIZE_PX } from "@/constants";

type HeaderIconButtonProps = {
  /** The accessible name; the pointer hint too when `hasTitle`. */
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  hasTitle?: boolean;
};

/**
 * A header button shown by an icon alone: the body the settings button and
 * the tool buttons share, so the three look alike.
 * Implements FR1, UX1 of add-settings-page-and-device-time-location (D11).
 * Implements FR4, UX3 of add-unix-time-converter-tool (D2).
 */
export const HeaderIconButton = forwardRef<
  HTMLButtonElement,
  HeaderIconButtonProps
>(function HeaderIconButton(
  { label, icon: Icon, onClick, hasTitle = false },
  buttonRef,
) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={hasTitle ? label : undefined}
      className="flex h-11 w-11 items-center justify-center rounded-md text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <Icon aria-hidden="true" size={HEADER_ICON_SIZE_PX} />
    </button>
  );
});
