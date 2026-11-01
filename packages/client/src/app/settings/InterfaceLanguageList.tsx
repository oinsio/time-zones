import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_BUTTON_CLASS_NAME } from "@/constants";
import type { RegisteredLocale } from "@/locales";
import { cn } from "@/shared/lib/cn";

type InterfaceLanguageListProps = {
  listId: string;
  caption: string;
  locales: readonly RegisteredLocale[];
  activeCode: string;
  isSearchShown: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onChoose: (code: string) => void;
};

/**
 * The expanded part of the language group: an optional search field, one row
 * per language (emoji and native name) and a note when the search finds none.
 * Implements FR3, FR4, FR6, NFR-A1, NFR-A2 of add-interface-language-selection (D6).
 */
export function InterfaceLanguageList({
  listId,
  caption,
  locales,
  activeCode,
  isSearchShown,
  query,
  onQueryChange,
  onChoose,
}: InterfaceLanguageListProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      {isSearchShown && (
        <input
          type="search"
          value={query}
          aria-label={t("settings.languageSearch")}
          onChange={(event) => onQueryChange(event.target.value)}
          className="min-h-11 w-full rounded-md border border-border bg-surface px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
      )}
      {locales.length === 0 && (
        <p className="text-muted-foreground">
          {t("settings.languageNotFound")}
        </p>
      )}
      <ul id={listId} aria-label={caption} className="flex flex-col gap-2">
        {locales.map(({ metadata }) => {
          const isActive = metadata.code === activeCode;
          return (
            <li key={metadata.code}>
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onChoose(metadata.code)}
                className={cn(
                  LANGUAGE_BUTTON_CLASS_NAME,
                  isActive ? "border-accent" : "border-border",
                )}
              >
                <span aria-hidden="true">{metadata.emoji}</span>
                <span lang={metadata.code} className="flex-1 text-left">
                  {metadata.nativeName}
                </span>
                {isActive && (
                  <Check aria-hidden="true" className="text-accent" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
