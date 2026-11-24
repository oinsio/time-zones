// Verifies FR12, FR13 of apply-data-updates-silently: the attribution names the dump date.
// Verifies FR13, UX4 of add-geonames-city-source (D10): the city data attribution is the last line of the page.
// Verifies FR6 of the day colouring change: the working hours row appears only in Working hours.
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { GEONAMES_URL } from "@/constants";
import { renderSettingsPage } from "./renderSettingsPage";

describe("SettingsPage city data attribution", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should show the attribution link to GeoNames", () => {
    renderSettingsPage();
    expect(
      screen.getByRole("link", {
        name: "City data: GeoNames (November 14, 2026), CC BY 4.0",
      }),
    ).toHaveAttribute("href", GEONAMES_URL);
  });

  it("should follow the zone rules release line as the last element of main", () => {
    renderSettingsPage();
    const main = screen.getByRole("main");
    const attribution = screen.getByRole("link", {
      name: "City data: GeoNames (November 14, 2026), CC BY 4.0",
    });
    expect(main.lastElementChild).toBe(attribution);
    expect(attribution.previousElementSibling).toHaveAttribute(
      "data-zone-rules-release",
    );
  });
});

describe("SettingsPage day colouring", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should show the working hours row directly under the colouring group only in Working hours", async () => {
    renderSettingsPage();
    expect(screen.queryByRole("group", { name: "Working hours" })).toBeNull();
    await userEvent.click(screen.getByRole("radio", { name: "Working hours" }));
    const row = screen.getByRole("group", { name: "Working hours" });
    const colouring = screen.getByRole("radiogroup", { name: "Colouring" });
    expect(colouring.compareDocumentPosition(row)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Plain" }));
    expect(screen.queryByRole("group", { name: "Working hours" })).toBeNull();
  });
});

// Verifies FR1, FR2 of add-unix-time-converter-tool.
describe("SettingsPage tools group", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should stand after the zone label group and before the language group", () => {
    renderSettingsPage();
    const zoneLabelGroup = screen.getByRole("group", {
      name: "Timezone label",
    });
    const toolsGroup = screen.getByRole("group", { name: "Tools" });
    const languageCaption = screen.getByRole("button", { name: /^Language/ });
    expect(zoneLabelGroup.compareDocumentPosition(toolsGroup)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(toolsGroup.compareDocumentPosition(languageCaption)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("should offer the Unix time converter, off at first", () => {
    renderSettingsPage();
    expect(
      screen.getByRole("button", { name: "Unix time converter" }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});
