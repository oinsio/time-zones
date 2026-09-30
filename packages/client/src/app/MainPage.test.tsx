// Verifies FR1, UX3 of add-main-page-scaffold: fixed page regions.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { MainPage } from "./MainPage";

const NOTICE_TEXT = "a notice";

// The hosted Cards view has its own status region inside main.
const getNoticesRegion = () =>
  screen
    .getAllByRole("status")
    .find((region) => !screen.getByRole("main").contains(region));

const renderMainPage = (notices: ReactNode) =>
  render(
    <LocationsProvider repository={createInMemoryLocationRepository()}>
      <MainPage notices={notices} />
    </LocationsProvider>,
  );

describe("MainPage", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show the app title as the only heading", () => {
    renderMainPage(null);
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Time Zones",
    );
  });

  it("should put the title in the header landmark", () => {
    renderMainPage(null);
    expect(screen.getByRole("banner")).toContainElement(
      screen.getByRole("heading", { level: 1 }),
    );
  });

  it("should host the view in the main landmark", async () => {
    renderMainPage(null);
    expect(
      await screen.findByText("No locations added yet."),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent(
      "No locations added yet.",
    );
  });

  it("should keep the title out of the main landmark", () => {
    renderMainPage(null);
    expect(screen.getByRole("main")).not.toContainElement(
      screen.getByRole("heading", { level: 1 }),
    );
  });

  it("should render notices in a polite region", () => {
    renderMainPage(<p>{NOTICE_TEXT}</p>);
    expect(getNoticesRegion()).toHaveAttribute("aria-live", "polite");
    expect(getNoticesRegion()).toContainElement(screen.getByText(NOTICE_TEXT));
  });

  it("should render an empty polite region when there are no notices", () => {
    renderMainPage(null);
    expect(getNoticesRegion()).toBeEmptyDOMElement();
  });
});
