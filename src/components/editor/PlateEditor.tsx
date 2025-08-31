"use client";

import * as React from "react";
import type { Value } from "platejs";
import { Plate, PlateContent, createPlateEditor } from "platejs/react";
import { paragraphPlugin, initialValue } from "@/lib/plate-config";
import { AISlashCommand } from "./AISlashCommand";

type Mode = "happy" | "sad";
type PlateEditorProps = { mode: Mode };

// Replace entire doc with a single paragraph containing `text`
function asSingleParagraph(text: string): Value {
    return [{ type: "p", children: [{ text }] }];
}

// Naive plain-text (used for the "rewriting…" indicator)
function toPlainText(value: Value): string {
    return (value as any[])
        .map((n: any) =>
        Array.isArray(n?.children)
            ? n.children.map((c: any) => (typeof c?.text === "string" ? c.text : "")).join("")
            : ""
        )
    .join("\n");
}

export function PlateEditor({ mode }: PlateEditorProps) {
    // Create Plate editor once
    const editor = React.useMemo(
        () =>
        createPlateEditor({
            plugins: [paragraphPlugin],
            value: initialValue,
        }),
        []
    );

    // Mirror value in React just for slash-command detection / localStorage later
    const [value, setValue] = React.useState<Value>(initialValue);
    const [isRewriting, setIsRewriting] = React.useState(false);

    // Keep our mirror in sync when the user types
    const handleChange = React.useCallback(({ value }: { value: Value }) => {
        setValue(value);
    }, []);

    // Apply the rewrite into BOTH the editor *and* our mirror state
    const handleApplyRewrite = React.useCallback(
        (rewritten: string) => {
        const newValue = asSingleParagraph(rewritten);

        // Preferred (if available on your version)
        if (typeof (editor as any).setValue === "function") {
            (editor as any).setValue(newValue);
        } else {
            // Fallback for versions without setValue: mutate and notify
            (editor as any).children = newValue as any;
            (editor as any).onChange();
        }

        setValue(newValue);
        setIsRewriting(false);
        },
        [editor]
    );

    // Simple "(rewriting…)" indicator while the text ends with /rewrite
    React.useEffect(() => {
        const text = toPlainText(value).trim();
        setIsRewriting(/\/rewrite\s*$/i.test(text));
    }, [value]);

    return (
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 12 }}>
        <div style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
            Mode: <strong>{mode}</strong>{" "}
            {isRewriting && <em style={{ marginLeft: 8 }}>(rewriting…)</em>}
        </div>

        <Plate editor={editor} onChange={handleChange}>
            <PlateContent
            placeholder="Write something… then add /rewrite at the end"
            style={{ minHeight: 160, outline: "none" }}
            />

            {/* Headless watcher: triggers rewrite and invokes handleApplyRewrite */}
            <AISlashCommand value={value} mode={mode} onApply={handleApplyRewrite} />
        </Plate>
        </div>
    );
}
