import React from "react";

/**
 * SRSCDrawing — SVG technical drawing matching the standard ALT SRS-C layout.
 *
 * Standard drawing layout (left = section view, right = end view):
 *
 * Section view (left):
 *   - Shaft runs full width, threaded through nut
 *   - Nut body is a rectangle: total length = A, OD = D, bore ~ D3
 *   - Wiper recesses at each end of nut (width = w, depth brings OD from D → D2)
 *   - "a" zones (end relief) inside nut at each end
 *   - "b" is the central threaded engagement zone
 *
 * Above the nut (top annotations, left→right):
 *   A  (total nut length) — top
 *   b  (central body)     — below A
 *   w  w                  — wiper widths at each end
 *
 * Right-side vertical annotations:
 *   D  (nut OD)
 *   H  (nut OD including wipers — same as D for C type, shown as full height)
 *   D2 (bore / inner OD)
 *   D3 (thread root diameter)
 *   Q  (wiper groove depth indicator)
 *
 * Left-side / shaft annotations:
 *   d1 (shaft OD)
 *   d2 (shaft thread root)
 *
 * End view (right panel):
 *   Concentric circles: D (outer), D2 (bore), D3 (thread root), d1 (shaft)
 */

export default function SRSCDrawing({ dims }) {
  if (!dims) return null;

  const { d1, d2, D, A, w, a, b, H, Q, D2, D3 } = dims;

  // ── SVG canvas ──────────────────────────────────────────────────────────────
  const SVG_W = 620;
  const SVG_H = 340;

  // Section view occupies left ~68% of canvas
  const SEC_X0 = 10;   // leftmost x for shaft
  const SEC_W  = 390;  // width available for section view
  const CY     = 175;  // centreline y

  // End view occupies right portion
  const EV_CX  = 540;
  const EV_CY  = CY;
  const EV_R   = 60;   // display radius for D (outer nut)

  // ── Scale: map actual dimension A → SEC_W with some shaft overhang ─────────
  const SHAFT_OVERHANG = 0.22; // fraction of A shown on each side
  const totalShaftFraction = 1 + 2 * SHAFT_OVERHANG;
  const scale = SEC_W / (A * totalShaftFraction);

  const sA   = A  * scale;
  const sD   = (D  / 2) * scale;   // nut outer radius
  const sD2  = (D2 / 2) * scale;   // bore radius
  const sD3  = (D3 / 2) * scale;   // thread root radius in nut
  const sd1  = (d1 / 2) * scale;   // shaft OD radius
  const sd2  = (d2 / 2) * scale;   // shaft root radius
  const sw   = w  * scale;         // wiper groove width
  const sa   = a  * scale;         // end-relief zone
  const sb   = b  * scale;         // central engagement zone
  const sQ   = Q  * scale;         // wiper groove depth (radial)

  // Nut left edge X (shaft starts at SEC_X0)
  const SHAFT_X0 = SEC_X0;
  const SHAFT_X1 = SEC_X0 + SEC_W;
  const NUT_X0   = SEC_X0 + A * SHAFT_OVERHANG * scale;
  const NUT_X1   = NUT_X0 + sA;
  const NUT_CX   = NUT_X0 + sA / 2;

  // Wiper groove boundaries (from each end inward)
  const W_L0 = NUT_X0;
  const W_L1 = NUT_X0 + sw;          // left wiper right edge
  const W_R0 = NUT_X1 - sw;          // right wiper left edge
  const W_R1 = NUT_X1;
  // "a" zones inside the wiper
  const A_L0 = W_L1;
  const A_L1 = W_L1 + sa;
  const A_R0 = W_R0 - sa;
  const A_R1 = W_R0;
  // Central "b" zone
  const B_X0 = NUT_CX - sb / 2;
  const B_X1 = NUT_CX + sb / 2;

  // Wiper OD = D2 (bore), inner step at D3
  // Nut cross-section: outer = D, wiper recesses reduce to D2 at ends
  const TOP_D   = CY - sD;
  const BOT_D   = CY + sD;
  const TOP_D2  = CY - sD2;
  const BOT_D2  = CY + sD2;
  const TOP_D3  = CY - sD3;
  const BOT_D3  = CY + sD3;
  const TOP_d1  = CY - sd1;
  const BOT_d1  = CY + sd1;
  const TOP_d2  = CY - sd2;
  const BOT_d2  = CY + sd2;

  // ── Colours ─────────────────────────────────────────────────────────────────
  const LINE   = "#1e293b";
  const DIM    = "#003494";
  const DASH   = "#64748b";
  const FILL_NUT   = "#d1e8f7";
  const FILL_SHAFT = "#f0f4f8";
  const fs = 9.5; // font size for labels

  // ── Arrow marker ────────────────────────────────────────────────────────────
  // We'll draw arrowheads manually as small triangles for reliability

  // Helper: draw a simple dimension leader line + label
  // Horizontal dim arrow spanning x1→x2 at height y, with extension lines down to yBase
  function HDim({ x1, x2, y, yBase, label }) {
    const mid = (x1 + x2) / 2;
    const AH = 4; // arrowhead half-size
    return (
      <g>
        {/* extension lines */}
        <line x1={x1} y1={yBase} x2={x1} y2={y + 2} stroke={DIM} strokeWidth={0.6} strokeDasharray="2,2" />
        <line x1={x2} y1={yBase} x2={x2} y2={y + 2} stroke={DIM} strokeWidth={0.6} strokeDasharray="2,2" />
        {/* dimension line */}
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={DIM} strokeWidth={0.9} />
        {/* left arrowhead */}
        <polygon points={`${x1},${y} ${x1 + AH * 2},${y - AH} ${x1 + AH * 2},${y + AH}`} fill={DIM} />
        {/* right arrowhead */}
        <polygon points={`${x2},${y} ${x2 - AH * 2},${y - AH} ${x2 - AH * 2},${y + AH}`} fill={DIM} />
        {/* label */}
        <rect x={mid - label.length * 3} y={y - fs - 1} width={label.length * 6} height={fs + 2} fill="white" />
        <text x={mid} y={y - 2} textAnchor="middle" fontSize={fs} fill={DIM} fontFamily="monospace" fontWeight="bold">{label}</text>
      </g>
    );
  }

  // Vertical dim arrow spanning y1→y2 at x, with extension lines to xBase
  function VDim({ x, xBase, y1, y2, label, side = "right" }) {
    const mid = (y1 + y2) / 2;
    const AH = 4;
    const anchor = side === "right" ? "start" : "end";
    const lx = side === "right" ? x + 4 : x - 4;
    return (
      <g>
        {/* extension lines */}
        <line x1={xBase} y1={y1} x2={x - 2} y2={y1} stroke={DIM} strokeWidth={0.6} strokeDasharray="2,2" />
        <line x1={xBase} y1={y2} x2={x - 2} y2={y2} stroke={DIM} strokeWidth={0.6} strokeDasharray="2,2" />
        {/* dimension line */}
        <line x1={x} y1={y1} x2={x} y2={y2} stroke={DIM} strokeWidth={0.9} />
        {/* top arrowhead */}
        <polygon points={`${x},${y1} ${x - AH},${y1 + AH * 2} ${x + AH},${y1 + AH * 2}`} fill={DIM} />
        {/* bottom arrowhead */}
        <polygon points={`${x},${y2} ${x - AH},${y2 - AH * 2} ${x + AH},${y2 - AH * 2}`} fill={DIM} />
        {/* label */}
        <rect x={lx - (side === "right" ? 0 : label.length * 6)} y={mid - fs / 2 - 1} width={label.length * 6} height={fs + 2} fill="white" />
        <text x={lx} y={mid + fs / 2 - 1} textAnchor={anchor} fontSize={fs} fill={DIM} fontFamily="monospace" fontWeight="bold">{label}</text>
      </g>
    );
  }

  // Simple leader line with dot + label
  function Leader({ x1, y1, x2, y2, label, anchor = "start" }) {
    return (
      <g>
        <circle cx={x1} cy={y1} r={2} fill={DIM} />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM} strokeWidth={0.8} />
        <text x={x2 + (anchor === "start" ? 3 : -3)} y={y2 + 3} textAnchor={anchor} fontSize={fs} fill={DIM} fontFamily="monospace" fontWeight="bold">{label}</text>
      </g>
    );
  }

  // End-view scale factor
  const evS = EV_R / (D / 2);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}
    >

      {/* ═══════════════════════════════════════════════════════════════
          SECTION VIEW
      ═══════════════════════════════════════════════════════════════ */}

      {/* ── Shaft (full width) ── */}
      {/* Shaft fill */}
      <rect x={SHAFT_X0} y={TOP_d1} width={SHAFT_X1 - SHAFT_X0} height={sd1 * 2} fill={FILL_SHAFT} />
      {/* Thread lines top */}
      {Array.from({ length: 20 }).map((_, i) => {
        const tx = SHAFT_X0 + i * ((SHAFT_X1 - SHAFT_X0) / 20);
        return <line key={`tt${i}`} x1={tx} y1={TOP_d1} x2={tx + 3} y2={TOP_d2} stroke={DASH} strokeWidth={0.4} />;
      })}
      {/* Thread lines bottom */}
      {Array.from({ length: 20 }).map((_, i) => {
        const tx = SHAFT_X0 + i * ((SHAFT_X1 - SHAFT_X0) / 20);
        return <line key={`tb${i}`} x1={tx} y1={BOT_d1} x2={tx + 3} y2={BOT_d2} stroke={DASH} strokeWidth={0.4} />;
      })}
      {/* Shaft OD lines */}
      <line x1={SHAFT_X0} y1={TOP_d1} x2={SHAFT_X1} y2={TOP_d1} stroke={LINE} strokeWidth={1} />
      <line x1={SHAFT_X0} y1={BOT_d1} x2={SHAFT_X1} y2={BOT_d1} stroke={LINE} strokeWidth={1} />

      {/* ── Nut body — main OD rectangle ── */}
      {/* Central body area (full height = D) */}
      <rect x={NUT_X0} y={TOP_D} width={sA} height={sD * 2} fill={FILL_NUT} stroke={LINE} strokeWidth={1.4} />

      {/* Wiper recesses: stepped-down zones at each end (from D → D2 height) */}
      {/* Left wiper recess top */}
      <rect x={W_L0} y={TOP_D} width={sw} height={sD - sD2} fill="#f0f7ff" stroke={LINE} strokeWidth={0.8} />
      <rect x={W_L0} y={CY + sD2} width={sw} height={sD - sD2} fill="#f0f7ff" stroke={LINE} strokeWidth={0.8} />
      {/* Right wiper recess top */}
      <rect x={W_R0} y={TOP_D} width={sw} height={sD - sD2} fill="#f0f7ff" stroke={LINE} strokeWidth={0.8} />
      <rect x={W_R0} y={CY + sD2} width={sw} height={sD - sD2} fill="#f0f7ff" stroke={LINE} strokeWidth={0.8} />

      {/* Bore line (D2) — inner bore dashed across full nut width */}
      <line x1={NUT_X0} y1={TOP_D2} x2={NUT_X1} y2={TOP_D2} stroke={LINE} strokeWidth={0.8} strokeDasharray="4,2" />
      <line x1={NUT_X0} y1={BOT_D2} x2={NUT_X1} y2={BOT_D2} stroke={LINE} strokeWidth={0.8} strokeDasharray="4,2" />

      {/* Bore line (D3) — thread root diameter */}
      <line x1={NUT_X0} y1={TOP_D3} x2={NUT_X1} y2={TOP_D3} stroke={DASH} strokeWidth={0.6} strokeDasharray="2,3" />
      <line x1={NUT_X0} y1={BOT_D3} x2={NUT_X1} y2={BOT_D3} stroke={DASH} strokeWidth={0.6} strokeDasharray="2,3" />

      {/* ── Centreline ── */}
      <line x1={SHAFT_X0 - 5} y1={CY} x2={SHAFT_X1 + 5} y2={CY} stroke="#94a3b8" strokeWidth={0.6} strokeDasharray="10,4,2,4" />

      {/* ═══════════════════════════════════════════════════════════════
          DIMENSION ANNOTATIONS — matching standard drawing layout
      ═══════════════════════════════════════════════════════════════ */}

      {/* ── ABOVE THE NUT ── */}
      {/* A: total nut length — topmost, full span */}
      <HDim x1={NUT_X0} x2={NUT_X1} y={TOP_D - 30} yBase={TOP_D} label={`A = ${A}`} />

      {/* b: central engagement zone — second row */}
      <HDim x1={B_X0} x2={B_X1} y={TOP_D - 14} yBase={TOP_D} label={`b = ${b}`} />

      {/* w: left wiper width — third row, left side */}
      <HDim x1={W_L0} x2={W_L1} y={TOP_D - 14} yBase={TOP_D} label={`w=${w}`} />

      {/* w: right wiper width — third row, right side */}
      <HDim x1={W_R0} x2={W_R1} y={TOP_D - 14} yBase={TOP_D} label={`w=${w}`} />

      {/* ── BELOW THE NUT ── */}
      {/* a: end-relief zone, left — below */}
      <HDim x1={A_L0} x2={A_L1} y={BOT_D + 20} yBase={BOT_D} label={`a=${a}`} />
      {/* a: end-relief zone, right — below */}
      <HDim x1={A_R0} x2={A_R1} y={BOT_D + 20} yBase={BOT_D} label={`a=${a}`} />

      {/* ── RIGHT SIDE — vertical dims ── */}
      {/* D: nut OD, half (centreline to top) */}
      <VDim x={NUT_X1 + 22} xBase={NUT_X1} y1={CY} y2={TOP_D} label={`D=${D}`} side="right" />

      {/* H: full nut height (top to bottom) */}
      <VDim x={NUT_X1 + 42} xBase={NUT_X1} y1={TOP_D} y2={BOT_D} label={`H=${H}`} side="right" />

      {/* D2: bore half-height (centreline to bore top) */}
      <VDim x={NUT_X1 + 62} xBase={NUT_X1} y1={CY} y2={TOP_D2} label={`D2=${D2}`} side="right" />

      {/* Q: wiper groove depth (from D2 up to D — shown as radial step) */}
      <VDim x={NUT_X1 + 82} xBase={NUT_X1} y1={TOP_D} y2={TOP_D2} label={`Q=${Q}`} side="right" />

      {/* ── LEFT SIDE — shaft dims ── */}
      {/* d1: shaft OD (centreline to shaft top) */}
      <VDim x={SHAFT_X0 - 22} xBase={SHAFT_X0} y1={CY} y2={TOP_d1} label={`d1=${d1}`} side="left" />

      {/* d2: shaft root (centreline to thread root) */}
      <VDim x={SHAFT_X0 - 42} xBase={SHAFT_X0} y1={CY} y2={TOP_d2} label={`d2=${d2}`} side="left" />

      {/* D3: nut thread root — leader from bore line on left */}
      <Leader x1={NUT_X0} y1={TOP_D3} x2={NUT_X0 - 12} y2={TOP_D3 - 12} label={`D3=${D3}`} anchor="end" />

      {/* ═══════════════════════════════════════════════════════════════
          END VIEW (right panel)
      ═══════════════════════════════════════════════════════════════ */}
      <g>
        {/* Panel label */}
        <text x={EV_CX} y={EV_CY - EV_R - 18} textAnchor="middle" fontSize={8} fill={DASH} fontFamily="sans-serif">END VIEW</text>

        {/* Outer nut OD (D) */}
        <circle cx={EV_CX} cy={EV_CY} r={EV_R} fill={FILL_NUT} stroke={LINE} strokeWidth={1.5} />

        {/* D2 bore */}
        <circle cx={EV_CX} cy={EV_CY} r={(D2 / 2) * evS} fill="white" stroke={LINE} strokeWidth={0.9} strokeDasharray="4,2" />

        {/* D3 thread root */}
        <circle cx={EV_CX} cy={EV_CY} r={(D3 / 2) * evS} fill="none" stroke={DASH} strokeWidth={0.6} strokeDasharray="2,3" />

        {/* Shaft d1 */}
        <circle cx={EV_CX} cy={EV_CY} r={(d1 / 2) * evS} fill={FILL_SHAFT} stroke={LINE} strokeWidth={1} />

        {/* Crosshair */}
        <line x1={EV_CX - EV_R - 6} y1={EV_CY} x2={EV_CX + EV_R + 6} y2={EV_CY} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="8,3,2,3" />
        <line x1={EV_CX} y1={EV_CY - EV_R - 6} x2={EV_CX} y2={EV_CY + EV_R + 6} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="8,3,2,3" />

        {/* Labels for end view circles */}
        <text x={EV_CX + EV_R + 5} y={EV_CY - 5} fontSize={8} fill={DIM} fontFamily="monospace">D</text>
        <text x={EV_CX + (D2 / 2) * evS + 4} y={EV_CY + 10} fontSize={8} fill={DIM} fontFamily="monospace">D2</text>
        <text x={EV_CX - 6} y={EV_CY - (d1 / 2) * evS - 4} fontSize={8} fill={DIM} fontFamily="monospace" textAnchor="middle">d1</text>
      </g>

      {/* ── Title bar ── */}
      <text x={8} y={SVG_H - 8} fontSize={8.5} fill={DASH} fontFamily="monospace">
        SRS – C  |  Ø{dims._dia}×{dims._lead} mm  |  All dimensions in mm
      </text>
    </svg>
  );
}