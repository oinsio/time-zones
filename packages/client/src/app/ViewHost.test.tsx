// Verifies FR2, FR4, FR5, FR6, NFR-A2, M4 of add-main-page-scaffold and
// D12 of add-locations-via-search; FR3, FR4, FR5 of add-view-mode-setting-and-grid-skeleton.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  buildTestView,
  buildTextView,
  failingThenLoading,
} from "@/test/viewFixtures";
import { ViewHost } from "./ViewHost";

const NARROW_TEXT = "narrow view";
const PLACEHOLDER_ROW_COUNT = 3;
const RESOLVED_TEXT = "resolved view";
const RESOLVED_VIEW = () => <p>{RESOLVED_TEXT}</p>;

const narrowView = buildTextView("narrow", NARROW_TEXT);
const buildNeverLoadingView = () =>
  buildTestView("pending", () => new Promise(() => {}));
const buildFlakyView = (failureCount: number) =>
  buildTestView("flaky", failingThenLoading(RESOLVED_VIEW, failureCount));

describe("ViewHost", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should render nothing and not fail for an empty registry", () => {
    const { container } = render(<ViewHost registry={[]} />);
    expect(container.textContent).toBe("");
  });

  it("should resolve a second registered view without a page edit", async () => {
    render(<ViewHost registry={[buildTextView("extra", RESOLVED_TEXT)]} />);
    expect(await screen.findByText(RESOLVED_TEXT)).toBeInTheDocument();
  });

  it("should mark the content container with the active view id", async () => {
    const { container } = render(<ViewHost registry={[narrowView]} />);
    await screen.findByText(NARROW_TEXT);
    expect(container.querySelector("[data-view-id]")).toHaveAttribute(
      "data-view-id",
      narrowView.id,
    );
  });

  it("should show a busy skeleton while the view loads", () => {
    const { container } = render(
      <ViewHost registry={[buildNeverLoadingView()]} />,
    );
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("should draw placeholder rows hidden from assistive technology in the skeleton", () => {
    const { container } = render(
      <ViewHost registry={[buildNeverLoadingView()]} />,
    );
    expect(
      container.querySelectorAll('[aria-busy="true"] [aria-hidden="true"]'),
    ).toHaveLength(PLACEHOLDER_ROW_COUNT);
  });

  it("should label the skeleton for assistive technology", () => {
    render(<ViewHost registry={[buildNeverLoadingView()]} />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("should announce an error when the view fails to load", async () => {
    render(<ViewHost registry={[buildFlakyView(1)]} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The view could not be loaded.",
    );
  });

  it("should offer a Retry action when the view fails to load", async () => {
    render(<ViewHost registry={[buildFlakyView(1)]} />);
    expect(
      await screen.findByRole("button", { name: "Retry" }),
    ).toBeInTheDocument();
  });

  it("should not move focus when the error appears", async () => {
    render(<ViewHost registry={[buildFlakyView(1)]} />);
    await screen.findByRole("alert");
    expect(document.body).toHaveFocus();
  });

  it("should show the view after Retry once the failure cause is gone", async () => {
    render(<ViewHost registry={[buildFlakyView(1)]} />);
    await userEvent.click(await screen.findByRole("button", { name: "Retry" }));
    expect(await screen.findByText(RESOLVED_TEXT)).toBeInTheDocument();
  });

  it("should retry from the keyboard with Tab and Enter", async () => {
    render(<ViewHost registry={[buildFlakyView(1)]} />);
    await screen.findByRole("alert");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByText(RESOLVED_TEXT)).toBeInTheDocument();
  });

  it("should keep the error when the retry fails again", async () => {
    render(<ViewHost registry={[buildFlakyView(2)]} />);
    await userEvent.click(await screen.findByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
