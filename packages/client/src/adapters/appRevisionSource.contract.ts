import { AppRevisionFailure, type AppRevisionSource } from "@/ports";

export interface AppRevisionSourceScenario {
  /** A source whose file answers as stated. */
  createSource: (answer: string | AppRevisionFailure) => AppRevisionSource;
}

/**
 * Contract every `AppRevisionSource` adapter must satisfy.
 * Verifies FR5, FR6 of apply-data-updates-silently (D2).
 */
export const describeAppRevisionSourceContract = (
  adapterName: string,
  scenario: AppRevisionSourceScenario,
) => {
  describe(`AppRevisionSource contract: ${adapterName}`, () => {
    it("should read the app revision the site serves", async () => {
      expect(await scenario.createSource("c3").fetchAppRevision()).toBe("c3");
    });

    it.each([AppRevisionFailure.REQUEST_FAILED, AppRevisionFailure.UNPARSABLE])(
      "should answer %s for a file that fails so",
      async (failure) => {
        expect(await scenario.createSource(failure).fetchAppRevision()).toBe(
          failure,
        );
      },
    );
  });
};
