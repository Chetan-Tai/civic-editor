"use client";
import * as React from "react";

type PopoverProps = { trigger: React.ReactNode; children: React.ReactNode };
export function Popover({ trigger, children }: PopoverProps) {
    const [open, setOpen] = React.useState(false);
    return (
        <span style={{ position: "relative" }}>
        <span onClick={() => setOpen((o) => !o)} style={{ textDecoration: "underline", cursor: "pointer" }}>
            {trigger}
        </span>
        {open && (
            <div
            style={{
                position: "absolute",
                top: "120%",
                left: 0,
                padding: 8,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: 8,
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                zIndex: 10,
            }}
            >
            {children}
            </div>
        )}
        </span>
    );
}