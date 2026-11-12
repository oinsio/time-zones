// Verifies FR7, UX1, UX2 of add-remote-zone-rules-updates: the shell shows the zone rules update notice and wires its actions.
import { useRegisterSW } from "virtual:pwa-register/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryStoredReleaseRepository,
  createInMemoryZoneRulesVersionSource,
} from "@/adapters";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";
import { AppShell } from "./AppShell";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const NEWER_RELEASE = "2999a";

const mockServiceWorker = (isUpdateAvailable = false) => {
  const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useRegisterSW).mockReturnValue({
    offlineReady: [false, vi.fn()],
    needRefresh: [isUpdateAvailable, vi.fn()],
    updateServiceWorker,
  } as unknown as ReturnType<typeof useRegisterSW>);
  return { updateServiceWorker };
};

const renderShell = () => {
  const reloadPage = vi.fn();
  render(
    <AppShell
      zoneRulesVersionSource={createInMemoryZoneRulesVersionSource({
        version: { release: NEWER_RELEASE },
        releases: { [NEWER_RELEASE]: buildReleaseDocument(NEWER_RELEASE) },
      })}
      storedReleases={createInMemoryStoredReleaseRepository()}
      reloadPage={reloadPage}
    />,
  );
  return { reloadPage };
};

/** The notices region; a drag and drop live region is also a status. */
const getNoticesRegion = () =>
  screen
    .getAllByRole("status")
    .find(
      (region) => region.getAttribute("aria-live") === "polite",
    ) as HTMLElement;

const findNotice = () => screen.findByText(new RegExp(NEWER_RELEASE));

describe("AppShell zone rules update notice", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    mockServiceWorker();
  });

  it("should name the release in English", async () => {
    renderShell();
    expect(await findNotice()).toHaveTextContent(
      `Time zone rules ${NEWER_RELEASE} are ready. Reload to use them.`,
    );
  });

  it("should name the release in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderShell();
    expect(await findNotice()).toHaveTextContent(
      `Доступны правила часовых поясов ${NEWER_RELEASE}. Перезагрузите, чтобы применить.`,
    );
  });

  it("should reload the page once from Reload", async () => {
    const { reloadPage } = renderShell();
    await findNotice();
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  it("should hide the notice when dismissed", async () => {
    renderShell();
    await findNotice();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(
      screen.queryByText(new RegExp(NEWER_RELEASE)),
    ).not.toBeInTheDocument();
  });

  it("should show nothing while no newer release is published", () => {
    render(
      <AppShell
        zoneRulesVersionSource={createInMemoryZoneRulesVersionSource()}
        storedReleases={createInMemoryStoredReleaseRepository()}
      />,
    );
    expect(getNoticesRegion()).toBeEmptyDOMElement();
  });
});

describe("AppShell with a waiting update and a zone rules update", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should apply the waiting update instead of reloading the page", async () => {
    const { updateServiceWorker } = mockServiceWorker(true);
    const { reloadPage } = renderShell();
    await findNotice();
    const [, zoneRulesReload] = screen.getAllByRole("button", {
      name: "Reload",
    });
    await userEvent.click(zoneRulesReload);
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
    expect(reloadPage).not.toHaveBeenCalled();
  });

  it("should show both notices with the zone rules one after the update notice", async () => {
    mockServiceWorker(true);
    renderShell();
    await findNotice();
    expect(screen.getAllByRole("button", { name: "Reload" })).toHaveLength(2);
    expect(getNoticesRegion().textContent).toMatch(
      /A new version is available\..*Time zone rules/,
    );
  });
});
