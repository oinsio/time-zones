// Verifies FR6, FR7, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, UX1, UX4, UX5, UX6, NFR-A2, NFR-A3 of add-unix-time-converter-tool.
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { converterViewRegistry } from "..";
import {
  createCollectingTickScheduler,
  renderConverterView,
} from "./renderConverterView";

const [listView] = converterViewRegistry;
const renderList = (shouldFocusInput = false) =>
  renderConverterView({ view: listView, shouldFocusInput });
const inputField = () =>
  screen.getByRole("textbox", { name: "Unix-время или дата ISO 8601" });
const typeInto = async (text: string) => {
  await userEvent.clear(inputField());
  if (text !== "") await userEvent.type(inputField(), text);
};
const timeOf = (city: string) =>
  screen.getByRole("button", { name: new RegExp(`^Время — ${city},`) })
    .textContent;

describe("ListConverterView", () => {
  afterEach(() => i18n.changeLanguage("ru"));

  it("should show the live moment in the input and the rows", () => {
    renderList();
    expect(inputField()).toHaveValue("1795432987");
    expect(timeOf("Moscow")).toBe("14:23:07");
    expect(screen.getByText("Единица: Секунды")).toBeInTheDocument();
  });

  it("should list the sections in the order of UX6", () => {
    renderList();
    const input = inputField();
    const rows = screen.getByRole("list", { name: "Время в местах" });
    const notations = screen.getByRole("region", { name: "Форматы" });
    const showButton = screen.getByRole("button", {
      name: "Показать на главной",
    });
    const follows = (first: Element, second: Element) =>
      Boolean(
        first.compareDocumentPosition(second) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );
    expect(follows(input, rows)).toBe(true);
    expect(follows(rows, notations)).toBe(true);
    expect(follows(notations, showButton)).toBe(true);
  });

  it("should focus the input and select its text when asked", () => {
    renderList(true);
    expect(inputField()).toHaveFocus();
    expect((inputField() as HTMLInputElement).selectionEnd).toBe(
      "1795432987".length,
    );
  });

  it("should leave the focus alone when not asked", () => {
    renderList(false);
    expect(inputField()).not.toHaveFocus();
  });

  it("should set the moment while the user types and keep the typed text", async () => {
    renderList();
    await typeInto("1795432987123");
    expect(inputField()).toHaveValue("1795432987123");
    expect(timeOf("Moscow")).toBe("14:23:07.123");
  });

  it("should replace an app-written text as a whole on a paste", async () => {
    renderList();
    await userEvent.click(inputField());
    await userEvent.paste("1700000000");
    expect(inputField()).toHaveValue("1700000000");
  });

  it("should insert a paste into a typed text", async () => {
    renderList();
    await typeInto("17");
    await userEvent.paste("00");
    expect(inputField()).toHaveValue("1700");
  });

  it("should show a message tied to the input and leave the rows alone", async () => {
    renderList();
    await typeInto("abc");
    const message = "Введите Unix-время или дату и время в формате ISO 8601";
    expect(screen.getByText(message, { selector: "p" })).toHaveAttribute(
      "role",
      "status",
    );
    expect(inputField()).toHaveAccessibleDescription(message);
    expect(timeOf("Moscow")).toBe("14:23:07");
  });

  it("should offer no description while the text is readable", () => {
    renderList();
    expect(inputField()).not.toHaveAttribute("aria-describedby");
  });

  it("should read the typed number again under a chosen unit", async () => {
    renderList();
    await typeInto("1795432987");
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Единица Unix-времени" }),
      "Миллисекунды",
    );
    expect(timeOf("Moscow")).toBe(
      "14:23:07.987".replace("14:23:07.987", "21:43:52.987"),
    );
    expect(inputField()).toHaveValue("1795432987");
  });

  it("should tick the live moment every second", () => {
    const { clock, tickScheduler } = renderList();
    clock.moveTo("2026-11-23T11:23:08Z", "Asia/Almaty");
    act(() => tickScheduler.runPending());
    expect(inputField()).toHaveValue("1795432988");
    expect(timeOf("Moscow")).toBe("14:23:08");
  });

  it("should enable Now and Show on main page only while pinned", async () => {
    renderList();
    const now = () => screen.getByRole("button", { name: "Сейчас" });
    const show = () =>
      screen.getByRole("button", { name: "Показать на главной" });
    expect(
      [now(), show()].map((button) => (button as HTMLButtonElement).disabled),
    ).toEqual([true, true]);
    await typeInto("1700000000");
    expect(
      [now(), show()].map((button) => (button as HTMLButtonElement).disabled),
    ).toEqual([false, false]);
    await userEvent.click(now());
    expect(inputField()).toHaveValue("1795432987");
  });

  it("should show the relative time", async () => {
    renderList();
    expect(
      screen.getByLabelText("Относительно текущего времени"),
    ).toHaveTextContent("сейчас");
    await typeInto("1700000000");
    expect(
      screen.getByLabelText("Относительно текущего времени"),
    ).toHaveTextContent("3 года назад");
  });

  it("should set the moment from a typed row time, with seconds and a fraction", async () => {
    renderList();
    await userEvent.click(
      screen.getByRole("button", { name: /^Время — New York,/ }),
    );
    const field = screen.getByRole("textbox", { name: /^Время — New York,/ });
    await userEvent.clear(field);
    await userEvent.type(field, "93015");
    expect(field).toHaveValue("9:30:15");
    await userEvent.type(field, ".5{Enter}");
    expect(inputField()).toHaveValue("1795444215500");
    expect(timeOf("Moscow")).toBe("17:30:15.500");
  });

  it("should keep the field open with an error for an unreadable row time", async () => {
    renderList();
    await userEvent.click(
      screen.getByRole("button", { name: /^Время — Moscow,/ }),
    );
    const field = screen.getByRole("textbox", { name: /^Время — Moscow,/ });
    await userEvent.clear(field);
    await userEvent.type(field, "abc{Enter}");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(inputField()).toHaveValue("1795432987");
  });

  it("should restore the row field with Esc without leaving the page", async () => {
    renderList();
    await userEvent.click(
      screen.getByRole("button", { name: /^Время — Moscow,/ }),
    );
    await userEvent.keyboard("{Escape}");
    expect(timeOf("Moscow")).toBe("14:23:07");
  });

  it("should show the wall-time hint of a row", async () => {
    renderList();
    await typeInto("2026-03-08T12:00:00Z");
    await userEvent.click(
      screen.getByRole("button", { name: /^Время — New York,/ }),
    );
    const field = screen.getByRole("textbox", { name: /^Время — New York,/ });
    await userEvent.clear(field);
    await userEvent.type(field, "2:30:15{Enter}");
    expect(screen.getByText(/не существует/)).toBeInTheDocument();
  });

  it("should open the calendar of a row and move that row to the chosen day", async () => {
    renderList();
    await typeInto("1795432987123");
    await userEvent.click(
      screen.getByRole("button", { name: /^Выбрать дату — New York,/ }),
    );
    await userEvent.click(await screen.findByRole("button", { name: /24/ }));
    expect(inputField()).toHaveValue("1795519387123");
  });

  it("should show the notations and copy exactly the shown text", async () => {
    const { textCopying } = renderList();
    await typeInto("1795432987123");
    const notations = screen.getByRole("region", { name: "Форматы" });
    expect(
      within(notations).getByText("1795432987123456000".slice(0, 13)),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Копировать: Секунды" }),
    );
    expect(textCopying.copiedTexts).toEqual(["1795432987"]);
    expect(await screen.findByText("Скопировано")).toBeInTheDocument();
  });

  it("should show a failure beside the action when the copy is refused", async () => {
    const { textCopying } = renderList();
    textCopying.copyText = async () => "FAILED" as never;
    await userEvent.click(
      screen.getByRole("button", { name: "Копировать: Секунды" }),
    );
    expect(
      await screen.findByText("Не удалось скопировать"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("should speak English with the English texts", async () => {
    await i18n.changeLanguage("en");
    renderList();
    expect(
      screen.getByRole("textbox", { name: "Unix time or ISO 8601 date" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show on main page" }),
    ).toBeInTheDocument();
  });

  it("should show one row for the device time zone when the list is empty", () => {
    renderConverterView({ view: listView, locations: [] });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});

describe("createCollectingTickScheduler", () => {
  it("should run and clear what is scheduled", () => {
    const scheduler = createCollectingTickScheduler();
    const callback = vi.fn();
    scheduler.schedule(callback);
    scheduler.runPending();
    scheduler.runPending();
    expect(callback).toHaveBeenCalledOnce();
  });
});
