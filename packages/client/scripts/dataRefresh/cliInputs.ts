/**
 * Readers of the committed and refreshed data files of the data refresh commands.
 * Implements FR3, FR5, FR6 of refresh-data-through-scheduled-pull-requests (D5).
 */
import {
  ZONE_COORDINATES_FILE,
  ZONE_RULES_RELEASE_FILE,
} from "../../app.config.ts";
import type { CityDataset } from "../cityData/cityDataTypes.ts";
import { DATASET_PATH } from "../cityData/constants.ts";

export type ReadFile = (path: string) => Promise<string | undefined>;

async function requireFile(read: ReadFile, path: string): Promise<string> {
  const content = await read(path);
  if (content === undefined) {
    throw new Error(`Missing file ${path}`);
  }
  return content;
}

export async function readZoneRulesInputs(read: ReadFile) {
  const coordinates = await read(ZONE_COORDINATES_FILE);
  return {
    release: JSON.parse(await requireFile(read, ZONE_RULES_RELEASE_FILE)),
    coordinates:
      coordinates === undefined ? undefined : JSON.parse(coordinates),
  };
}

export async function readCityData(read: ReadFile): Promise<CityDataset> {
  return JSON.parse(await requireFile(read, DATASET_PATH));
}
