import "@fontsource-variable/manrope";
import "@/styles/globals.css";
import "@/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppErrorBoundary, AppShell } from "@/app";
import { ROOT_ELEMENT_ID } from "@/constants";

/**
 * Entry point: mounts the app shell inside the error boundary.
 * Implements FR2, FR8, FR11 of setup-app-shell-and-pages-deploy.
 */
const rootElement = document.getElementById(ROOT_ELEMENT_ID);
if (!rootElement) {
  throw new Error(`Missing #${ROOT_ELEMENT_ID} element in index.html`);
}

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppShell />
    </AppErrorBoundary>
  </StrictMode>,
);
