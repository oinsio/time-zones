// Verifies FR1, FR2, FR4 of open-location-search-with-slash-shortcut
import { KeyboardKey } from "@/constants";
import { isSearchShortcutEvent } from "./searchShortcut";

type KeyOptions = KeyboardEventInit & { key?: string };

/** Dispatches a keydown on the element and returns the predicate's verdict. */
function judgeKeydownOn(target: Element, options: KeyOptions): boolean {
  let verdict = false;
  target.addEventListener("keydown", (event) => {
    verdict = isSearchShortcutEvent(event as KeyboardEvent);
  });
  target.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: KeyboardKey.SLASH,
      bubbles: true,
      ...options,
    }),
  );
  return verdict;
}

const createInput = (type?: string) => {
  const input = document.createElement("input");
  if (type !== undefined) input.setAttribute("type", type);
  return input;
};

const createDiv = (contentEditable: string) => {
  const div = document.createElement("div");
  div.setAttribute("contenteditable", contentEditable);
  return div;
};

describe("isSearchShortcutEvent", () => {
  let appendedElements: Element[] = [];

  const append = (element: Element) => {
    document.body.appendChild(element);
    appendedElements.push(element);
    return element;
  };

  afterEach(() => {
    for (const element of appendedElements) element.remove();
    appendedElements = [];
  });

  it("should accept the slash key on the document body", () => {
    expect(judgeKeydownOn(document.body, {})).toBe(true);
  });

  it("should accept the slash key on a button", () => {
    expect(judgeKeydownOn(append(document.createElement("button")), {})).toBe(
      true,
    );
  });

  it("should accept the slash key typed with Shift", () => {
    expect(judgeKeydownOn(document.body, { shiftKey: true })).toBe(true);
  });

  it.each(["?", "a"])("should ignore the key %s", (key) => {
    expect(judgeKeydownOn(document.body, { key })).toBe(false);
  });

  it.each(["ctrlKey", "metaKey", "altKey"])(
    "should ignore the slash key with %s held",
    (modifier) => {
      expect(judgeKeydownOn(document.body, { [modifier]: true })).toBe(false);
    },
  );

  it.each([undefined, "text", "search", "email"])(
    "should ignore the slash key in an input of type %s",
    (type) => {
      expect(judgeKeydownOn(append(createInput(type)), {})).toBe(false);
    },
  );

  it.each([
    "button",
    "checkbox",
    "color",
    "file",
    "image",
    "radio",
    "range",
    "reset",
    "submit",
  ])("should accept the slash key on an input of type %s", (type) => {
    expect(judgeKeydownOn(append(createInput(type)), {})).toBe(true);
  });

  it("should ignore the slash key in a textarea", () => {
    expect(judgeKeydownOn(append(document.createElement("textarea")), {})).toBe(
      false,
    );
  });

  it.each(["true", ""])(
    'should ignore the slash key in contenteditable="%s"',
    (value) => {
      expect(judgeKeydownOn(append(createDiv(value)), {})).toBe(false);
    },
  );

  it("should ignore the slash key in an element inside a contenteditable", () => {
    const span = document.createElement("span");
    append(createDiv("true")).appendChild(span);
    expect(judgeKeydownOn(span, {})).toBe(false);
  });

  it('should accept the slash key in contenteditable="false"', () => {
    expect(judgeKeydownOn(append(createDiv("false")), {})).toBe(true);
  });

  it("should accept the slash key when the target is not an element", () => {
    const event = new KeyboardEvent("keydown", { key: KeyboardKey.SLASH });
    expect(isSearchShortcutEvent(event)).toBe(true);
  });
});
