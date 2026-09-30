// Verifies FR2, FR11 of setup-app-shell-and-pages-deploy and FR1 of
// add-main-page-scaffold: title in the active language and rendering driven by
// the view registry.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import { lazy } from "react";
import type { ViewDefinition } from "@/views";
import { AppShell } from "./AppShell";

const registeredViews = vi.hoisted((): ViewDefinition[] => []);

vi.mock("@/views", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/views")>()),
  get viewRegistry() {
    return registeredViews;
  },
}));

const REGISTERED_VIEW_TEXT = "registered view content";

const buildViewDefinition = (viewText: string) =>
  ({
    id: viewText,
    titleKey: "app.title",
    icon: () => null,
    component: lazy(async () => ({ default: () => <p>{viewText}</p> })),
    autoMinWidth: 0,
  }) as unknown as ViewDefinition;

describe("AppShell", () => {
  beforeEach(async () => {
    registeredViews.length = 0;
    await i18n.changeLanguage("en");
  });

  it("should render the app title as the only page heading", () => {
    render(<AppShell />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Time Zones",
    );
  });

  it("should render the heading in the active language", async () => {
    await i18n.changeLanguage("ru");
    render(<AppShell />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Часовые пояса",
    );
  });

  it("should sync the document title with the active language", () => {
    render(<AppShell />);
    expect(document.title).toBe("Time Zones");
  });

  it("should render an empty content region when no views are registered", () => {
    render(<AppShell />);
    expect(screen.getByRole("main").textContent).toBe("");
  });

  it("should not fail when no views are registered", () => {
    expect(() => render(<AppShell />)).not.toThrow();
  });

  it("should render the first registered view inside main", async () => {
    registeredViews.push(buildViewDefinition(REGISTERED_VIEW_TEXT));
    render(<AppShell />);
    const viewContent = await screen.findByText(REGISTERED_VIEW_TEXT);
    expect(screen.getByRole("main")).toContainElement(viewContent);
  });

  it("should render an empty polite notice region when there is nothing to announce", () => {
    render(<AppShell />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
