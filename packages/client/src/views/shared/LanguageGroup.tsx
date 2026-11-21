import { ChevronDown } from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import {
  KeyboardKey,
  LANGUAGE_BUTTON_CLASS_NAME,
  LANGUAGE_LIST_ARROW_STEP_BY_KEY,
  LANGUAGE_LIST_FOCUSABLE_SELECTOR,
  LANGUAGE_SEARCH_MIN_LOCALES,
} from "@/constants";
import {
  filterLocales,
  findRegisteredLocale,
  localeRegistry,
  type RegisteredLocale,
} from "@/locales";
import { cn } from "@/shared/lib/cn";
import { LanguageList } from "./LanguageList";

type LanguageGroupProps = {
  locales?: readonly RegisteredLocale[];
  /** The caption above the button and the name of the list. */
  caption: string;
  /** The accessible name of the button, from the native name of the active language. */
  getButtonLabel: (languageName: string) => string;
  activeCode: string;
  onChoose: (code: string) => void;
  /** A control beside the button, such as the share language pin. */
  besideButton?: ReactNode;
};

/**
 * The language group: a button with the flag and the native name of the active
 * language that expands a list in the flow (no popup layer). Arrow keys move
 * the focus, Escape collapses the list and stops there. The interface language
 * of the settings page and the share language of the share dialog use it.
 * Implements FR1–FR6, NFR-A1, NFR-A2, UX1, UX2, UX4 of add-interface-language-selection (D6).
 * Implements FR4 of add-meeting-share-dialog (D7): moved here from the settings page.
 */
export function LanguageGroup({
  locales = localeRegistry,
  caption,
  getButtonLabel,
  activeCode,
  onChoose,
  besideButton,
}: LanguageGroupProps) {
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
    const step = LANGUAGE_LIST_ARROW_STEP_BY_KEY[event.key];
    if (step === undefined || !isExpanded) return;
    const focusables = Array.from(
      groupRef.current?.querySelectorAll<HTMLElement>(
        LANGUAGE_LIST_FOCUSABLE_SELECTOR,
      ) ?? [],
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
        {caption}
      </p>
      <div className="flex items-center gap-2">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={isExpanded}
          aria-controls={listId}
          aria-label={getButtonLabel(activeName)}
          onClick={() => (isExpanded ? collapse() : setIsExpanded(true))}
          className={cn(LANGUAGE_BUTTON_CLASS_NAME, "border-control-border")}
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
        {besideButton}
      </div>
      {isExpanded && (
        <LanguageList
          listId={listId}
          caption={caption}
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
