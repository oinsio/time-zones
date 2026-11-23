// Public API of the Unix time presenter (ADR-0002, D11 of add-unix-time-converter-tool).
// Not re-exported from `presenter/index.ts`: only the converter chunk imports it.
export { formatExactLocalTime } from "./exactTimeLabel";
export {
  type ExactWallTime,
  parseExactWallTimeInput,
} from "./parseExactWallTimeInput";
export {
  type ConverterContext,
  type ConverterNotationId,
  type PresentedConverter,
  type PresentedNotation,
  type PresentedUnitOption,
  presentConverter,
} from "./presentConverter";
export {
  type ConverterRowsContext,
  type PresentedConverterRow,
  presentConverterRows,
} from "./presentConverterRows";
export { presentRelativeTime } from "./presentRelativeTime";
