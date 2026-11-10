// Verifies FR6 of refine-meeting-range-entry-and-handles.
import type { ChangeEvent } from "react";
import { describe, expect, it } from "vitest";
import { getTypedTimeFieldText } from "./typedTimeFieldText";

const changeTo = (
  value: string,
  selectionEnd: number,
  inputType?: string,
): ChangeEvent<HTMLInputElement> =>
  ({
    target: { value, selectionEnd },
    nativeEvent: { inputType },
  }) as unknown as ChangeEvent<HTMLInputElement>;

describe("getTypedTimeFieldText", () => {
  it("should insert the separator when a digit is inserted at the end", () => {
    expect(getTypedTimeFieldText(changeTo("103", 3, "insertText"), "10")).toBe(
      "10:3",
    );
  });

  it("should insert the separator into a pasted time", () => {
    expect(
      getTypedTimeFieldText(changeTo("1030", 4, "insertFromPaste"), "07:00"),
    ).toBe("10:30");
  });

  it("should keep the raw text on a deletion", () => {
    expect(
      getTypedTimeFieldText(
        changeTo("103", 3, "deleteContentBackward"),
        "10:30",
      ),
    ).toBe("103");
  });

  it("should keep the raw text when the caret is not at the end", () => {
    expect(
      getTypedTimeFieldText(changeTo("1230", 2, "insertText"), "130"),
    ).toBe("1230");
  });

  it("should keep the raw text of a shorter prefix without an input type", () => {
    expect(getTypedTimeFieldText(changeTo("103", 3), "1030")).toBe("103");
  });

  it("should insert the separator for another change without an input type", () => {
    expect(getTypedTimeFieldText(changeTo("103", 3), "10")).toBe("10:3");
  });
});
