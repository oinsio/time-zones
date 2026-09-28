import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useDocumentLanguage, usePwaUpdateStatus } from "@/controller";
import { viewRegistry } from "@/views";
import { OfflineReadyNotice } from "./OfflineReadyNotice";
import { UpdateNotice } from "./UpdateNotice";

/**
 * Application frame: the app title, the active view and a polite region for
 * notices. Renders no view while the registry is empty.
 * Implements FR2, FR6, FR7, FR11, UX2 of setup-app-shell-and-pages-deploy.
 */
export function AppShell() {
  const { t } = useTranslation();
  useDocumentLanguage();
  const { isOfflineReady, isUpdateAvailable, applyUpdate, dismiss } =
    usePwaUpdateStatus();

  const [activeView] = viewRegistry;
  const ActiveViewComponent = activeView?.component;

  return (
    <>
      <main className="mx-auto min-h-dvh w-full max-w-screen-2xl px-4 pt-6 pb-32">
        <h1 className="text-2xl font-semibold">{t("app.title")}</h1>
        {ActiveViewComponent && (
          <Suspense fallback={null}>
            <ActiveViewComponent />
          </Suspense>
        )}
      </main>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center p-4"
      >
        {isUpdateAvailable ? (
          <UpdateNotice onReload={applyUpdate} onDismiss={dismiss} />
        ) : (
          isOfflineReady && <OfflineReadyNotice onDismiss={dismiss} />
        )}
      </div>
    </>
  );
}
