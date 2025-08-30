"use client";

import * as React from "react";
import type { Value } from "platejs";
import { useAI } from "@/hooks/useAI";
import type { RewriteMode } from "@/lib/ai";

// Flatten a Plate Value to plain text (good enough for single-paragraph MVP)
function toPlainText(value: Value): string {
    return value
        .map((n: any) =>
        Array.isArray(n.children)
            ? n.children.map((c: any) => (typeof c.text === "string" ? c.text : "")).join("")
            : ""
        )
        .join("\n");
    }

    // Component is headless: it watches `value`, triggers rewrite when text ends with `/rewrite`,
    // and calls `onApply` with the rewritten text. It renders nothing.
    export function AISlashCommand({
    value,
    mode,
    onApply,
    }: {
    value: Value;
    mode: RewriteMode;
    onApply: (rewritten: string) => void;
    }) {
    const { rewrite } = useAI();
    const [busy, setBusy] = React.useState(false);
    const lastInputRef = React.useRef<string>("");

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
            const rewritten = await rewrite(input, mode);
            onApply(rewritten);
        } catch (e) {
            onApply(`(Rewrite failed) ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setBusy(false);
        }
        })();
    }, [value, mode, rewrite, busy, onApply]);

    return null;
}
