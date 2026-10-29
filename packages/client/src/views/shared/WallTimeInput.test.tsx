// Verifies FR1, FR3, FR5, FR6, FR10, NFR-A2, NFR-A4, UX1, UX2 of add-wall-time-input-with-hint (D6).
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WallTimeInputOutcome } from "@/controller";
import { WallTimeInput } from "./WallTimeInput";

const LABEL = "Enter time — Moscow, 10:30";

function renderField(outcome = WallTimeInputOutcome.CLOSED) {
  const onConfirm = vi.fn(() => outcome);
  const onClose = vi.fn();
  const onParentKeyDown = vi.fn();
  render(
    <div onKeyDown={onParentKeyDown}>
      <WallTimeInput
        label={LABEL}
        initialText="10:30"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </div>,
  );
  return {
    onConfirm,
    onClose,
    onParentKeyDown,
    field: screen.getByRole("textbox", { name: LABEL }),
  };
}

describe("WallTimeInput", () => {
  it("opens a numeric text field holding the time, selected", () => {
    const { field } = renderField();
    expect(field).toHaveAttribute("type", "text");
    expect(field).toHaveAttribute("inputmode", "numeric");
    expect(field).toHaveAttribute("autocomplete", "off");
    expect(field).toHaveValue("10:30");
    expect(field).toHaveFocus();
    expect((field as HTMLInputElement).selectionStart).toBe(0);
    expect((field as HTMLInputElement).selectionEnd).toBe(5);
  });

  it("confirms the typed text with Enter and restores focus", async () => {
    const { field, onConfirm, onClose } = renderField();
    await userEvent.clear(field);
    await userEvent.type(field, "1040{Enter}");
    expect(onConfirm).toHaveBeenCalledWith("1040");
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("shows the error and stays open for invalid text", async () => {
    const { field, onClose } = renderField(WallTimeInputOutcome.INVALID_TEXT);
    await userEvent.clear(field);
    await userEvent.type(field, "9:3{Enter}");
    expect(onClose).not.toHaveBeenCalled();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Введите время в формате ЧЧ:ММ")).toHaveAttribute(
      "id",
      field.getAttribute("aria-describedby"),
    );
  });

  it("closes with Escape and restores focus without confirming", async () => {
    const { field, onConfirm, onClose } = renderField();
    await userEvent.type(field, "{Escape}");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("confirms changed text when the field is left", async () => {
    const { field, onConfirm, onClose } = renderField();
    await userEvent.clear(field);
    await userEvent.type(field, "1040");
    fireEvent.blur(field);
    expect(onConfirm).toHaveBeenCalledWith("1040");
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it("closes without confirming when left unchanged", () => {
    const { field, onConfirm, onClose } = renderField();
    fireEvent.blur(field);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it("keeps the field open with the error when left with invalid text", async () => {
    const { field, onClose } = renderField(WallTimeInputOutcome.INVALID_TEXT);
    await userEvent.clear(field);
    await userEvent.type(field, "9:3");
    fireEvent.blur(field);
    expect(onClose).not.toHaveBeenCalled();
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

  it.each([
    " ",
    "{Enter}",
    "{ArrowLeft}",
    "{ArrowRight}",
    "{ArrowUp}",
    "{ArrowDown}",
    "{Escape}",
  ])("keeps the key %s from reaching a parent listener", async (key) => {
    const { field, onParentKeyDown } = renderField();
    await userEvent.type(field, key);
    expect(onParentKeyDown).not.toHaveBeenCalled();
  });

  it("lets Tab reach the page so the focus can leave the field", async () => {
    const { field, onParentKeyDown } = renderField();
    await userEvent.type(field, "{Tab}");
    expect(onParentKeyDown).toHaveBeenCalled();
  });

  it("starts without an error", () => {
    const { field } = renderField();
    expect(field).toHaveAttribute("aria-invalid", "false");
    expect(field).not.toHaveAttribute("aria-describedby");
  });
});
