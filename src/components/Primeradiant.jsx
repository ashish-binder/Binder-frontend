import { useEffect, useRef } from "react";

/**
 * PrimeRadiant — a seamless, looping 3D holographic mark.
 *
 * Ported from a standalone HTML/CSS/WAAPI animation into a self-contained
 * React functional component. All styles and motion are scoped to the
 * component's root element (nothing is written to document.body / <html>),
 * so you can drop multiple instances anywhere.
 *
 * By default it renders as a FIXED, full-viewport background layer that sits
 * behind your UI (z-index: -1) and never intercepts clicks — a drop-in
 * replacement for a background component:
 *
 *   <PrimeRadiant />
 *   <PrimeRadiant tempo="calm" palette="mono" depth="gentle" />
 *
 * To bound it inside a specific box instead, give that box position: relative
 * and override the positioning via the style prop:
 *
 *   <div style={{ position: "relative", width: 480, height: 480 }}>
 *     <PrimeRadiant style={{ position: "absolute", zIndex: 0 }} />
 *   </div>
 *
 * If it renders ON TOP of your content, an ancestor has an opaque background
 * painted above it — make that ancestor a stacking context, e.g.
 *   .login-split-container { position: relative; z-index: 0; }
 * or raise this component's z-index through the style prop.
 *
 * Props (all optional):
 *   tempo   "calm" | "flow" | "lively"   loop speed        (default "lively")
 *   bloom   "gentle" | "full" | "wide"   breathe amount    (default "full")
 *   depth   "flat" | "gentle" | "deep"   3D perspective    (default "deep")
 *   dwell   "short" | "long"             static hold time  (default "long")
 *   glow    "on" | "off"                 holographic glow  (default "on")
 *   palette "orange" | "mono"            color             (default "orange")
 *   cycle   "on" | "off"                 completion pulse  (default "on")
 *   className / style                    forwarded to the root element
 *
 * Note: uses the Web Animations API + @property, so it renders on the client
 * only (no SSR output). Motion is disabled automatically when the user has
 * prefers-reduced-motion set.
 */

// ── Geometry ────────────────────────────────────────────────────────────
// viewBox 1000×1000, centre (500,500). Point-up hexagon symmetry.
const C = 500;
const RAD = Math.PI / 180;

function polyPoints(n, r, rotDeg) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (-90 + rotDeg + (i * 360) / n) * RAD;
    out.push([C + r * Math.cos(a), C + r * Math.sin(a)]);
  }
  return out;
}
const fmt = (pts) =>
  pts.map((p) => p[0].toFixed(2) + "," + p[1].toFixed(2)).join(" ");

// The shape stack, back → front (measured from the original logo):
// outer hexagon web (hexagram + spokes), two hexagons, two squares/diamonds.
// Per-shape motion budget:
//   rot .......... in-plane spin (multiple of symmetry so it lands identical)
//   rx/ry ........ dual-axis tumble    xt/yt .... mid-loop tilt
//   tz ........... depth lift          d ........ radial breathe
//   h ............ prism half-depth (hollow glass volume that opens mid-loop)
const SHAPES = [
  {
    k: "hexweb",
    r: 455,
    base: 0,
    sw: 1.4,
    so: 0.5,
    fo: 0.03,
    rot: 480,
    rx: 0,
    ry: 0,
    xt: 16,
    yt: -14,
    tz: 0,
    d: 0.06,
    h: 109,
  },
  {
    k: "hex",
    r: 310,
    base: 0,
    sw: 1.2,
    so: 0.5,
    fo: 0.04,
    rot: -180,
    rx: -360,
    ry: 540,
    xt: 0,
    yt: 0,
    tz: 18,
    d: -0.18,
    h: 40,
  },
  {
    k: "hex",
    r: 185,
    base: 0,
    sw: 1.2,
    so: 0.52,
    fo: 0.06,
    rot: 300,
    rx: 540,
    ry: -360,
    xt: 20,
    yt: 0,
    tz: -28,
    d: 0.4,
    h: 46,
  },
  {
    k: "square",
    r: 127,
    base: 0,
    sw: 1.2,
    so: 0.55,
    fo: 0.13,
    rot: 450,
    rx: -180,
    ry: -1080,
    xt: 0,
    yt: 0,
    tz: 22,
    d: 0.85,
    h: 52,
  },
  {
    k: "square",
    r: 70,
    base: 0,
    sw: 1.5,
    so: 0.85,
    fo: 0.28,
    rot: 630,
    rx: -540,
    ry: 720,
    xt: 20,
    yt: 25,
    tz: 30,
    d: 1.9,
    h: 58,
  },
];

