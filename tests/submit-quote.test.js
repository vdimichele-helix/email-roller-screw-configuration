import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import handler from '../api/submit-quote.js';

test('submits sales email and customer confirmation with attached PDF', async () => {
  process.env.SMTP2GO_API_KEY = 'test-only-key';
  const calls = [];
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    calls.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ data: { succeeded: 1 } }) };
  };
  try {
    const form = new FormData();
    form.set('companyName', 'Example <Company>');
    form.set('yourName', 'Test Person');
    form.set('yourEmail', 'customer@example.com');
    form.set('partNumber', 'SRS-123');
    form.set('config', JSON.stringify({ trsType: 'SRS', lead: '5' }));
    form.set('drawing', new Blob(['%PDF-1.4\nexample'], { type: 'application/pdf' }), 'drawing.pdf');
    const multipart = new Request('http://localhost', { method: 'POST', body: form });
    const body = Buffer.from(await multipart.arrayBuffer());
    const req = Readable.from([body]);
    req.method = 'POST';
    req.headers = { 'content-type': multipart.headers.get('content-type') };
    const res = { code: 0, status(code) { this.code = code; return this; }, json(value) { this.value = value; return this; }, setHeader() { return this; } };
    await handler(req, res);
    assert.equal(res.code, 200);
    assert.equal(calls.length, 2);
    assert.deepEqual(calls.map((call) => call.to), [['sales@helixlinear.com', 'partsolutionshelix@robot.zapier.com'], ['customer@example.com']]);
    assert.match(calls[0].html_body, /SRS-123/);
    assert.match(calls[0].html_body, /Standard Roller Screw/);
    assert.match(calls[0].html_body, /Example &lt;Company&gt;/);
    assert.equal(calls[0].attachments[0].fileblob, Buffer.from('%PDF-1.4\nexample').toString('base64'));
    assert.match(calls[1].html_body, /SRS-123/);
  } finally { globalThis.fetch = previousFetch; delete process.env.SMTP2GO_API_KEY; }
});
