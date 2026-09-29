import React, { useState, useCallback } from "react";
import Navigation from "@/components/layout/Navigation";
import HeaderSection from "@/components/builder/HeaderSection";
import PartNumberPreview from "@/components/builder/PartNumberPreview";
import BuilderSections from "@/components/builder/BuilderSections";
import { generatePdf, buildPartNumberString } from "@/components/builder/PdfGenerator";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const INITIAL_CONFIG = {
  trsType: "",
  diameter: "",
  lead: "",
  hand: "",
  nutType: "",
  constraint: "",
  threadedLength: "",
  totalLength: "",
  leadPrecision: "",
  flangeOrientation: "",
  shaftEnd: "",
  wipers: "",
  lubricant: "",
};

export default function PartNumberBuilder() {
  const [accountName, setAccountName] = useState("");
  const [salesperson, setSalesperson] = useState("");
  const [yourName, setYourName] = useState("");
  const [yourEmail, setYourEmail] = useState("");
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [drawingFile, setDrawingFile] = useState(null);

  const allComplete =
    config.trsType &&
    config.diameter && config.lead &&
    config.hand &&
    config.nutType &&
    config.constraint &&
    config.threadedLength && config.totalLength &&
    config.leadPrecision &&
    config.flangeOrientation &&
    config.shaftEnd &&
    config.wipers &&
    config.lubricant;

  const canPublish = accountName.trim() && salesperson && allComplete;
  const canSubmitQuote = accountName.trim() && yourName.trim() && yourEmail.trim() && allComplete;

  const handleReset = useCallback(() => {
    setConfig(INITIAL_CONFIG);
    setAccountName("");
    setSalesperson("");
    setYourName("");
    setYourEmail("");
    setDrawingFile(null);
    toast.success("Builder reset");
  }, []);

  const handleSubmitQuote = useCallback(async () => {
    if (!canSubmitQuote) {
      toast.error("Please fill in all required fields and complete all sections");
      return;
    }
    const partNumber = buildPartNumberString(config);
    toast.loading("Submitting quote request...", { id: "quote" });
    try {
      let drawingUrl = null;
      if (drawingFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: drawingFile });
        drawingUrl = file_url;
      }
      const res = await base44.functions.invoke('submitQuote', {
        companyName: accountName,
        yourName,
        yourEmail,
        partNumber,
        drawingUrl,
        config,
      });
      if (res.data?.success) {
        toast.success("Thank you for your request. Our Helix Application Engineers will review your design and contact you shortly.", { id: "quote" });
      } else {
        toast.error("There is an error. Please reach out to our Application Engineers at sales@helixlinear.com.", { id: "quote" });
      }
    } catch (e) {
      toast.error("There is an error. Please reach out to our Application Engineers at sales@helixlinear.com.", { id: "quote" });
    }
  }, [canSubmitQuote, config, accountName, yourName, yourEmail, drawingFile]);

  const handlePublish = useCallback(async () => {
    if (!canPublish) {
      toast.error("Please complete all sections before publishing");
      return;
    }

    toast.loading("Generating PDF...", { id: "pdf" });

    const html = await generatePdf(config, accountName, salesperson);
    const partNumber = buildPartNumberString(config);

    // Save configuration
    await base44.entities.Configuration.create({
      account_name: accountName,
      salesperson: salesperson,
      part_number: partNumber,
      config_data: config,
    });

    // Open HTML in new tab for printing
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    
    toast.success("PDF generated — use Print (Ctrl+P) to save", { id: "pdf" });
  }, [canPublish, config, accountName, salesperson]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <HeaderSection
        accountName={accountName}
        setAccountName={setAccountName}
        salesperson={salesperson}
        setSalesperson={setSalesperson}
        yourName={yourName}
        setYourName={setYourName}
        yourEmail={yourEmail}
        setYourEmail={setYourEmail}
        onPublish={handlePublish}
        onReset={handleReset}
      />

      {/* Main Content */}
      <div className="bg-[#cbcdce]/15">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-3 gap-12">
            {/* Left sidebar - Preview (Sticky) */}
            <div className="col-span-1">
              <div className="sticky top-[100px]">
                <PartNumberPreview config={config} />
              </div>
            </div>

            {/* Right content - Builder sections */}
            <div className="col-span-2 space-y-6">
              <BuilderSections config={config} setConfig={setConfig} drawingFile={drawingFile} setDrawingFile={setDrawingFile} />
              <div className="pt-2">
                <Button
                  onClick={handleSubmitQuote}
                  disabled={!canSubmitQuote}
                  className="w-full h-12 bg-[#27ae60] hover:bg-[#219150] text-white rounded-[6px] text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}