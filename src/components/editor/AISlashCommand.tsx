"use client";

import * as React from "react";
import type { Value } from "platejs";
import { useAI } from "@/hooks/useAI";
import type { RewriteMode } from "@/lib/ai";

function toPlainText(value: Value): string {
  return value
    .map((n: any) =>
      Array.isArray(n.children)
        ? n.children.map((c: any) => (typeof c.text === "string" ? c.text : "")).join("")
        : ""
    )
    .join("\n");
}

type AISlashCommandProps = {
  value: Value;
  mode: RewriteMode;
  onApply: (rewritten: string) => void;
  getYMeta?: () => any | null;
};

export function AISlashCommand({ value, mode, onApply, getYMeta }: AISlashCommandProps) {
  const { rewrite } = useAI();
  const [busy, setBusy] = React.useState(false);
  const lastInputRef = React.useRef<string>("");

  const runRewriteOnceSafely = React.useCallback(
    async (fn: () => Promise<string>) => {
      const yMeta = getYMeta?.();
      if (!yMeta) return fn();

      if (yMeta.get("rewriteLock")) return null;

      yMeta.set("rewriteLock", true);
      try {
        const out = await fn();
        yMeta.set("lastRewriteAt", Date.now());
        return out;
      } finally {
        yMeta.set("rewriteLock", false);
      }
    },
    [getYMeta]
  );

  React.useEffect(() => {
    if (busy) return;

    const text = toPlainText(value).trim();
    const endsWithRewrite = /\/rewrite\s*$/i.test(text);
    if (!endsWithRewrite) return;

    const input = text.replace(/\/rewrite\s*$/i, "").trim();
    if (!input || input === lastInputRef.current) return;
    lastInputRef.current = input;

    (async () => {
      try {
        setBusy(true);
        const maybe = await runRewriteOnceSafely(async () => {
          return await rewrite(input, mode);
        });
        if (maybe != null) onApply(maybe);
      } catch (e) {
        onApply(`(Rewrite failed) ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setBusy(false);
      }
    })();
  }, [value, mode, rewrite, busy, onApply, runRewriteOnceSafely]);

  return null;
}