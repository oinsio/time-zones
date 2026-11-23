import { useCallback, useRef } from "react";
import type { ToolSession } from "@/tools";

/**
 * Holds what each tool page keeps while the app stays open, in a ref of the
 * shell (not a module variable): the value survives leaving and reopening a
 * tool page and is gone after a reload.
 * Implements FR14 of add-unix-time-converter-tool (D8).
 */
export function useToolSessions(): (toolId: string) => ToolSession {
  const sessions = useRef(new Map<string, unknown>());
  return useCallback(
    (toolId) => ({
      read: () => sessions.current.get(toolId),
      write: (value) => {
        sessions.current.set(toolId, value);
      },
    }),
    [],
  );
}
