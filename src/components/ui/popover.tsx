"use client";

import * as React from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = RadixPopover.Root;
const PopoverTrigger = RadixPopover.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof RadixPopover.Content>,
  React.ComponentPropsWithoutRef<typeof RadixPopover.Content>
>(({ className, align = "center", side = "bottom", ...props }, ref) => (
  <RadixPopover.Portal>
    <RadixPopover.Content
      ref={ref}
      align={align}
      side={side}
      sideOffset={8}
      className={cn(
        "z-50 rounded-lg border bg-white p-3 text-sm shadow-md outline-none",
        className
      )}
      {...props}
    />
  </RadixPopover.Portal>
));

PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };