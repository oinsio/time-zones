// Verifies FR1, FR2, FR5, UX1 of add-country-to-zone-label.
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { renderSettingsPage } from "./renderSettingsPage";

const GROUP_NAME = "Timezone label";

function getGroup() {
  return screen.getByRole("group", { name: GROUP_NAME });
}

describe("ZoneLabelGroup", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should offer Country, Abbreviation and UTC offset in this order", () => {
    renderSettingsPage();
    const names = within(getGroup())
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(names).toEqual(["Country", "Abbreviation", "UTC offset"]);
  });

  it("should remove the country from the example when Country is turned off", async () => {
    renderSettingsPage();
    expect(getGroup()).toHaveAccessibleDescription(/Russia/);
    await userEvent.click(screen.getByRole("button", { name: "Country" }));
    expect(getGroup()).not.toHaveAccessibleDescription(/Russia/);
    expect(getGroup()).toHaveAccessibleDescription(/MSK/);
  });

  it("should read City only and render no zone line when every part is off", async () => {
    renderSettingsPage();
    for (const name of ["Country", "Abbreviation", "UTC offset"]) {
      await userEvent.click(screen.getByRole("button", { name }));
    }
    expect(getGroup()).toHaveAccessibleDescription("Example: City only");
    expect(getGroup().querySelector("[data-zone-line]")).toBeNull();
  });
});
