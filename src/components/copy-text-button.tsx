"use client";

import { useState } from "react";

export function CopyTextButton({
  value,
  label = "Kopírovat text",
  successMessage = "Zkopírováno",
  errorMessage = "Text zkopíruj ručně.",
  className = "button secondary",
}: {
  value: string;
  label?: string;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}) {
  const [message, setMessage] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(successMessage);
    } catch {
      setMessage(errorMessage);
    }
  }

  return (
    <>
      <button className={className} type="button" onClick={copy}>{label}</button>
      <small className="copy-text-status" role="status">{message}</small>
    </>
  );
}
