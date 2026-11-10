import { KeyboardKey } from "@/constants";

const KEYS_KEPT_IN_FIELD = new Set<string>([
  KeyboardKey.SPACE,
  KeyboardKey.ENTER,
  KeyboardKey.ESCAPE,
  KeyboardKey.ARROW_UP,
  KeyboardKey.ARROW_DOWN,
  KeyboardKey.ARROW_LEFT,
  KeyboardKey.ARROW_RIGHT,
]);

/**
 * Whether a key typed in a time field belongs to the field: it must not reach
 * the row's reorder or menu handlers.
 * Implements FR4 of fix-grid-meeting-range-lock-and-layering (D4): shared by the wall-time input and the meeting range input.
 */
export function isKeyKeptInField(key: string): boolean {
  return KEYS_KEPT_IN_FIELD.has(key);
}
