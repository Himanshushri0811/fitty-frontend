// postureEngine.js
// Pure JS (no React). Posture.jsx me import karke use karo.
// Backend rule schema same rehta hai: {name, check_type, keypoints:[a,b,c], min, max, message:{correct, unsafe}}
//
// Quick use (Posture.jsx me):
//   const session = new PostureSession({ rules: exercise.posture_config, repConfig: getRepConfig(exercise.name), aspect: video.videoWidth / video.videoHeight });
//   // har frame par (PoseLandmarker result se landmarks[0]):
//   const out = session.process(landmarks);
//   // out.rules[i].status: 'ok' | 'bad' | 'hidden' | 'skipped', out.reps, out.phase, out.event ('rep' | 'partial' | 'bottom' | null)

// ---------------------------------------------------------------------------
// Landmark helpers
// ---------------------------------------------------------------------------
// MediaPipe Pose: left <-> right jodi
export const MIRROR = {
  7: 8, 8: 7, 11: 12, 12: 11, 13: 14, 14: 13, 15: 16, 16: 15,
  17: 18, 18: 17, 19: 20, 20: 19, 21: 22, 22: 21,
  23: 24, 24: 23, 25: 26, 26: 25, 27: 28, 28: 27,
  29: 30, 30: 29, 31: 32, 32: 31,
};

/**
 * Angle at point b (a-b-c), 0..180 degrees.
 * aspect = videoWidth / videoHeight. Normalized x,y alag scale ke hote hain; bina aspect
 * correction ke angle 16:9 / 4:3 video me kharab nikalta hai (accuracy ka bada reason).
 */
