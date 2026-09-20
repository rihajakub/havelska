"use client";

import { useState } from "react";

export function CopyCheckInLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };
  return <button className="button secondary copy-link" type="button" onClick={copy}>{copied ? "Zkopírováno" : "Kopírovat odkaz"}</button>;
}
