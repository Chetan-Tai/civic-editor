"use client";

import Popover from "@/components/ui/popover";

type QuotePopoverProps = {
  trigger: React.ReactNode;
  quote: string;
};

export function QuotePopover({ trigger, quote }: QuotePopoverProps) {
  return (
    <Popover trigger={trigger}>
      <div style={{ maxWidth: 280, fontSize: 14, lineHeight: 1.4 }}>{quote}</div>
    </Popover>
  );
}
