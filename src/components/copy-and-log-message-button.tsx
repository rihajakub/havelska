"use client";

import { useState, useTransition } from "react";
import { logMessageSent } from "@/app/actions";
import type { MessageTemplateId } from "@/domain/types";

export function CopyAndLogMessageButton({ stayId, templateId, value, disabled = false }: { stayId: string; templateId: MessageTemplateId; value: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    const formData = new FormData();
    formData.set("stayId", stayId);
    formData.set("templateId", templateId);
    startTransition(async () => logMessageSent(formData));
    window.setTimeout(() => setCopied(false), 2200);
  };
  return <button className="button" type="button" disabled={disabled || pending} onClick={copy}>{pending ? "Ukládám…" : copied ? "Zkopírováno a zaznamenáno" : "Kopírovat a označit odeslání"}</button>;
}
