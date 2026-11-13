// Verifies FR3, FR4, FR5, FR7, FR16 of add-settings-page-and-device-time-location (D10).
// Verifies FR1, FR2 of add-country-to-zone-label.
// Verifies FR12, FR14 of show-zone-abbreviations-and-zone-label-setting (D7).
// Verifies FR1, FR2, FR3, FR4 of compact-settings-controls.
// Verifies FR1, FR2 of add-view-mode-setting-and-grid-skeleton (D2): the view group after the hour format.
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { PreferencesLoadStatus } from "@/ports";
import { HourFormat, ThemePreference, ZoneLabelPart } from "@/preferences";
import { renderSettingsPage } from "./renderSettingsPage";

const themeGroup = () => screen.getByRole("radiogroup", { name: "Theme" });
const hourGroup = () => screen.getByRole("radiogroup", { name: "Hour format" });

describe("SettingsPage", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should have the heading Settings, focused when it opens", () => {
    renderSettingsPage();
    expect(
      screen.getByRole("heading", { name: "Settings", level: 1 }),
    ).toHaveFocus();
  });

  it("should keep the heading focusable by script only", () => {
    renderSettingsPage();
    expect(screen.getByRole("heading", { name: "Settings" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("should have a Back button", async () => {
    const { onBack } = renderSettingsPage();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["Light", "sun"],
    ["Dark", "moon"],
    ["System", "monitor"],
  ])("should draw the %s theme option with the %s icon", (name, icon) => {
    renderSettingsPage();
    const label = within(themeGroup())
      .getByRole("radio", { name })
      .closest("label");
    expect(label?.querySelector(`svg.lucide-${icon}`)).not.toBeNull();
    expect(label).toHaveAttribute("title", name);
    expect(label?.querySelector("span.sr-only")?.textContent).toBe(name);
    expect(label?.querySelectorAll(":scope > span:not(.sr-only)")).toHaveLength(
      0,
    );
  });

  it("should order the theme options System, Light, Dark", () => {
    renderSettingsPage();
    expect(
      within(themeGroup())
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("value")),
    ).toEqual([
      ThemePreference.SYSTEM,
      ThemePreference.LIGHT,
      ThemePreference.DARK,
    ]);
  });

  it("should show the hour formats as 12 and 24, named 12-hour and 24-hour", () => {
    renderSettingsPage();
    const labels = within(hourGroup())
      .getAllByRole("radio")
      .map((radio) => radio.closest("label"));
    expect(
      labels.map((label) => label?.querySelector("[aria-hidden]")?.textContent),
    ).toEqual(["12", "24"]);
    expect(
      within(hourGroup())
        .getAllByRole("radio")
        .map((radio) => radio.closest("label")?.getAttribute("title")),
    ).toEqual(["12-hour", "24-hour"]);
  });

  it("should check System and 24-hour by default", () => {
    renderSettingsPage();
    expect(
      within(themeGroup()).getByRole("radio", { name: "System" }),
    ).toBeChecked();
    expect(
      within(hourGroup()).getByRole("radio", { name: "24-hour" }),
    ).toBeChecked();
  });

  it("should fill the checked option only", () => {
    renderSettingsPage();
    const checkedLabel = within(themeGroup())
      .getByRole("radio", { name: "System" })
      .closest("label");
    const otherLabel = within(themeGroup())
      .getByRole("radio", { name: "Dark" })
      .closest("label");
    expect(checkedLabel).toHaveClass("bg-accent");
    expect(otherLabel).not.toHaveClass("bg-accent");
  });

  it("should apply the chosen theme and hour format and save them", async () => {
    const { repository, writeScheduler } = renderSettingsPage();
    await userEvent.click(
      within(themeGroup()).getByRole("radio", { name: "Dark" }),
    );
    await userEvent.click(
      within(hourGroup()).getByRole("radio", { name: "12-hour" }),
    );
    expect(
      within(themeGroup()).getByRole("radio", { name: "Dark" }),
    ).toBeChecked();
    writeScheduler.runPending();
    expect(repository.load()).toEqual({
      status: PreferencesLoadStatus.LOADED,
      preferences: {
        theme: ThemePreference.DARK,
        hourFormat: HourFormat.H12,
        interfaceLanguage: null,
        viewMode: null,
        zoneLabelParts: [
          ZoneLabelPart.UTC_OFFSET,
          ZoneLabelPart.ZONE_ABBREVIATION,
          ZoneLabelPart.COUNTRY,
        ],
      },
    });
  });

  it("should move the theme choice with the arrow keys", async () => {
    renderSettingsPage();
    within(themeGroup()).getByRole("radio", { name: "System" }).focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(
      within(themeGroup()).getByRole("radio", { name: "Dark" }),
    ).toBeChecked();
  });

  it("should list the groups as Theme, Hour format, View, Zone label, Language", () => {
    renderSettingsPage();
    const groupNames = screen.getAllByRole("radiogroup").map((group) => {
      const captionId = group.getAttribute("aria-labelledby") ?? "";
      return document.getElementById(captionId)?.textContent;
    });
    expect(groupNames).toEqual(["Theme", "Hour format", "View"]);
    const zoneLabel = screen.getByRole("group", { name: "Timezone label" });
    expect(
      hourGroup().compareDocumentPosition(zoneLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      zoneLabel.compareDocumentPosition(
        screen.getByRole("button", { name: /^Language:/ }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should show every zone label toggle on and the example by default", () => {
    renderSettingsPage();
    const zoneLabel = screen.getByRole("group", { name: "Timezone label" });
    expect(
      within(zoneLabel).getByRole("button", {
        name: "Country",
        pressed: true,
      }),
    ).toBeInTheDocument();
    expect(
      within(zoneLabel).getByRole("button", {
        name: "UTC offset",
        pressed: true,
      }),
    ).toBeInTheDocument();
    expect(
      within(zoneLabel).getByRole("button", {
        name: "Abbreviation",
        pressed: true,
      }),
    ).toBeInTheDocument();
    expect(zoneLabel).toHaveAccessibleDescription("Example: Russia MSK UTC+3");
  });

  it("should order the zone label toggles like the zone line", () => {
    renderSettingsPage();
    const zoneLabel = screen.getByRole("group", { name: "Timezone label" });
    const toggleNames = within(zoneLabel)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(toggleNames).toEqual(["Country", "Abbreviation", "UTC offset"]);
  });

  it("should change the example in the same render as the Abbreviation toggle", async () => {
    renderSettingsPage();
    await userEvent.click(screen.getByRole("button", { name: "Abbreviation" }));
    expect(
      screen.getByRole("group", { name: "Timezone label" }),
    ).toHaveAccessibleDescription("Example: Russia UTC+3");
  });

  it("should save the zone label once after the debounce", async () => {
    const { repository, writeScheduler } = renderSettingsPage();
    await userEvent.click(screen.getByRole("button", { name: "Abbreviation" }));
    writeScheduler.runPending();
    expect(repository.load()).toMatchObject({
      preferences: {
        zoneLabelParts: [ZoneLabelPart.UTC_OFFSET, ZoneLabelPart.COUNTRY],
      },
    });
  });

  it("should show the notices in a polite status region", () => {
    renderSettingsPage();
    expect(screen.getByRole("status")).toHaveTextContent("a notice");
  });

  it("should show the unreadable note with Reset, and Reset clears it", async () => {
    const repository = createInMemoryPreferencesRepository({
      initialDocument: { status: PreferencesLoadStatus.UNREADABLE },
    });
    renderSettingsPage(repository);
    expect(screen.getByRole("alert")).toHaveTextContent("could not be read");
    await userEvent.click(
      screen.getByRole("button", { name: "Reset settings" }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(repository.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
  });

  it("should show no unreadable note for readable settings", () => {
    renderSettingsPage();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should warn that the settings will not be saved after a failed save", async () => {
    const { writeScheduler } = renderSettingsPage(
      createInMemoryPreferencesRepository({ isWritable: false }),
    );
    await userEvent.click(
      within(themeGroup()).getByRole("radio", { name: "Light" }),
    );
    writeScheduler.runPending();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "will not be saved",
    );
    expect(
      within(themeGroup()).getByRole("radio", { name: "Light" }),
    ).toBeChecked();
  });
});
