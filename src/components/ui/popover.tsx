"use client";
import * as React from "react";

export type PopoverProps = { trigger: React.ReactNode; children: React.ReactNode };

export function Popover({ trigger, children }: PopoverProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLSpanElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // keep Slate caret from moving, but DO NOT mark the trigger non-editable
    e.preventDefault();
    setOpen(o => !o);
  };

  // close on outside click
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // close on ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span ref={rootRef} style={{ position: "relative" }}>
      <span
        onMouseDown={handleMouseDown}
        style={{ textDecoration: "underline dotted", cursor: "pointer" }}
        role="button"
      >
        {trigger}
      </span>

      {open && (
        <div
          contentEditable={false}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "120%",
            left: 0,
            padding: 8,
            background: "white",
            color: "black",
            border: "1px solid #ddd",
            borderRadius: 8,
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            zIndex: 9999,
            maxWidth: 280,
          }}
        >
          {children}
        </div>
      )}
    </span>
  );
}

export default Popover;
