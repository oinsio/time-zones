import { readFileSync } from "node:fs";
import { join } from "node:path";

const ENGLISH_LOCALE_FILE = join(process.cwd(), "src", "locales", "en.json");

/** The English locale, read from disk (Playwright cannot import JSON). */
export const englishLocale = JSON.parse(
  readFileSync(ENGLISH_LOCALE_FILE, "utf8"),
) as {
  views: { cardsEmptyState: string };
  locations: Record<string, string>;
  mainPage: {
    viewError: string;
    retry: string;
    updateCheckFailed: string;
    storageUnavailable: string;
  };
};
