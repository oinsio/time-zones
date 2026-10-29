/**
 * Adds one `<link rel="modulepreload">` per URL before `</head>`, skipping
 * URLs the page already links. Pure: no I/O.
 * Implements NFR-P1, NFR-P2 of support-legacy-ios-12-safari (D2).
 */
const HEAD_END_TAG = "</head>";

export function addMainChunkPreloads(
  html: string,
  chunkUrls: readonly string[],
): string {
  const links = chunkUrls
    .filter((chunkUrl) => !html.includes(`href="${chunkUrl}"`))
    .map(
      (chunkUrl) => `<link rel="modulepreload" crossorigin href="${chunkUrl}">`,
    );
  if (links.length === 0) return html;
  return html.replace(
    HEAD_END_TAG,
    `${links.join("\n    ")}\n  ${HEAD_END_TAG}`,
  );
}
