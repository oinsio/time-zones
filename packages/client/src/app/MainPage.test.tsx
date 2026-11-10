// Verifies FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5): the date bar layer.
// Verifies FR13 of add-grid-meeting-range-and-share (D7): the meeting bar replaces the header.
// Verifies FR1, UX3 of add-main-page-scaffold: fixed page regions.
// Verifies FR8 of select-date-with-calendar-and-now (D7): the bottom bar.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { createInMemoryLocationRepository } from "@/adapters";
import { DATE_BAR_SELECTOR } from "@/constants";
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
    expect(await screen.findByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("list"));
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

  it("should set the header apart from the page with a bottom border", () => {
    renderMainPage(null);
    expect(screen.getByRole("banner")).toHaveClass("grid", "border-b");
  });

  it("should render the bottom bar in a footer after the main landmark", () => {
    renderMainPage(null);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toContainElement(screen.getByText(BOTTOM_BAR_TEXT));
    expect(screen.getByRole("main")).not.toContainElement(footer);
    expect(footer).toHaveClass("z-page-bar");
    // FR7 of refine-meeting-range-entry-and-handles: the locator of the date bar.
    expect(document.querySelector(DATE_BAR_SELECTOR)).toBe(footer);
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

describe("MainPage with a meeting bar", () => {
  const renderWithBar = () =>
    render(
      <LocationsProvider repository={createInMemoryLocationRepository()}>
        <MainPage
          notices={null}
          bottomBar={<p>{BOTTOM_BAR_TEXT}</p>}
          headerActions={<button type="button">header action</button>}
          meetingBar={<h1>the meeting bar</h1>}
        />
      </LocationsProvider>,
    );

  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should render only the meeting bar in the header", () => {
    renderWithBar();
    expect(screen.getByRole("banner")).toContainElement(
      screen.getByText("the meeting bar"),
    );
    expect(screen.queryByText("header action")).toBeNull();
    expect(screen.queryByText("Time Zones")).toBeNull();
  });

  it("should have the bar title as the only heading", () => {
    renderWithBar();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("should colour the header with the meeting bar tokens", () => {
    renderWithBar();
    expect(screen.getByRole("banner")).toHaveClass(
      "bg-meeting-bar",
      "border-meeting",
    );
  });
});
