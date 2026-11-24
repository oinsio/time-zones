// Verifies FR6, FR15, NFR-A2, NFR-A3, NFR-A4 of add-unix-time-converter-tool.
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PresentedConverter } from "@/presenter/unixTime";
import { ConverterInputField } from "./ConverterInputField";

const INPUT_NAME = "Unix-время или дата ISO 8601";
const MESSAGE = "Введите Unix-время или дату и время в формате ISO 8601";

const buildInput = (
  overrides: Partial<PresentedConverter["input"]> = {},
): PresentedConverter["input"] => ({
  text: "1795432987",
  isTyped: false,
  name: INPUT_NAME,
  hint: "hint",
  ...overrides,
});
const renderField = (
  input = buildInput(),
  { onTypeInput = vi.fn(), shouldFocusOnMount = false } = {},
) => {
  render(
    <ConverterInputField
      input={input}
      onTypeInput={onTypeInput}
      shouldFocusOnMount={shouldFocusOnMount}
    />,
  );
  return { onTypeInput };
};
const field = () => screen.getByRole("textbox", { name: INPUT_NAME });

describe("ConverterInputField", () => {
  it("should show the hint as the description of an empty input", () => {
    renderField(buildInput({ text: "" }));
    expect(field()).toHaveAccessibleDescription("hint");
  });

  it("should show no hint once the input has a text", () => {
    renderField();
    expect(screen.queryByText("hint")).toBeNull();
  });

  it("should show the presented text under the presented name", () => {
    renderField();
    expect(field()).toHaveValue("1795432987");
  });

  it("should send every change of the text", async () => {
    const { onTypeInput } = renderField(buildInput({ isTyped: true }));
    await userEvent.type(field(), "5");
    expect(onTypeInput).toHaveBeenCalledWith("17954329875");
  });

  it("should focus the field with its text selected when asked to on mount", () => {
    renderField(buildInput(), { shouldFocusOnMount: true });
    expect(field()).toHaveFocus();
    expect((field() as HTMLInputElement).selectionEnd).toBe(10);
    expect((field() as HTMLInputElement).selectionStart).toBe(0);
  });

  it("should leave the focus alone when not asked to focus", () => {
    renderField();
    expect(field()).not.toHaveFocus();
  });

  it("should send a paste as a whole text while the text is one the app wrote", () => {
    const { onTypeInput } = renderField(buildInput({ isTyped: false }));
    fireEvent.paste(field(), { clipboardData: { getData: () => "42" } });
    expect(onTypeInput).toHaveBeenCalledExactlyOnceWith("42");
  });

  it("should leave a paste to the browser while the user is typing", () => {
    const { onTypeInput } = renderField(buildInput({ isTyped: true }));
    fireEvent.paste(field(), { clipboardData: { getData: () => "42" } });
    expect(onTypeInput).not.toHaveBeenCalled();
  });

  it("should describe the field by its message and mark it invalid", () => {
    renderField(buildInput({ message: MESSAGE }));
    const message = screen.getByText(MESSAGE);
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field()).toHaveAttribute("aria-describedby", message.id);
  });

  it("should announce the message politely and not the ticking text", () => {
    renderField(buildInput({ message: MESSAGE }));
    expect(screen.getByText(MESSAGE)).toHaveAttribute("aria-live", "polite");
    expect(field()).not.toHaveAttribute("aria-live");
  });

  it("should not mark the field invalid without a message", () => {
    renderField();
    expect(field()).toHaveAttribute("aria-invalid", "false");
    expect(field()).not.toHaveAttribute("aria-describedby");
  });
});
