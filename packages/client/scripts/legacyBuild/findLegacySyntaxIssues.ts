/**
 * Rules of the legacy build check: JavaScript that does not parse at the
 * Safari 12 level and CSS that iOS Safari 12 ignores. Pure: no I/O.
 * Implements FR12, FR13 of support-legacy-ios-12-safari (D9).
 */
import { parse } from "acorn";

export type LegacyIssue = { file: string; construct: string };

const ECMA_VERSION = 2020;
const LOOKBEHIND_PATTERN = /\(\?<[=!]/;
const REGEXP_CONSTRUCTOR_NAME = "RegExp";
const NULLISH_OPERATOR = "??";
const INSET_DECLARATION_PATTERN = /(?:^|[{;\s])inset\s*:/g;
const CSS_BLOCK_PATTERN = /([^{}]+)\{([^{}]*)\}/g;
const DVH_UNIT_PATTERN = /\ddvh\b/;
const VH_UNIT_PATTERN = /\dvh\b/;

// A const object, not an enum: Node runs this file with type stripping only.
export const LegacyConstruct = {
  OPTIONAL_CHAINING: "optional chaining",
  NULLISH_COALESCING: "nullish coalescing",
  BIGINT_LITERAL: "BigInt literal",
  REGEX_LOOKBEHIND: "regex lookbehind",
  INSET_SHORTHAND: "inset shorthand",
  DVH_WITHOUT_FALLBACK: "dvh height without a preceding vh fallback",
} as const;

type AstNode = { type: string; [key: string]: unknown };

const isAstNode = (value: unknown): value is AstNode =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as AstNode).type === "string";

function* walk(node: AstNode): Generator<AstNode> {
  yield node;
  for (const value of Object.values(node)) {
    const children = Array.isArray(value) ? value : [value];
    for (const child of children) {
      if (isAstNode(child)) yield* walk(child);
    }
  }
}

function findConstruct(node: AstNode): string | undefined {
  if (node.type === "ChainExpression") return LegacyConstruct.OPTIONAL_CHAINING;
  if (node.type === "LogicalExpression" && node.operator === NULLISH_OPERATOR) {
    return LegacyConstruct.NULLISH_COALESCING;
  }
  if (node.type === "Literal" && "bigint" in node) {
    return LegacyConstruct.BIGINT_LITERAL;
  }
  const regex = node.regex as { pattern: string } | undefined;
  if (node.type === "Literal" && regex !== undefined) {
    return LOOKBEHIND_PATTERN.test(regex.pattern)
      ? LegacyConstruct.REGEX_LOOKBEHIND
      : undefined;
  }
  return isLookbehindRegExpCall(node)
    ? LegacyConstruct.REGEX_LOOKBEHIND
    : undefined;
}

function isLookbehindRegExpCall(node: AstNode): boolean {
  if (node.type !== "NewExpression" && node.type !== "CallExpression") {
    return false;
  }
  const callee = node.callee as AstNode & { name?: string };
  const [firstArgument] = node.arguments as (AstNode & { value?: unknown })[];
  return (
    callee.type === "Identifier" &&
    callee.name === REGEXP_CONSTRUCTOR_NAME &&
    firstArgument?.type === "Literal" &&
    typeof firstArgument.value === "string" &&
    LOOKBEHIND_PATTERN.test(firstArgument.value)
  );
}

/** Syntax that Safari 12 cannot parse or run, found in one built script. */
export function findLegacySyntaxIssues(
  file: string,
  source: string,
): LegacyIssue[] {
  let program: AstNode;
  try {
    program = parse(source, {
      ecmaVersion: ECMA_VERSION,
      sourceType: "module",
    }) as unknown as AstNode;
  } catch (parseError) {
    const message = parseError instanceof Error ? parseError.message : "";
    return [{ file, construct: `parse error: ${message}` }];
  }
  const issues: LegacyIssue[] = [];
  for (const node of walk(program)) {
    const construct = findConstruct(node);
    if (construct !== undefined) issues.push({ file, construct });
  }
  return issues;
}

/** Every `inset:` declaration (not `inset-inline:` or a `--*-inset:` property). */
export function findInsetShorthand(css: string): string[] {
  return [...css.matchAll(INSET_DECLARATION_PATTERN)].map(
    () => LegacyConstruct.INSET_SHORTHAND,
  );
}

type Declaration = { property: string; value: string };

function readDeclarations(block: string): Declaration[] {
  return block
    .split(";")
    .map((text) => text.split(":"))
    .filter((parts) => parts.length >= 2)
    .map(([property = "", ...valueParts]) => ({
      property: property.trim(),
      value: valueParts.join(":").trim(),
    }));
}

/** Rules with a `dvh` declaration that has no earlier `vh` declaration of the same property. */
export function findDvhWithoutFallback(css: string): string[] {
  const findings: string[] = [];
  for (const [, selector = "", block = ""] of css.matchAll(CSS_BLOCK_PATTERN)) {
    const declarations = readDeclarations(block);
    declarations.forEach((declaration, declarationIndex) => {
      if (!DVH_UNIT_PATTERN.test(declaration.value)) return;
      const hasFallback = declarations
        .slice(0, declarationIndex)
        .some(
          (earlier) =>
            earlier.property === declaration.property &&
            VH_UNIT_PATTERN.test(earlier.value),
        );
      if (!hasFallback) {
        findings.push(
          `${LegacyConstruct.DVH_WITHOUT_FALLBACK}: ${selector.trim()} { ${declaration.property}: ${declaration.value} }`,
        );
      }
    });
  }
  return findings;
}

/** CSS that iOS Safari 12 ignores, found in one built stylesheet. */
export function findLegacyCssIssues(file: string, css: string): LegacyIssue[] {
  return [...findInsetShorthand(css), ...findDvhWithoutFallback(css)].map(
    (construct) => ({ file, construct }),
  );
}
