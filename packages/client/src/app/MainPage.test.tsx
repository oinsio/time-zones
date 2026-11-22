// Verifies FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5): the date bar layer.
// Verifies FR12, NFR-A3 of move-meeting-range-and-extend-past-midnight (D9): the sticky meeting bar.
// Verifies FR13 of add-grid-meeting-range-and-share (D7): the meeting bar replaces the header.
// Verifies FR1, UX3 of add-main-page-scaffold: fixed page regions.
// Verifies FR8 of select-date-with-calendar-and-now (D7): the bottom bar.
// Verifies FR6, FR12, UX4 of redesign-cards-grid-and-day-palettes: the header and the content column.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { createInMemoryLocationRepository } from "@/adapters";
import {
  DATE_BAR_SELECTOR,
  MEETING_BAR_SELECTOR,
  SCROLL_PADDING_TOP_PROPERTY,
} from "@/constants";
import { LocationsProvider } from "@/controller";
import { installResizeObserverFake } from "@/test/resizeObserverFake";
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

  it("should draw no line under the header", () => {
    renderMainPage(null);
    expect(screen.getByRole("banner").className).not.toMatch(/\bborder-b\b/);
  });

  it("should put the title first and the header actions after it", () => {
    render(
      <LocationsProvider repository={createInMemoryLocationRepository()}>
        <MainPage
          notices={null}
          bottomBar={null}
          headerActions={<button type="button">header action</button>}
        />
      </LocationsProvider>,
    );

    const title = screen.getByRole("heading", { level: 1 });
    const action = screen.getByText("header action");
    expect(
      title.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole("banner").firstElementChild).toContainElement(
      title,
    );
  });

  it("should keep the content in a centred column and the bottom bar on the page background", () => {
    renderMainPage(null);

    expect(screen.getByRole("main")).toHaveClass(
      "mx-auto w-full max-w-content px-column",
    );
    expect(screen.getByRole("contentinfo")).toHaveClass("bg-background");
    expect(screen.getByRole("contentinfo").className).not.toMatch(
      /\bborder-t\b/,
    );
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

// FR12: the meeting bar stays at the top; NFR-A3: focus scrolling stops below it
describe("MainPage with a sticky meeting bar", () => {
  const HEADER_HEIGHT_PX = 85;
  const TALLER_HEADER_HEIGHT_PX = 120;
  let headerHeightPx = HEADER_HEIGHT_PX;
  const renderBar = (meetingBar?: ReactNode) =>
    render(
      <LocationsProvider repository={createInMemoryLocationRepository()}>
        <MainPage
          notices={null}
          bottomBar={<p>{BOTTOM_BAR_TEXT}</p>}
          meetingBar={meetingBar}
        />
      </LocationsProvider>,
    );
  const readScrollPaddingTop = () =>
    document.documentElement.style.getPropertyValue(
      SCROLL_PADDING_TOP_PROPERTY,
    );

  beforeEach(async () => {
    await i18n.changeLanguage("en");
    headerHeightPx = HEADER_HEIGHT_PX;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      () => ({ height: headerHeightPx }) as DOMRect,
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should make the header sticky on the meeting bar layer", () => {
    renderBar(<h1>the meeting bar</h1>);

    expect(screen.getByRole("banner")).toHaveClass("sticky", "z-meeting-bar");
  });

  it("should not make the normal header sticky", () => {
    renderBar();

    expect(screen.getByRole("banner").className).not.toMatch(
      /sticky|z-meeting-bar/,
    );
  });

  it("should locate the meeting bar by its selector only while it is shown", () => {
    const { unmount } = renderBar(<h1>the meeting bar</h1>);
    expect(document.querySelector(MEETING_BAR_SELECTOR)).toBe(
      screen.getByRole("banner"),
    );
    unmount();

    renderBar();

    expect(document.querySelector(MEETING_BAR_SELECTOR)).toBeNull();
  });

  it("should set the scroll padding to the header height and follow its size", () => {
    const fake = installResizeObserverFake();
    renderBar(<h1>the meeting bar</h1>);
    expect(readScrollPaddingTop()).toBe(`${HEADER_HEIGHT_PX}px`);

    headerHeightPx = TALLER_HEADER_HEIGHT_PX;
    fake.reportWidth(1);

    expect(readScrollPaddingTop()).toBe(`${TALLER_HEADER_HEIGHT_PX}px`);
  });

  it("should clear the scroll padding when the meeting bar goes away", () => {
    const { rerender } = renderBar(<h1>the meeting bar</h1>);

    rerender(
      <LocationsProvider repository={createInMemoryLocationRepository()}>
        <MainPage notices={null} bottomBar={<p>{BOTTOM_BAR_TEXT}</p>} />
      </LocationsProvider>,
    );

    expect(readScrollPaddingTop()).toBe("");
  });
});
