// Verifies NFR-P2 of bind-day-periods-to-sun (D4): a failed sun chunk shows the recovery screen.
import { screen, waitFor } from "@testing-library/react";
import i18n from "i18next";
import { mountApp } from "./mountApp";

vi.mock("./AppShell", () => ({
  AppShell: () => <p>app shell</p>,
}));

describe("mountApp", () => {
  let rootElement: HTMLElement;

  beforeEach(async () => {
    await i18n.changeLanguage("en");
    rootElement = document.createElement("div");
    document.body.append(rootElement);
  });

  afterEach(() => {
    rootElement.remove();
  });

  it("should render the app shell once the sun support has loaded", async () => {
    await mountApp(rootElement, () => Promise.resolve());
    await waitFor(() => expect(screen.getByText("app shell")).toBeTruthy());
  });

  it("should show the recovery screen when the sun support fails to load", async () => {
    await mountApp(rootElement, () => Promise.reject(new Error("chunk")));
    await waitFor(() =>
      expect(screen.getByText("Something went wrong")).toBeTruthy(),
    );
  });
});
