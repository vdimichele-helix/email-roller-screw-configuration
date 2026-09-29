import React from "react";
import { getTechData } from "./srsCTechnicalData";

export default function SRSCTechPanel({ diameter, lead }) {
  const data = getTechData(diameter, lead);
  if (!data) return null;

  const rows = [
    { label: "N", unit: "—", value: data.N, desc: "Number of roller sets" },
    { label: "Ca", unit: "kN", value: data.Ca, desc: "Dynamic load capacity" },
    { label: "Ca0", unit: "kN", value: data.Ca0, desc: "Static load capacity" },
    { label: "η", unit: "—", value: data.h, desc: "Drive efficiency" },
    { label: "η'", unit: "—", value: data.hPrime, desc: "Back-drive efficiency" },
    { label: "S₀", unit: "—", value: data.S0, desc: "Static safety factor" },
    { label: "T₀", unit: "Nm", value: data.T0, desc: "Starting torque (no load)" },
    { label: "mₙ", unit: "kg", value: data.mn, desc: "Nut mass" },
    { label: "mₛ", unit: "kg/m", value: data.ms, desc: "Shaft mass per metre" },
    { label: "Iₛ", unit: "kg·mm²/m", value: data.Is, desc: "Shaft polar inertia / m" },
    { label: "Iₙₙ", unit: "kg·mm²", value: data.Inn, desc: "Nut axial inertia" },
    { label: "Iₙₛ", unit: "kg·mm²", value: data.Ins, desc: "Nut polar inertia" },
    { label: "Zₙ", unit: "mL", value: data.Zn, desc: "Nut lubrication volume" },
    { label: "Zₛ", unit: "mL/m", value: data.Zs, desc: "Shaft lubrication volume / m" },
  ];

  return (
    <div className="rounded-[8px] border-2 border-[#003494] bg-white overflow-hidden">
      <div className="bg-[#003494] px-4 py-2.5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-white">
          Technical Specifications — SRS Ø{diameter}×{lead} / C
        </p>
        <span className="text-[#73b2e6] text-xs font-mono">SRS {String(diameter).padStart(3,"0")}x{String(lead).padStart(2,"0")} R – C</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-[#cbcdce]">
        {rows.map(({ label, unit, value, desc }) => (
          <div key={label} className="bg-white px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-1 mb-0.5">
              <span className="text-xs font-bold text-[#000000] font-mono">{label}</span>
              <span className="text-[10px] text-[#939598] font-mono">{unit}</span>
            </div>
            <div className="text-base font-bold text-[#003494] font-mono leading-tight">{value}</div>
            <div className="text-[10px] text-[#939598] leading-tight mt-0.5">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}