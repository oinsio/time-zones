import { WallTimeInputOutcome } from "@/controller";

/** A wall-time confirmation for tests that do not type a time. */
export const ignoreWallTime = () => WallTimeInputOutcome.CLOSED;
