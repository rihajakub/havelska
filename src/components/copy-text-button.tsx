"use client";

import { useState } from "react";

export function CopyTextButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="button secondary" type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }}>{copied ? "Zkopírováno" : "Kopírovat text"}</button>;
}
