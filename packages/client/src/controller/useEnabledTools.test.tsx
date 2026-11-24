// Verifies FR1, FR3 of add-unix-time-converter-tool.
import { renderHook } from "@testing-library/react";
import { Binary } from "lucide-react";
import type { ReactNode } from "react";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import type { ToolDefinition } from "@/tools";
import { PreferencesProvider } from "./PreferencesProvider";
import { useEnabledTools } from "./useEnabledTools";

const toolA: ToolDefinition = { id: "a", titleKey: "a", icon: Binary };
const toolB: ToolDefinition = { id: "b", titleKey: "b", icon: Binary };

describe("useEnabledTools", () => {
  it("should return no tool outside a provider", () => {
    const { result } = renderHook(() => useEnabledTools([toolA]));
    expect(result.current).toEqual([]);
  });

  it("should return the enabled tools in registry order", () => {
    const repository = createInMemoryPreferencesRepository({
      initialDocument: {
        status: PreferencesLoadStatus.LOADED,
        preferences: {
          ...DEFAULT_PREFERENCES,
          enabledTools: ["b", "a", "folders"],
        },
      },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PreferencesProvider
        repository={repository}
        writeScheduler={immediateWriteScheduler}
      >
        {children}
      </PreferencesProvider>
    );
    const { result } = renderHook(() => useEnabledTools([toolA, toolB]), {
      wrapper,
    });
    expect(result.current).toEqual([toolA, toolB]);
  });
});
