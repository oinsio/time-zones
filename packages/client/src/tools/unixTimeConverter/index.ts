// Implements FR5 of add-unix-time-converter-tool (D2, D9, D11): the converter chunk.
import i18n from "i18next";
import { loadUnixTimeLocales } from "@/locales";
import { UnixTimeConverterPage } from "./UnixTimeConverterPage";

export { UnixTimeConverterPage };

/**
 * Loads the converter texts, then hands the page over: the page never renders
 * before its texts are there, and a failed load shows the error fallback with Retry.
 * Implements FR4, FR18, NFR-P1 of add-unix-time-converter-tool (D11).
 */
export async function loadUnixTimeConverterPage() {
  await loadUnixTimeLocales(i18n);
  return { default: UnixTimeConverterPage };
}
