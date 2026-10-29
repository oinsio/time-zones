/**
 * Vite plugin: preloads the `main` chunk, its static imports and their
 * stylesheets from index.html, so the boot step adds no request waterfall on modern browsers.
 * The chunk with the legacy polyfills is only a dynamic import of the boot
 * chunk, so it gets no link.
 * Implements NFR-P1, NFR-P2 of support-legacy-ios-12-safari (D2).
 */
import type { Plugin, Rollup } from "vite";
import { addMainChunkPreloads } from "./addMainChunkPreloads.ts";

const MAIN_CHUNK_NAME = "main";

function collectStaticImportClosure(
  bundle: Rollup.OutputBundle,
  startChunk: Rollup.OutputChunk,
): Rollup.OutputChunk[] {
  const collectedChunks = new Map<string, Rollup.OutputChunk>();
  const pendingChunks = [startChunk];
  for (const chunk of pendingChunks) {
    if (collectedChunks.has(chunk.fileName)) continue;
    collectedChunks.set(chunk.fileName, chunk);
    for (const importedFileName of chunk.imports) {
      const importedChunk = bundle[importedFileName];
      if (importedChunk?.type === "chunk") pendingChunks.push(importedChunk);
    }
  }
  return [...collectedChunks.values()];
}

export function mainChunkPreloadPlugin(): Plugin {
  let base = "/";
  return {
    name: "time-zones-main-chunk-preload",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        const bundle = context.bundle;
        if (bundle === undefined) return html;
        const mainChunk = Object.values(bundle).find(
          (output): output is Rollup.OutputChunk =>
            output.type === "chunk" &&
            output.isDynamicEntry &&
            output.name === MAIN_CHUNK_NAME,
        );
        if (mainChunk === undefined) return html;
        const closureChunks = collectStaticImportClosure(bundle, mainChunk);
        const toUrl = (fileName: string) => `${base}${fileName}`;
        const chunkUrls = closureChunks.map((chunk) => toUrl(chunk.fileName));
        const stylesheetUrls = [
          ...new Set(
            closureChunks.flatMap((chunk) => [
              ...(chunk.viteMetadata?.importedCss ?? []),
            ]),
          ),
        ].map(toUrl);
        return addMainChunkPreloads(html, chunkUrls, stylesheetUrls);
      },
    },
  };
}
