import { screen, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";

/** Verifies FR8 of select-date-with-calendar-and-now (D7). */
export const expectBottomBarShowsDateBar = () => {
  const bottomBar = screen.getByRole("contentinfo");
  for (const name of [
    i18n.t("date.previousDay"),
    /^Choose date|^Выбрать дату/,
    i18n.t("date.nextDay"),
  ]) {
    expect(within(bottomBar).getByRole("button", { name })).toBeInTheDocument();
  }
};
