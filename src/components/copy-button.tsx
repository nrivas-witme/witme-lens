"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  label,
  variant = "outline",
  primary = false,
}: {
  value: string;
  label: string;
  variant?: "outline" | "default" | "secondary";
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      const text =
        value.startsWith("/") && typeof window !== "undefined"
          ? `${window.location.origin}${value}`
          : value;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant={primary ? "default" : variant}
      onClick={copy}
      className="h-10 rounded-[10px] px-3.5 text-[14px]"
    >
      {copied ? (
        <CheckIcon data-icon="inline-start" />
      ) : (
        <CopyIcon data-icon="inline-start" />
      )}
      {copied ? "Copiado" : label}
    </Button>
  );
}
