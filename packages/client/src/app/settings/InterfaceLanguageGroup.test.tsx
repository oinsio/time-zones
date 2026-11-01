// Verifies FR2, FR3, FR4, FR6, NFR-A1, NFR-A2, UX1, UX4 of add-interface-language-selection (D6).
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { TEN_LOCALES } from "@/test/factories/localeFixtures";
import { InterfaceLanguageGroup } from "./InterfaceLanguageGroup";

const renderGroup = (props = {}) => {
  const onChoose = vi.fn();
  const view = render(
    <InterfaceLanguageGroup activeCode="en" onChoose={onChoose} {...props} />,
  );
  return { onChoose, ...view };
};

const toggleButton = () => screen.getByRole("button", { name: /^Language:/ });
const expand = async () => userEvent.click(toggleButton());

describe("InterfaceLanguageGroup", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should show one collapsed button with the flag and the name", () => {
    renderGroup();
    expect(toggleButton()).toHaveTextContent("🇺🇸");
    expect(toggleButton()).toHaveTextContent("English");
    expect(toggleButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("should name the group and the current language for assistive tech", () => {
    renderGroup({ activeCode: "ru" });
    expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Language: Русский" }),
    ).toBeInTheDocument();
  });

  it("should expand to a list controlled by the button", async () => {
    renderGroup();
    await expand();
    expect(toggleButton()).toHaveAttribute("aria-expanded", "true");
    expect(toggleButton().getAttribute("aria-controls")).toBe(
      screen.getByRole("list").id,
    );
  });

  it("should list English then Russian by their native names", async () => {
    renderGroup();
    await expand();
    const rows = within(screen.getByRole("list")).getAllByRole("button");
    expect(rows.map((row) => row.textContent)).toEqual([
      "🇺🇸English",
      "🇷🇺Русский",
    ]);
    expect(
      within(screen.getByRole("list")).getByRole("button", { name: "Русский" }),
    ).toBeInTheDocument();
  });

  it("should hide the emoji from assistive tech and mark the native language", async () => {
    renderGroup();
    await expand();
    const russianRow = within(screen.getByRole("list")).getByRole("button", {
      name: "Русский",
    });
    expect(russianRow.querySelector("[aria-hidden='true']")).toHaveTextContent(
      "🇷🇺",
    );
    expect(within(russianRow).getByText("Русский")).toHaveAttribute(
      "lang",
      "ru",
    );
  });

  it("should mark the active row with the accent border and a check", async () => {
    renderGroup();
    await expand();
    const [activeRow, otherRow] = within(screen.getByRole("list")).getAllByRole(
      "button",
    );
    expect(activeRow).toHaveAttribute("aria-current", "true");
    expect(activeRow).toHaveClass("border-accent");
    expect(activeRow?.querySelector("svg")).not.toBeNull();
    expect(otherRow).toHaveClass("border-border");
    expect(otherRow).not.toHaveAttribute("aria-current");
    expect(otherRow?.querySelector("svg")).toBeNull();
  });

  it("should rotate the chevron only while expanded", async () => {
    renderGroup();
    const chevron = () => toggleButton().querySelector("svg");
    expect(chevron()).not.toHaveClass("rotate-180");
    await expand();
    expect(chevron()).toHaveClass("rotate-180");
  });

  it("should choose a language, collapse and focus the button", async () => {
    const { onChoose } = renderGroup();
    await expand();
    await userEvent.click(screen.getByRole("button", { name: "Русский" }));
    expect(onChoose).toHaveBeenCalledWith("ru");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(toggleButton()).toHaveFocus();
  });

  it("should collapse on a second press of the button", async () => {
    renderGroup();
    await expand();
    await expand();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("should move the focus with the arrow keys", async () => {
    renderGroup();
    await expand();
    const [firstRow, secondRow] = within(screen.getByRole("list")).getAllByRole(
      "button",
    );
    firstRow?.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(secondRow).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    expect(firstRow).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    expect(firstRow).toHaveFocus();
  });

  it("should choose with Enter on a focused row", async () => {
    const { onChoose } = renderGroup();
    await expand();
    screen.getByRole("button", { name: "Русский" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onChoose).toHaveBeenCalledWith("ru");
  });

  it("should collapse on Escape without letting the page see it", async () => {
    renderGroup();
    const pageListener = vi.fn();
    document.addEventListener("keydown", pageListener);
    await expand();
    screen.getByRole("button", { name: "Русский" }).focus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(toggleButton()).toHaveFocus();
    expect(pageListener).not.toHaveBeenCalled();
    document.removeEventListener("keydown", pageListener);
  });

  it("should let Escape through while collapsed", async () => {
    renderGroup();
    const pageListener = vi.fn();
    document.addEventListener("keydown", pageListener);
    toggleButton().focus();
    await userEvent.keyboard("{Escape}");
    expect(pageListener).toHaveBeenCalledTimes(1);
    document.removeEventListener("keydown", pageListener);
  });

  it("should use only design tokens, no gray palette", async () => {
    const { container } = renderGroup();
    await expand();
    expect(container.innerHTML).not.toContain("gray-");
  });
});

describe("InterfaceLanguageGroup search", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should not show a search field below the threshold", async () => {
    renderGroup();
    await expand();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("should show a search field at the threshold", async () => {
    renderGroup({ locales: TEN_LOCALES });
    await expand();
    expect(
      screen.getByRole("searchbox", { name: "Search languages" }),
    ).toBeInTheDocument();
  });

  it("should filter the rows as the user types", async () => {
    renderGroup({ locales: TEN_LOCALES });
    await expand();
    await userEvent.type(screen.getByRole("searchbox"), "deu");
    const rows = within(screen.getByRole("list")).getAllByRole("button");
    expect(rows.map((row) => row.textContent)).toEqual(["🇩🇪Deutsch"]);
  });

  it("should say that nothing was found", async () => {
    renderGroup({ locales: TEN_LOCALES });
    await expand();
    await userEvent.type(screen.getByRole("searchbox"), "zzz");
    expect(screen.getByText("No languages found")).toBeInTheDocument();
  });

  it("should move from the search field to the first row with Arrow Down", async () => {
    renderGroup({ locales: TEN_LOCALES });
    await expand();
    screen.getByRole("searchbox").focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(
      within(screen.getByRole("list")).getAllByRole("button")[0],
    ).toHaveFocus();
  });

  it("should clear the search when collapsed", async () => {
    renderGroup({ locales: TEN_LOCALES });
    await expand();
    await userEvent.type(screen.getByRole("searchbox"), "deu");
    await expand();
    await expand();
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
});
