// Verifies FR4, FR5, NFR-P1 of add-unix-time-converter-tool.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Binary } from "lucide-react";
import type { ToolDefinition, ToolPageProps } from "@/tools";
import { createRetryableLazyView } from "@/views";
import { ToolHost } from "./ToolHost";

const session = { read: vi.fn(), write: vi.fn() };
const LoadedPage = ({ onBack }: ToolPageProps) => (
  <button type="button" onClick={onBack}>
    loaded page
  </button>
);

const renderHost = (tool: ToolDefinition, onBack = vi.fn()) =>
  render(
    <ToolHost
      tool={tool}
      notices={<p>a notice</p>}
      onBack={onBack}
      session={session}
    />,
  );

describe("ToolHost", () => {
  it("should show the frame with a skeleton while the page loads", async () => {
    const tool: ToolDefinition = {
      id: "a",
      titleKey: "tools.unixTimeConverter",
      icon: Binary,
      page: createRetryableLazyView<ToolPageProps>(() => new Promise(() => {})),
    };
    renderHost(tool);
    expect(
      await screen.findByRole("heading", { name: "Конвертер Unix-времени" }),
    ).toBeInTheDocument();
    expect(document.querySelector("[aria-busy=true]")).not.toBeNull();
  });

  it("should hand the page its props", async () => {
    const onBack = vi.fn();
    const tool: ToolDefinition = {
      id: "a",
      titleKey: "tools.unixTimeConverter",
      icon: Binary,
      page: createRetryableLazyView<ToolPageProps>(async () => ({
        default: LoadedPage,
      })),
    };
    renderHost(tool, onBack);
    await userEvent.click(
      await screen.findByRole("button", { name: "loaded page" }),
    );
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("should show the error fallback with Retry and Back, then the page after Retry", async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error("chunk failed"))
      .mockResolvedValueOnce({ default: LoadedPage });
    const tool: ToolDefinition = {
      id: "a",
      titleKey: "tools.unixTimeConverter",
      icon: Binary,
      page: createRetryableLazyView<ToolPageProps>(loader, vi.fn()),
    };
    renderHost(tool);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Назад" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(
      await screen.findByRole("button", { name: "loaded page" }),
    ).toBeInTheDocument();
  });

  it("should render nothing for a tool without a page", () => {
    const { container } = renderHost({
      id: "a",
      titleKey: "tools.back",
      icon: Binary,
    });
    expect(container).toBeEmptyDOMElement();
  });
});
