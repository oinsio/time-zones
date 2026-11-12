// Verifies FR5, NFR-A1, UX2 of polish-settings-and-remove-offline-update-notice.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { SettingsPage } from "./SettingsPage";

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

describe("DeployTime on the settings page", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  // FR8 of add-remote-zone-rules-updates: the zone rules release line follows it.
  it("should be followed only by the zone rules release line", () => {
    const { container } = renderPage();
    const main = container.querySelector("main") as HTMLElement;
    const deployTime = container.querySelector(DEPLOY_TIME_SELECTOR);
    expect(deployTime?.nextElementSibling).toBe(main.lastElementChild);
    expect(main.lastElementChild).toHaveAttribute("data-zone-rules-release");
  });

  it("should come after the language group, also with the list expanded", async () => {
    const { container } = renderPage();
    await userEvent.click(screen.getByRole("button", { name: /English/ }));
    const languageGroup = screen.getByRole("group", { name: "Language" });
    const deployTime = container.querySelector(DEPLOY_TIME_SELECTOR) as Node;
    expect(
      languageGroup.compareDocumentPosition(deployTime) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should use the icon colour, a small size and a centred line", () => {
    const { container } = renderPage();
    const deployTime = container.querySelector(DEPLOY_TIME_SELECTOR);
    expect(deployTime).toHaveClass("text-accent", "text-sm", "text-center");
  });

  it.each(["tabindex", "role", "aria-live"])(
    "should have no %s attribute",
    (attribute) => {
      const { container } = renderPage();
      expect(
        container.querySelector(DEPLOY_TIME_SELECTOR)?.hasAttribute(attribute),
      ).toBe(false);
    },
  );
});
