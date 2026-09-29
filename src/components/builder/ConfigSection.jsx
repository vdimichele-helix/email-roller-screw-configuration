import React, { useState } from "react";
import { ChevronDown, CheckCircle2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function ConfigSection({ title, stepNumber, isComplete, tooltip, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn(
      "bg-white rounded-[8px] border-2 transition-all duration-200",
      isComplete ? "border-[#003494] shadow-md" : "border-[#cbcdce] shadow-sm",
      "hover:shadow-lg"
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-[#cbcdce]/10 transition-colors"
      >
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors",
          isComplete 
            ? "bg-[#003494] text-white" 
            : "bg-[#cbcdce] text-[#939598]"
        )}>
          {isComplete ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
        </div>

        <span className="text-base font-semibold text-[#000000] flex-1">{title}</span>

        {tooltip && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span onClick={(e) => e.stopPropagation()} className="cursor-help">
                  <Info className="h-4 w-4 text-[#939598] hover:text-[#000000] transition-colors" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <ChevronDown className={cn(
          "h-5 w-5 text-[#939598] transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2">
          <div className="border-t-2 border-[#cbcdce] pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}