/**
 * jsdom has no PointerEvent; React reads `pointerType` and `pointerId` from it.
 * `src/test/setup.ts` installs this stand-in when the global is missing.
 * Implements FR8, FR9 of support-legacy-ios-12-safari (D8).
 */
export class FakePointerEvent extends MouseEvent {
  pointerId: number;
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
    this.pointerType = init.pointerType ?? "";
  }
}
