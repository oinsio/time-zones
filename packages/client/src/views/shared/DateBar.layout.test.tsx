// Verifies FR15, UX4 of add-settings-page-and-device-time-location (D13).
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { DateBar } from "./DateBar";

const NOW_BUTTON_NAME = "Now";

describe("DateBar layout", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should centre one group of controls at every width", () => {
    render(
      <LocationsProvider
        repository={createInMemoryLocationRepository()}
        writeScheduler={immediateWriteScheduler}
        clock={fakeClock("2026-03-08T07:30:00Z", "Asia/Almaty")}
        tickScheduler={createManualTickScheduler()}
      >
        <DateBar />
      </LocationsProvider>,
    );
    const groupRow = screen.getByRole("button", {
      name: NOW_BUTTON_NAME,
    }).parentElement;
    expect(groupRow).toHaveClass("justify-center", "gap-3");
    expect(groupRow).not.toHaveClass(
      "justify-between",
      "md:justify-center",
      "md:gap-4",
    );
  });
});
