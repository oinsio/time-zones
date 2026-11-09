// Verifies FR1, FR2, FR3, FR4, NFR-A1 of add-view-mode-setting-and-grid-skeleton (D2).
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { PreferencesProvider } from "@/controller";
import { PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { registryOverride } from "@/test/registryOverride";
import { buildTextView } from "@/test/viewFixtures";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { ViewId, viewRegistry } from "@/views";
import { ViewModeGroup } from "./ViewModeGroup";

vi.mock("@/views", async (importOriginal) =>
  (await import("@/test/registryOverride")).withRegistryOverride(
    await importOriginal<typeof import("@/views")>(),
  ),
);

const renderGroup = (viewMode: string | null = null) => {
  const backend = createInMemoryPreferencesBackend({
    status: PreferencesLoadStatus.LOADED,
    preferences: { ...DEFAULT_PREFERENCES, viewMode },
  });
  render(
    <PreferencesProvider
      repository={createInMemoryPreferencesRepository({ backend })}
      writeScheduler={immediateWriteScheduler}
    >
      <ViewModeGroup />
    </PreferencesProvider>,
  );
  return backend;
};

const group = () => screen.getByRole("radiogroup", { name: "View" });
const optionNames = () =>
  within(group())
    .getAllByRole("radio")
    .map((radio) => (radio as HTMLInputElement).closest("label")?.textContent);

describe("ViewModeGroup", () => {
  beforeEach(async () => {
    registryOverride.views = undefined;
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    registryOverride.views = undefined;
    await i18n.changeLanguage("ru");
  });

  it("should list Cards, then Grid, with Cards checked by default", () => {
    renderGroup();
    expect(optionNames()).toEqual(["Cards", "Grid"]);
    expect(within(group()).getByRole("radio", { name: "Cards" })).toBeChecked();
  });

  it("should show the names only, without icons", () => {
    renderGroup();
    expect(group().querySelector("svg")).toBeNull();
  });

  it("should check the stored view", () => {
    renderGroup(ViewId.GRID);
    expect(within(group()).getByRole("radio", { name: "Grid" })).toBeChecked();
  });

  it("should store the chosen view", async () => {
    const backend = renderGroup();
    await userEvent.click(within(group()).getByRole("radio", { name: "Grid" }));
    expect(backend.document).toMatchObject({
      preferences: { viewMode: ViewId.GRID },
    });
    expect(within(group()).getByRole("radio", { name: "Grid" })).toBeChecked();
  });

  it("should check Cards when the stored view is not registered", () => {
    renderGroup("timeline");
    expect(within(group()).getByRole("radio", { name: "Cards" })).toBeChecked();
  });

  it("should write the names in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderGroup();
    expect(
      within(screen.getByRole("radiogroup", { name: "Вид" }))
        .getAllByRole("radio")
        .map(
          (radio) => (radio as HTMLInputElement).closest("label")?.textContent,
        ),
    ).toEqual(["Карточки", "Сетка"]);
  });

  it("should list a view added to the registry without a change to the group", () => {
    registryOverride.views = [
      ...viewRegistry,
      buildTextView("test", "test view"),
    ];
    renderGroup();
    expect(optionNames()).toHaveLength(3);
  });

  it("should render nothing for an empty registry", () => {
    registryOverride.views = [];
    renderGroup();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });
});
