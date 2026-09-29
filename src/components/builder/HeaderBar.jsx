import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, RotateCcw } from "lucide-react";

const SALESPEOPLE = [
  "Alex Thompson",
  "Maria Garcia",
  "James Wilson",
  "Sarah Chen",
  "Robert Kim",
  "Lisa Patel"
];

export default function HeaderBar({ accountName, setAccountName, salesperson, setSalesperson, onPublish, onReset, canPublish }) {
  return (
    <div className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">RS</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 leading-tight">Roller Screw</h1>
              <p className="text-[11px] text-slate-400 leading-tight">Part Number Builder</p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2.5 w-full sm:w-auto">
            <Input
              placeholder="Account Name *"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="h-9 text-sm bg-slate-50 border-slate-200 focus:bg-white max-w-[200px]"
            />
            <Select value={salesperson} onValueChange={setSalesperson}>
              <SelectTrigger className="h-9 text-sm bg-slate-50 border-slate-200 max-w-[180px]">
                <SelectValue placeholder="Salesperson *" />
              </SelectTrigger>
              <SelectContent>
                {SALESPEOPLE.map(sp => (
                  <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5 ml-auto">
              <Button variant="ghost" size="sm" onClick={onReset} className="h-9 text-slate-500 hover:text-slate-700">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
              <Button 
                size="sm" 
                onClick={onPublish} 
                disabled={!canPublish}
                className="h-9 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Publish PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}