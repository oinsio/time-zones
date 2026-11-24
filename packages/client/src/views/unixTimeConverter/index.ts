import { List } from "lucide-react";
import {
  type ConverterViewDefinition,
  ConverterViewId,
} from "./converterViewDefinition";
import { ListConverterView } from "./list/ListConverterView";

export type {
  ConverterViewDefinition,
  ConverterViewProps,
} from "./converterViewDefinition";
export {
  ConverterViewId,
  DEFAULT_CONVERTER_VIEW_ID,
} from "./converterViewDefinition";

const listConverterView: ConverterViewDefinition = {
  id: ConverterViewId.LIST,
  titleKey: "unixTime.viewList",
  icon: List,
  component: ListConverterView,
};

/**
 * Every converter view the tool can show, in display order. A new view is one
 * entry here plus its folder. Not re-exported from `views/index.ts` (D11): only
 * the converter chunk imports it.
 * Implements FR17, G5, M8 of add-unix-time-converter-tool (D9).
 */
export const converterViewRegistry: readonly ConverterViewDefinition[] = [
  listConverterView,
];
