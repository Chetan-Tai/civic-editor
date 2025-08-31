"use client";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export type CollabHandle = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  awareness: WebsocketProvider["awareness"];
  destroy: () => void;
};

export function startWebRTCCollab(roomId: string): CollabHandle {
  const doc = new Y.Doc();

  // Public demo server from Yjs (good for testing)
  // If your network blocks it, we can run a local server instead.
  const provider = new WebsocketProvider(
    "wss://demos.yjs.dev", // websocket endpoint
    roomId,
    doc,
    {
      connect: true,
      // params: {}, // you can add query params if needed
    }
  );

  // Basic status logs to confirm connection
  provider.on("status", (event: any) => {
    console.log("[y-websocket] status:", event.status); // "connected" / "disconnected"
  });

  // simple presence info
  const palette = ["#0ea5e9", "#f97316", "#10b981", "#a855f7", "#ef4444", "#f59e0b"];
  const color = palette[Math.floor(Math.random() * palette.length)];
  provider.awareness.setLocalStateField("user", { name: "Guest", color });

  const destroy = () => {
    provider.destroy();
    doc.destroy();
  };

  return { doc, provider, awareness: provider.awareness, destroy };
}