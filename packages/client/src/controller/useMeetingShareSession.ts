import { useCallback, useEffect, useState } from "react";

type ShareSession = {
  excludedLocationIds: readonly string[];
  shareLanguage: string;
};

/**
 * The state of one opening of the share dialog: the unticked locations and the
 * share language. It is controller state, not a preference: it ends with the
 * dialog (FR5). The session closes when the meeting range is removed (FR10).
 * Implements FR2, FR4, FR5, FR10 of add-meeting-share-dialog (D6).
 */
export function useMeetingShareSession(hasMeetingRange: boolean) {
  const [session, setSession] = useState<ShareSession | undefined>();

  useEffect(() => {
    if (!hasMeetingRange) setSession(undefined);
  }, [hasMeetingRange]);

  const open = useCallback(
    (shareLanguage: string) =>
      setSession({ excludedLocationIds: [], shareLanguage }),
    [],
  );
  const close = useCallback(() => setSession(undefined), []);
  const toggleLocation = useCallback(
    (locationId: string) =>
      setSession((current) =>
        current === undefined
          ? current
          : {
              ...current,
              excludedLocationIds: current.excludedLocationIds.includes(
                locationId,
              )
                ? current.excludedLocationIds.filter(
                    (excludedId) => excludedId !== locationId,
                  )
                : [...current.excludedLocationIds, locationId],
            },
      ),
    [],
  );
  const setShareLanguage = useCallback(
    (shareLanguage: string) =>
      setSession((current) =>
        current === undefined ? current : { ...current, shareLanguage },
      ),
    [],
  );

  return {
    isOpen: session !== undefined && hasMeetingRange,
    excludedLocationIds: session?.excludedLocationIds ?? [],
    shareLanguage: session?.shareLanguage,
    open,
    close,
    toggleLocation,
    setShareLanguage,
  };
}
