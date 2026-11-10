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

const HEADER_CLASS_NAMES =
  "grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border pt-6 pb-4";
// Below 360 px the title cannot stay centred beside the 92 px of buttons.
const MEETING_HEADER_CLASS_NAMES =
  "-mx-4 grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-meeting bg-meeting-bar px-4 pt-6 pb-4 min-[360px]:grid-cols-[1fr_auto_1fr]";

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
 */
export function MainPage({
  notices,
  bottomBar,
  headerActions,
  meetingBar,
}: MainPageProps) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-screen-2xl flex-col px-4">
      <header
        className={
          meetingBar === undefined
            ? HEADER_CLASS_NAMES
            : MEETING_HEADER_CLASS_NAMES
        }
      >
        {meetingBar ?? (
          <>
            <h1 className="order-2 col-start-2 text-center text-2xl font-semibold">
              {t("app.title")}
            </h1>
            {headerActions}
          </>
        )}
      </header>
      <main className="flex-1">
        <ViewHost />
      </main>
      <footer
        data-date-bar
        className="sticky bottom-0 z-page-bar -mx-4 border-t border-border bg-surface"
      >
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-full flex flex-col items-center gap-2 p-4"
        >
          {notices}
        </div>
        {bottomBar}
      </footer>
    </div>
  );
}
