import { base44 } from "@/api/base44Client";
import { getDims } from "./srsCDimensions";
import { getTechData } from "./srsCTechnicalData";

const SECTION_LABELS = {
  trsType: { title: "TRS Type", map: { SRS: "Standard Roller Screw", URS: "Ultra-Capacitive Roller Screw", IRS: "Inverted Roller Screw", DRS: "Differential Roller Screw", RRS: "Recirculating Roller Screw" } },
  hand: { title: "Hand", map: { R: "Right", L: "Left (on request)" } },
  nutType: { title: "Nut Type", map: { C: "Cylindrical", F: "Centered flange", P: "Off-centered flange" } },
  constraint: { title: "Constraints", map: { "+": "With backlash", "0": "Zero backlash", "-": "With preload" } },
  leadPrecision: { title: "Lead Precision", map: { G5: "Standard", G3: "On request", G1: "On request" } },
  flangeOrientation: { title: "Flanged Nut Orientation", map: { S: "Toward shorter end", L: "Toward longer end", "-": "Identical ends / cylindrical" } },
  shaftEnd: { title: "Shaft Machined End", map: { Z: "Per customer drawing" } },
  wipers: { title: "Wipers", map: { H: "With wipers", T: "Without wipers", X: "No wiper recesses (SRS)" } },
  lubricant: { title: "Lubricant", map: { G: "Grease", O: "Oil", D: "Dry" } },
};

export function buildPartNumberString(config) {
  const dia = config.diameter ? String(config.diameter).padStart(3, "0") : "___";
  const lead = config.lead ? String(config.lead).padStart(2, "0") : "__";
  const constraint = config.constraint === "+" ? "(+)" : config.constraint === "0" ? "(0)" : config.constraint === "-" ? "(-)" : "(_)";

  return `${config.trsType || "___"} - ${dia} x${lead} ${config.hand || "_"} - ${config.nutType || "_"}${constraint} ${config.threadedLength || "___"}/${config.totalLength || "___"} - ${config.leadPrecision || "__"} - ${config.flangeOrientation || "_"} - ${config.shaftEnd || "_"} - ${config.wipers || "_"} - ${config.lubricant || "_"}`;
}

