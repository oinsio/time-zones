import { TrackMove } from "@/controller";

/** Key names from the feature file mapped to the track move they trigger. */
export const MOVE_BY_KEY_NAME: Record<string, TrackMove> = {
  "next step": TrackMove.NEXT_STEP,
  "previous step": TrackMove.PREVIOUS_STEP,
  "one hour forward": TrackMove.HOUR_FORWARD,
  "one hour back": TrackMove.HOUR_BACK,
  "start of day": TrackMove.DAY_START,
  "end of day": TrackMove.DAY_END,
};

export type CardTable = {
  city: string;
  time: string;
  date: string;
  offset: string;
}[];
