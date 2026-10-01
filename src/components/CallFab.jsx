import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";

const publicKey = process.env.REACT_APP_VAPI_PUBLIC_KEY || "221a36e9-5529-4a27-80e1-4d6efe32c6d8";
const assistantId = process.env.REACT_APP_VAPI_ASSISTANT_ID || "d3ad5d9d-42cc-4c27-a64e-8a9128c2b369";


let vapi = null;
const getVapi = () => {
  if (!vapi && publicKey) vapi = new Vapi(publicKey);
  return vapi;
};

export default function CallFab() {
  const [status, setStatus] = useState("idle"); // idle | connecting | active
  const bound = useRef(false);

  useEffect(() => {
    const v = getVapi();
    if (!v || bound.current) return;
    bound.current = true;
    v.on("call-start", () => setStatus("active"));
    v.on("call-end", () => setStatus("idle"));
    v.on("error", (e) => {
      console.error("Vapi error:", e);
      setStatus("idle");
    });
    return () => {
      try { v.stop(); } catch (e) {}
    };
  }, []);

  const toggle = () => {
    const v = getVapi();
    if (!v || !assistantId) {
      alert("Call agent is not configured yet.");
      return;
    }
    if (status === "idle") {
      setStatus("connecting");
      v.start(assistantId);
    } else {
      v.stop();
    }
    console.log("Vapi config:", { hasKey: !!publicKey, hasAssistant: !!assistantId });
  };

  return (
    <button
      onClick={toggle}
      title={status === "idle" ? "Talk to Fitty on call" : "End call"}
      style={{
        position: "fixed",
        bottom: 24,
        right: 100, // chat button ke left me. Overlap ho to badlo
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "none",
        background: status === "active" ? "#ef4444" : "#22c55e",
        color: "#fff",
        fontSize: 24,
        cursor: "pointer",
        zIndex: 1000,
        boxShadow: "0 4px 14px rgba(0,0,0,.4)",
      }}
    >
      {status === "idle" ? "📞" : status === "connecting" ? "…" : "⏹"}
    </button>
  );
}