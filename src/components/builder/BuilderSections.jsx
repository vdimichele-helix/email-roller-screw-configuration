import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Paperclip, X } from "lucide-react";
import ConfigSection from "./ConfigSection";
import SelectorOption from "./SelectorOption";
import { DIAMETERS, getAvailableLeads, getLoadCapacity } from "./loadCapacityData";
import SRSCTechPanel from "./SRSCTechPanel";

export default function BuilderSections({ config, setConfig, drawingFile, setDrawingFile }) {
  const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
  const fileInputRef = useRef(null);
  
  const availableLeads = getAvailableLeads(config.diameter);
  const loadCapacity = getLoadCapacity(config.diameter, config.lead);
  
  // Reset lead if diameter changes and current lead is not available
  React.useEffect(() => {
    if (config.diameter && config.lead && !availableLeads.includes(parseInt(config.lead))) {
      update("lead", "");
    }
  }, [config.diameter]);

  // Auto-select "Z" for shaftEnd on mount
  React.useEffect(() => {
    if (!config.shaftEnd) {
      update("shaftEnd", "Z");
    }
  }, []);

  return (
    <div className="space-y-5">
      {/* 1. TRS Type */}
      <ConfigSection 
        title="TRS Type" 
        stepNumber={1} 
        isComplete={!!config.trsType}
        tooltip="Select the roller screw type for your application"
      >
        <SelectorOption
          value={config.trsType}
          onChange={(v) => update("trsType", v)}
          columns={3}
          options={[
            { value: "SRS", code: "SRS", label: "Standard Roller Screw" },
            { value: "URS", code: "URS", label: "Ultra-Capacitive" },
            { value: "IRS", code: "IRS", label: "Inverted Roller Screw" },
            { value: "DRS", code: "DRS", label: "Differential Roller Screw" },
            { value: "RRS", code: "RRS", label: "Recirculating Roller Screw" },
          ]}
        />
      </ConfigSection>

      {/* 2. Nominal Diameter x Lead */}
      <ConfigSection
        title="Nominal Diameter × Lead (mm)"
        stepNumber={2}
        isComplete={!!config.diameter && !!config.lead}
        tooltip="Select diameter and compatible lead combination"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-sm font-semibold text-[#000000] mb-2 block">Diameter (mm)</Label>
              <Select value={config.diameter} onValueChange={(v) => update("diameter", v)}>
                <SelectTrigger className="h-10 text-sm font-mono bg-white border-[#cbcdce] focus:border-[#003494]">
                  <SelectValue placeholder="Select diameter" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {DIAMETERS.map(d => (
                    <SelectItem key={d} value={String(d)} className="font-mono">
                      {d} mm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-slate-300 font-mono text-lg mt-5">×</span>
            <div className="flex-1">
              <Label className="text-sm font-semibold text-[#000000] mb-2 block">Lead (mm)</Label>
              <Select 
                value={config.lead} 
                onValueChange={(v) => update("lead", v)}
                disabled={!config.diameter}
              >
                <SelectTrigger className="h-10 text-sm font-mono bg-white border-[#cbcdce] focus:border-[#003494] disabled:bg-[#cbcdce]/20">
                  <SelectValue placeholder={config.diameter ? "Select lead" : "Select diameter first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableLeads.map(l => (
                    <SelectItem key={l} value={String(l)} className="font-mono">
                      {l} mm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loadCapacity ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-[8px] bg-[#73b2e6]/15 border border-[#003494]">
              <div className="flex-1">
                <div className="text-xs text-[#003494] font-semibold">Dynamic Load Capacity</div>
                <div className="text-lg font-bold text-[#003494] font-mono">{loadCapacity} kN</div>
              </div>
            </div>
          ) : config.diameter && config.lead ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-[8px] bg-amber-50 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-xs text-amber-700 font-medium">Invalid diameter × lead combination</span>
            </div>
          ) : null}
        </div>
      </ConfigSection>

      {/* 3. Hand */}
      <ConfigSection title="Hand" stepNumber={3} isComplete={!!config.hand} tooltip="Direction of thread helix">
        <SelectorOption
          value={config.hand}
          onChange={(v) => update("hand", v)}
          columns={2}
          options={[
            { value: "R", code: "R", label: "Right hand" },
            { value: "L", code: "L", label: "Left hand (on request)" },
          ]}
        />
      </ConfigSection>

      {/* 4. Nut Type */}
      <ConfigSection title="Nut Type" stepNumber={4} isComplete={!!config.nutType} tooltip="Type of nut housing configuration">
        <SelectorOption
          value={config.nutType}
          onChange={(v) => update("nutType", v)}
          columns={3}
          options={[
            { value: "C", code: "C", label: "Cylindrical" },
            { value: "F", code: "F", label: "Centered flange" },
            { value: "P", code: "P", label: "Off-centered flange" },
          ]}
        />
      </ConfigSection>

      {/* Assembly Drawing Preview */}
      {config.trsType === "SRS" && config.nutType === "C" && (
        <div className="rounded-[8px] border-2 border-[#cbcdce] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#939598] mb-3">
            Assembly Drawing — SRS / Cylindrical Nut
          </p>
          <img
            src="https://media.base44.com/images/public/699fbdce49c5d29ff8598031/630672c1c_image.png"
            alt="SRS Cylindrical Nut Assembly Drawing"
            className="w-full rounded-[6px]"
          />
        </div>
      )}

      {/* Technical Specs Panel */}
      {config.trsType === "SRS" && config.nutType === "C" && config.diameter && config.lead && (
        <SRSCTechPanel diameter={config.diameter} lead={config.lead} />
      )}

      {/* 5. Constraints */}
      <ConfigSection title="Constraints" stepNumber={5} isComplete={!!config.constraint} tooltip="Backlash and preload configuration">
        <SelectorOption
          value={config.constraint}
          onChange={(v) => update("constraint", v)}
          columns={3}
          options={[
            { value: "+", code: "+", label: "With backlash" },
            { value: "0", code: "0", label: "Zero backlash" },
            { value: "-", code: "–", label: "With preload" },
          ]}
        />
      </ConfigSection>

      {/* 6. Threaded / Total Length */}
      <ConfigSection
        title="Threaded Length / Total Length (mm)"
        stepNumber={6}
        isComplete={!!config.threadedLength && !!config.totalLength}
        tooltip="Threaded and overall shaft lengths"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-sm font-semibold text-[#000000] mb-2 block">Threaded length</Label>
            <Input
              type="number"
              min={1}
              placeholder="360"
              value={config.threadedLength || ""}
              onChange={(e) => update("threadedLength", e.target.value)}
              className="h-10 text-sm font-mono bg-white border-[#cbcdce] focus:border-[#003494] focus:bg-white"
            />
          </div>
          <span className="text-[#cbcdce] font-mono text-lg mt-5">/</span>
          <div className="flex-1">
            <Label className="text-sm font-semibold text-[#000000] mb-2 block">Total length</Label>
            <Input
              type="number"
              min={1}
              placeholder="420"
              value={config.totalLength || ""}
              onChange={(e) => update("totalLength", e.target.value)}
              className="h-10 text-sm font-mono bg-white border-[#cbcdce] focus:border-[#003494] focus:bg-white"
            />
          </div>
        </div>
      </ConfigSection>

      {/* 7. Lead Precision */}
      <ConfigSection title="Lead Precision" stepNumber={7} isComplete={!!config.leadPrecision} tooltip="Shaft lead accuracy grade">
        <SelectorOption
          value={config.leadPrecision}
          onChange={(v) => update("leadPrecision", v)}
          columns={3}
          options={[
            { value: "G5", code: "G5", label: "Standard lead precision" },
            { value: "G3", code: "G3", label: "Precision on request" },
            { value: "G1", code: "G1", label: "Precision on request" },
          ]}
        />
      </ConfigSection>

      {/* 8. Flanged Nut Orientation */}
      <ConfigSection
        title="Flanged Nut Orientation"
        stepNumber={8}
        isComplete={!!config.flangeOrientation}
        tooltip="Orientation of the nut ground OD relative to machined shaft ends"
      >
        <SelectorOption
          value={config.flangeOrientation}
          onChange={(v) => update("flangeOrientation", v)}
          columns={3}
          options={[
            { value: "S", code: "S", label: "Toward shorter machined end" },
            { value: "L", code: "L", label: "Toward longer machined end" },
            { value: "-", code: "–", label: "Identical ends / cylindrical" },
          ]}
        />
      </ConfigSection>

      {/* 9. Shaft Machined End */}
      <ConfigSection title="Shaft Machined End" stepNumber={9} isComplete={!!config.shaftEnd} tooltip="Machined end specification per drawing">
        <SelectorOption
          value={config.shaftEnd}
          onChange={(v) => update("shaftEnd", v)}
          columns={2}
          options={[
            { value: "Z", code: "Z", label: "According to customer drawing" },
          ]}
        />
        {/* Drawing PDF Upload */}
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setDrawingFile(file);
              e.target.value = "";
            }}
          />
          {drawingFile ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[#003494]/10 border border-[#003494]/30">
              <Paperclip className="h-4 w-4 text-[#003494] shrink-0" />
              <span className="text-sm text-[#003494] font-medium truncate flex-1">{drawingFile.name}</span>
              <button
                onClick={() => setDrawingFile(null)}
                className="text-[#939598] hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-[6px] border border-dashed border-[#cbcdce] hover:border-[#003494] hover:bg-[#003494]/5 transition-colors text-sm text-[#939598] hover:text-[#003494]"
            >
              <Paperclip className="h-4 w-4" />
              Upload customer drawing (.pdf)
            </button>
          )}
        </div>
      </ConfigSection>

      {/* 10. Wipers */}
      <ConfigSection title="Wipers" stepNumber={10} isComplete={!!config.wipers} tooltip="Wiper seal configuration for the nut">
        <SelectorOption
          value={config.wipers}
          onChange={(v) => update("wipers", v)}
          columns={3}
          options={[
            { value: "H", code: "H", label: "With wipers" },
            { value: "T", code: "T", label: "Without wipers" },
            { value: "X", code: "X", label: "No wiper recesses (SRS only)" },
          ]}
        />
      </ConfigSection>

      {/* 11. Lubricant */}
      <ConfigSection title="Lubricant" stepNumber={11} isComplete={!!config.lubricant} tooltip="Lubrication type for the assembly">
        <SelectorOption
          value={config.lubricant}
          onChange={(v) => update("lubricant", v)}
          columns={3}
          options={[
            { value: "G", code: "G", label: "Grease" },
            { value: "O", code: "O", label: "Oil" },
            { value: "D", code: "D", label: "Dry" },
          ]}
        />
      </ConfigSection>
    </div>
  );
}