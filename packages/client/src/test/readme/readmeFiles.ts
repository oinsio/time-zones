// Implements FR13 of refresh-readme-to-current-state: one owner of the README readers.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const REPOSITORY_ROOT = join(import.meta.dirname, "../../../../..");
export const MAX_DOCUMENT_LINES = 300;
export const ARCHIVE_DIRECTORY_NAME = "archive";
export const RUSSIAN_DOCUMENT_SUFFIX = ".ru.md";
export const ENGLISH_DOCUMENT_SUFFIX = ".md";

export const README_EN = "README.md";
export const README_RU = "README.ru.md";
export const GUIDE_EN = "docs/gnomish-factory/README.md";
export const GUIDE_RU = "docs/gnomish-factory/README.ru.md";
export const ALL_DOCUMENTS = [README_EN, README_RU, GUIDE_EN, GUIDE_RU];
export const README_DOCUMENTS = [README_EN, README_RU];
export const LANGUAGE_PAIRS = [
  [README_EN, README_RU],
  [GUIDE_EN, GUIDE_RU],
];

export const README_SECTIONS_EN = [
  "Contents",
  "Features",
  "Screenshots",
  "Localization",
  "Supported browsers",
  "Tech Stack",
  "Development",
  "Continuous integration and deployment",
  "Gnomish Factory",
  "Contributing",
  "License",
];
export const README_SECTIONS_RU = [
  "Содержание",
  "Возможности",
  "Скриншоты",
  "Локализация",
  "Поддерживаемые браузеры",
  "Технологии",
  "Разработка",
  "CI и деплой",
  "Гномская фабрика",
  "Участие в разработке",
  "Лицензия",
];

export const STALE_PHRASES_EN = [
  "MVP",
  "Here entry",
  "smoke E2E",
  "origin/main",
  "nine stages",
  "working hours / evening",
  "`autonomy.attemptLimit` (2)",
];
export const STALE_PHRASES_RU = [
  "MVP",
  "строкой «Здесь»",
  "smoke E2E",
  "origin/main",
  "девять стадий",
  "рабочие часы / вечер",
  "локаци",
];
export const STALE_README_PHRASES: Record<string, string[]> = {
  [README_EN]: STALE_PHRASES_EN,
  [GUIDE_EN]: STALE_PHRASES_EN,
  [README_RU]: STALE_PHRASES_RU,
  [GUIDE_RU]: STALE_PHRASES_RU,
};

export const TECH_STACK_PACKAGES: ReadonlyArray<[string, string]> = [
  ["react", "React"],
  ["vite", "Vite"],
  ["typescript", "TypeScript"],
  ["tailwindcss", "Tailwind CSS"],
  ["@radix-ui/react-dialog", "Radix UI"],
  ["@dnd-kit/core", "dnd-kit"],
  ["temporal-polyfill", "temporal-polyfill"],
  ["vite-plugin-pwa", "vite-plugin-pwa"],
  ["i18next", "i18next"],
  ["@biomejs/biome", "Biome"],
  ["vitest", "Vitest"],
  ["playwright-bdd", "playwright-bdd"],
  ["@amiceli/vitest-cucumber", "vitest-cucumber"],
  ["@stryker-mutator/core", "Stryker"],
];

export const PNPM_BUILT_INS = ["install", "add", "exec", "dlx"];
export const CLIENT_FILTER = "--filter @time-zones/client";
export const FACTORY_IGNORED_ENTRIES = [
  /^\.gitignore$/,
  /^gnomish-\d/,
  /\.tar\.gz$/,
  /\.zip$/,
  /^SHA256SUMS$/,
  /^gnomish\.local\.env$/,
  /^logs$/,
];

export function readRepositoryFile(relativePath: string): string {
  return readFileSync(join(REPOSITORY_ROOT, relativePath), "utf8");
}

export function readDocument(relativePath: string): string {
  const absolutePath = join(REPOSITORY_ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`${relativePath} is missing`);
  }
  return readFileSync(absolutePath, "utf8");
}

function listDirectories(relativePath: string): string[] {
  return readdirSync(join(REPOSITORY_ROOT, relativePath), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

export function readStableCapabilities(): string[] {
  return listDirectories("openspec/specs");
}

export function readActiveDeltaCapabilities(): string[] {
  return listDirectories("openspec/changes")
    .filter((changeName) => changeName !== ARCHIVE_DIRECTORY_NAME)
    .flatMap((changeName) => {
      const specsPath = `openspec/changes/${changeName}/specs`;
      return existsSync(join(REPOSITORY_ROOT, specsPath))
        ? listDirectories(specsPath)
        : [];
    });
}

export function readWorkflowFiles(): string[] {
  return readdirSync(join(REPOSITORY_ROOT, ".github/workflows")).sort();
}

export function readFactoryEntries(): string[] {
  return readdirSync(join(REPOSITORY_ROOT, ".gnomish/factory")).filter(
    (entry) => !FACTORY_IGNORED_ENTRIES.some((pattern) => pattern.test(entry)),
  );
}

export function readPackageJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(readRepositoryFile(relativePath));
}

export function readScriptNames(): string[] {
  return ["package.json", "packages/client/package.json"].flatMap(
    (packagePath) =>
      Object.keys(
        (readPackageJson(packagePath).scripts as Record<string, string>) ?? {},
      ),
  );
}

export function readDependencyNames(): string[] {
  return ["package.json", "packages/client/package.json"].flatMap(
    (packagePath) => {
      const parsed = readPackageJson(packagePath);
      return [
        ...Object.keys((parsed.dependencies as object) ?? {}),
        ...Object.keys((parsed.devDependencies as object) ?? {}),
      ];
    },
  );
}

export interface StageFacts {
  position: number;
  name: string;
  model: string;
  judge: string;
  attempts: number;
}

export function readDefaultAttemptLimit(): number {
  const match = /^ {2}attemptLimit: (\d+)/m.exec(
    readRepositoryFile(".gnomish/config.yaml"),
  );
  return Number(match?.[1]);
}

export function readStageFacts(): StageFacts[] {
  const stageNames = [
    ...readRepositoryFile(".gnomish/pipeline.yaml").matchAll(/^ {2}- (\S+)/gm),
  ].map((match) => match[1]);
  return stageNames.map((name, index) => {
    const text = readRepositoryFile(`.gnomish/stages/${name}/stage.yaml`);
    const judgeModel = /- type: judge[\s\S]*?^ {4}model: (\S+)/m.exec(text);
    const ownLimit = /^autonomy:\n(?: {2}.*\n)*? {2}attemptLimit: (\d+)/m.exec(
      text,
    );
    return {
      position: index + 1,
      name,
      model: /^ {2}model: (\S+)/m.exec(text)?.[1] ?? "",
      judge: judgeModel ? `\`${judgeModel[1]}\`` : "—",
      attempts: Number(ownLimit?.[1] ?? readDefaultAttemptLimit()),
    };
  });
}
