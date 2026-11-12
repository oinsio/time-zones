import {
  isZoneRulesSourceFailure,
  ZoneRulesSourceFailure,
  type ZoneRulesVersionSource,
} from "@/ports";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";

export interface ZoneRulesVersionSourceScenario {
  /** A source whose version file and release file `2026g` answer as stated. */
  createSource: (answers: {
    version: { release: string } | ZoneRulesSourceFailure;
    release2026g: unknown | ZoneRulesSourceFailure;
  }) => ZoneRulesVersionSource;
}

const RELEASE_DOCUMENT = buildReleaseDocument("2026g");

/**
 * Contract every `ZoneRulesVersionSource` adapter must satisfy.
 * Verifies FR3, FR4 of add-remote-zone-rules-updates (D4).
 */
export const describeZoneRulesVersionSourceContract = (
  adapterName: string,
  scenario: ZoneRulesVersionSourceScenario,
) => {
  const createSource = (
    answers: Partial<Parameters<typeof scenario.createSource>[0]> = {},
  ) =>
    scenario.createSource({
      version: { release: "2026g" },
      release2026g: RELEASE_DOCUMENT,
      ...answers,
    });

  describe(`ZoneRulesVersionSource contract: ${adapterName}`, () => {
    it("should read the release the version file names", async () => {
      expect(await createSource().fetchVersion()).toEqual({
        release: "2026g",
      });
    });

    it("should read the release file", async () => {
      expect(await createSource().fetchRelease("2026g")).toEqual(
        RELEASE_DOCUMENT,
      );
    });

    it.each([
      ZoneRulesSourceFailure.REQUEST_FAILED,
      ZoneRulesSourceFailure.UNPARSABLE,
    ])("should answer %s for a version file that fails so", async (failure) => {
      expect(await createSource({ version: failure }).fetchVersion()).toBe(
        failure,
      );
    });

    it.each([
      ZoneRulesSourceFailure.REQUEST_FAILED,
      ZoneRulesSourceFailure.UNPARSABLE,
    ])("should answer %s for a release file that fails so", async (failure) => {
      const outcome = await createSource({
        release2026g: failure,
      }).fetchRelease("2026g");
      expect(outcome).toBe(failure);
      expect(isZoneRulesSourceFailure(outcome)).toBe(true);
    });
  });
};
