// Verifies FR1, UX3 of add-main-page-scaffold: fixed page regions.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import { MainPage } from "./MainPage";

const NOTICE_TEXT = "a notice";

describe("MainPage", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show the app title as the only heading", () => {
    render(<MainPage notices={null} />);
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Time Zones",
    );
  });

  it("should put the title in the header landmark", () => {
    render(<MainPage notices={null} />);
    expect(screen.getByRole("banner")).toContainElement(
      screen.getByRole("heading", { level: 1 }),
    );
  });

  it("should host the view in the main landmark", async () => {
    render(<MainPage notices={null} />);
    expect(
      await screen.findByText("No locations added yet."),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent(
      "No locations added yet.",
    );
  });

  it("should keep the title out of the main landmark", () => {
    render(<MainPage notices={null} />);
    expect(screen.getByRole("main")).not.toContainElement(
      screen.getByRole("heading", { level: 1 }),
    );
  });

  it("should render notices in a polite region", () => {
    render(<MainPage notices={<p>{NOTICE_TEXT}</p>} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("status")).toContainElement(
      screen.getByText(NOTICE_TEXT),
    );
  });

  it("should render an empty polite region when there are no notices", () => {
    render(<MainPage notices={null} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
