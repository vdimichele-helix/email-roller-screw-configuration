import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { getLoadCapacity } from "./loadCapacityData";

export default function PartNumberPreview({ config }) {
  const [copied, setCopied] = useState(false);

  const buildPartNumber = () => {
    const parts = [];
    parts.push(config.trsType || "___");
    const dia = config.diameter ? String(config.diameter).padStart(3, "0") : "___";
    const lead = config.lead ? `x${String(config.lead).padStart(2, "0")}` : "x__";
    parts.push(`${dia}${lead}`);
    parts.push(config.hand || "_");
    const nut = config.nutType || "_";
    const constraint = config.constraint === "+" ? "(+)" : config.constraint === "0" ? "(0)" : config.constraint === "-" ? "(-)" : "(_)";
    parts.push(`${nut}${constraint}`);
    const tLen = config.threadedLength || "___";
    const totLen = config.totalLength || "___";
    parts.push(`${tLen}/${totLen}`);
    parts.push(config.leadPrecision || "__");
    parts.push(config.flangeOrientation || "_");
    parts.push(config.shaftEnd || "_");
    parts.push(config.wipers || "_");
    parts.push(config.lubricant || "_");
    return parts.join("-");
  };

  const partNumber = buildPartNumber();
  const loadCapacity = getLoadCapacity(config.diameter, config.lead);

  const handleCopy = () => {
    navigator.clipboard.writeText(partNumber.replace(/ /g, "").replace(/-/g, " - "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSections = 11;
  let completed = 0;
  if (config.trsType) completed++;
  if (config.diameter && config.lead) completed++;
  if (config.hand) completed++;
  if (config.nutType) completed++;
  if (config.constraint) completed++;
  if (config.threadedLength && config.totalLength) completed++;
  if (config.leadPrecision) completed++;
  if (config.flangeOrientation) completed++;
  if (config.shaftEnd) completed++;
  if (config.wipers) completed++;
  if (config.lubricant) completed++;

  const progress = (completed / totalSections) * 100;

  return (
    <div className="bg-white rounded-[8px] border-2 border-[#cbcdce] shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Progress bar */}
      <div className="h-1 bg-[#cbcdce]">
        <div 
          className="h-full bg-[#003494] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-[#939598] uppercase tracking-widest">
            Part Number
          </span>
          <span className="text-xs text-[#939598]">
            {completed}/{totalSections} complete
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <code className="block text-lg font-mono font-bold text-[#000000] tracking-tight leading-tight break-all">
              {partNumber}
            </code>
            {(config.diameter || config.lead || loadCapacity) && (
              <div className="flex flex-col gap-2 mt-4 text-xs text-[#939598]">
                {config.diameter && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#003494] font-semibold">Ø</span>
                    <span>{config.diameter}mm diameter</span>
                  </div>
                )}
                {config.lead && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#003494] font-semibold">×</span>
                    <span>{config.lead}mm lead</span>
                  </div>
                )}
                {loadCapacity && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#cbcdce]">
                    <span className="font-semibold text-[#003494]">{loadCapacity}kN</span>
                    <span>capacity</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="h-10 w-10 shrink-0 border-[#cbcdce] hover:bg-[#73b2e6]/15 hover:border-[#003494] text-[#939598] transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[#003494]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}