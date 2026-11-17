/**
 * Constants of the app revision of a build.
 * Implements FR1 of apply-data-updates-silently (D1).
 */

/** The environment variable that sets the app revision explicitly. */
export const APP_REVISION_ENVIRONMENT_KEY = "APP_REVISION";

/** One record per commit: the hash, a NUL, the trailer lines, the record end. */
export const GIT_LOG_FORMAT = "--format=%H%x00%(trailers:only,unfold)%x1e";

export const GIT_COMMAND = "git";
export const GIT_LOG_ARGUMENTS = ["log", GIT_LOG_FORMAT];

export const GIT_RECORD_SEPARATOR = "\x1e";
export const GIT_FIELD_SEPARATOR = "\0";

/** The app revision when git cannot name one; unique per build, so a notice is shown. */
export const UNREADABLE_REVISION_PREFIX = "unreadable-";
