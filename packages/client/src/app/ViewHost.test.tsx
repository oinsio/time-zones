// Verifies FR2, FR4, FR5, FR6, NFR-A2, M4 of add-main-page-scaffold.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { installResizeObserverFake } from "@/test/resizeObserverFake";
import {
  buildTestView,
  buildTextView,
  failingThenLoading,
} from "@/test/viewFixtures";
import { AutoViewMode } from "@/views";
import { ViewHost } from "./ViewHost";

const WIDE_CONTAINER_WIDTH = 1024;
const NARROW_CONTAINER_WIDTH = 320;
const WIDE_MIN_WIDTH = 768;
const NARROW_TEXT = "narrow view";
const WIDE_TEXT = "wide view";
const PLACEHOLDER_ROW_COUNT = 3;
const RESOLVED_TEXT = "resolved view";
const RESOLVED_VIEW = () => <p>{RESOLVED_TEXT}</p>;

const narrowView = buildTextView("narrow", 0, NARROW_TEXT);
const wideView = buildTextView("wide", WIDE_MIN_WIDTH, WIDE_TEXT);
const buildNeverLoadingView = () =>
  buildTestView("pending", 0, () => new Promise(() => {}));
const buildFlakyView = (failureCount: number) =>
  buildTestView("flaky", 0, failingThenLoading(RESOLVED_VIEW, failureCount));

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

  it("should show the narrowest view before any width is measured", async () => {
    render(<ViewHost registry={[wideView, narrowView]} />);
    expect(await screen.findByText(NARROW_TEXT)).toBeInTheDocument();
  });

  it("should show the wide view when the container is wide", async () => {
    const resizeObserver = installResizeObserverFake();
    render(<ViewHost registry={[narrowView, wideView]} />);
    resizeObserver.reportWidth(WIDE_CONTAINER_WIDTH);
    expect(await screen.findByText(WIDE_TEXT)).toBeInTheDocument();
  });

  it("should switch views when the container is resized", async () => {
    const resizeObserver = installResizeObserverFake();
    render(<ViewHost registry={[narrowView, wideView]} />);
    resizeObserver.reportWidth(WIDE_CONTAINER_WIDTH);
    await screen.findByText(WIDE_TEXT);
    resizeObserver.reportWidth(NARROW_CONTAINER_WIDTH);
    expect(await screen.findByText(NARROW_TEXT)).toBeInTheDocument();
  });

  it("should resolve a second registered view without a page edit", async () => {
    render(<ViewHost registry={[buildTextView("extra", 0, RESOLVED_TEXT)]} />);
    expect(await screen.findByText(RESOLVED_TEXT)).toBeInTheDocument();
  });

  it("should honour a requested view id", async () => {
    render(<ViewHost registry={[narrowView, wideView]} mode={wideView.id} />);
    expect(await screen.findByText(WIDE_TEXT)).toBeInTheDocument();
  });

  it("should resolve by width in AUTO mode", async () => {
    render(
      <ViewHost registry={[narrowView, wideView]} mode={AutoViewMode.AUTO} />,
    );
    expect(await screen.findByText(NARROW_TEXT)).toBeInTheDocument();
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
