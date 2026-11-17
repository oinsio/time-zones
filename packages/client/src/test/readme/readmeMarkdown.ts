// Implements FR13 of refresh-readme-to-current-state: one owner of the README Markdown parsers.
import { existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import {
  ENGLISH_DOCUMENT_SUFFIX,
  REPOSITORY_ROOT,
  RUSSIAN_DOCUMENT_SUFFIX,
  readActiveDeltaCapabilities,
  type StageFacts,
} from "./readmeFiles";

export const STAGE_ROW_PATTERN =
  /^\| (\d+) \| `([a-z-]+)` \| `([^`]+)` \| (`[^`]+`|—) \| (\d+) \|/gm;

export function parseStageRows(text: string): StageFacts[] {
  return [...text.matchAll(STAGE_ROW_PATTERN)].map((match) => ({
    position: Number(match[1]),
    name: match[2],
    model: match[3],
    judge: match[4],
    attempts: Number(match[5]),
  }));
}

export function parseHeadings(text: string, level: number): string[] {
  const marker = "#".repeat(level);
  return withoutFences(text)
    .split("\n")
    .filter((line) => line.startsWith(`${marker} `))
    .map((line) => line.slice(level + 1).trim());
}

function withoutFences(text: string): string {
  return text.replace(/```[\s\S]*?```/g, "");
}

export function parseLinkTargets(text: string): string[] {
  const targets = [
    ...text.matchAll(/\]\(([^)\s]+)\)/g),
    ...text.matchAll(/src="([^"]+)"/g),
  ].map((match) => match[1]);
  return targets
    .filter((target) => !/^(https?:|mailto:|#)/.test(target))
    .map((target) => target.split("#")[0])
    .filter((target) => target !== "");
}

export function resolveLinkTarget(
  documentPath: string,
  target: string,
): string {
  return normalize(join(dirname(documentPath), target));
}

export function isLinkResolved(documentPath: string, target: string): boolean {
  const resolved = resolveLinkTarget(documentPath, target);
  if (existsSync(join(REPOSITORY_ROOT, resolved))) {
    return true;
  }
  const capability = /^openspec\/specs\/([^/]+)\/spec\.md$/.exec(resolved);
  return (
    capability !== null && readActiveDeltaCapabilities().includes(capability[1])
  );
}

export function toPairKey(relativePath: string): string {
  return relativePath.endsWith(RUSSIAN_DOCUMENT_SUFFIX)
    ? `${relativePath.slice(0, -RUSSIAN_DOCUMENT_SUFFIX.length)}${ENGLISH_DOCUMENT_SUFFIX}`
    : relativePath;
}

export function resolvedPairKeys(documentPath: string, text: string): string[] {
  return [
    ...new Set(
      parseLinkTargets(text).map((target) =>
        toPairKey(resolveLinkTarget(documentPath, target)),
      ),
    ),
  ].sort();
}

export function parseFencedPnpmCommands(text: string): string[] {
  const blocks = [...text.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map(
    (match) => match[1],
  );
  return blocks
    .flatMap((block) => block.split("\n"))
    .flatMap((line) => [...line.matchAll(/(?:^|\s)pnpm (.*?)(?:\s+#.*)?$/gm)])
    .map((match) => match[1].trim());
}

export function readImageAlts(text: string): string[] {
  const htmlAlts = [...text.matchAll(/<img\b[^>]*>/g)].map(
    (match) => /alt="([^"]*)"/.exec(match[0])?.[1] ?? "",
  );
  const markdownAlts = [...text.matchAll(/!\[([^\]]*)\]\([^)]*\)/g)].map(
    (match) => match[1],
  );
  return [...htmlAlts, ...markdownAlts];
}

export function readOpeningParagraph(text: string): string {
  return text.split(/^## /m)[0];
}
