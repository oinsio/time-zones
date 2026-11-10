// Verifies FR3, FR4, NFR-A1, UX2 of fix-grid-meeting-range-lock-and-layering.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { MeetingRangeInputOutcome } from "@/controller";
import { MeetingRangeInput } from "./MeetingRangeInput";

const START_NAME = "Время начала — Moscow";
const END_NAME = "Время окончания — Moscow";

const renderInput = (
  outcome: MeetingRangeInputOutcome = MeetingRangeInputOutcome.CLOSED,
) => {
  const onConfirm = vi.fn(() => outcome);
  const onClose = vi.fn();
  render(
    <div>
      <button type="button">Outside</button>
      <MeetingRangeInput
        city="Moscow"
        initialStartText="07:00"
        initialEndText="09:00"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </div>,
  );
  return {
    onConfirm,
    onClose,
    startField: screen.getByRole("textbox", { name: START_NAME }),
    endField: screen.getByRole("textbox", { name: END_NAME }),
  };
};

describe("MeetingRangeInput", () => {
  it.each([START_NAME, END_NAME])(
    "should style the field %s as the meeting span",
    (name) => {
      renderInput();
      expect(screen.getByRole("textbox", { name })).toHaveClass(
        "border-accent",
        "font-bold",
        "text-meeting-text",
      );
    },
  );

  it("should put a dash between the fields", () => {
    const { startField, endField } = renderInput();
    expect(startField.parentElement).toBe(endField.parentElement);
    expect(startField.parentElement).toHaveTextContent("–");
  });

  it("should fill the fields with the row's local times", () => {
    const { startField, endField } = renderInput();
    expect(startField).toHaveValue("07:00");
    expect(endField).toHaveValue("09:00");
  });

  it("should focus the start field with its text selected", () => {
    const { startField } = renderInput();
    expect(startField).toHaveFocus();
    expect((startField as HTMLInputElement).selectionStart).toBe(0);
    expect((startField as HTMLInputElement).selectionEnd).toBe(5);
  });

  it.each([
    ["start", START_NAME],
    ["end", END_NAME],
  ])(
    "should confirm both texts on Enter in the %s field",
    async (_name, fieldName) => {
      const { onConfirm, onClose } = renderInput();
      const field = screen.getByRole("textbox", { name: fieldName });
      await userEvent.clear(field);
      await userEvent.type(field, "8{Enter}");
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith(true);
    },
  );

  it("should pass the typed start and end to the confirmation", async () => {
    const { onConfirm, startField } = renderInput();
    await userEvent.clear(startField);
    await userEvent.type(startField, "8{Enter}");
    expect(onConfirm).toHaveBeenCalledWith("8", "09:00");
  });

  it("should not confirm when Tab moves from the start to the end field", async () => {
    const { onConfirm, onClose, endField } = renderInput();
    await userEvent.tab();
    expect(endField).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should confirm when the focus leaves both fields after a change", async () => {
    const { onConfirm, onClose, startField } = renderInput();
    await userEvent.type(startField, "5");
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(false);
  });

  // FR4: leaving both fields after only the end text changed confirms.
  it("should confirm when only the end text changed and the focus leaves", async () => {
    const { onConfirm, endField } = renderInput();
    await userEvent.clear(endField);
    await userEvent.type(endField, "10:00");
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(onConfirm).toHaveBeenCalledWith("07:00", "10:00");
  });

  it("should close without confirming when the focus leaves unchanged", async () => {
    const { onConfirm, onClose } = renderInput();
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it("should close on Escape without confirming", async () => {
    const { onConfirm, onClose } = renderInput();
    await userEvent.keyboard("{Escape}");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("should mark the start field and explain an invalid start text", async () => {
    const { startField, endField } = renderInput(
      MeetingRangeInputOutcome.INVALID_START_TEXT,
    );
    await userEvent.type(startField, "{Enter}");
    expect(startField).toHaveAttribute("aria-invalid", "true");
    expect(endField).toHaveAttribute("aria-invalid", "false");
    const message = screen.getByText("Введите время в формате ЧЧ:ММ");
    expect(startField).toHaveAttribute("aria-describedby", message.id);
  });

  it("should mark the end field for an invalid end text", async () => {
    const { startField, endField } = renderInput(
      MeetingRangeInputOutcome.INVALID_END_TEXT,
    );
    await userEvent.type(startField, "{Enter}");
    expect(endField).toHaveAttribute("aria-invalid", "true");
    expect(startField).toHaveAttribute("aria-invalid", "false");
    expect(endField).toHaveAttribute(
      "aria-describedby",
      screen.getByText("Введите время в формате ЧЧ:ММ").id,
    );
  });

  it("should mark both fields for a refused range and keep the input open", async () => {
    const { onClose, startField, endField } = renderInput(
      MeetingRangeInputOutcome.INVALID_RANGE,
    );
    await userEvent.type(startField, "{Enter}");
    const message = screen.getByText(
      "Встреча должна быть внутри дня, с шагом 15 минут",
    );
    for (const field of [startField, endField]) {
      expect(field).toHaveAttribute("aria-invalid", "true");
      expect(field).toHaveAttribute("aria-describedby", message.id);
    }
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should show no error before a confirmation", () => {
    const { startField } = renderInput();
    expect(startField).toHaveAttribute("aria-invalid", "false");
    expect(startField).not.toHaveAttribute("aria-describedby");
  });
});

describe("MeetingRangeInput in English", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  // FR4: the English text of the range error.
  it("should explain a refused range in English", async () => {
    render(
      <MeetingRangeInput
        city="Moscow"
        initialStartText="07:00"
        initialEndText="09:00"
        onConfirm={() => MeetingRangeInputOutcome.INVALID_RANGE}
        onClose={vi.fn()}
      />,
    );
    await userEvent.type(screen.getAllByRole("textbox")[0], "{Enter}");
    expect(
      screen.getByText(
        "The meeting must lie within the day, in 15-minute steps",
      ),
    ).toBeInTheDocument();
  });
});
