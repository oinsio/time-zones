import { type ReactNode, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { SCROLL_PADDING_TOP_PROPERTY } from "@/constants";
import { ViewHost } from "./ViewHost";

interface MainPageProps {
  /** Contents of the polite notices region, out of the document flow. */
  notices: ReactNode;
  /** Content of the footer bar that stays at the bottom of the viewport. */
  bottomBar: ReactNode;
  /** The Add location and Settings buttons; they carry their own header placement. */
  headerActions?: ReactNode;
  /** The meeting bar; while given it takes the header's place (no title, no header actions). */
  meetingBar?: ReactNode;
}

// Physical-property utilities: iOS Safari 12.5 ignores the logical shorthands.
const COLUMN_CLASS_NAME = "mx-auto w-full max-w-content px-column";
// Below 360 px the title cannot stay centred beside the 92 px of buttons.
const MEETING_HEADER_CLASS_NAMES =
  "sticky top-0 z-meeting-bar grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-meeting bg-meeting-bar px-4 pt-6 pb-4 min-[360px]:grid-cols-[1fr_auto_1fr]";

/**
 * The main page: header with the title and a slot for future controls, the
 * content region hosting the active view, the sticky bottom bar (a footer
 * landmark) and the notices region stacked above that bar. Later features
 * fill the slots, they do not reshape the page.
 * Implements FR1, UX3 of add-main-page-scaffold (D3, D7) and FR8 of
 * select-date-with-calendar-and-now (D7).
 * Implements FR1, FR2, UX1 of add-settings-page-and-device-time-location (D11):
 * a three-column grid on every width (Add location, centred title, Settings);
 * DOM order is the Tab order.
 * Implements FR3, FR4, UX2 of fix-location-card-and-header-layout (D3): one
 * header layout on every width, the title centred on the page.
 * Implements FR13, NFR-R1, UX1 of add-grid-meeting-range-and-share (D7): the meeting bar takes the header's place.
 * Implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5).
 * Implements FR7 of refine-meeting-range-entry-and-handles (D5): `data-date-bar` locates the date bar.
 * Implements FR12 of move-meeting-range-and-extend-past-midnight (D9): the meeting bar is sticky
 * at the top of the viewport, `data-meeting-bar` locates it and, as D9 says, the scrolling
 * element's `scroll-padding-top` equals its height (NFR-A3).
 * Implements FR6, FR12, UX4 of redesign-cards-grid-and-day-palettes (D4): the title at the
 * left, Add location and Settings at the right, no line under the header; the content sits
 * in a centred column of at most 1120 px while the bars span the viewport.
 */
export function MainPage({
  notices,
  bottomBar,
  headerActions,
  meetingBar,
}: MainPageProps) {
  const { t } = useTranslation();
  const headerRef = useRef<HTMLElement | null>(null);
  const hasMeetingBar = meetingBar !== undefined;
  // While the bar is sticky, the browser's own focus scrolling stops below it (NFR-A3).
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!hasMeetingBar || header === null) return;
    const scrollingElement = document.documentElement;
    const applyHeaderHeight = () =>
      scrollingElement.style.setProperty(
        SCROLL_PADDING_TOP_PROPERTY,
        `${header.getBoundingClientRect().height}px`,
      );
    applyHeaderHeight();
    const observer = new ResizeObserver(applyHeaderHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      scrollingElement.style.removeProperty(SCROLL_PADDING_TOP_PROPERTY);
    };
  }, [hasMeetingBar]);
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <header
        ref={headerRef}
        data-meeting-bar={meetingBar === undefined ? undefined : ""}
        className={
          meetingBar === undefined ? undefined : MEETING_HEADER_CLASS_NAMES
        }
      >
        {meetingBar ?? (
          <div
            className={`${COLUMN_CLASS_NAME} flex items-center justify-between gap-2 pt-6 pb-4`}
          >
            <h1 className="text-header-title-narrow font-bold min-[361px]:text-header-title">
              {t("app.title")}
            </h1>
            <div className="flex items-center">{headerActions}</div>
          </div>
        )}
      </header>
      <main className={`${COLUMN_CLASS_NAME} flex-1`}>
        <ViewHost />
      </main>
      <footer
        data-date-bar
        className="sticky bottom-0 z-page-bar bg-background"
      >
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-full flex flex-col items-center gap-2 p-4"
        >
          {notices}
        </div>
        <div className="mx-auto w-full max-w-content">{bottomBar}</div>
      </footer>
    </div>
  );
}