export function calcAngle(a, b, c, aspect = 1) {
  const abx = (a.x - b.x) * aspect, aby = a.y - b.y;
  const cbx = (c.x - b.x) * aspect, cby = c.y - b.y;
  const mag = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (!mag) return null;
  const cos = Math.max(-1, Math.min(1, (abx * cbx + aby * cby) / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

function minVisibility(landmarks, idxs) {
  let m = 1;
  for (const i of idxs) {
    const v = landmarks?.[i]?.visibility;
    m = Math.min(m, typeof v === 'number' ? v : 0);
  }
  return m;
}

/** Rule ke keypoints (left) ya unka mirror (right) me se jo zyada visible ho, wo chuno. */
export function pickSide(landmarks, keypoints, minVis = 0.6) {
  const mirrored = keypoints.map((i) => (MIRROR[i] !== undefined ? MIRROR[i] : i));
  const vA = minVisibility(landmarks, keypoints);
  const vB = minVisibility(landmarks, mirrored);
  const useMirror = vB > vA;
  const visibility = useMirror ? vB : vA;
  return {
    indices: useMirror ? mirrored : keypoints,
    side: useMirror ? 'mirrored' : 'original',
    visibility,
    visible: visibility >= minVis,
  };
}

// ---------------------------------------------------------------------------
// Smoothing + debounce
// ---------------------------------------------------------------------------
export class EmaFilter {
  constructor(alpha = 0.35) { this.alpha = alpha; this.value = null; }
  update(v) {
    if (v == null) return this.value;
    this.value = this.value == null ? v : this.alpha * v + (1 - this.alpha) * this.value;
    return this.value;
  }
  reset() { this.value = null; }
}

/** Verdict tabhi badlega jab nayi value kuch frames AUR kuch ms tak lagatar rahe (flicker band). */
export class VerdictDebouncer {
  constructor({ minFrames = 5, minMs = 300, initial = 'unknown' } = {}) {
    this.minFrames = minFrames;
    this.minMs = minMs;
    this.stable = initial;
    this.candidate = initial;
    this.count = 0;
    this.since = 0;
  }
  update(v, now = performance.now()) {
    if (v === this.stable) { this.candidate = v; this.count = 0; return this.stable; }
    if (v !== this.candidate) { this.candidate = v; this.count = 1; this.since = now; }
    else this.count += 1;
    if (this.count >= this.minFrames && now - this.since >= this.minMs) {
      this.stable = v;
      this.count = 0;
    }
    return this.stable;
  }
}

// ---------------------------------------------------------------------------
// Rule tracking
// ---------------------------------------------------------------------------
class RuleTracker {
  constructor(rule) {
    this.rule = rule;
    this.ema = new EmaFilter(0.35);
    this.debounce = new VerdictDebouncer();
  }

  update(landmarks, { aspect, minVis }) {
    const { rule } = this;
    const kp = rule.keypoints || [];
    const base = { name: rule.name, message: '' };
    if (kp.length !== 3) return { ...base, status: 'skipped', angle: null, indices: kp };

    const side = pickSide(landmarks, kp, minVis);
    let raw = 'hidden';
    let angle = null;

    if (side.visible) {
      const [a, b, c] = side.indices.map((i) => landmarks[i]);
      const rawAngle = calcAngle(a, b, c, aspect);
      angle = this.ema.update(rawAngle);
      const lo = rule.min ?? rule.min_val ?? 0;
      const hi = rule.max ?? rule.max_val ?? 180;
      raw = angle != null && angle >= lo && angle <= hi ? 'ok' : 'bad';
    } else {
      this.ema.reset();
    }

    const status = this.debounce.update(raw);
    const msgs = rule.message || {};
    const message = status === 'ok' ? msgs.correct || '' : status === 'bad' ? msgs.unsafe || '' : '';
    return { ...base, status, angle, message, indices: side.indices, side: side.side };
  }
}

// ---------------------------------------------------------------------------
// Rep counter (state machine)  up -> down -> up = 1 rep
// Contraction me angle GHATTA hai (squat, curl, push-up). Bottom tak na pahunche to 'partial'.
// ---------------------------------------------------------------------------
export class RepCounter {
  constructor({ top = 160, bottom = 100 } = {}) {
    this.top = top;
    this.bottom = bottom;
    this.phase = 'up';
    this.reps = 0;
    this.dipping = false;
    this.extreme = null;
  }
  update(angle) {
    let event = null;
    if (angle == null) return { phase: this.phase, reps: this.reps, event, extreme: this.extreme };

    if (this.phase === 'up') {
      if (angle <= this.bottom) {
        this.phase = 'down';
        this.extreme = angle;
        this.dipping = false;
        event = 'bottom';
      } else if (angle < this.top - 15) {
        this.dipping = true;
      } else if (angle >= this.top && this.dipping) {
        this.dipping = false;
        event = 'partial'; // neeche tak nahi gaya
      }
    } else {
      this.extreme = Math.min(this.extreme, angle);
      if (angle >= this.top) {
        this.phase = 'up';
        this.reps += 1;
        event = 'rep';
      }
    }
    return { phase: this.phase, reps: this.reps, event, extreme: this.extreme };
  }
  reset() { this.phase = 'up'; this.reps = 0; this.dipping = false; this.extreme = null; }
}

// Exercise ke naam me ye shabd mile to ye thresholds (primary rule ke angle ke liye). Zaroorat ho to badlo.
const REP_DEFAULTS = [
  { match: /squat|leg press/i, top: 160, bottom: 100 },
  { match: /push|dip/i, top: 155, bottom: 95 },
  { match: /curl/i, top: 150, bottom: 60 },
  { match: /lunge/i, top: 160, bottom: 100 },
  { match: /press|raise/i, top: 160, bottom: 90 },
];
export function getRepConfig(exerciseName = '') {
  const hit = REP_DEFAULTS.find((d) => d.match.test(exerciseName));
  return hit ? { top: hit.top, bottom: hit.bottom } : { top: 160, bottom: 100 };
}

// ---------------------------------------------------------------------------
// PostureSession: sab ko jodta hai
// ---------------------------------------------------------------------------
export class PostureSession {
  constructor({ rules = [], repConfig = {}, aspect = 1, minVisibility: minVis = 0.6, primaryIndex = 0 } = {}) {
    this.trackers = rules.map((r) => new RuleTracker(r));
    this.counter = new RepCounter(repConfig);
    this.aspect = aspect;
    this.minVis = minVis;
    this.primaryIndex = primaryIndex;
    this.issues = new Set();
  }

  setAspect(aspect) { if (aspect > 0) this.aspect = aspect; }

  process(landmarks) {
    if (!landmarks || !landmarks.length) {
      return { rules: [], reps: this.counter.reps, phase: this.counter.phase, event: null, allVisible: false, formOk: null, issues: [] };
    }
    const opts = { aspect: this.aspect, minVis: this.minVis };
    const rules = this.trackers.map((t) => t.update(landmarks, opts));
    const primary = rules[this.primaryIndex];
    const rep = this.counter.update(primary ? primary.angle : null);

    // Rep ke neeche wale hisse me jo rule 'bad' hua, wo yaad rakho
    if (rep.phase === 'down') rules.forEach((r) => r.status === 'bad' && this.issues.add(r.name));

    let formOk = null;
    let issues = [];
    if (rep.event === 'rep') {
      issues = [...this.issues];
      formOk = issues.length === 0;
      this.issues.clear();
    } else if (rep.event === 'partial') {
      this.issues.clear();
    }

    return {
      rules,
      reps: rep.reps,
      phase: rep.phase,
      event: rep.event,
      formOk,
      issues,
      allVisible: rules.every((r) => r.status !== 'hidden'),
    };
  }

  reset() {
    this.counter.reset();
    this.issues.clear();
  }
}

// ---------------------------------------------------------------------------
// Frame loop: busy ho to frame skip, FPS cap. Phone par lag nahi hoga.
// ---------------------------------------------------------------------------
export function startFrameLoop(video, detect, { maxFps = 24 } = {}) {
  let raf = 0;
  let last = 0;
  let busy = false;
  let stopped = false;
  const interval = 1000 / maxFps;

  const tick = async (t) => {
    if (stopped) return;
    raf = requestAnimationFrame(tick);
    if (busy || t - last < interval || video.readyState < 2) return;
    last = t;
    busy = true;
    try { await detect(video, t); } catch (e) { console.error('pose frame error', e); } finally { busy = false; }
  };
  raf = requestAnimationFrame(tick);
  return () => { stopped = true; cancelAnimationFrame(raf); };
}

// ---------------------------------------------------------------------------
// Camera (phone friendly) + wake lock
// ---------------------------------------------------------------------------
export async function openCamera(video, facingMode = 'user') {
  if (!navigator.mediaDevices?.getUserMedia) {
    const e = new Error('no-mediadevices');
    e.code = 'NO_MEDIA_DEVICES';
    throw e;
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: facingMode }, width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
  video.setAttribute('playsinline', '');
  video.muted = true;
  video.srcObject = stream;
  await video.play();
  return stream;
}

export function stopCamera(stream) {
  stream?.getTracks().forEach((t) => t.stop());
}

export function describeCameraError(err) {
  const name = err?.name || err?.code || '';
  if (name === 'NO_MEDIA_DEVICES') return 'Camera ke liye HTTPS chahiye. Site ko https:// se kholo.';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') return 'Camera permission band hai. Browser settings me allow karke dobara try karo.';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'Is device me camera nahi mila.';
  if (name === 'NotReadableError' || name === 'TrackStartError') return 'Camera kisi aur app me chal raha hai. Use band karke dobara try karo.';
  if (name === 'OverconstrainedError') return 'Ye camera supported nahi hai. Doosra camera try karo.';
  return 'Camera start nahi ho paya. Dobara try karo.';
}

export async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) return await navigator.wakeLock.request('screen');
  } catch { /* ignore */ }
  return null;
}
