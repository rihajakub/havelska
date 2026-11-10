"use client";

import { useFormStatus } from "react-dom";

export function FormSubmitButton({
  children,
  pendingText = "Ukládám…",
  className = "button",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-busy={pending}
      className={`${className}${pending ? " is-pending" : ""}`}
      disabled={pending}
      type="submit"
    >
      <span className="submit-spinner" aria-hidden="true" />
      {pending ? pendingText : children}
    </button>
  );
}
