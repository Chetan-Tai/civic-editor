"use client";

import * as React from "react";
import type { Value } from "platejs";
import { Plate, PlateContent, createPlateEditor } from "platejs/react";

import { paragraphPlugin, initialValue } from "@/lib/plate-config";
import { AISlashCommand } from "./AISlashCommand";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { QuotePopover } from "@/components/ui/quote-popover";

import { HAPPY_QUOTES, SAD_QUOTES } from "@/lib/quotes";

import { YjsPlugin } from "@platejs/yjs/react";
import { Editor, Transforms } from "slate";

type Mode = "happy" | "sad";
type PlateEditorProps = { mode: Mode };

// ---- helpers ----
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

function findKeywordRanges(text: string) {
  const out: Array<{ start: number; end: number; type: "happy" | "sad" }> = [];
  const scan = (w: "happy" | "sad") => {
    const re = new RegExp(`\\b${w}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) out.push({ start: m.index, end: m.index + m[0].length, type: w });
  };
  scan("happy");
  scan("sad");
  return out.sort((a, b) => a.start - b.start);
}

// ---- deterministic quote picker (by a stable key) ----
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function pickDeterministicQuoteByKey(kind: "happy" | "sad", key: string): string {
  const pool = kind === "happy" ? HAPPY_QUOTES : SAD_QUOTES;
  const idx = hashString(`${kind}:${key}`) % pool.length;
  return pool[idx];
}

export function PlateEditor({ mode }: PlateEditorProps) {
  // SSR guard
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // ---- room (from URL hash; updates live) ----
  const defaultRoom = mode === "happy" ? "civic-room-happy" : "civic-room-sad";
  const [roomId, setRoomId] = React.useState<string>(() => {
    if (typeof window === "undefined") return defaultRoom;
    const hash = (window.location.hash || "").replace(/^#/, "");
    return hash || defaultRoom;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => {
      const hash = (window.location.hash || "").replace(/^#/, "");
      setRoomId(hash || defaultRoom);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [defaultRoom]);

  // ---- persistence ----
  const storageKey = mode === "happy" ? "civic-doc-happy" : "civic-doc-sad";
  const [stored, setStored, loaded] = useLocalStorage<Value>(storageKey, initialValue);
  const [value, setValue] = React.useState<Value>(stored);
  const [isRewriting, setIsRewriting] = React.useState(false);

  // ---- editor + yjs (public webrtc signaling) ----
  const editor = React.useMemo(
    () =>
      createPlateEditor({
        value: stored, // local fallback; Yjs sync will take over
        plugins: [
          paragraphPlugin,
          YjsPlugin.configure({
            options: {
              cursors: { data: { name: "Guest", color: "#0ea5e9" } },
              providers: [
                {
                  type: "webrtc",
                  options: {
                    roomName: roomId,
                    signaling: ["wss://signaling.yjs.dev"],
                    maxConns: 8,
                  },
                },
              ],
            },
          }),
        ],
      }),
    [roomId]
  );

  React.useEffect(() => {
    const api = editor.getApi(YjsPlugin);
    api.yjs.init({ id: roomId, autoSelect: "end" });
    return () => api.yjs.destroy();
  }, [editor, roomId]);

  // hydrate from localStorage only if NOT connected to yjs
  React.useEffect(() => {
    if (!loaded) return;

    const isConnected =
      (editor as any).getOptions?.(YjsPlugin)?._isConnected ??
      (editor as any).getApi?.(YjsPlugin)?.yjs?.isConnected ??
      false;

    if (!isConnected) {
      const v = stored ?? initialValue;
      if (typeof (editor as any).setValue === "function") (editor as any).setValue(v);
      else {
        (editor as any).children = v as any;
        (editor as any).onChange();
      }
      setValue(v);
    }
  }, [stored, loaded, editor]);

  // on change
  const handlePlateChange = React.useCallback(
    ({ value: next }: { value: Value }) => {
      setValue(next);
      if (loaded) setStored(next);
    },
    [loaded, setStored]
  );

  // apply /rewrite
  const handleApplyRewrite = React.useCallback(
    (rewritten: string) => {
      const newValue = asSingleParagraph(rewritten);

      Editor.withoutNormalizing(editor as any, () => {
        while ((editor as any).children.length > 0) {
          Transforms.removeNodes(editor as any, { at: [0] });
        }
        Transforms.insertNodes(editor as any, newValue, { at: [0] });
        const end = Editor.end(editor as any, [0]);
        Transforms.select(editor as any, end);
      });

      setValue(newValue);
      if (loaded) setStored(newValue);
      setIsRewriting(false);
    },
    [editor, loaded, setStored]
  );

  // detect /rewrite
  React.useEffect(() => {
    setIsRewriting(/\/rewrite\s*$/i.test(toPlainText(value).trim()));
  }, [value]);

  // decorate — add offsets & path so the quote key is stable per token
  const decorate = React.useCallback(({ entry }: { entry: any }) => {
    if (!Array.isArray(entry) || entry.length < 2) return [];
    const [node, path] = entry as [any, any];
    const ranges: Array<{
      anchor: any;
      focus: any;
      happy?: true;
      sad?: true;
      __start?: number;
      __end?: number;
      __path?: any;
    }> = [];

    const txt = node?.text;
    if (typeof txt === "string") {
      for (const hit of findKeywordRanges(txt)) {
        ranges.push({
          anchor: { path, offset: hit.start },
          focus: { path, offset: hit.end },
          [hit.type]: true,
          __start: hit.start,     // <- carry offsets
          __end: hit.end,
          __path: path,           // <- carry path
        });
      }
    }
    return ranges;
  }, []);

  // renderLeaf with deterministic quotes keyed by (path + offsets)
  const renderLeaf = React.useCallback((props: any) => {
    const { attributes, children, leaf, text } = props;

    if (leaf?.happy || leaf?.sad) {
      const kind: "happy" | "sad" = leaf.happy ? "happy" : "sad";

      // build a stable key for this exact occurrence
      const pathPart = Array.isArray(leaf?.__path) ? leaf.__path.join(".") : "p";
      const start = typeof leaf?.__start === "number" ? leaf.__start : 0;
      const end = typeof leaf?.__end === "number" ? leaf.__end : 0;
      const stableKey = `${pathPart}:${start}-${end}`;

      const quote = pickDeterministicQuoteByKey(kind, stableKey);

      return (
        <span {...attributes}>
          <QuotePopover
            trigger={
              <span
                onMouseDown={(e) => e.preventDefault()} // keep caret stable
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
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          Room: <code>#{roomId}</code> (edit the URL hash to switch)
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <Plate editor={editor} onChange={handlePlateChange}>
          <PlateContent
            placeholder="Write something… (add '/rewrite' at the end)"
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