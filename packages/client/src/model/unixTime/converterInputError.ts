/**
 * Why the converter input cannot set the moment; the texts are the presenter's.
 * Implements FR15 of add-unix-time-converter-tool (D5).
 */
export enum ConverterInputError {
  UNREADABLE = "UNREADABLE",
  OUT_OF_RANGE = "OUT_OF_RANGE",
}
