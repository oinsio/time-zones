// Verifies FR1, UX3 of add-main-page-scaffold: fixed page regions.
// Verifies FR8 of select-date-with-calendar-and-now (D7): the bottom bar.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { MainPage } from "./MainPage";

const NOTICE_TEXT = "a notice";
const BOTTOM_BAR_TEXT = "a bottom bar";

// The hosted Cards view has its own status region inside main.
const getNoticesRegion = () =>
  screen
    .getAllByRole("status")
    .find((region) => !screen.getByRole("main").contains(region));

const renderMainPage = (notices: ReactNode) =>
  render(
    <LocationsProvider repository={createInMemoryLocationRepository()}>
      <MainPage notices={notices} bottomBar={<p>{BOTTOM_BAR_TEXT}</p>} />
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

  it("should render the bottom bar in a footer after the main landmark", () => {
    renderMainPage(null);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toContainElement(screen.getByText(BOTTOM_BAR_TEXT));
    expect(screen.getByRole("main")).not.toContainElement(footer);
    expect(
      screen.getByRole("main").compareDocumentPosition(footer) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should keep the notices region inside the bottom bar", () => {
    renderMainPage(<p>{NOTICE_TEXT}</p>);
    expect(screen.getByRole("contentinfo")).toContainElement(
      screen.getByText(NOTICE_TEXT),
    );
  });
});
