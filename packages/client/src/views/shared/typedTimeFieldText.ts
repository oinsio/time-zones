import type { ChangeEvent } from "react";
import { INSERT_INPUT_TYPE_PREFIX } from "@/constants";
import { formatTypedWallTimeText } from "@/presenter";

const isInsertion = (
  event: ChangeEvent<HTMLInputElement>,
  previousText: string,
): boolean => {
  const inputType = (event.nativeEvent as InputEvent).inputType;
  if (inputType !== undefined) {
    return inputType.startsWith(INSERT_INPUT_TYPE_PREFIX);
  }
  const text = event.target.value;
  return !(text.length < previousText.length && previousText.startsWith(text));
};

/**
 * The text a time field shows after a change: the typed digits with the `:`
 * inserted, only when the user inserted text at the end of the field. A
 * deletion, or an edit inside the text, keeps the raw value.
 * Implements FR6, UX1 of refine-meeting-range-entry-and-handles (D4).
 */
export function getTypedTimeFieldText(
  event: ChangeEvent<HTMLInputElement>,
  previousText: string,
): string {
  const text = event.target.value;
  const isAtEnd = event.target.selectionEnd === text.length;
  return isInsertion(event, previousText) && isAtEnd
    ? formatTypedWallTimeText(text)
    : text;
}
