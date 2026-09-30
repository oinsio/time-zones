import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ViewHost } from "./ViewHost";

interface MainPageProps {
  /** Contents of the polite notices region, out of the document flow. */
  notices: ReactNode;
}

/**
 * The main page: header with the title and a slot for future controls, the
 * content region hosting the active view, an empty bottom bar slot and the
 * notices region. Later features fill the slots, they do not reshape the page.
 * Implements FR1, UX3 of add-main-page-scaffold (D3, D7).
 */
export function MainPage({ notices }: MainPageProps) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-screen-2xl flex-col px-4 pb-32">
      <header className="flex items-center justify-between gap-2 pt-6 pb-4">
        <h1 className="text-2xl font-semibold">{t("app.title")}</h1>
        <div className="flex items-center gap-2" />
      </header>
      <main className="flex-1">
        <ViewHost />
      </main>
      <div className="flex items-center justify-center" />
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 flex flex-col items-center gap-2 p-4"
      >
        {notices}
      </div>
    </div>
  );
}
