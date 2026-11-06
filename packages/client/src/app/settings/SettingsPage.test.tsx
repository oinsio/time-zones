// Verifies FR3, FR4, FR5, FR7, FR16 of add-settings-page-and-device-time-location (D10).
// Verifies FR12, FR14 of show-zone-abbreviations-and-zone-label-setting (D7).
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { PreferencesLoadStatus } from "@/ports";
import { HourFormat, ThemePreference, ZoneLabelPart } from "@/preferences";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { SettingsPage } from "./SettingsPage";

const renderPage = (
  repository = createInMemoryPreferencesRepository(),
  onBack = vi.fn(),
) => {
  const writeScheduler = createManualWriteScheduler();
  render(
    <PreferencesProvider
      repository={repository}
      writeScheduler={writeScheduler}
    >
      <LocationsProvider
        repository={createInMemoryLocationRepository()}
        writeScheduler={immediateWriteScheduler}
        clock={fakeClock("2026-07-15T12:00:00Z")}
        tickScheduler={createManualTickScheduler()}
      >
        <SettingsPage notices={<p>a notice</p>} onBack={onBack} />
      </LocationsProvider>
    </PreferencesProvider>,
  );
  return { repository, writeScheduler, onBack };
};

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
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Settings", level: 1 }),
    ).toHaveFocus();
  });

  it("should keep the heading focusable by script only", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Settings" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("should have a Back button", async () => {
    const { onBack } = renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["Light", "sun"],
    ["Dark", "moon"],
    ["System", "monitor"],
  ])("should draw the %s theme option with the %s icon", (name, icon) => {
    renderPage();
    const option = within(themeGroup()).getByRole("radio", { name });
    expect(
      option.closest("label")?.querySelector(`svg.lucide-${icon}`),
    ).not.toBeNull();
  });

  it("should check System and 24-hour by default", () => {
    renderPage();
    expect(
      within(themeGroup()).getByRole("radio", { name: "System" }),
    ).toBeChecked();
    expect(
      within(hourGroup()).getByRole("radio", { name: "24-hour" }),
    ).toBeChecked();
  });

  it("should draw a check icon on the checked option only", () => {
    renderPage();
    const checkedLabel = within(themeGroup())
      .getByRole("radio", { name: "System" })
      .closest("label");
    const otherLabel = within(themeGroup())
      .getByRole("radio", { name: "Dark" })
      .closest("label");
    expect(checkedLabel?.querySelector("svg.lucide-check")).not.toBeNull();
    expect(otherLabel?.querySelector("svg.lucide-check")).toBeNull();
  });

  it("should apply the chosen theme and hour format and save them", async () => {
    const { repository, writeScheduler } = renderPage();
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
        zoneLabelParts: [
          ZoneLabelPart.UTC_OFFSET,
          ZoneLabelPart.ZONE_ABBREVIATION,
        ],
      },
    });
  });

  it("should move the theme choice with the arrow keys", async () => {
    renderPage();
    within(themeGroup()).getByRole("radio", { name: "System" }).focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(
      within(themeGroup()).getByRole("radio", { name: "Dark" }),
    ).toBeChecked();
  });

  it("should list the groups as Theme, Hour format, Zone label, Language", () => {
    renderPage();
    const groupNames = screen
      .getAllByRole("radiogroup")
      .map((group) => group.getAttribute("aria-label"));
    expect(groupNames).toEqual(["Theme", "Hour format"]);
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

  it("should show both zone label toggles on and the example by default", () => {
    renderPage();
    const zoneLabel = screen.getByRole("group", { name: "Timezone label" });
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
    renderPage();
    const zoneLabel = screen.getByRole("group", { name: "Timezone label" });
    const toggleNames = within(zoneLabel)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(toggleNames).toEqual(["Abbreviation", "UTC offset"]);
  });

  it("should change the example in the same render as the Abbreviation toggle", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Abbreviation" }));
    expect(
      screen.getByRole("group", { name: "Timezone label" }),
    ).toHaveAccessibleDescription("Example: Russia UTC+3");
  });

  it("should save the zone label once after the debounce", async () => {
    const { repository, writeScheduler } = renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Abbreviation" }));
    writeScheduler.runPending();
    expect(repository.load()).toMatchObject({
      preferences: { zoneLabelParts: [ZoneLabelPart.UTC_OFFSET] },
    });
  });

  it("should show the notices in a polite status region", () => {
    renderPage();
    expect(screen.getByRole("status")).toHaveTextContent("a notice");
  });

  it("should show the unreadable note with Reset, and Reset clears it", async () => {
    const repository = createInMemoryPreferencesRepository({
      initialDocument: { status: PreferencesLoadStatus.UNREADABLE },
    });
    renderPage(repository);
    expect(screen.getByRole("alert")).toHaveTextContent("could not be read");
    await userEvent.click(
      screen.getByRole("button", { name: "Reset settings" }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(repository.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
  });

  it("should show no unreadable note for readable settings", () => {
    renderPage();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should warn that the settings will not be saved after a failed save", async () => {
    const { writeScheduler } = renderPage(
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

  it("should write the texts in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Настройки" }),
    ).toBeInTheDocument();
    const russianTheme = screen.getByRole("radiogroup", { name: "Тема" });
    for (const name of ["Светлая", "Тёмная", "Системная"]) {
      expect(
        within(russianTheme).getByRole("radio", { name }),
      ).toBeInTheDocument();
    }
    const russianHours = screen.getByRole("radiogroup", {
      name: "Формат времени",
    });
    for (const name of ["12 часов", "24 часа"]) {
      expect(
        within(russianHours).getByRole("radio", { name }),
      ).toBeInTheDocument();
    }
  });
});
