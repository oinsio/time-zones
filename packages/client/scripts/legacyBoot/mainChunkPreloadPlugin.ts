/**
 * Vite plugin: preloads the `main` chunk and its static imports from
 * index.html, so the boot step adds no request waterfall on modern browsers.
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
): string[] {
  const collectedFileNames = new Set<string>();
  const pendingChunks = [startChunk];
  for (const chunk of pendingChunks) {
    if (collectedFileNames.has(chunk.fileName)) continue;
    collectedFileNames.add(chunk.fileName);
    for (const importedFileName of chunk.imports) {
      const importedChunk = bundle[importedFileName];
      if (importedChunk?.type === "chunk") pendingChunks.push(importedChunk);
    }
  }
  return [...collectedFileNames];
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
        const chunkUrls = collectStaticImportClosure(bundle, mainChunk).map(
          (fileName) => `${base}${fileName}`,
        );
        return addMainChunkPreloads(html, chunkUrls);
      },
    },
  };
}
