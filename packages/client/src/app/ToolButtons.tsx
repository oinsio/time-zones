import type { RefCallback } from "react";
import type { ToolDefinition } from "@/tools";
import { ToolButton } from "./ToolButton";

type ToolButtonsProps = {
  /** The enabled tools in registry order. */
  tools: readonly ToolDefinition[];
  onOpenTool: (toolId: string) => void;
  getOpenerRef: (toolId: string) => RefCallback<HTMLButtonElement>;
};

/**
 * One tool button per enabled tool that has a page, in registry order.
 * Implements FR4 of add-unix-time-converter-tool (D2).
 */
export function ToolButtons({
  tools,
  onOpenTool,
  getOpenerRef,
}: ToolButtonsProps) {
  return (
    <>
      {tools
        .filter((tool) => tool.page !== undefined)
        .map((tool) => (
          <ToolButton
            key={tool.id}
            ref={getOpenerRef(tool.id)}
            tool={tool}
            onClick={() => onOpenTool(tool.id)}
          />
        ))}
    </>
  );
}
