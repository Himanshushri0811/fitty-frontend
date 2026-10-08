import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import "./CallFab.css";

const publicKey = process.env.REACT_APP_VAPI_PUBLIC_KEY || "221a36e9-5529-4a27-80e1-4d6efe32c6d8";
const assistantId = process.env.REACT_APP_VAPI_ASSISTANT_ID || "d3ad5d9d-42cc-4c27-a64e-8a9128c2b369";

let vapi = null;
const getVapi = () => {
  if (!vapi && publicKey) vapi = new Vapi(publicKey);
  return vapi;
};

export default function CallFab() {
  const [status, setStatus] = useState("idle"); // idle | connecting | active
  const [speaking, setSpeaking] = useState(false); // Fitty is talking
  const [hover, setHover] = useState(false);
  const [autoTip, setAutoTip] = useState(false);
  const [notice, setNotice] = useState(""); // short error / info message
  const noticeTimer = useRef(null);

  /* ---- Vapi events (removed again on unmount so nothing stacks up) ---- */
  useEffect(() => {
    const v = getVapi();
    if (!v) return;

    const onStart = () => setStatus("active");
    const onEnd = () => { setStatus("idle"); setSpeaking(false); };
    const onSpeechStart = () => setSpeaking(true);
    const onSpeechEnd = () => setSpeaking(false);
    const onError = (e) => {
      console.error("Vapi error:", e);
      setStatus("idle");
      setSpeaking(false);
      showNotice("Could not connect. Check your mic permission and try again.");
    };

    v.on("call-start", onStart);
    v.on("call-end", onEnd);
    v.on("speech-start", onSpeechStart);
    v.on("speech-end", onSpeechEnd);
    v.on("error", onError);

    return () => {
      v.off?.("call-start", onStart);
      v.off?.("call-end", onEnd);
      v.off?.("speech-start", onSpeechStart);
      v.off?.("speech-end", onSpeechEnd);
      v.off?.("error", onError);
      try { v.stop(); } catch (e) { }
      clearTimeout(noticeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Show the "Call with Fitty" popup once after load ---- */
  useEffect(() => {
    const show = setTimeout(() => setAutoTip(true), 2500);
    const hide = setTimeout(() => setAutoTip(false), 9000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  const showNotice = (msg) => {
    setNotice(msg);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 5000);
  };

  const toggle = async () => {
    const v = getVapi();
    if (!v || !assistantId) {
      showNotice("Call agent is not configured yet.");
      return;
    }
    setAutoTip(false);
    if (status === "idle") {
      setStatus("connecting");
      try {
        await v.start(assistantId);
      } catch (e) {
        console.error("Vapi start failed:", e);
        setStatus("idle");
        showNotice("Could not start the call. Please try again.");
      }
    } else {
      v.stop();
    }
  };

  /* ---- Popup text depends on the state ---- */
  let tip = null;
  if (notice) tip = { text: notice, kind: "warn" };
  else if (status === "connecting") tip = { text: "Connecting to Fitty...", kind: "info" };
  else if (status === "active") tip = { text: "On call with Fitty. Tap to end", kind: "live" };
  else if (hover || autoTip) tip = { text: "Call with Fitty", kind: "idle" };

  const label =
    status === "idle" ? "Call with Fitty" : status === "connecting" ? "Connecting, tap to cancel" : "End call with Fitty";

  return (
    <div className={`fcb-wrap is-${status} ${speaking ? "is-speaking" : ""}`}>
      {tip && (
        <div className={`fcb-tip fcb-tip-${tip.kind}`} role="status" aria-live="polite">
          <span className="fcb-tip-dot" />
          <span>{tip.text}</span>
        </div>
      )}

      <button
        className="fcb-btn"
        onClick={toggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label={label}
        title={label}
      >
        <span className="fcb-ring" aria-hidden="true" />

        <svg className="fcb-face" viewBox="0 0 64 64" aria-hidden="true">
          {/* headband */}
          <path d="M12 29 C12 7 52 7 52 29" fill="none" stroke="#0e1530" strokeWidth="2.6" strokeLinecap="round" />
          {/* head */}
          <rect x="14" y="16" width="36" height="30" rx="11" fill="#f1f2ff" />
          {/* visor */}
          <rect x="19" y="22" width="26" height="15" rx="7" fill="#0e1530" />
          {/* eyes (blink) */}
          <ellipse className="fcb-eye" cx="27" cy="29.5" rx="3.1" ry="3.7" fill="#22d3ee" />
          <ellipse className="fcb-eye" cx="37" cy="29.5" rx="3.1" ry="3.7" fill="#22d3ee" />
          {/* mouth: smile when idle, moves while Fitty talks */}
          <path className="fcb-smile" d="M28 41.5 Q32 44.5 36 41.5" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
          <ellipse className="fcb-talk" cx="32" cy="42" rx="3.6" ry="2.4" fill="#7c3aed" />
          {/* ear cups */}
          <rect x="8.5" y="27" width="7" height="13" rx="3.5" fill="#0e1530" />
          <rect x="48.5" y="27" width="7" height="13" rx="3.5" fill="#0e1530" />
          {/* mic boom: left ear down to the mouth */}
          <path d="M12 40 C12 52 20 54 26.5 50.5" fill="none" stroke="#0e1530" strokeWidth="2.2" strokeLinecap="round" />
          <circle className="fcb-mic" cx="28.5" cy="49.5" r="3.2" fill="#ec4899" stroke="#0e1530" strokeWidth="1.6" />
        </svg>

        {/* small red "end call" badge while a call is running */}
        {status !== "idle" && <span className="fcb-end" aria-hidden="true"><i /></span>}
      </button>
    </div>
  );
}