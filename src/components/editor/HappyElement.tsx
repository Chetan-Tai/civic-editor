"use client";
import * as React from "react";

type Props = React.HTMLAttributes<HTMLSpanElement> & { children: React.ReactNode };

export function HappyElement(props: Props) {
    return <span {...props} style={{ cursor: "pointer" }}>{props.children}</span>;
}
