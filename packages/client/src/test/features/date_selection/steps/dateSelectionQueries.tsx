import { screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";

/** Queries and clicks on the date bar and rows of the rendered main page. */
export const barElement = () =>
  screen.getByRole("group", { name: i18n.t("date.barLabel") });

export const clickBarButton = (key: string) =>
  userEvent.click(
    within(barElement()).getByRole("button", { name: i18n.t(key) }),
  );

export const isNowShown = () =>
  within(barElement()).queryByRole("button", { name: i18n.t("date.now") }) !==
  null;

export const rowOf = (city: string) =>
  screen
    .getByRole("button", {
      name: i18n.t("locations.locationMenu", { city }),
    })
    .closest("li") as HTMLElement;

export const shownIsoDate = () =>
  barElement().querySelector("time")?.getAttribute("datetime");
