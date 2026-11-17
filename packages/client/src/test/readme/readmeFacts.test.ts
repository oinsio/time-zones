// Implements FR13 of refresh-readme-to-current-state: README facts checked against the repository.
import { describe, expect, it } from "vitest";
import {
  ALL_DOCUMENTS,
  CLIENT_FILTER,
  GUIDE_EN,
  GUIDE_RU,
  isLinkResolved,
  LANGUAGE_PAIRS,
  MAX_DOCUMENT_LINES,
  PNPM_BUILT_INS,
  parseFencedPnpmCommands,
  parseHeadings,
  parseLinkTargets,
  parseStageRows,
  README_DOCUMENTS,
  README_EN,
  README_RU,
  README_SECTIONS_EN,
  README_SECTIONS_RU,
  readActiveDeltaCapabilities,
  readDefaultAttemptLimit,
  readDependencyNames,
  readDocument,
  readFactoryEntries,
  readImageAlts,
  readOpeningParagraph,
  readPackageJson,
  readRepositoryFile,
  readScriptNames,
  readStableCapabilities,
  readStageFacts,
  readWorkflowFiles,
  resolvedPairKeys,
  resolveLinkTarget,
  STALE_README_PHRASES,
  TECH_STACK_PACKAGES,
} from "./readmeFiles";

const COUNTERPART_FILE_NAME = "README.ru.md";
const ENGLISH_COUNTERPART_FILE_NAME = "README.md";
const FACTORY_SECTION_HEADINGS: Record<string, string> = {
  [README_EN]: "Gnomish Factory",
  [README_RU]: "Гномская фабрика",
};
const STAGE_COUNT_WORDS: Record<string, string> = {
  [README_EN]: "stages",
  [README_RU]: "стади",
};

