import React from "react";
import App from "./App";
import { makeScopedStorage } from "./devStorage";

const clients = [
  { id: "admin", label: "ADMIN" },
  { id: "host", label: "HOST" },
  { id: "777", label: "PLAYER 777" },
  { id: "888", label: "PLAYER 888" },
];

export default function DevMultiClientPage() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {clients.map((c) => (
        <iframe
          key={c.id}
          title={c.label}
          src={`/dev-client.html?client=${c.id}`}
          style={{
            width: "100%",
            height: "90vh",
            border: "2px solid #ddd",
            borderRadius: 8,
          }}
        />
      ))}
    </div>
  );
}