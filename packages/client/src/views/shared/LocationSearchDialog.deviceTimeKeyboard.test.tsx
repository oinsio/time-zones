// Verifies FR11 of add-settings-page-and-device-time-location (keyboard over the Device time option).
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  berlin,
  kolkata,
  moscow,
  renderDialog,
} from "./locationSearchDialogFixtures";

const DEVICE_TIME_LABEL = "Device time";
const ARROW_DOWN = "{ArrowDown}";

describe("LocationSearchDialog keyboard with the Device time option", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  const renderWithDeviceTimeOption = () => {
    const onChooseDeviceTime = vi.fn();
    const handlers = renderDialog({
      presentedResults: [moscow, kolkata, berlin],
      deviceTimeOption: {
        label: DEVICE_TIME_LABEL,
        onChoose: onChooseDeviceTime,
      },
    });
    return { ...handlers, onChooseDeviceTime };
  };

  it("should choose the Device time option with Enter on the first option", async () => {
    const { onChoose, onChooseDeviceTime } = renderWithDeviceTimeOption();
    await userEvent.type(screen.getByRole("combobox"), "{Enter}");
    expect(onChooseDeviceTime).toHaveBeenCalledTimes(1);
    expect(onChoose).not.toHaveBeenCalled();
  });

  it.each([
    { downPresses: 1, expectedResult: moscow },
    { downPresses: 2, expectedResult: kolkata },
    { downPresses: 3, expectedResult: berlin },
  ])(
    "should choose the city result reached after $downPresses ArrowDown presses",
    async ({ downPresses, expectedResult }) => {
      const { onChoose, onChooseDeviceTime } = renderWithDeviceTimeOption();
      await userEvent.type(
        screen.getByRole("combobox"),
        `${ARROW_DOWN.repeat(downPresses)}{Enter}`,
      );
      expect(onChoose).toHaveBeenCalledWith(expectedResult);
      expect(onChooseDeviceTime).not.toHaveBeenCalled();
    },
  );
});
