"use client";
import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export function Button(props: ButtonProps) {
    return (
        <button
        {...props}
        style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
        }}
        />
    );
}
