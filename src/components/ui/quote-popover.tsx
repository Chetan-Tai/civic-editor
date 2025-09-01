// src/components/ui/quote-popover.tsx
"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type QuotePopoverProps = {
  trigger: React.ReactNode;
  quote: string;
};

export function QuotePopover({ trigger, quote }: QuotePopoverProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* prevent caret jump; allow click to open */}
        <span onMouseDown={(e) => e.preventDefault()} role="button" tabIndex={0} style={{ cursor: "pointer" }}>
          {trigger}
        </span>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" sideOffset={6} className="max-w-xs p-3 leading-snug text-gray-800">
        {quote}
      </PopoverContent>
    </Popover>
  );
}