const COL = "var(--pr-color)";

// Inner polygon(s) for one shape, as JSX.
function ShapeFaces({ s }) {
  if (s.k === "hexweb") {
    const v = polyPoints(6, s.r, s.base);
    const segs = [];
    for (let i = 0; i < 6; i++) segs.push([v[i], v[(i + 2) % 6]]); // hexagram
    for (let i = 0; i < 3; i++) segs.push([v[i], v[(i + 3) % 6]]); // spokes
    return (
      <>
        <polygon
          points={fmt(v)}
          fill={COL}
          fillOpacity={s.fo}
          stroke={COL}
          strokeOpacity={s.so}
          strokeWidth={s.sw}
          vectorEffect="non-scaling-stroke"
        />
        <g
          stroke={COL}
          strokeOpacity={(s.so * 0.85).toFixed(3)}
          strokeWidth={s.sw}
          vectorEffect="non-scaling-stroke"
        >
          {segs.map(([a, b], i) => (
            <line
              key={i}
              x1={a[0].toFixed(2)}
              y1={a[1].toFixed(2)}
              x2={b[0].toFixed(2)}
              y2={b[1].toFixed(2)}
            />
          ))}
        </g>
      </>
    );
  }
  const v = polyPoints(s.k === "hex" ? 6 : 4, s.r, s.base);
  return (
    <polygon
      points={fmt(v)}
      fill={COL}
      fillOpacity={s.fo}
      stroke={COL}
      strokeOpacity={s.so}
      strokeWidth={s.sw}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  );
}

// Translucent side walls of the prism — one pane per polygon edge.
function sideWalls(s) {
  const n = s.k === "square" ? 4 : 6;
  const v = polyPoints(n, s.r, s.base);
  const walls = [];
  for (let i = 0; i < n; i++) {
    const a = v[i];
    const b = v[(i + 1) % n];
    const mx = (a[0] + b[0]) / 2 / 10;
    const my = (a[1] + b[1]) / 2 / 10;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) / 10;
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    walls.push(
      <div
        key={i}
        className="pr-side"
        style={{
          left: `${(mx - L / 2).toFixed(3)}%`,
          top: `${my.toFixed(3)}%`,
          width: `${L.toFixed(3)}%`,
          height: "calc(2 * var(--h))",
          marginTop: "calc(-1 * var(--h))",
          transform: `rotate(${ang.toFixed(2)}deg) rotateX(90deg) scaleY(var(--ext))`,
        }}
      />,
    );
  }
  return walls;
}

// ── Tempo / bloom / depth maps ──────────────────────────────────────────
const TEMPO = { calm: "30s", flow: "22s", lively: "16s" };
const BLOOM = { gentle: "0.5", full: "1", wide: "1.6" };
const DEPTH = { flat: "none", gentle: "2600px", deep: "1600px" };

