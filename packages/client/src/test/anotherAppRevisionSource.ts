import { createInMemoryAppRevisionSource } from "@/adapters";

/** An app revision that differs from the running build's `TEST_APP_REVISION`. */
export const ANOTHER_APP_REVISION = "another-app-revision";

/** A source whose site serves an app change, so a waiting build raises the update notice. */
export const createAnotherAppRevisionSource = () =>
  createInMemoryAppRevisionSource(ANOTHER_APP_REVISION);
