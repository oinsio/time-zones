import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { ConverterCommands } from "@/controller/unixTime";
import type { PresentedConverter } from "@/presenter/unixTime";

/**
 * Identifiers of the registered converter views; a member is added with each
 * new view.
 * Implements FR17, G5 of add-unix-time-converter-tool (D9).
 */
export enum ConverterViewId {
  LIST = "list",
}

/** The converter view shown when no other is chosen; no setting chooses one while one is registered (NG7). */
export const DEFAULT_CONVERTER_VIEW_ID = ConverterViewId.LIST;

/**
 * What every converter view receives: the same presented data and the same
 * commands. A view renders them and decides nothing about time.
 * Implements FR17 of add-unix-time-converter-tool (D9).
 */
export type ConverterViewProps = {
  converter: PresentedConverter;
  commands: ConverterCommands;
  /** The view focuses its input and selects its text on mount: a fine, hovering pointer. */
  shouldFocusInput: boolean;
};

/** Describes one swappable converter view. Implements FR17, G5 of add-unix-time-converter-tool (D9). */
export interface ConverterViewDefinition {
  id: string;
  /** i18n key of the view name. */
  titleKey: string;
  icon: LucideIcon;
  component: ComponentType<ConverterViewProps>;
}
