"use client";

import * as React from "react";
import type { Value } from "platejs";
import { Plate, PlateContent, createPlateEditor } from "platejs/react";
import { paragraphPlugin, initialValue } from "@/lib/plate-config";
import { AISlashCommand } from "./AISlashCommand";

type Mode = "happy" | "sad";
type PlateEditorProps = { mode: Mode };

// Replace entire document with a single paragraph containing `text`
function asSingleParagraph(text: string): Value {
    return [{ type: "p", children: [{ text }] }];
}

export function PlateEditor({ mode }: PlateEditorProps) {
    const editor = React.useMemo(
        () =>
        createPlateEditor({
            plugins: [paragraphPlugin],
            value: initialValue,
        }),
        []
    );

    const [value, setValue] = React.useState<Value>(initialValue);
    const [isRewriting, setIsRewriting] = React.useState(false);

    // Plate vNext: onChange gets ({ value })
    const handleChange = React.useCallback(({ value }: { value: Value }) => {
        setValue(value);
    }, []);

    const handleApplyRewrite = React.useCallback((rewritten: string) => {
        setValue(asSingleParagraph(rewritten));
        setIsRewriting(false);
    }, []);

    // Show "rewriting…" while AISlashCommand is at work (toggled inside)
    // We’ll flip this flag on whenever a rewrite is detected:
    React.useEffect(() => {
        // crude indicator: if the text currently ends with /rewrite, assume we’re rewriting
        const text = (value as any[])
        .map((n: any) => (Array.isArray(n?.children) ? n.children.map((c: any) => c?.text || "").join("") : ""))
        .join("\n")
        .trim();
        const endsWithRewrite = /\/rewrite\s*$/i.test(text);
        setIsRewriting(endsWithRewrite);
    }, [value]);

    return (
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 12 }}>
        <div style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
            Mode: <strong>{mode}</strong> {isRewriting && <em style={{ marginLeft: 8 }}>(rewriting…)</em>}
        </div>

        <Plate editor={editor} onChange={handleChange}>
            <PlateContent
            placeholder="Write something… then add /rewrite at the end"
            style={{ minHeight: 160, outline: "none" }}
            />
            {/* Headless watcher that triggers the rewrite and applies it */}
            <AISlashCommand value={value} mode={mode} onApply={handleApplyRewrite} />
        </Plate>
        </div>
    );
}
