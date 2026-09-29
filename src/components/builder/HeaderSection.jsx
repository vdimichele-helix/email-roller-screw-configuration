import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw } from "lucide-react";

const SALESPEOPLE = [
"Christopher Nook",
"Greg Koenig",
"Michelle Fellows",
"Kerry Bronco",
"Hide Araki",
"Rich Maxon"];


export default function HeaderSection({ accountName, setAccountName, salesperson, setSalesperson, yourName, setYourName, yourEmail, setYourEmail, onReset }) {
  return (
    <div className="bg-white border-b border-[#cbcdce]">
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Headline Section */}
        <div className="mb-8 max-w-3xl">
          <h1 className="text-4xl font-bold text-[#000000] mb-4 leading-tight">
            Configure Your Roller Screw
          </h1>
          <p className="text-base text-[#939598] leading-relaxed">
            Build precise part specifications with our interactive configuration tool. Enter your account details and customize each parameter to generate production-ready documentation.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#cbcdce]/20 rounded-[8px] border-2 border-[#cbcdce] p-3 mb-0">
          <h2 className="text-sm font-semibold mb-2 uppercase tracking-widest text-[#939598]">Order Information</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-[#000000] mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter company name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="h-9 text-sm bg-white border-[#cbcdce] focus:border-[#003494] focus:ring-2 focus:ring-[#73b2e6]/20 rounded-[6px]" />
              
            </div>

            <div className="hidden">
              <label className="block text-xs font-semibold text-[#000000] mb-1.5 hidden">
                Salesperson <span className="text-red-500">*</span>
              </label>
              <Select value={salesperson} onValueChange={setSalesperson}>
                <SelectTrigger className="h-9 text-sm bg-white border-[#cbcdce] focus:border-[#003494] rounded-[6px] hidden">
                  <SelectValue placeholder="Select salesperson" />
                </SelectTrigger>
                <SelectContent>
                  {SALESPEOPLE.map((sp) =>
                  <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-[#000000] mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter your name"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                className="h-9 text-sm bg-white border-[#cbcdce] focus:border-[#003494] focus:ring-2 focus:ring-[#73b2e6]/20 rounded-[6px]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#000000] mb-1.5">
                Your Email <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter your email"
                value={yourEmail}
                onChange={(e) => setYourEmail(e.target.value)}
                className="h-9 text-sm bg-white border-[#cbcdce] focus:border-[#003494] focus:ring-2 focus:ring-[#73b2e6]/20 rounded-[6px]" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onReset}
              className="h-9 border-[#cbcdce] text-[#000000] hover:bg-[#cbcdce]/20 rounded-[6px] px-6 text-sm font-semibold transition-colors">
              
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>


          </div>
        </div>
      </div>
    </div>);

}