// ── Scoped stylesheet (injected once) ───────────────────────────────────
const STYLE_ID = "prime-radiant-styles";
const CSS = `
.prime-radiant {
  --bg: #F2EDE4;
  --ink-soft: #5A544A;
  --orange: #E57A3C;
  --dur: 16s;
  --bloom: 1;
  --ease: cubic-bezier(.45,0,.55,1);

  position: fixed;      /* full-viewport background layer (like the original) */
  inset: 0;
  z-index: -1;          /* sits behind your UI — see note if it renders on top */
  background: var(--bg);
  overflow: hidden;
  pointer-events: none; /* decorative: never intercepts clicks on your form */
}

.prime-radiant .pr-stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 46%, rgba(229,122,60,.05) 0, transparent 60%),
    var(--bg);
}
.prime-radiant .pr-mark {
  position: relative;
  width: min(86vmin, 860px);
  height: min(86vmin, 860px);
  perspective: var(--persp, 1150px);
}
.prime-radiant .pr-mark svg {
  display: block; width: 100%; height: 100%;
  overflow: visible;
  transition: filter .4s ease;
}

@property --ext {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

.prime-radiant .pr-lyr,
.prime-radiant .pr-rot,
.prime-radiant .pr-scl {
  position: absolute;
  inset: 0;
  transform-origin: center;
  will-change: transform;
  transform-style: preserve-3d;
}
.prime-radiant .pr-gyro {
  position: absolute;
  inset: 0;
  transform-origin: center;
  transform-style: preserve-3d;
  will-change: transform;
}

.prime-radiant svg.pr-face {
  position: absolute;
  inset: 0;
}
.prime-radiant svg.pr-face.front { transform: translateZ(calc(var(--ext) * var(--h, 0px))); }
.prime-radiant svg.pr-face.back {
  transform: translateZ(calc(var(--ext) * var(--h, 0px) * -1));
  opacity: calc(var(--ext) * 0.85);
}
.prime-radiant .pr-side {
  position: absolute;
  box-sizing: border-box;
  transform-origin: center;
  background: color-mix(in srgb, var(--pr-color) 5%, transparent);
  border-left: 1px solid color-mix(in srgb, var(--pr-color) 45%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--pr-color) 45%, transparent);
  pointer-events: none;
}

.prime-radiant:not([data-palette="mono"]) {
  --holo-glow: rgba(229,122,60,.55);
  --holo-halo: rgba(255,171,64,.33);
  --scan-line: rgba(229,122,60,.11);
  --pr-color: var(--orange);
}
.prime-radiant[data-palette="mono"] {
  --holo-glow: rgba(90,84,74,.45);
  --holo-halo: rgba(120,110,95,.25);
  --scan-line: rgba(90,84,74,.10);
  --pr-color: var(--ink-soft);
}

.prime-radiant[data-glow="on"] .pr-lyr svg {
  animation: pr-holo var(--dur) var(--ease) infinite;
}
.prime-radiant[data-glow="on"][data-dwell="long"] .pr-lyr svg { animation-name: pr-holo-long; }

@keyframes pr-holo {
  0%, 9%    { filter: drop-shadow(0 0 0px rgba(0,0,0,0)) drop-shadow(0 0 0px rgba(0,0,0,0)) hue-rotate(0deg) saturate(1) brightness(1); }
  30%       { filter: drop-shadow(0 0 9px var(--holo-glow)) drop-shadow(0 0 24px var(--holo-halo)) hue-rotate(-30deg) saturate(1.4) brightness(1.07); }
  50%       { filter: drop-shadow(0 0 13px var(--holo-glow)) drop-shadow(0 0 32px var(--holo-halo)) hue-rotate(24deg) saturate(1.55) brightness(1.12); }
  70%       { filter: drop-shadow(0 0 9px var(--holo-glow)) drop-shadow(0 0 24px var(--holo-halo)) hue-rotate(-14deg) saturate(1.35) brightness(1.06); }
  91%, 100% { filter: drop-shadow(0 0 0px rgba(0,0,0,0)) drop-shadow(0 0 0px rgba(0,0,0,0)) hue-rotate(0deg) saturate(1) brightness(1); }
}
@keyframes pr-holo-long {
  0%, 18%   { filter: drop-shadow(0 0 0px rgba(0,0,0,0)) drop-shadow(0 0 0px rgba(0,0,0,0)) hue-rotate(0deg) saturate(1) brightness(1); }
  34%       { filter: drop-shadow(0 0 9px var(--holo-glow)) drop-shadow(0 0 24px var(--holo-halo)) hue-rotate(-30deg) saturate(1.4) brightness(1.07); }
  50%       { filter: drop-shadow(0 0 13px var(--holo-glow)) drop-shadow(0 0 32px var(--holo-halo)) hue-rotate(24deg) saturate(1.55) brightness(1.12); }
  66%       { filter: drop-shadow(0 0 9px var(--holo-glow)) drop-shadow(0 0 24px var(--holo-halo)) hue-rotate(-14deg) saturate(1.35) brightness(1.06); }
  82%, 100% { filter: drop-shadow(0 0 0px rgba(0,0,0,0)) drop-shadow(0 0 0px rgba(0,0,0,0)) hue-rotate(0deg) saturate(1) brightness(1); }
}

.prime-radiant .pr-scan {
  position: absolute;
  inset: -4%;
  pointer-events: none;
  opacity: 0;
  background: repeating-linear-gradient(0deg,
    var(--scan-line) 0px, var(--scan-line) 1px,
    transparent 1px, transparent 6px);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, black 52%, transparent 76%);
  mask-image: radial-gradient(circle at 50% 50%, black 52%, transparent 76%);
  animation: pr-scan var(--dur) linear infinite;
}
.prime-radiant[data-glow="off"] .pr-scan { display: none; }
.prime-radiant[data-dwell="long"] .pr-scan { animation-name: pr-scan-long; }
@keyframes pr-scan {
  0%, 9%    { opacity: 0; transform: translateY(0); }
  30%       { opacity: .55; }
  50%       { opacity: .7; }
  70%       { opacity: .5; }
  91%, 100% { opacity: 0; transform: translateY(26px); }
}
@keyframes pr-scan-long {
  0%, 18%   { opacity: 0; transform: translateY(0); }
  34%       { opacity: .55; }
  50%       { opacity: .7; }
  66%       { opacity: .5; }
  82%, 100% { opacity: 0; transform: translateY(26px); }
}

.prime-radiant .pr-complete {
  position: absolute;
  left: 50%; top: 50%;
  width: 60%; aspect-ratio: 1 / 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(229,122,60,.34) 0%, rgba(229,122,60,.13) 34%, transparent 66%);
  opacity: 0;
  pointer-events: none;
  animation: pr-complete var(--dur) linear infinite;
}
.prime-radiant[data-palette="mono"] .pr-complete {
  background: radial-gradient(circle,
    rgba(90,84,74,.26) 0%, rgba(90,84,74,.10) 34%, transparent 66%);
}
.prime-radiant[data-cycle="off"] .pr-complete { display: none; }
@keyframes pr-complete {
  0%, 74% { opacity: 0; }
  90%     { opacity: 1; }
  100%    { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .prime-radiant .pr-gyro,
  .prime-radiant .pr-lyr,
  .prime-radiant .pr-rot,
  .prime-radiant .pr-scl,
  .prime-radiant .pr-lyr svg,
  .prime-radiant .pr-scan { animation: none !important; }
  .prime-radiant .pr-complete,
  .prime-radiant .pr-scan { animation: none !important; display: none; }
}
`;

