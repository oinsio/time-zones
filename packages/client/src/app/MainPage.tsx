import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
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

const COLUMN_CLASS_NAME = "content-column";
// Below 360 px the title cannot stay centred beside the 92 px of buttons.
const MEETING_HEADER_CLASS_NAMES =
  "grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-meeting bg-meeting-bar px-4 pt-6 pb-4 min-[360px]:grid-cols-[1fr_auto_1fr]";

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
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <header
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
