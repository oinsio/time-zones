import { ChevronLeft } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

type ToolPageFrameProps = {
  /** The tool name, the only page heading. */
  title: string;
  /** Contents of the polite notices region, as on the main page. */
  notices: ReactNode;
  onBack: () => void;
  /** The heading takes the focus on mount; a page that focuses a field passes false. */
  shouldFocusHeading?: boolean;
  children?: ReactNode;
};

/**
 * The frame of a tool page: a focusable heading, the back button and the
 * notices region, in the layout of the settings page.
 * Implements FR5, NFR-A2 of add-unix-time-converter-tool (D2).
 */
export function ToolPageFrame({
  title,
  notices,
  onBack,
  shouldFocusHeading = true,
  children,
}: ToolPageFrameProps) {
  const { t } = useTranslation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (shouldFocusHeading) headingRef.current?.focus();
  }, [shouldFocusHeading]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-screen-2xl flex-col px-4">
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-control-border pt-6 pb-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("tools.back")}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-center text-2xl font-semibold focus:outline-none"
        >
          {title}
        </h1>
        <span aria-hidden="true" className="min-w-11" />
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 py-6">
        {children}
      </main>
      <footer className="sticky bottom-0 -mx-4">
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none flex flex-col items-center gap-2 p-4"
        >
          {notices}
        </div>
      </footer>
    </div>
  );
}
