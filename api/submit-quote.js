const SALES_EMAIL = 'sales@helixlinear.com';
const QUOTE_RECIPIENTS = [SALES_EMAIL, 'partsolutionshelix@robot.zapier.com'];
const MAX_DRAWING_BYTES = 3 * 1024 * 1024;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const labels = {
  trsType: { SRS: 'Standard Roller Screw', URS: 'Ultra-Capacitive Roller Screw', IRS: 'Inverted Roller Screw', DRS: 'Differential Roller Screw', RRS: 'Recirculating Roller Screw' },
  hand: { R: 'Right', L: 'Left (on request)' },
  nutType: { C: 'Cylindrical', F: 'Centered flange', P: 'Off-centered flange' },
  constraint: { '+': 'With backlash', '0': 'Zero backlash', '-': 'With preload' },
  leadPrecision: { G5: 'Standard', G3: 'On request', G1: 'On request' },
  flangeOrientation: { S: 'Toward shorter end', L: 'Toward longer end', '-': 'Identical ends / cylindrical' },
  shaftEnd: { Z: 'Per customer drawing' },
  wipers: { H: 'With wipers', T: 'Without wipers', X: 'No wiper recesses (SRS)' },
  lubricant: { G: 'Grease', O: 'Oil', D: 'Dry' },
};

function selections(config) {
  const rows = [
    ['TRS Type', config.trsType, labels.trsType[config.trsType]],
    ['Nominal Diameter × Lead', `${config.diameter || '—'} × ${config.lead || '—'} mm`, ''],
    ['Hand', config.hand, labels.hand[config.hand]],
    ['Nut Type', config.nutType, labels.nutType[config.nutType]],
    ['Constraints', config.constraint, labels.constraint[config.constraint]],
    ['Threaded / Total Length', `${config.threadedLength || '—'} / ${config.totalLength || '—'} mm`, ''],
    ['Lead Precision', config.leadPrecision, labels.leadPrecision[config.leadPrecision]],
    ['Flanged Nut Orientation', config.flangeOrientation, labels.flangeOrientation[config.flangeOrientation]],
    ['Shaft Machined End', config.shaftEnd, labels.shaftEnd[config.shaftEnd]],
    ['Wipers', config.wipers, labels.wipers[config.wipers]],
    ['Lubricant', config.lubricant, labels.lubricant[config.lubricant]],
  ];
  return `<h3>Selections</h3><table style="border-collapse:collapse;width:100%;font-family:sans-serif"><thead><tr style="background:#003494;color:white"><th>Parameter</th><th>Code</th><th>Description</th></tr></thead><tbody>${rows.map(([name, code, description], i) => `<tr style="background:${i % 2 ? '#fff' : '#f8fafc'}"><td style="padding:8px 12px">${escapeHtml(name)}</td><td style="padding:8px 12px;font-family:monospace">${escapeHtml(code || '—')}</td><td style="padding:8px 12px">${escapeHtml(description || '')}</td></tr>`).join('')}</tbody></table>`;
}

async function sendEmail(key, to, subject, html, attachments = [], replyTo = SALES_EMAIL) {
  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Smtp2go-Api-Key': key },
    body: JSON.stringify({ api_key: key, to: Array.isArray(to) ? to : [to], sender: `Roller Screw Configurator <${SALES_EMAIL}>`, subject, html_body: html, custom_headers: [{ header: 'Reply-To', value: replyTo }], ...(attachments.length ? { attachments } : {}) }),
  });
  const result = await response.json();
  if (!response.ok || result?.data?.succeeded !== (Array.isArray(to) ? to.length : 1)) throw new Error('SMTP2GO send failed');
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).setHeader('Allow', 'POST').json({ error: 'Method not allowed' });
  if (!process.env.SMTP2GO_API_KEY) return response.status(503).json({ error: 'Quote service unavailable' });
  try {
    // Vercel provides a Node request, so convert its body to a Web Request for FormData parsing.
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 4 * 1024 * 1024) return response.status(413).json({ error: 'Request too large' });
      chunks.push(chunk);
    }
    const form = await new Request('http://localhost', { method: 'POST', headers: { 'content-type': request.headers['content-type'] || '' }, body: Buffer.concat(chunks) }).formData();
    const companyName = String(form.get('companyName') || '').trim();
    const yourName = String(form.get('yourName') || '').trim();
    const yourEmail = String(form.get('yourEmail') || '').trim();
    const partNumber = String(form.get('partNumber') || '').trim();
    const config = JSON.parse(String(form.get('config') || '{}'));
    if (!companyName || !yourName || !partNumber || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(yourEmail) || !config || typeof config !== 'object' || Array.isArray(config) || [companyName, yourName, yourEmail, partNumber].some((s) => s.length > 300)) {
      return response.status(400).json({ error: 'Invalid quote request' });
    }
    const drawing = form.get('drawing');
    const attachments = [];
    if (drawing) {
      const bytes = Buffer.from(await drawing.arrayBuffer());
      if (bytes.length > MAX_DRAWING_BYTES || bytes.subarray(0, 5).toString() !== '%PDF-') return response.status(400).json({ error: 'Drawing must be a PDF under 3 MB' });
      attachments.push({ filename: 'customer-drawing.pdf', fileblob: bytes.toString('base64'), mimetype: 'application/pdf' });
    }
    const details = `<table style="border-collapse:collapse;width:100%;font-family:sans-serif">${[['Company Name', companyName], ['Your Name', yourName], ['Your Email', yourEmail], ['Part Number', partNumber]].map(([label, value]) => `<tr><td style="padding:8px 12px;font-weight:bold;background:#f1f5f9">${label}</td><td style="padding:8px 12px">${escapeHtml(value)}</td></tr>`).join('')}</table>`;
    await sendEmail(process.env.SMTP2GO_API_KEY, QUOTE_RECIPIENTS, `Quote Request from ${companyName} — ${partNumber}`, `<h2>New Quote Request</h2>${details}${attachments.length ? '<p>Customer drawing attached as PDF.</p>' : ''}${selections(config)}`, attachments, yourEmail);
    try {
      await sendEmail(process.env.SMTP2GO_API_KEY, yourEmail, `Your Quote Request — ${partNumber}`, `<div style="font-family:sans-serif;color:#222"><h2 style="color:#003494">Thank you for your quote request, ${escapeHtml(yourName)}!</h2><p>We've received your request and our sales team will be in touch shortly.</p><h3>Your Configuration</h3>${details}${selections(config)}<p>If you have any questions, contact <a href="mailto:${SALES_EMAIL}">${SALES_EMAIL}</a>.</p></div>`);
    } catch (error) {
      console.error('Customer quote confirmation failed', error);
      return response.status(207).json({ success: true, confirmationSent: false });
    }
    return response.status(200).json({ success: true, confirmationSent: true });
  } catch (error) {
    console.error('Quote submission failed', error);
    return response.status(error instanceof SyntaxError ? 400 : 502).json({ error: 'Unable to submit quote request' });
  }
}
