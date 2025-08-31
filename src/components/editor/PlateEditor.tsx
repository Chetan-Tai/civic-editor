"use client";

import * as React from "react";
import * as Y from "yjs";
import type { Value } from "platejs";
import { Plate, PlateContent, createPlateEditor } from "platejs/react";

import { paragraphPlugin, initialValue } from "@/lib/plate-config";
import { AISlashCommand } from "./AISlashCommand";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { QuotePopover } from "@/components/ui/quote-popover";
import { randomHappyQuote, randomSadQuote } from "@/lib/quotes";

import { startWebRTCCollab } from "@/lib/collaboration";
import { CollaborationPlugin } from "./CollaborationPlugin";

type Mode = "happy" | "sad";
type PlateEditorProps = { mode: Mode };

/** Helpers to convert between plain text and a single-paragraph Plate Value */
function asSingleParagraph(text: string): Value {
  return [{ type: "p", children: [{ text }] }];
}
function toPlainText(value: Value): string {
  return (value as any[])
    .map((n: any) =>
      Array.isArray(n?.children)
        ? n.children.map((c: any) => (typeof c?.text === "string" ? c.text : "")).join("")
        : ""
    )
    .join("\n");
}

/** Find whole-word ranges of "happy" / "sad" within a given string */
function findKeywordRanges(text: string) {
  const ranges: Array<{ start: number; end: number; type: "happy" | "sad" }> = [];
  const pushAll = (word: "happy" | "sad") => {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      ranges.push({ start: m.index, end: m.index + m[0].length, type: word });
    }
  };
  pushAll("happy");
  pushAll("sad");
  return ranges.sort((a, b) => a.start - b.start);
}

