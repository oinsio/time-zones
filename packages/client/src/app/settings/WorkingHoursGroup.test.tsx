// Verifies FR4–FR7, FR14, NFR-A2, UX3, UX5, FR15 of add-day-colouring-setting.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { PreferencesProvider } from "@/controller";
import { PreferencesLoadStatus } from "@/ports";
import {
  DayColouring,
  DEFAULT_PREFERENCES,
  HourFormat,
  type Preferences,
} from "@/preferences";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { WorkingHoursGroup } from "./WorkingHoursGroup";

const renderGroup = (overrides: Partial<Preferences> = {}) => {
  const backend = createInMemoryPreferencesBackend({
    status: PreferencesLoadStatus.LOADED,
    preferences: {
      ...DEFAULT_PREFERENCES,
      dayColouring: DayColouring.WORKING_HOURS,
      ...overrides,
    },
  });
  const repository = createInMemoryPreferencesRepository({ backend });
  render(
    <PreferencesProvider
      repository={repository}
      writeScheduler={immediateWriteScheduler}
    >
      <WorkingHoursGroup />
    </PreferencesProvider>,
  );
  return repository;
};

const startField = () =>
  screen.getByRole("textbox", { name: "Start of working hours" });
const endField = () =>
  screen.getByRole("textbox", { name: "End of working hours" });
const typeInto = async (field: HTMLElement, text: string) => {
  await userEvent.clear(field);
  await userEvent.type(field, text);
};

describe("WorkingHoursGroup", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it.each([DayColouring.PLAIN, DayColouring.TIME_OF_DAY])(
    "should be absent in %s",
    (dayColouring) => {
      renderGroup({ dayColouring });
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    },
  );

  it("should show the default hours in the 24-hour format", () => {
    renderGroup();
    expect(screen.getByRole("group", { name: "Working hours" })).toBeVisible();
    expect(
      [startField(), endField()].map((field) => field.getAttribute("value")),
    ).toEqual(["10:00", "18:00"]);
  });

  it("should show the hours in the 12-hour format", () => {
    renderGroup({ hourFormat: HourFormat.H12 });
    expect(startField()).toHaveValue("10:00 AM");
    expect(endField()).toHaveValue("6:00 PM");
  });

  it("should store a minute-exact start and show it in canonical form", async () => {
    const repository = renderGroup();
    await typeInto(startField(), "907");
    await userEvent.type(startField(), "{Enter}");
    expect(startField()).toHaveValue("09:07");
    expect(repository.load()).toMatchObject({
      preferences: { workingHours: { start: "09:07", end: "18:00" } },
    });
  });

  it("should accept 5:30 pm as the end in the 12-hour format", async () => {
    const repository = renderGroup({ hourFormat: HourFormat.H12 });
    await typeInto(endField(), "5:30 pm{Enter}");
    expect(endField()).toHaveValue("5:30 PM");
    expect(repository.load()).toMatchObject({
      preferences: { workingHours: { start: "10:00", end: "17:30" } },
    });
  });

  it.each([
    ["18:00", "10:00", "The start must be before the end"],
    ["12:00", "12:00", "The start must be before the end"],
    ["25:00", "18:00", "Enter the time as HH:MM"],
  ])(
    "should refuse %s to %s with the hint %s and keep the stored hours",
    async (start, end, hint) => {
      const repository = renderGroup();
      await typeInto(startField(), start);
      await typeInto(endField(), `${end}{Enter}`);
      expect(screen.getByRole("status")).toHaveTextContent(hint);
      expect(startField()).toBeInvalid();
      expect(repository.load()).toMatchObject({
        preferences: { workingHours: { start: "10:00", end: "18:00" } },
      });
    },
  );

  it("should mark only the end invalid for an unreadable end", async () => {
    renderGroup();
    await typeInto(endField(), "abc{Enter}");
    expect(endField()).toBeInvalid();
    expect(startField()).not.toBeInvalid();
  });

  it("should restore the stored texts on Escape and drop the hint", async () => {
    renderGroup();
    await typeInto(startField(), "18:00{Enter}");
    await userEvent.keyboard("{Escape}");
    expect(startField()).toHaveValue("10:00");
    expect(endField()).toHaveValue("18:00");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("should show the hint in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderGroup();
    await typeInto(
      screen.getByRole("textbox", { name: "Начало рабочего дня" }),
      "18:00{Enter}",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Начало должно быть раньше конца",
    );
    expect(screen.getByRole("group", { name: "Рабочие часы" })).toBeVisible();
  });
});