export async function generatePdf(config, accountName, salesperson) {
  const partNumber = buildPartNumberString(config);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const rows = [];

  rows.push({ label: "TRS Type", code: config.trsType, desc: SECTION_LABELS.trsType.map[config.trsType] });
  rows.push({ label: "Nominal Diameter × Lead", code: `${config.diameter || "—"} × ${config.lead || "—"} mm`, desc: "" });
  rows.push({ label: "Hand", code: config.hand, desc: SECTION_LABELS.hand.map[config.hand] });
  rows.push({ label: "Nut Type", code: config.nutType, desc: SECTION_LABELS.nutType.map[config.nutType] });
  rows.push({ label: "Constraints", code: config.constraint, desc: SECTION_LABELS.constraint.map[config.constraint] });
  rows.push({ label: "Threaded / Total Length", code: `${config.threadedLength || "—"} / ${config.totalLength || "—"} mm`, desc: "" });
  rows.push({ label: "Lead Precision", code: config.leadPrecision, desc: SECTION_LABELS.leadPrecision.map[config.leadPrecision] });
  rows.push({ label: "Flanged Nut Orientation", code: config.flangeOrientation, desc: SECTION_LABELS.flangeOrientation.map[config.flangeOrientation] });
  rows.push({ label: "Shaft Machined End", code: config.shaftEnd, desc: SECTION_LABELS.shaftEnd.map[config.shaftEnd] });
  rows.push({ label: "Wipers", code: config.wipers, desc: SECTION_LABELS.wipers.map[config.wipers] });
  rows.push({ label: "Lubricant", code: config.lubricant, desc: SECTION_LABELS.lubricant.map[config.lubricant] });

  const tableRows = rows.map(r => `
    <tr>
      <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; font-weight:500; color:#475569; font-size:13px;">${r.label}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; font-family:monospace; font-weight:700; color:#0f172a; font-size:14px;">${r.code || "—"}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px;">${r.desc || ""}</td>
    </tr>
  `).join("");

  const html = `
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin:0; padding:40px; background:#fff; color:#0f172a;">
      <div style="max-width:700px; margin:0 auto;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #0d9488;">
          <div>
            <div style="font-size:22px; font-weight:700; color:#0d9488;">Roller Screw Configuration</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">Part Number Specification Document</div>
          </div>
          <div style="text-align:right; font-size:12px; color:#94a3b8;">
            <div>${today}</div>
          </div>
        </div>

        <div style="display:flex; gap:40px; margin-bottom:28px;">
          <div>
            <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Account</div>
            <div style="font-size:15px; font-weight:600; margin-top:2px;">${accountName}</div>
          </div>
          <div>
            <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Salesperson</div>
            <div style="font-size:15px; font-weight:600; margin-top:2px;">${salesperson}</div>
          </div>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
          <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Part Number</div>
          <div style="font-size:20px; font-family:monospace; font-weight:800; color:#0f172a; letter-spacing:1px;">${partNumber}</div>
        </div>

        ${(() => {
          if (config.trsType !== "SRS" || config.nutType !== "C") return "";
          const dims = getDims(config.diameter, config.lead);
          if (!dims) {
            return `<div style="margin-bottom:28px; text-align:center;">
              <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Assembly Drawing — SRS / Cylindrical Nut</div>
              <img src="https://media.base44.com/images/public/699fbdce49c5d29ff8598031/630672c1c_image.png" style="max-width:100%; border:1px solid #e2e8f0; border-radius:8px;" />
            </div>`;
          }
          const dimRows = [
            ["d1","d2","D","A","w","a","b","H","Q","D2","D3"],
            [dims.d1,dims.d2,dims.D,dims.A,dims.w,dims.a,dims.b,dims.H,dims.Q,dims.D2,dims.D3]
          ];
          return `<div style="margin-bottom:28px;">
            <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Dimensions — SRS Ø${config.diameter}×${config.lead} / Cylindrical Nut (mm)</div>
            <img src="https://media.base44.com/images/public/699fbdce49c5d29ff8598031/630672c1c_image.png" style="max-width:100%; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:12px;" />
            <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; font-size:12px;">
              <thead><tr style="background:#f1f5f9;">
                ${dimRows[0].map(h => `<th style="padding:7px 10px; text-align:center; color:#64748b; font-family:monospace;">${h}</th>`).join("")}
              </tr></thead>
              <tbody><tr>
                ${dimRows[1].map(v => `<td style="padding:7px 10px; text-align:center; font-family:monospace; font-weight:700; color:#003494;">${v}</td>`).join("")}
              </tr></tbody>
            </table>
          </div>`;
        })()}

        ${(() => {
          if (config.trsType !== "SRS" || config.nutType !== "C") return "";
          const tech = getTechData(config.diameter, config.lead);
          if (!tech) return "";
          const techFields = [
            { label: "N", unit: "—", value: tech.N, desc: "Number of roller sets" },
            { label: "Ca", unit: "kN", value: tech.Ca, desc: "Dynamic axial load capacity" },
            { label: "Ca0", unit: "kN", value: tech.Ca0, desc: "Static axial load capacity" },
            { label: "η", unit: "—", value: tech.h, desc: "Drive efficiency (screw to nut)" },
            { label: "η'", unit: "—", value: tech.hPrime, desc: "Back-drive efficiency (nut to screw)" },
            { label: "S₀", unit: "—", value: tech.S0, desc: "Static safety factor at Ca0" },
            { label: "T₀", unit: "Nm", value: tech.T0, desc: "No-load starting torque" },
            { label: "mₙ", unit: "kg", value: tech.mn, desc: "Nut assembly mass" },
            { label: "mₛ", unit: "kg/m", value: tech.ms, desc: "Shaft linear mass (per metre)" },
            { label: "Iₛ", unit: "kg·mm²/m", value: tech.Is, desc: "Shaft polar moment of inertia (per metre)" },
            { label: "Iₙₙ", unit: "kg·mm²", value: tech.Inn, desc: "Nut moment of inertia about screw axis" },
            { label: "Iₙₛ", unit: "kg·mm²", value: tech.Ins, desc: "Nut moment of inertia about transverse axis" },
            { label: "Zₙ", unit: "mL", value: tech.Zn, desc: "Nut lubrication quantity" },
            { label: "Zₛ", unit: "mL/m", value: tech.Zs, desc: "Shaft lubrication quantity (per metre)" },
          ];
          const techRows = techFields.map((f, i) => `
            <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
              <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; font-family:monospace; font-weight:700; font-size:14px; color:#003494; width:80px;">${f.label}</td>
              <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; color:#475569; font-size:13px;">${f.desc}</td>
              <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; font-family:monospace; font-weight:700; font-size:15px; color:#0f172a; text-align:right; white-space:nowrap;">${f.value}</td>
              <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; font-size:12px; color:#94a3b8; text-align:left; white-space:nowrap; width:90px;">${f.unit}</td>
            </tr>
          `).join("");
          return `<div style="margin-bottom:28px;">
            <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #003494;">Technical Specifications — SRS Ø${config.diameter}×${config.lead} / C</div>
            <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
              <thead>
                <tr style="background:#003494;">
                  <th style="padding:10px 14px; text-align:left; font-size:11px; color:#ffffff; text-transform:uppercase; letter-spacing:0.5px; font-family:monospace;">Symbol</th>
                  <th style="padding:10px 14px; text-align:left; font-size:11px; color:#ffffff; text-transform:uppercase; letter-spacing:0.5px;">Description</th>
                  <th style="padding:10px 14px; text-align:right; font-size:11px; color:#ffffff; text-transform:uppercase; letter-spacing:0.5px;">Value</th>
                  <th style="padding:10px 14px; text-align:left; font-size:11px; color:#ffffff; text-transform:uppercase; letter-spacing:0.5px;">Unit</th>
                </tr>
              </thead>
              <tbody>${techRows}</tbody>
            </table>
          </div>`;
        })()}

        <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:10px 14px; text-align:left; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Parameter</th>
              <th style="padding:10px 14px; text-align:left; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Code</th>
              <th style="padding:10px 14px; text-align:left; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Description</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="margin-top:32px; padding-top:16px; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; color:#94a3b8;">
          Generated by Roller Screw Part Number Builder • ${today}
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}