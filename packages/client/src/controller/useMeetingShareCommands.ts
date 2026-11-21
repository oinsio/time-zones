import { useCallback, useContext } from "react";
import type { ZoneLabelPart } from "@/preferences";
import { PreferencesContext } from "./preferencesContext";
import type { useMeetingShareSession } from "./useMeetingShareSession";

type ShareLanguageInput = {
  session: ReturnType<typeof useMeetingShareSession>;
  isShareLanguagePinned: boolean;
  shareLanguage: string;
};

/**
 * The dialog commands that change the share language and the share zone label
 * parts. A pinned language and the parts are preferences; an unpinned
 * language lives in the session only.
 * Implements FR4, FR5, FR6 of add-meeting-share-dialog (D6).
 */
export function useMeetingShareCommands({
  session,
  isShareLanguagePinned,
  shareLanguage,
}: ShareLanguageInput) {
  const preferencesContext = useContext(PreferencesContext);
  const chooseShareLanguage = useCallback(
    (language: string) => {
      session.setShareLanguage(language);
      if (isShareLanguagePinned) preferencesContext?.setShareLanguage(language);
    },
    [session, isShareLanguagePinned, preferencesContext],
  );
  const toggleShareLanguagePin = useCallback(
    () =>
      preferencesContext?.setShareLanguage(
        isShareLanguagePinned ? null : shareLanguage,
      ),
    [preferencesContext, isShareLanguagePinned, shareLanguage],
  );
  const toggleShareZoneLabelPart = useCallback(
    (part: ZoneLabelPart) => preferencesContext?.toggleShareZoneLabelPart(part),
    [preferencesContext],
  );
  return {
    chooseShareLanguage,
    toggleShareLanguagePin,
    toggleShareZoneLabelPart,
  };
}
