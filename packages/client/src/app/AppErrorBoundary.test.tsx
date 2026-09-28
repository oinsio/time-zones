// Verifies FR8, UX4 of setup-app-shell-and-pages-deploy: rendering errors show
// the recovery screen instead of a blank page.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { AppErrorBoundary } from "./AppErrorBoundary";

const FAILURE_DETAILS = "TypeError: cannot read properties of undefined";
const HEALTHY_CONTENT = "healthy content";

const FailingChild = () => {
  throw new Error(FAILURE_DETAILS);
};

describe("AppErrorBoundary", () => {
  beforeEach(async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await i18n.changeLanguage("en");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render children when nothing fails", () => {
    render(
      <AppErrorBoundary>
        <p>{HEALTHY_CONTENT}</p>
      </AppErrorBoundary>,
    );
    expect(screen.getByText(HEALTHY_CONTENT)).toBeInTheDocument();
  });

  it("should not show the recovery screen when nothing fails", () => {
    render(
      <AppErrorBoundary>
        <p>{HEALTHY_CONTENT}</p>
      </AppErrorBoundary>,
    );
    expect(screen.queryByRole("button", { name: "Reload" })).toBeNull();
  });

  it("should show the recovery screen when a child fails to render", () => {
    render(
      <AppErrorBoundary>
        <FailingChild />
      </AppErrorBoundary>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Something went wrong",
    );
  });

  it("should not show technical error details", () => {
    render(
      <AppErrorBoundary>
        <FailingChild />
      </AppErrorBoundary>,
    );
    expect(document.body).not.toHaveTextContent(FAILURE_DETAILS);
  });

  it("should reload the page through the injected reloadPage", async () => {
    const reloadPage = vi.fn();
    render(
      <AppErrorBoundary reloadPage={reloadPage}>
        <FailingChild />
      </AppErrorBoundary>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  it("should reload the browser location by default", async () => {
    const reloadLocation = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      reload: reloadLocation,
    });
    render(
      <AppErrorBoundary>
        <FailingChild />
      </AppErrorBoundary>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(reloadLocation).toHaveBeenCalledTimes(1);
  });
});
