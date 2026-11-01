// Verifies NFR-A2 of add-interface-language-selection (D6): keyboard operation of the language group.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
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

describe("InterfaceLanguageGroup keyboard", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  afterEach(async () => {
    await i18n.changeLanguage("ru");
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

  // Verifies NFR-A2 of add-interface-language-selection: Tab and Shift+Tab reach every row.
  it("should reach the button and every row with Tab and Shift+Tab", async () => {
    renderGroup();
    await expand();
    const rows = within(screen.getByRole("list")).getAllByRole("button");
    for (const row of rows) {
      await userEvent.tab();
      expect(row).toHaveFocus();
    }
    for (const row of rows.slice(0, -1).reverse()) {
      await userEvent.tab({ shift: true });
      expect(row).toHaveFocus();
    }
    await userEvent.tab({ shift: true });
    expect(toggleButton()).toHaveFocus();
  });

  // Verifies NFR-A2 of add-interface-language-selection: Space chooses.
  it("should choose with Space on a focused row", async () => {
    const { onChoose } = renderGroup();
    await expand();
    screen.getByRole("button", { name: "Русский" }).focus();
    await userEvent.keyboard(" ");
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
});
