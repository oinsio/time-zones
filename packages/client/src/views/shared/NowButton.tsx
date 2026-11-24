import { Clock } from "lucide-react";

const NOW_ICON_SIZE_PX = 18;

type NowButtonProps = {
  /** Active while the moment is pinned; inactive (disabled) while it is live. */
  isActive: boolean;
  label: string;
  onReturnToNow: () => void;
};

/**
 * The Now button: the outlined button that returns a moment to live.
 * Shared by the date bar and the converter.
 * Implements FR14 of add-unix-time-converter-tool.
 */
export function NowButton({ isActive, label, onReturnToNow }: NowButtonProps) {
  return (
    <button
      type="button"
      disabled={!isActive}
      className="flex h-11 items-center gap-1.5 rounded-now border border-control-border px-2.5 text-base font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:border-control-border-inactive disabled:text-muted-foreground"
      onClick={onReturnToNow}
    >
      <Clock aria-hidden="true" size={NOW_ICON_SIZE_PX} />
      {label}
    </button>
  );
}
