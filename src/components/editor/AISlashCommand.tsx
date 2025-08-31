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
  /** Provide a Yjs meta map getter from the editor (optional; passed from PlateEditor) */
  getYMeta?: () => any | null;
};

export function AISlashCommand({ value, mode, onApply, getYMeta }: AISlashCommandProps) {
  const { rewrite } = useAI();
  const [busy, setBusy] = React.useState(false);
  const lastInputRef = React.useRef<string>("");

  // Small helper: acquire & release a shared Yjs lock
  const runRewriteOnceSafely = React.useCallback(
    async (fn: () => Promise<string>) => {
      const yMeta = getYMeta?.();
      // If no Yjs (or not connected), just run locally:
      if (!yMeta) return fn();

      // already locked? then someone else will produce the answer; do nothing
      if (yMeta.get("rewriteLock")) return null;

      // acquire lock
      yMeta.set("rewriteLock", true);
      try {
        const out = await fn();
        // optional metadata
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
          // one caller will do the API call (temp=0 on server)
          return await rewrite(input, mode);
        });
        // If null, another tab is doing it; just wait for Yjs to sync result.
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