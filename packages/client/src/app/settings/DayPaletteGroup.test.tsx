// Verifies FR5, UX2, NFR-A3 of redesign-cards-grid-and-day-palettes.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { PreferencesProvider } from "@/controller";
import { PreferencesLoadStatus } from "@/ports";
import { DayColouring, DayPalette, DEFAULT_PREFERENCES } from "@/preferences";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { DayPaletteGroup } from "./DayPaletteGroup";

const renderGroup = (dayColouring = DayColouring.TIME_OF_DAY) => {
  const backend = createInMemoryPreferencesBackend({
    status: PreferencesLoadStatus.LOADED,
    preferences: { ...DEFAULT_PREFERENCES, dayColouring },
  });
  const repository = createInMemoryPreferencesRepository({ backend });
  const { container } = render(
    <PreferencesProvider
      repository={repository}
      writeScheduler={immediateWriteScheduler}
    >
      <DayPaletteGroup />
    </PreferencesProvider>,
  );
  return { repository, container };
};

const optionNames = () =>
  within(screen.getByRole("radiogroup"))
    .getAllByRole("radio")
    .map((radio) => (radio as HTMLInputElement).closest("label")?.title);

describe("DayPaletteGroup", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it.each([DayColouring.PLAIN, DayColouring.WORKING_HOURS])(
    "should render nothing in %s",
    (dayColouring) => {
      const { container } = renderGroup(dayColouring);

      expect(container).toBeEmptyDOMElement();
    },
  );

  it("should list Vivid and Muted with Vivid checked by default", () => {
    renderGroup();

    expect(screen.getByRole("radiogroup", { name: "Colours" })).toBeVisible();
    expect(optionNames()).toEqual(["Vivid", "Muted"]);
    expect(screen.getByRole("radio", { name: "Vivid" })).toBeChecked();
  });

  it("should name the group and options in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderGroup();

    expect(screen.getByRole("radiogroup", { name: "Цвета" })).toBeVisible();
    expect(optionNames()).toEqual(["Яркие", "Приглушённые"]);
  });

  it("should store Muted when it is chosen", async () => {
    const { repository } = renderGroup();

    await userEvent.click(screen.getByRole("radio", { name: "Muted" }));

    expect(repository.load()).toMatchObject({
      preferences: { dayPalette: DayPalette.MUTED },
    });
  });
});
