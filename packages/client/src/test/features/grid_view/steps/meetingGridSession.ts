// Supports FR5, FR15 of add-grid-meeting-range-and-share.
import { screen } from "@testing-library/react/pure";
import { createInMemoryTextSharing } from "@/adapters";
import type { InterfaceLanguageCode } from "@/locales";
import { HourFormat } from "@/preferences";
import { ViewId } from "@/views";
import { createGridViewWorld } from "../../main_page/steps/gridViewWorld";
import { setSampleMeeting } from "./meetingGridQueries";

const ALMATY_ZONE = "Asia/Almaty";
const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";
export const ALL_CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];

const openSharing = () =>
  createInMemoryTextSharing({ canShare: true, canCopy: true });

/** The Grid view world of the unit scenarios, with the text sharing and the language of the scenario. */
export const createMeetingGridSession = () => {
  const world = createGridViewWorld();
  let sharing = openSharing();
  let language: InterfaceLanguageCode = "en";
  let hourFormat: HourFormat = HourFormat.H24;

  const openGrid = async (
    cities: string[] = ALL_CITIES,
    textSharing = sharing,
  ) => {
    world.setInstant(SAMPLE_INSTANT);
    world.setDeviceZone(ALMATY_ZONE);
    world.storeViewModeAndLanguage(ViewId.GRID, language, hourFormat);
    world.storeLocations(cities);
    await world.openApp(textSharing);
    await screen.findAllByRole("slider");
  };
  const openGridWithSampleMeeting = async (textSharing = sharing) => {
    await openGrid(ALL_CITIES, textSharing);
    setSampleMeeting();
  };

  return {
    world,
    openGrid,
    openGridWithSampleMeeting,
    getSharing: () => sharing,
    useSharing: (options: Parameters<typeof createInMemoryTextSharing>[0]) => {
      sharing = createInMemoryTextSharing(options);
    },
    setHourFormat: (format: HourFormat) => {
      hourFormat = format;
    },
    setLanguage: (code: InterfaceLanguageCode) => {
      language = code;
    },
    reset: async () => {
      await world.reset();
      sharing = openSharing();
      language = "en";
      hourFormat = HourFormat.H24;
    },
  };
};
