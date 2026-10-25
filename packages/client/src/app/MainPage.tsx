import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ViewHost } from "./ViewHost";

interface MainPageProps {
  /** Contents of the polite notices region, out of the document flow. */
  notices: ReactNode;
  /** Content of the footer bar that stays at the bottom of the viewport. */
  bottomBar: ReactNode;
}

/**
 * The main page: header with the title and a slot for future controls, the
 * content region hosting the active view, the sticky bottom bar (a footer
 * landmark) and the notices region stacked above that bar. Later features
 * fill the slots, they do not reshape the page.
 * Implements FR1, UX3 of add-main-page-scaffold (D3, D7) and FR8 of
 * select-date-with-calendar-and-now (D7).
 */
export function MainPage({ notices, bottomBar }: MainPageProps) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-screen-2xl flex-col px-4">
      <header className="flex items-center justify-between gap-2 pt-6 pb-4">
        <h1 className="text-2xl font-semibold">{t("app.title")}</h1>
        <div className="flex items-center gap-2" />
      </header>
      <main className="flex-1">
        <ViewHost />
      </main>
      <footer className="sticky bottom-0 -mx-4 border-t border-border bg-surface">
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
