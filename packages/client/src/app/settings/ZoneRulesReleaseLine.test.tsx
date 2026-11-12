// Verifies FR8, NFR-A1, UX3 of add-remote-zone-rules-updates: the line after the deploy time.
import { render } from "@testing-library/react";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import * as zoneRules from "@/lib/zoneRules";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { SettingsPage } from "./SettingsPage";

const LINE_SELECTOR = "[data-zone-rules-release]";
const DEPLOY_TIME_SELECTOR = "[data-deploy-time]";

function renderPage() {
  return render(
    <PreferencesProvider
      repository={createInMemoryPreferencesRepository()}
      writeScheduler={createManualWriteScheduler()}
    >
      <LocationsProvider
        repository={createInMemoryLocationRepository()}
        writeScheduler={immediateWriteScheduler}
        clock={fakeClock("2026-11-06T10:30:00Z")}
        tickScheduler={createManualTickScheduler()}
      >
        <SettingsPage notices={null} onBack={() => undefined} />
      </LocationsProvider>
    </PreferencesProvider>,
  );
}

describe("ZoneRulesReleaseLine on the settings page", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await i18n.changeLanguage("ru");
  });

  it("should name the installed release", () => {
    const { container } = renderPage();
    const installed = zoneRules.getInstalledRelease()?.release;
    expect(container.querySelector(LINE_SELECTOR)).toHaveTextContent(
      `Time zone rules: ${installed}`,
    );
  });

  it("should be the last element of main, directly after the deploy time", () => {
    const { container } = renderPage();
    const main = container.querySelector("main") as HTMLElement;
    const line = container.querySelector(LINE_SELECTOR);
    expect(main.lastElementChild).toBe(line);
    expect(line?.previousElementSibling).toBe(
      container.querySelector(DEPLOY_TIME_SELECTOR),
    );
  });

  it("should share the class list of the deploy time", () => {
    const { container } = renderPage();
    expect(container.querySelector(LINE_SELECTOR)?.className).toBe(
      container.querySelector(DEPLOY_TIME_SELECTOR)?.className,
    );
  });

  it.each(["tabindex", "role", "aria-live"])(
    "should have no %s attribute",
    (attribute) => {
      const { container } = renderPage();
      expect(
        container.querySelector(LINE_SELECTOR)?.hasAttribute(attribute),
      ).toBe(false);
    },
  );

  it("should be absent without an active release", () => {
    vi.spyOn(zoneRules, "getInstalledRelease").mockReturnValue(undefined);
    const { container } = renderPage();
    expect(container.querySelector(LINE_SELECTOR)).toBeNull();
  });
});
