import { Binary } from "lucide-react";
import { createRetryableLazyView } from "@/views";
import {
  type ToolDefinition,
  ToolId,
  type ToolPageProps,
} from "./toolDefinition";

export { resolveEnabledTools } from "./resolveEnabledTools";
export { ToolPageFrame } from "./ToolPageFrame";
export type {
  ToolDefinition,
  ToolPageProps,
  ToolServices,
  ToolSession,
} from "./toolDefinition";
export { ToolId } from "./toolDefinition";

const unixTimeConverterTool: ToolDefinition = {
  id: ToolId.UNIX_TIME_CONVERTER,
  titleKey: "tools.unixTimeConverter",
  icon: Binary,
  page: createRetryableLazyView<ToolPageProps>(async () =>
    (await import("./unixTimeConverter")).loadUnixTimeConverterPage(),
  ),
};

/**
 * Every tool the app offers, in display order (ADR-0020 draft). A new tool is
 * one entry here plus its folder; the tools group and the header list it by
 * themselves.
 * Implements FR1, G5 of add-unix-time-converter-tool (D1).
 */
export const toolRegistry: readonly ToolDefinition[] = [unixTimeConverterTool];
