import type { ButtonHTMLAttributes } from "react";

/** Text button used for notice and recovery actions. */
export function NoticeButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="min-h-11 rounded-md px-3 font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      {...props}
    />
  );
}
