import { screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";

/**
 * Removes a location the way a user does: opens the location menu of the city
 * and chooses "Remove".
 * Implements FR11 of set-home-location-and-show-differences (D8).
 */
export async function removeLocationThroughMenu(city: string): Promise<void> {
  await userEvent.click(
    screen.getByRole("button", {
      name: i18n.t("locations.locationMenu", { city }),
    }),
  );
  await userEvent.click(
    screen.getByRole("menuitem", { name: i18n.t("locations.remove") }),
  );
}