export function PlateEditor({ mode }: PlateEditorProps) {
  // SSR guard
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Persist by mode
  const storageKey = mode === "happy" ? "civic-doc-happy" : "civic-doc-sad";
  const [stored, setStored, loaded] = useLocalStorage<Value>(storageKey, initialValue);

  // In-memory value (mirrors editor)
  const [value, setValue] = React.useState<Value>(stored);
  const [isRewriting, setIsRewriting] = React.useState(false);

  // Editor instance
  const editor = React.useMemo(
    () => createPlateEditor({ plugins: [paragraphPlugin], value: stored }),
    [] // editor config static
  );

  // Hydrate editor with stored value once localStorage is ready
  React.useEffect(() => {
    if (!loaded) return;
    const v = stored ?? initialValue;
    if (typeof (editor as any).setValue === "function") (editor as any).setValue(v);
    else {
      (editor as any).children = v as any;
      (editor as any).onChange();
    }
    setValue(v);
  }, [stored, loaded, editor]);

    // Keep localStorage in sync
    const handlePlateChange = React.useCallback(
    ({ value: next }: { value: Value }) => {
        setValue(next);
        if (loaded) setStored(next);

        // If collaboration is active, publish to Y
        const handle = collabRef.current;
        if (handle && !applyingRemoteRef.current) {
        const yContent = handle.doc.getMap<Value>("content");
        yContent.set("value", next);
        }
    },
    [loaded, setStored]
    );


  // Apply /rewrite result
  const handleApplyRewrite = React.useCallback(
    (rewritten: string) => {
      const newValue = asSingleParagraph(rewritten);
      if (typeof (editor as any).setValue === "function") (editor as any).setValue(newValue);
      else {
        (editor as any).children = newValue as any;
        (editor as any).onChange();
      }
      setValue(newValue);
      if (loaded) setStored(newValue);
      setIsRewriting(false);
    },
    [editor, loaded, setStored]
  );

  // Detect "/rewrite" at end of doc to show the status hint
  React.useEffect(() => {
    setIsRewriting(/\/rewrite\s*$/i.test(toPlainText(value).trim()));
  }, [value]);

  // --- Decorate: mark happy/sad leaves so renderLeaf can style/handle clicks ---
  const decorate = React.useCallback(({ entry }: { entry: any }) => {
    if (!Array.isArray(entry) || entry.length < 2) return [];
    const [node, path] = entry as [any, any];

    const ranges: Array<{
      anchor: { path: any; offset: number };
      focus: { path: any; offset: number };
      happy?: true;
      sad?: true;
    }> = [];

    if (node?.text && typeof node.text === "string") {
      for (const hit of findKeywordRanges(node.text)) {
        ranges.push({
          anchor: { path, offset: hit.start },
          focus: { path, offset: hit.end },
          [hit.type]: true,
        });
      }
    }
    return ranges;
  }, []);

  // --- Cache a quote for each encountered token so it doesn't shuffle on re-render ---
  const quoteCacheRef = React.useRef(new Map<string, string>());
  const pickStableQuote = (kind: "happy" | "sad", label: string, start?: number, end?: number) => {
    const key = `${kind}:${start ?? ""}-${end ?? ""}:${label.toLowerCase()}`;
    const existing = quoteCacheRef.current.get(key);
    if (existing) return existing;
    const q = kind === "happy" ? randomHappyQuote() : randomSadQuote();
    quoteCacheRef.current.set(key, q);
    return q;
  };

  // --- Render matched leaves: clickable with popover using your QuotePopover ---
  const renderLeaf = React.useCallback((props: any) => {
    const { attributes, children, leaf, text } = props;

    if (leaf?.happy || leaf?.sad) {
      const kind: "happy" | "sad" = leaf.happy ? "happy" : "sad";
      const label = typeof text?.text === "string" ? text.text : String(children);
      const quote = pickStableQuote(kind, label, leaf?.anchor?.offset, leaf?.focus?.offset);

      return (
        <span {...attributes}>
          <QuotePopover
            trigger={
              <span
                onMouseDown={(e) => {
                  // keeps caret from moving when clicking the word
                  e.preventDefault();
                }}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline dotted",
                  color: kind === "happy" ? "#0a7" : "#a33",
                }}
              >
                {children}
              </span>
            }
            quote={quote}
          />
        </span>
      );
    }

    return <span {...attributes}>{children}</span>;
  }, []);

  // ---------------------------
  // Collaboration (Yjs + WebRTC)
  // ---------------------------
    const [roomId, setRoomId] = React.useState(
        mode === "happy" ? "civic-room-happy" : "civic-room-sad"
    );
    const collabRef = React.useRef<ReturnType<typeof startWebRTCCollab> | null>(null);

    // guard to prevent echo loops when applying remote data
    const applyingRemoteRef = React.useRef(false);

    // Start/stop Yjs WebRTC session when room changes
    React.useEffect(() => {
    collabRef.current?.destroy();
    collabRef.current = startWebRTCCollab(roomId);
    return () => {
        collabRef.current?.destroy();
        collabRef.current = null;
    };
    }, [roomId]);

  if (!mounted || !loaded) {
    return (
      <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 12 }}>
        <div style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
          Mode: <strong>{mode}</strong>
        </div>
        <div style={{ minHeight: 160, display: "flex", alignItems: "center", color: "#999" }}>
          Loading editor…
        </div>
      </div>
    );
  }

    return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: "#666" }}>
            Mode: <strong>{mode}</strong>
            {isRewriting && <em style={{ marginLeft: 8 }}>(rewriting…)</em>}
        </div>
        <label style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
            Room:
            <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{
                marginLeft: 6,
                fontSize: 12,
                padding: "2px 6px",
                border: "1px solid #ddd",
                borderRadius: 6,
            }}
            placeholder="enter-room-id"
            />
        </label>
        </div>

        <div style={{ position: "relative" }}>
        {collabRef.current && (
            <CollaborationPlugin
            editor={editor}
            doc={collabRef.current.doc}
            roomId={roomId}
            onRemoteValue={(next) => {
                // prevent echo while we apply the remote state
                applyingRemoteRef.current = true;
                try {
                if (typeof (editor as any).setValue === "function") (editor as any).setValue(next);
                else {
                    (editor as any).children = next as any;
                    (editor as any).onChange();
                }
                setValue(next);
                if (loaded) setStored(next);
                } finally {
                // allow local changes to publish again on next tick
                setTimeout(() => (applyingRemoteRef.current = false), 0);
                }
            }}
            />
        )}

        <Plate editor={editor} onChange={handlePlateChange}>
            <PlateContent
            placeholder="Write something… (add /rewrite at the end)"
            style={{ minHeight: 160, outline: "none" }}
            decorate={decorate}
            renderLeaf={renderLeaf}
            />
            <AISlashCommand value={value} mode={mode} onApply={handleApplyRewrite} />
        </Plate>
        </div>
    </div>
    );
}
