import type { ReactNode } from "react";

/** Visual shell shared by every card in the notices region. */
export function NoticeCard({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-auto flex w-full max-w-md flex-wrap items-center gap-2 rounded-lg bg-notice p-3 text-notice-foreground shadow-lg">
      {children}
    </div>
  );
}
