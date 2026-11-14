// Verifies FR1, FR2, FR3, FR14, UX1, NFR-A1, FR15 of add-day-colouring-setting.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { PreferencesProvider } from "@/controller";
import { PreferencesLoadStatus } from "@/ports";
import { DayColouring, DEFAULT_PREFERENCES } from "@/preferences";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { DayColouringGroup } from "./DayColouringGroup";

const renderGroup = (dayColouring = DEFAULT_PREFERENCES.dayColouring) => {
  const backend = createInMemoryPreferencesBackend({
    status: PreferencesLoadStatus.LOADED,
    preferences: { ...DEFAULT_PREFERENCES, dayColouring },
  });
  const repository = createInMemoryPreferencesRepository({ backend });
  render(
    <PreferencesProvider
      repository={repository}
      writeScheduler={immediateWriteScheduler}
    >
      <DayColouringGroup />
    </PreferencesProvider>,
  );
  return repository;
};

const optionNames = () =>
  within(screen.getByRole("radiogroup"))
    .getAllByRole("radio")
    .map((radio) => (radio as HTMLInputElement).closest("label")?.title);

describe("DayColouringGroup", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should list Plain, Time of day, Working hours with Time of day checked by default", () => {
    renderGroup();
    expect(screen.getByRole("radiogroup", { name: "Colouring" })).toBeVisible();
    expect(optionNames()).toEqual(["Plain", "Time of day", "Working hours"]);
    expect(screen.getByRole("radio", { name: "Time of day" })).toBeChecked();
  });

  it("should name the options in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderGroup();
    expect(screen.getByRole("radiogroup", { name: "Раскраска" })).toBeVisible();
    expect(optionNames()).toEqual([
      "Обычная",
      "По времени суток",
      "По рабочему времени",
    ]);
  });

  it("should check the stored colouring", () => {
    renderGroup(DayColouring.WORKING_HOURS);
    expect(screen.getByRole("radio", { name: "Working hours" })).toBeChecked();
  });

  it("should apply and store a choice", async () => {
    const repository = renderGroup();
    await userEvent.click(screen.getByRole("radio", { name: "Plain" }));
    expect(screen.getByRole("radio", { name: "Plain" })).toBeChecked();
    expect(repository.load()).toMatchObject({
      preferences: { dayColouring: DayColouring.PLAIN },
    });
  });

  it("should move the choice with the arrow keys", async () => {
    renderGroup();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Working hours" })).toBeChecked();
  });
});
