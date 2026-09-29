import React from "react";
import { cn } from "@/lib/utils";

export default function SelectorOption({ options, value, onChange, columns = 3 }) {
  return (
    <div className={cn(
      "grid gap-3",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-2 sm:grid-cols-3",
      columns === 4 && "grid-cols-2 sm:grid-cols-4",
      columns === 5 && "grid-cols-2 sm:grid-cols-5"
    )}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-start gap-3 p-4 rounded-[8px] border-2 text-left transition-all duration-150",
            value === opt.value
              ? "border-[#003494] bg-[#73b2e6]/15 shadow-md"
              : "border-[#cbcdce] bg-white hover:border-[#73b2e6] hover:bg-[#cbcdce]/10 hover:shadow-sm"
          )}
        >
          <div className={cn(
            "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
            value === opt.value
              ? "border-[#003494]"
              : "border-[#cbcdce]"
          )}>
            {value === opt.value && (
              <div className="h-2.5 w-2.5 rounded-full bg-[#003494]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#000000] font-mono">{opt.code}</div>
            <div className="text-xs text-[#939598] leading-tight mt-0.5">{opt.label}</div>
          </div>
        </button>
      ))}
    </div>
  );
}