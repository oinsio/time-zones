/**
 * Adds one `<link rel="modulepreload">` per chunk URL and one
 * `<link rel="stylesheet">` per stylesheet URL before `</head>`, skipping
 * URLs the page already links. Pure: no I/O.
 * Implements NFR-P1, NFR-P2 of support-legacy-ios-12-safari (D2).
 */
const HEAD_END_TAG = "</head>";

export function addMainChunkPreloads(
  html: string,
  chunkUrls: readonly string[],
  stylesheetUrls: readonly string[] = [],
): string {
  const isNotLinked = (url: string) => !html.includes(`href="${url}"`);
  const links = [
    ...chunkUrls
      .filter(isNotLinked)
      .map((url) => `<link rel="modulepreload" crossorigin href="${url}">`),
    ...stylesheetUrls
      .filter(isNotLinked)
      .map((url) => `<link rel="stylesheet" crossorigin href="${url}">`),
  ];
  if (links.length === 0) return html;
  return html.replace(
    HEAD_END_TAG,
    `${links.join("\n    ")}\n  ${HEAD_END_TAG}`,
  );
}
