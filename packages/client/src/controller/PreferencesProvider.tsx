import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { localStoragePreferencesRepository } from "@/adapters";
import { PREFERENCES_WRITE_DEBOUNCE_MS } from "@/constants";
import {
  type PreferencesLoadResult,
  PreferencesLoadStatus,
  type PreferencesRepository,
  SaveOutcome,
} from "@/ports";
import {
  DEFAULT_PREFERENCES,
  type HourFormat,
  type Preferences,
  PreferencesCommandType,
  reducePreferences,
  type ThemePreference,
} from "@/preferences";
import {
  PreferencesContext,
  type PreferencesContextValue,
  PreferencesStatus,
} from "./preferencesContext";
import { timeoutWriteScheduler, type WriteScheduler } from "./writeScheduler";

const PAGE_HIDE_EVENT = "pagehide";

type PreferencesProviderProps = {
  children?: ReactNode;
  repository?: PreferencesRepository;
  writeScheduler?: WriteScheduler;
};

type LoadedPreferences = {
  preferences: Preferences;
  loadStatus: PreferencesStatus;
};

function toLoadedPreferences(result: PreferencesLoadResult): LoadedPreferences {
  return {
    preferences:
      result.status === PreferencesLoadStatus.LOADED
        ? result.preferences
        : DEFAULT_PREFERENCES,
    loadStatus:
      result.status === PreferencesLoadStatus.UNREADABLE
        ? PreferencesStatus.UNREADABLE
        : PreferencesStatus.READY,
  };
}

/**
 * Owns the preferences and their persistence: loads once, applies a change at
 * once, writes it debounced (flushed on `pagehide`) and never on load, applies
 * changes made by other tabs, and reports a failed save.
 * Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location (D5).
 */
export function PreferencesProvider({
  children,
  repository = localStoragePreferencesRepository,
  writeScheduler = timeoutWriteScheduler,
}: PreferencesProviderProps) {
  const [initial] = useState(() => toLoadedPreferences(repository.load()));
  const [preferences, setPreferences] = useState(initial.preferences);
  const [loadStatus, setLoadStatus] = useState(initial.loadStatus);
  const [hasSaveFailed, setHasSaveFailed] = useState(false);
  const latestPreferences = useRef(preferences);
  const cancelPendingWrite = useRef<(() => void) | undefined>(undefined);

  const discardPendingWrite = useCallback(() => {
    cancelPendingWrite.current?.();
    cancelPendingWrite.current = undefined;
  }, []);

  const flushWrite = useCallback(() => {
    discardPendingWrite();
    setHasSaveFailed(
      repository.save(latestPreferences.current) === SaveOutcome.FAILED,
    );
  }, [repository, discardPendingWrite]);

  const applyChange = useCallback(
    (command: Parameters<typeof reducePreferences>[1]) => {
      const next = reducePreferences(latestPreferences.current, command);
      if (next === latestPreferences.current) return;
      latestPreferences.current = next;
      setPreferences(next);
      discardPendingWrite();
      cancelPendingWrite.current = writeScheduler.schedule(
        flushWrite,
        PREFERENCES_WRITE_DEBOUNCE_MS,
      );
    },
    [writeScheduler, flushWrite, discardPendingWrite],
  );

  useEffect(() => {
    const flushPendingWrite = () => {
      if (cancelPendingWrite.current) flushWrite();
    };
    const unsubscribe = repository.subscribe((result) => {
      discardPendingWrite();
      const external = toLoadedPreferences(result);
      latestPreferences.current = external.preferences;
      setPreferences(external.preferences);
      setLoadStatus(external.loadStatus);
    });
    window.addEventListener(PAGE_HIDE_EVENT, flushPendingWrite);
    return () => {
      unsubscribe();
      window.removeEventListener(PAGE_HIDE_EVENT, flushPendingWrite);
    };
  }, [repository, flushWrite, discardPendingWrite]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      loadStatus,
      hasSaveFailed,
      setTheme: (theme: ThemePreference) =>
        applyChange({ type: PreferencesCommandType.SET_THEME, theme }),
      setHourFormat: (hourFormat: HourFormat) =>
        applyChange({
          type: PreferencesCommandType.SET_HOUR_FORMAT,
          hourFormat,
        }),
      resetPreferences: () => {
        discardPendingWrite();
        latestPreferences.current = DEFAULT_PREFERENCES;
        setPreferences(DEFAULT_PREFERENCES);
        setLoadStatus(PreferencesStatus.READY);
        setHasSaveFailed(repository.clear() === SaveOutcome.FAILED);
      },
    }),
    [
      preferences,
      loadStatus,
      hasSaveFailed,
      applyChange,
      discardPendingWrite,
      repository,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
