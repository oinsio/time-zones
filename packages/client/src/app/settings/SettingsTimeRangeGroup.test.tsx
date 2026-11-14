// Verifies FR14, UX2, NFR-A2 of add-day-colouring-setting.
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsTimeRangeGroup } from "./SettingsTimeRangeGroup";

function renderGroup(
  overrides: Partial<Parameters<typeof SettingsTimeRangeGroup>[0]> = {},
) {
  const onConfirm = vi.fn();
  const onRestore = vi.fn();
  const outsideButton = <button type="button">outside</button>;
  render(
    <>
      <SettingsTimeRangeGroup
        caption="Sample"
        startLabel="From"
        endLabel="To"
        startText="08:00"
        endText="09:00"
        onConfirm={onConfirm}
        onRestore={onRestore}
        {...overrides}
      />
      {outsideButton}
    </>,
  );
  return { onConfirm, onRestore };
}

describe("SettingsTimeRangeGroup", () => {
  it("should be a group named by its caption with two named fields showing the texts", () => {
    renderGroup();
    const group = screen.getByRole("group", { name: "Sample" });
    expect(group).toContainElement(
      screen.getByRole("textbox", { name: "From" }),
    );
    expect(screen.getByRole("textbox", { name: "From" })).toHaveValue("08:00");
    expect(screen.getByRole("textbox", { name: "To" })).toHaveValue("09:00");
  });

  it("should report the confirmed texts on Enter", async () => {
    const { onConfirm } = renderGroup();
    const endField = screen.getByRole("textbox", { name: "To" });
    await userEvent.clear(endField);
    await userEvent.type(endField, "1030{Enter}");
    expect(onConfirm).toHaveBeenCalledWith("08:00", "10:30");
  });

  it("should insert the separator while digits are typed", async () => {
    renderGroup();
    const startField = screen.getByRole("textbox", { name: "From" });
    await userEvent.clear(startField);
    await userEvent.type(startField, "0907");
    expect(startField).toHaveValue("09:07");
  });

  it("should mark both fields invalid and show the hint it is given", () => {
    renderGroup({
      hint: "Wrong",
      invalidFields: { start: true, end: true },
    });
    for (const name of ["From", "To"]) {
      const field = screen.getByRole("textbox", { name });
      expect(field).toBeInvalid();
      expect(field).toHaveAccessibleDescription("Wrong");
    }
    expect(screen.getByRole("status")).toHaveTextContent("Wrong");
  });

  it("should mark no field invalid without a hint", () => {
    renderGroup();
    expect(screen.getByRole("textbox", { name: "From" })).not.toBeInvalid();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("should restore on Escape with edited texts and not let the key out", async () => {
    const { onRestore } = renderGroup();
    const onWindowKey = vi.fn();
    document.addEventListener("keydown", onWindowKey);
    const startField = screen.getByRole("textbox", { name: "From" });
    await userEvent.clear(startField);
    await userEvent.type(startField, "18");
    onWindowKey.mockClear();
    await userEvent.keyboard("{Escape}");
    document.removeEventListener("keydown", onWindowKey);
    expect(onRestore).toHaveBeenCalledTimes(1);
    expect(startField).toHaveValue("08:00");
    expect(onWindowKey).not.toHaveBeenCalled();
  });

  it("should restore on Escape while a hint is shown", async () => {
    const { onRestore } = renderGroup({ hint: "Wrong" });
    screen.getByRole("textbox", { name: "From" }).focus();
    await userEvent.keyboard("{Escape}");
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it("should let Escape out when nothing is edited and no hint is shown", async () => {
    const { onRestore } = renderGroup();
    const onWindowKey = vi.fn();
    document.addEventListener("keydown", onWindowKey);
    screen.getByRole("textbox", { name: "From" }).focus();
    await userEvent.keyboard("{Escape}");
    document.removeEventListener("keydown", onWindowKey);
    expect(onRestore).not.toHaveBeenCalled();
    expect(onWindowKey).toHaveBeenCalledTimes(1);
  });

  it.each([
    "{Enter}",
    "{ArrowLeft}",
    "{ArrowRight}",
    "{ArrowUp}",
    "{ArrowDown}",
  ])("should not let %s out of a field", async (key) => {
    renderGroup();
    const onWindowKey = vi.fn();
    document.addEventListener("keydown", onWindowKey);
    screen.getByRole("textbox", { name: "From" }).focus();
    await userEvent.keyboard(key);
    document.removeEventListener("keydown", onWindowKey);
    expect(onWindowKey).not.toHaveBeenCalled();
  });

  it("should not confirm when the focus moves between its fields", async () => {
    const { onConfirm } = renderGroup();
    const startField = screen.getByRole("textbox", { name: "From" });
    await userEvent.clear(startField);
    await userEvent.type(startField, "0700");
    await userEvent.tab();
    expect(screen.getByRole("textbox", { name: "To" })).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("should confirm when the focus leaves the row with changed texts", async () => {
    const { onConfirm } = renderGroup();
    const startField = screen.getByRole("textbox", { name: "From" });
    await userEvent.clear(startField);
    await userEvent.type(startField, "0700");
    await userEvent.tab();
    await userEvent.tab();
    expect(onConfirm).toHaveBeenCalledWith("07:00", "09:00");
  });

  it("should not confirm when the focus leaves with unchanged texts", async () => {
    const { onConfirm } = renderGroup();
    screen.getByRole("textbox", { name: "From" }).focus();
    fireEvent.blur(screen.getByRole("textbox", { name: "From" }), {
      relatedTarget: screen.getByRole("button", { name: "outside" }),
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
