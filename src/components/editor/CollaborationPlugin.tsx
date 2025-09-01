"use client";

import * as React from "react";
import type { Value } from "platejs";
import type { TPlateEditor } from "platejs/react";
import * as Y from "yjs";

export function CollaborationPlugin({
  editor,
  doc,
  roomId,
  onRemoteValue,
}: {
  editor: TPlateEditor<Value, any>;
  doc: Y.Doc;
  roomId: string;
  onRemoteValue: (next: Value) => void;
}) {
  const yContent = React.useMemo(() => doc.getMap<Value>("content"), [doc]);

  React.useEffect(() => {
    const applyFromY = () => {
      const next = yContent.get("value");
      if (!next) return;
      onRemoteValue(next);
    };

    applyFromY();

    const observer = () => applyFromY();
    yContent.observe(observer);
    return () => yContent.unobserve(observer);
  }, [yContent, onRemoteValue]);

  return (
    <div
      aria-label={`room-${roomId}`}
      style={{
        position: "absolute",
        top: 8,
        right: 12,
        fontSize: 12,
        background: "#eef2ff",
        color: "#3730a3",
        padding: "2px 8px",
        borderRadius: 999,
      }}
    >
      Room: {roomId}
    </div>
  );
}