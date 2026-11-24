// Verifies FR5, FR14, FR16, FR17, NFR-A2 of add-unix-time-converter-tool.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Binary } from "lucide-react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
  createInMemoryTextCopying,
} from "@/adapters";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import type { ConverterViewDefinition } from "@/views/unixTimeConverter";
import { UnixTimeConverterPage } from "./UnixTimeConverterPage";

const moscow = buildLocation({ label: "Moscow", ...KNOWN_CITIES.Moscow });
const TEST_TEXT = "1795432987123";

const testView: ConverterViewDefinition = {
  id: "test",
  titleKey: "unixTime.viewList",
  icon: Binary,
  component: ({ converter, commands }) => (
    <div>
      <p data-testid="moscow">
        {converter.rows.find(({ id }) => id === moscow.id)?.timeLabel}
      </p>
      <button type="button" onClick={() => commands.typeInput(TEST_TEXT)}>
        send text
      </button>
    </div>
  ),
};
const secondView: ConverterViewDefinition = { ...testView, id: "second" };

function renderPage(
  registry?: readonly ConverterViewDefinition[],
  onBack = vi.fn(),
) {
  const backend = createInMemoryLocationBackend({
    status: LocationsLoadStatus.LOADED,
    locations: [moscow],
    homeLocationId: null,
  });
  render(
    <LocationsProvider
      repository={createInMemoryLocationRepository({ backend })}
      writeScheduler={immediateWriteScheduler}
      clock={createSwitchableClock("2026-11-23T11:23:07Z", "Asia/Almaty")}
      tickScheduler={createManualTickScheduler()}
    >
      <UnixTimeConverterPage
        notices={<p>a notice</p>}
        onBack={onBack}
        session={{ read: () => undefined, write: () => {} }}
        services={{
          tickScheduler: createManualTickScheduler(),
          textCopying: createInMemoryTextCopying(),
        }}
        registry={registry}
      />
    </LocationsProvider>,
  );
  return { onBack };
}

describe("UnixTimeConverterPage", () => {
  const originalMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });
  const stubPointer = (isFineAndHovering: boolean) => {
    window.matchMedia = vi.fn(() => ({
      matches: isFineAndHovering,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  };

  it("should show the tool name as the heading with the notices and a back button", () => {
    stubPointer(false);
    const { onBack } = renderPage([testView]);
    expect(
      screen.getByRole("heading", { name: "Конвертер Unix-времени" }),
    ).toBeInTheDocument();
    expect(screen.getByText("a notice")).toBeInTheDocument();
    expect(onBack).not.toHaveBeenCalled();
  });

  it("should hand the first registered view the presented data and take its commands", async () => {
    stubPointer(false);
    renderPage([testView, secondView]);
    expect(screen.getByTestId("moscow")).toHaveTextContent("14:23:07");
    await userEvent.click(screen.getByRole("button", { name: "send text" }));
    expect(screen.getByTestId("moscow")).toHaveTextContent("14:23:07.123");
  });

  it("should focus the heading on a touch device", () => {
    stubPointer(false);
    renderPage([testView]);
    expect(
      screen.getByRole("heading", { name: "Конвертер Unix-времени" }),
    ).toHaveFocus();
  });

  it("should not focus the heading on a fine, hovering pointer", () => {
    stubPointer(true);
    renderPage([testView]);
    expect(
      screen.getByRole("heading", { name: "Конвертер Unix-времени" }),
    ).not.toHaveFocus();
  });

  it("should focus the input with its text selected on a fine, hovering pointer", () => {
    stubPointer(true);
    renderPage();
    const input = screen.getByRole("textbox", {
      name: "Unix-время или дата ISO 8601",
    });
    expect(input).toHaveFocus();
  });
});
