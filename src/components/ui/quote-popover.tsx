"use client";
import * as React from "react";
import { Popover } from "./popover";

export function QuotePopover({ label, quote }: { label: string; quote: string }) {
    return (
        <Popover
        trigger={<span>{label}</span>}
        >
        <div style={{ maxWidth: 280, fontSize: 14, lineHeight: 1.4 }}>{quote}</div>
        </Popover>
    );
}
