import type { Value } from "platejs";
import { ParagraphPlugin } from "platejs/react";

export const paragraphPlugin = ParagraphPlugin;

export const initialValue: Value = [
    { type: "p", children: [{ text: "Start typing…" }] },
];
