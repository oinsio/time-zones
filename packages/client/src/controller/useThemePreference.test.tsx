// Verifies FR4 of add-settings-page-and-device-time-location.
import { act, render, renderHook } from "@testing-library/react";
import { type ReactNode, useLayoutEffect } from "react";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { PreferencesLoadStatus } from "@/ports";
import { HourFormat, ThemePreference } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { PreferencesProvider } from "./PreferencesProvider";
import { usePreferences } from "./usePreferences";
import { useThemePreference } from "./useThemePreference";

const storedTheme = (theme: ThemePreference) =>
  ({
    status: PreferencesLoadStatus.LOADED,
    preferences: { theme, hourFormat: HourFormat.H24, interfaceLanguage: null },
  }) as const;

const wrapperFor =
  (theme?: ThemePreference) =>
  ({ children }: { children: ReactNode }) => (
    <PreferencesProvider
      repository={createInMemoryPreferencesRepository({
        initialDocument: theme === undefined ? undefined : storedTheme(theme),
      })}
      writeScheduler={createManualWriteScheduler()}
    >
      {children}
    </PreferencesProvider>
  );

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe("useThemePreference", () => {
  it.each([
    [ThemePreference.DARK, "dark"],
    [ThemePreference.LIGHT, "light"],
  ])("should set data-theme for %s", (theme, expected) => {
    renderHook(() => useThemePreference(), { wrapper: wrapperFor(theme) });
    expect(document.documentElement.dataset.theme).toBe(expected);
  });

  it("should leave data-theme absent for SYSTEM", () => {
    document.documentElement.dataset.theme = "dark";
    renderHook(() => useThemePreference(), {
      wrapper: wrapperFor(ThemePreference.SYSTEM),
    });
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("should follow a change of the preference", () => {
    const { result } = renderHook(
      () => {
        useThemePreference();
        return usePreferences();
      },
      { wrapper: wrapperFor() },
    );
    act(() => result.current.setTheme(ThemePreference.DARK));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("should have set data-theme already in the first commit", () => {
    let themeSeenByChild: string | undefined;
    function Child() {
      useLayoutEffect(() => {
        themeSeenByChild = document.documentElement.dataset.theme;
      }, []);
      return null;
    }
    function ThemeOwner() {
      useThemePreference();
      return null;
    }
    render(
      <>
        <ThemeOwner />
        <Child />
      </>,
      { wrapper: wrapperFor(ThemePreference.DARK) },
    );
    expect(themeSeenByChild).toBe("dark");
  });
});