function readSection(documentPath: string, heading: string): string {
  const parts = readDocument(documentPath).split(/^## /m);
  return parts.find((part) => part.startsWith(`${heading}\n`)) ?? "";
}

describe("README documents", () => {
  it.each(README_DOCUMENTS)(
    "%s links the spec of every capability",
    (documentPath) => {
      // FR1: stable and active-change capabilities are all linked
      const linkedTargets = parseLinkTargets(readDocument(documentPath)).map(
        (target) => resolveLinkTarget(documentPath, target),
      );
      const capabilities = [
        ...readStableCapabilities(),
        ...readActiveDeltaCapabilities(),
      ];
      const missingLinks = capabilities
        .map((capability) => `openspec/specs/${capability}/spec.md`)
        .filter((specPath) => !linkedTargets.includes(specPath));
      expect(missingLinks).toEqual([]);
    },
  );

  it.each(ALL_DOCUMENTS)("%s has no stale phrase", (documentPath) => {
    // FR2: no stale or banned phrase
    const text = readDocument(documentPath);
    const found = STALE_README_PHRASES[documentPath].filter((phrase) =>
      text.includes(phrase),
    );
    expect(found).toEqual([]);
  });

  it.each(README_DOCUMENTS)("%s links every workflow", (documentPath) => {
    // FR7: all workflow files linked
    const linkedTargets = parseLinkTargets(readDocument(documentPath)).map(
      (target) => resolveLinkTarget(documentPath, target),
    );
    const missingLinks = readWorkflowFiles()
      .map((fileName) => `.github/workflows/${fileName}`)
      .filter((workflowPath) => !linkedTargets.includes(workflowPath));
    expect(missingLinks).toEqual([]);
  });

  it.each(README_DOCUMENTS)(
    "%s has one stage table row per pipeline stage",
    (documentPath) => {
      // FR8: rows equal pipeline.yaml order, model, judge and attempts
      expect(parseStageRows(readDocument(documentPath))).toEqual(
        readStageFacts(),
      );
    },
  );

  it.each(README_DOCUMENTS)(
    "%s states the stage count and the default attempt limit",
    (documentPath) => {
      // FR8: counts as written in the pipeline and config
      const section = readSection(
        documentPath,
        FACTORY_SECTION_HEADINGS[documentPath],
      );
      expect(section).toContain(
        `${readStageFacts().length} ${STAGE_COUNT_WORDS[documentPath]}`,
      );
      expect(section).toContain(
        `\`autonomy.attemptLimit\` (${readDefaultAttemptLimit()})`,
      );
    },
  );

  it.each(README_DOCUMENTS)(
    "%s names only existing pnpm scripts",
    (documentPath) => {
      // FR6: every fenced pnpm command exists
      const scriptNames = readScriptNames();
      const unknownCommands = parseFencedPnpmCommands(
        readDocument(documentPath),
      ).filter((command) => {
        const [firstWord] = command
          .replace(`${CLIENT_FILTER} `, "")
          .split(/\s+/);
        return ![...scriptNames, ...PNPM_BUILT_INS].includes(firstWord);
      });
      expect(unknownCommands).toEqual([]);
    },
  );

  it.each(README_DOCUMENTS)(
    "%s states the Node.js and pnpm requirements",
    (documentPath) => {
      // FR6: requirements equal engines, packageManager and .nvmrc
      const text = readDocument(documentPath);
      const engines = readPackageJson("package.json").engines as Record<
        string,
        string
      >;
      expect(text).toContain(`Node.js ${engines.node}`);
      expect(text).toContain(`pnpm ${engines.pnpm}`);
      expect(text).toContain(".nvmrc");
    },
  );

  it.each([GUIDE_EN, GUIDE_RU])(
    "%s pins the factory and OpenSpec versions",
    (documentPath) => {
      // FR9: versions equal gnomish.env and the root package.json
      const text = readDocument(documentPath);
      const factoryVersion = /GNOMISH_VERSION=(\S+)/.exec(
        readRepositoryFile(".gnomish/factory/gnomish.env"),
      )?.[1];
      const openspecVersion = (
        readPackageJson("package.json").devDependencies as Record<
          string,
          string
        >
      )["@fission-ai/openspec"];
      expect(text).toContain(`VERSION=${factoryVersion}\n`);
      expect(text).toContain(`@fission-ai/openspec@${openspecVersion}`);
    },
  );

  it.each([GUIDE_EN, GUIDE_RU])(
    "%s lists every tracked factory entry",
    (documentPath) => {
      // FR9: the factory table covers the directory
      const text = readDocument(documentPath);
      const missingEntries = readFactoryEntries().filter(
        (entry) =>
          !text.includes(`\`${entry}\``) && !text.includes(`\`${entry}/\``),
      );
      expect(missingEntries).toEqual([]);
    },
  );

  it.each(README_DOCUMENTS)(
    "%s links CONTRIBUTING.md and CLA.md",
    (documentPath) => {
      // FR10: contributing links
      const linkedTargets = parseLinkTargets(readDocument(documentPath));
      expect(linkedTargets).toContain("CONTRIBUTING.md");
      expect(linkedTargets).toContain("CLA.md");
    },
  );

  it.each(LANGUAGE_PAIRS)(
    "%s and its Russian version mirror each other",
    (englishPath, russianPath) => {
      // FR11: equal heading counts and link sets
      const englishText = readDocument(englishPath);
      const russianText = readDocument(russianPath);
      for (const level of [2, 3]) {
        expect(parseHeadings(russianText, level)).toHaveLength(
          parseHeadings(englishText, level).length,
        );
      }
      expect(resolvedPairKeys(russianPath, russianText)).toEqual(
        resolvedPairKeys(englishPath, englishText),
      );
      expect(parseLinkTargets(englishText)).toContain(COUNTERPART_FILE_NAME);
      expect(parseLinkTargets(russianText)).toContain(
        ENGLISH_COUNTERPART_FILE_NAME,
      );
    },
  );

  it.each(ALL_DOCUMENTS)(
    "%s has resolving links and fits the line cap",
    (documentPath) => {
      // FR12: links resolve, at most 300 lines
      const text = readDocument(documentPath);
      const brokenLinks = parseLinkTargets(text).filter(
        (target) => !isLinkResolved(documentPath, target),
      );
      expect(brokenLinks).toEqual([]);
      expect(text.split("\n").length).toBeLessThanOrEqual(MAX_DOCUMENT_LINES);
    },
  );

  it.each(README_DOCUMENTS)(
    "%s shows Cards and Grid screenshots with alt text",
    (documentPath) => {
      // FR3, NFR-A1: both views shown, every image has alt text
      const text = readDocument(documentPath);
      expect(text).toMatch(/docs\/design\/screens\/grid-[\w-]+\.png/);
      expect(text).toMatch(/docs\/design\/screens\/(phone|tablet)-[\w-]+\.png/);
      const alts = readImageAlts(text);
      expect(alts.length).toBeGreaterThan(0);
      expect(alts.filter((alt) => alt.trim() === "")).toEqual([]);
    },
  );

  it.each(README_DOCUMENTS)(
    "%s covers localization and supported browsers",
    (documentPath) => {
      // FR4, FR5: anchors of the prose sections
      const text = readDocument(documentPath);
      for (const anchor of ["_meta", "baseLanguage", "iOS Safari 12.5"]) {
        expect(text).toContain(anchor);
      }
    },
  );

  it.each(README_DOCUMENTS)(
    "%s names every main library of the tech stack",
    (documentPath) => {
      // FR5: each package exists and is named
      const text = readDocument(documentPath);
      const dependencyNames = readDependencyNames();
      const unknownPackages = TECH_STACK_PACKAGES.filter(
        ([packageName]) => !dependencyNames.includes(packageName),
      );
      const unnamedPackages = TECH_STACK_PACKAGES.filter(
        ([packageName, displayName]) =>
          !text.includes(packageName) && !text.includes(displayName),
      );
      expect(unknownPackages).toEqual([]);
      expect(unnamedPackages).toEqual([]);
    },
  );

  it.each([
    [README_EN, README_SECTIONS_EN],
    [README_RU, README_SECTIONS_RU],
  ])("%s keeps its sections in order", (documentPath, sections) => {
    // UX2: one question per section, in the designed order
    expect(parseHeadings(readDocument(documentPath), 2)).toEqual(sections);
  });

  it("opening paragraphs name both views", () => {
    // UX1: the opening paragraph names Cards and Grid
    const englishOpening = readOpeningParagraph(readDocument(README_EN));
    const russianOpening = readOpeningParagraph(readDocument(README_RU));
    expect(englishOpening).toContain("Cards view");
    expect(englishOpening).toContain("Grid view");
    expect(russianOpening).toContain("«Карточки»");
    expect(russianOpening).toContain("«Сетка»");
  });
});
