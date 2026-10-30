// Verifies FR3, FR4, FR5, FR7, FR16 of add-settings-page-and-device-time-location (D10).
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { PreferencesProvider } from "@/controller";
import { PreferencesLoadStatus } from "@/ports";
import { HourFormat, ThemePreference } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
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
      <SettingsPage notices={<p>a notice</p>} onBack={onBack} />
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
      preferences: { theme: ThemePreference.DARK, hourFormat: HourFormat.H12 },
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
