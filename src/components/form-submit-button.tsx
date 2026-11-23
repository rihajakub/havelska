"use client";

import { useFormStatus } from "react-dom";

export function FormSubmitButton({
  children,
  pendingText = "Ukládám…",
  className = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-busy={pending}
      className={`${className}${pending ? " is-pending" : ""}`}
      disabled={pending || disabled}
      type="submit"
    >
      <span className="submit-spinner" aria-hidden="true" />
      {pending ? pendingText : children}
    </button>
  );
}
