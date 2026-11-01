import { ChevronDown } from "lucide-react";
import { type KeyboardEvent, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardKey, LANGUAGE_SEARCH_MIN_LOCALES } from "@/constants";
import {
  filterLocales,
  findRegisteredLocale,
  localeRegistry,
  type RegisteredLocale,
} from "@/locales";
import { cn } from "@/shared/lib/cn";
import {
  InterfaceLanguageList,
  LANGUAGE_BUTTON_CLASS_NAME,
} from "./InterfaceLanguageList";

type InterfaceLanguageGroupProps = {
  locales?: readonly RegisteredLocale[];
  activeCode: string;
  onChoose: (code: string) => void;
};

const ARROW_STEP_BY_KEY: Partial<Record<string, number>> = {
  [KeyboardKey.ARROW_DOWN]: 1,
  [KeyboardKey.ARROW_UP]: -1,
};
const FOCUSABLE_SELECTOR = "input[type='search'], li button";

/**
 * The interface language group of the settings page: a button with the current
 * language that expands a list in the page flow (no modal, no popup layer).
 * Arrow keys move the focus, Escape collapses the list and keeps the page open.
 * Implements FR1–FR6, NFR-A1, NFR-A2, UX1, UX2, UX4 of add-interface-language-selection (D6).
 */
export function InterfaceLanguageGroup({
  locales = localeRegistry,
  activeCode,
  onChoose,
}: InterfaceLanguageGroupProps) {
  const { t } = useTranslation();
  const captionId = useId();
  const listId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const activeMetadata = findRegisteredLocale(activeCode, locales)?.metadata;
  const activeName = activeMetadata?.nativeName ?? activeCode;

  const collapse = () => {
    setIsExpanded(false);
    setQuery("");
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === KeyboardKey.ESCAPE && isExpanded) {
      event.stopPropagation();
      collapse();
      return;
    }
    const step = ARROW_STEP_BY_KEY[event.key];
    if (step === undefined || !isExpanded) return;
    const focusables = Array.from(
      groupRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
    );
    const currentIndex = focusables.indexOf(
      document.activeElement as HTMLElement,
    );
    focusables[currentIndex + step]?.focus();
    event.preventDefault();
  };

  return (
    <div
      ref={groupRef}
      role="group"
      aria-labelledby={captionId}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-2"
    >
      <p
        id={captionId}
        className="mb-2 text-sm font-semibold text-muted-foreground"
      >
        {t("settings.languageLabel")}
      </p>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isExpanded}
        aria-controls={listId}
        aria-label={t("settings.languageButton", { language: activeName })}
        onClick={() => (isExpanded ? collapse() : setIsExpanded(true))}
        className={cn(LANGUAGE_BUTTON_CLASS_NAME, "border-border")}
      >
        <span aria-hidden="true">{activeMetadata?.emoji}</span>
        <span lang={activeMetadata?.code} className="flex-1 text-left">
          {activeName}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "text-accent motion-safe:transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </button>
      {isExpanded && (
        <InterfaceLanguageList
          listId={listId}
          caption={t("settings.languageLabel")}
          locales={filterLocales(locales, query)}
          activeCode={activeCode}
          isSearchShown={locales.length >= LANGUAGE_SEARCH_MIN_LOCALES}
          query={query}
          onQueryChange={setQuery}
          onChoose={(code) => {
            onChoose(code);
            collapse();
          }}
        />
      )}
    </div>
  );
}
