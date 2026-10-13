"use client";

import SignalField from "./scenes/SignalField";

export default function RoleScene() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }}
    >
      <SignalField />
    </div>
  );
}