function useInjectStyles() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID))
      return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
}

// ── Component ───────────────────────────────────────────────────────────
export default function PrimeRadiant({
  tempo = "lively",
  bloom = "full",
  depth = "deep",
  dwell = "long",
  glow = "on",
  palette = "orange",
  cycle = "on",
  className = "",
  style,
}) {
  const rootRef = useRef(null);

  useInjectStyles();

  // Motion engine (WAAPI). One densely-sampled, velocity-continuous timeline
  // per element: dwell → flow → dwell, seam-free. Re-runs only when a
  // motion-affecting prop changes.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const anims = [];
    const durMs = parseFloat(TEMPO[tempo] || "16s") * 1000;
    const hold = dwell === "long" ? 0.18 : 0.09;
    const bloomV = parseFloat(BLOOM[bloom] || "1");
    const flat = depth === "flat";
    const N = 97;

    const S = (u) => (1 - Math.cos(Math.PI * u)) / 2; // ramp (things that travel)
    const E = (u) => Math.sin(Math.PI * u); //             bell (things that return)

    const sample = (fn) => {
      const out = [];
      for (let i = 0; i < N; i++) {
        const p = i / (N - 1);
        const u = Math.max(0, Math.min(1, (p - hold) / (1 - 2 * hold)));
        out.push({ offset: p, ...fn(u) });
      }
      return out;
    };

    const opts = { duration: durMs, iterations: Infinity, easing: "linear" };
    const t0 = document.timeline.currentTime ?? 0;
    const run = (el, fn) => {
      if (!el) return;
      const a = el.animate(sample(fn), opts);
      a.startTime = t0; // keep every element phase-locked to one clock
      anims.push(a);
    };

    // Whole-mark orbit — a full revolution with tilt excursions.
    const gyro = root.querySelector(".pr-gyro");
    if (gyro && !flat)
      run(gyro, (u) => {
        const e = E(u);
        const w = 2 * Math.PI * u;
        return {
          transform:
            `rotateX(${(34 * Math.sin(w) * e).toFixed(3)}deg)` +
            ` rotateY(${(-46 * Math.cos(w) * e).toFixed(3)}deg)` +
            ` rotateZ(${(22 * Math.sin(w - Math.PI / 3) * e).toFixed(3)}deg)`,
        };
      });

    root.querySelectorAll(".pr-lyr").forEach((lyr, i) => {
      const s = SHAPES[i];
      if (!s) return;

      if (!flat)
        run(lyr, (u) => {
          const e = E(u);
          const r = S(u);
          return {
            transform:
              `translateZ(${(s.tz * e).toFixed(2)}px)` +
              ` rotateX(${(s.rx * r + s.xt * e).toFixed(3)}deg)` +
              ` rotateY(${(s.ry * r + s.yt * e).toFixed(3)}deg)`,
          };
        });

      run(lyr.querySelector(".pr-rot"), (u) => ({
        transform: `rotate(${(s.rot * S(u)).toFixed(3)}deg)`,
      }));

      run(lyr.querySelector(".pr-scl"), (u) => {
        const e = E(u);
        const f = { transform: `scale(${(1 + s.d * bloomV * e).toFixed(4)})` };
        f["--ext"] = flat ? "0" : e.toFixed(4);
        return f;
      });
    });

    return () => anims.forEach((a) => a.cancel());
  }, [tempo, dwell, bloom, depth]);

  const rootStyle = {
    "--dur": TEMPO[tempo] || "16s",
    "--bloom": BLOOM[bloom] || "1",
    "--persp": DEPTH[depth] || "1150px",
    ...style,
  };

  return (
    <div
      ref={rootRef}
      className={`prime-radiant ${className}`.trim()}
      data-dwell={dwell}
      data-glow={glow}
      data-palette={palette}
      data-cycle={cycle}
      data-depth={depth}
      style={rootStyle}
    >
      <div className="pr-stage">
        <div className="pr-complete" />
        <div className="pr-mark">
          <div className="pr-gyro">
            {SHAPES.map((s, i) => (
              <div
                key={i}
                className="pr-lyr"
                style={{
                  "--rx": `${s.rx}deg`,
                  "--ry": `${s.ry}deg`,
                  "--xt": `${s.xt}deg`,
                  "--yt": `${s.yt}deg`,
                  "--tz": `${s.tz}px`,
                }}
              >
                <div className="pr-rot" style={{ "--rot": `${s.rot}deg` }}>
                  <div
                    className="pr-scl"
                    style={{ "--d": s.d, "--h": `${s.h}px` }}
                  >
                    {s.h > 0 ? (
                      <>
                        <svg
                          className="pr-face back"
                          viewBox="0 0 1000 1000"
                          fill="none"
                          strokeLinejoin="round"
                        >
                          <ShapeFaces s={s} />
                        </svg>
                        {sideWalls(s)}
                        <svg
                          className="pr-face front"
                          viewBox="0 0 1000 1000"
                          fill="none"
                          strokeLinejoin="round"
                        >
                          <ShapeFaces s={s} />
                        </svg>
                      </>
                    ) : (
                      <svg
                        viewBox="0 0 1000 1000"
                        fill="none"
                        strokeLinejoin="round"
                      >
                        <ShapeFaces s={s} />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pr-scan" />
        </div>
      </div>
    </div>
  );
}
