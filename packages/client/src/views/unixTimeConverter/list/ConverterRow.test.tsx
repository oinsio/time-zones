// Verifies FR9, FR10, FR11, NFR-A2, NFR-A3, UX1 of add-unix-time-converter-tool.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WallTimeInputOutcome } from "@/controller";
import type { PresentedConverterRow } from "@/presenter/unixTime";
import { ConverterRow } from "./ConverterRow";

const TIME_NAME = "Время — Москва, 14:23:07";
const DATE_NAME = "Выбрать дату — Москва";

const buildRow = (
  overrides: Partial<PresentedConverterRow> = {},
): PresentedConverterRow => ({
  id: "moscow",
  timeZoneId: "Europe/Moscow",
  cityLabel: "Москва",
  zoneLineParts: [],
  dateLabel: "пн, 23 нояб.",
  localIsoDate: "2026-11-23",
  timeLabel: "14:23:07",
  timeInputLabel: TIME_NAME,
  dateButtonLabel: DATE_NAME,
  ...overrides,
});
const renderRow = (
  row = buildRow(),
  onConfirmTime = vi.fn((_text: string) => WallTimeInputOutcome.CLOSED),
  onSelectDate = vi.fn(),
) => {
  render(
    <ul>
      <ConverterRow
        row={row}
        onConfirmTime={onConfirmTime}
        onSelectDate={onSelectDate}
      />
    </ul>,
  );
  return { onConfirmTime, onSelectDate };
};
const timeButton = () => screen.getByRole("button", { name: TIME_NAME });

describe("ConverterRow", () => {
  it("should show the city, the date and the time", () => {
    renderRow();
    expect(screen.getByText("Москва")).toBeInTheDocument();
    expect(screen.getAllByText("пн, 23 нояб.").length).toBeGreaterThan(0);
    expect(timeButton()).toHaveTextContent("14:23:07");
  });

  it("should show a wall-time hint only when the row has one", () => {
    renderRow(buildRow({ wallTimeHint: "Часы переведены вперёд" }));
    expect(screen.getByText("Часы переведены вперёд")).toBeInTheDocument();
  });

  it("should show no hint by default", () => {
    renderRow();
    expect(screen.queryByText("Часы переведены вперёд")).toBeNull();
  });

  it("should open a time field with the shown time when the time is chosen", async () => {
    renderRow();
    await userEvent.click(timeButton());
    expect(screen.getByRole("textbox", { name: TIME_NAME })).toHaveValue(
      "14:23:07",
    );
  });

  it("should confirm the typed time with Enter", async () => {
    const { onConfirmTime } = renderRow();
    await userEvent.click(timeButton());
    const field = screen.getByRole("textbox", { name: TIME_NAME });
    await userEvent.clear(field);
    await userEvent.type(field, "9:30:15.5{Enter}");
    expect(onConfirmTime.mock.calls[0]?.[0]).toBe("9:30:15.5");
  });

  it("should close the field and return the focus to the time on Esc", async () => {
    const { onConfirmTime } = renderRow();
    await userEvent.click(timeButton());
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("textbox", { name: TIME_NAME })).toBeNull();
    expect(timeButton()).toHaveFocus();
    expect(onConfirmTime).not.toHaveBeenCalled();
  });

  it("should open the calendar with the date of the row", async () => {
    renderRow();
    await userEvent.click(screen.getByRole("button", { name: DATE_NAME }));
    expect(
      await screen.findByRole("dialog", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
  });
});
