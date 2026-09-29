import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const { companyName, yourName, yourEmail, partNumber, drawingUrl, config } = await req.json();

    if (!companyName || !yourName || !yourEmail || !partNumber) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

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

    const selectionRows = config ? [
      ["TRS Type", config.trsType, SECTION_LABELS.trsType.map[config.trsType]],
      ["Nominal Diameter × Lead", `${config.diameter || "—"} × ${config.lead || "—"} mm`, ""],
      ["Hand", config.hand, SECTION_LABELS.hand.map[config.hand]],
      ["Nut Type", config.nutType, SECTION_LABELS.nutType.map[config.nutType]],
      ["Constraints", config.constraint, SECTION_LABELS.constraint.map[config.constraint]],
      ["Threaded / Total Length", `${config.threadedLength || "—"} / ${config.totalLength || "—"} mm`, ""],
      ["Lead Precision", config.leadPrecision, SECTION_LABELS.leadPrecision.map[config.leadPrecision]],
      ["Flanged Nut Orientation", config.flangeOrientation, SECTION_LABELS.flangeOrientation.map[config.flangeOrientation]],
      ["Shaft Machined End", config.shaftEnd, SECTION_LABELS.shaftEnd.map[config.shaftEnd]],
      ["Wipers", config.wipers, SECTION_LABELS.wipers.map[config.wipers]],
      ["Lubricant", config.lubricant, SECTION_LABELS.lubricant.map[config.lubricant]],
    ] : [];

    const selectionsTable = selectionRows.length ? `
      <h3>Selections</h3>
      <table style="border-collapse:collapse; width:100%; font-family:sans-serif;">
        <thead>
          <tr style="background:#003494;">
            <th style="padding:8px 12px; text-align:left; color:#fff; font-size:12px;">Parameter</th>
            <th style="padding:8px 12px; text-align:left; color:#fff; font-size:12px;">Code</th>
            <th style="padding:8px 12px; text-align:left; color:#fff; font-size:12px;">Description</th>
          </tr>
        </thead>
        <tbody>
          ${selectionRows.map(([label, code, desc], i) => `
            <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
              <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${label}</td>
              <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0; font-family:monospace; font-weight:bold;">${code || "—"}</td>
              <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0; color:#64748b;">${desc || ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : "";

    const SMTP2GO_API_KEY = secrets.get("SMTP2GO_API_KEY");

    async function sendViaSmtp2go({ to, subject, html, attachments }: any) {
      const res = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Smtp2go-Api-Key": SMTP2GO_API_KEY },
        body: JSON.stringify({
          api_key: SMTP2GO_API_KEY,
          to: [to],
          sender: "Roller Screw Configurator <sales@helixlinear.com>",
          subject,
          html_body: html,
          custom_headers: [{ header: "Reply-To", value: to }],
          ...(attachments && attachments.length ? { attachments } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.data?.succeeded !== 1) {
        throw new Error(data?.data?.error || data?.data?.failures?.[0]?.error || "SMTP2GO send failed");
      }
      return data;
    }

    const emailBody = `
      <h2>New Quote Request</h2>
      <table style="border-collapse:collapse; width:100%; font-family:sans-serif;">
        <tr><td style="padding:8px 12px; font-weight:bold; background:#f1f5f9;">Company Name</td><td style="padding:8px 12px;">${companyName}</td></tr>
        <tr><td style="padding:8px 12px; font-weight:bold; background:#f1f5f9;">Your Name</td><td style="padding:8px 12px;">${yourName}</td></tr>
        <tr><td style="padding:8px 12px; font-weight:bold; background:#f1f5f9;">Your Email</td><td style="padding:8px 12px;">${yourEmail}</td></tr>
        <tr><td style="padding:8px 12px; font-weight:bold; background:#f1f5f9;">Part Number</td><td style="padding:8px 12px; font-family:monospace; font-size:16px; font-weight:bold;">${partNumber}</td></tr>
        ${drawingUrl ? `<tr><td style="padding:8px 12px; font-weight:bold; background:#f1f5f9;">Customer Drawing</td><td style="padding:8px 12px;"><a href="${drawingUrl}">Download PDF</a></td></tr>` : ''}
      </table>
      ${selectionsTable}
    `;

    // Build attachments if drawing was uploaded
    const attachments: any[] = [];
    if (drawingUrl) {
      try {
        const pdfRes = await fetch(drawingUrl);
        if (pdfRes.ok) {
          const buffer = await pdfRes.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          attachments.push({
            filename: 'customer-drawing.pdf',
            fileblob: base64,
            mimetype: 'application/pdf',
          });
        }
      } catch (_) {}
    }

    // Internal sales notification
    await sendViaSmtp2go({
      to: 'sales@helixlinear.com',
      subject: `Quote Request from ${companyName} — ${partNumber}`,
      html: emailBody,
      attachments,
    });

    // Confirmation email to the customer
    const confirmBody = `
      <div style="font-family:sans-serif; color:#222;">
        <h2 style="color:#003494;">Thank you for your quote request, ${yourName}!</h2>
        <p>We've received your request and our sales team will be in touch shortly.</p>
        <h3>Your Configuration</h3>
        <table style="border-collapse:collapse; width:100%;">
          <tr><td style="padding:8px 12px; font-weight:bold; background:#f1f5f9;">Company Name</td><td style="padding:8px 12px;">${companyName}</td></tr>
          <tr><td style="padding:8px 12px; font-weight:bold; background:#f1f5f9;">Part Number</td><td style="padding:8px 12px; font-family:monospace; font-size:16px; font-weight:bold;">${partNumber}</td></tr>
        </table>
        <p style="margin-top:24px; color:#666;">If you have any questions, please contact us at <a href="mailto:sales@helixlinear.com">sales@helixlinear.com</a>.</p>
      </div>
    `;

    await sendViaSmtp2go({
      to: yourEmail,
      subject: `Your Quote Request — ${partNumber}`,
      html: confirmBody,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}