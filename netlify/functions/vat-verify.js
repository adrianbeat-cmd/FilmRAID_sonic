// /netlify/functions/vat-verify.js
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { vat } = JSON.parse(event.body || '{}');
    const clean = String(vat || '')
      .toUpperCase()
      .replace(/\s+/g, '');

    // quick format gate
    if (!/^[A-Z]{2}[A-Z0-9]{8,12}$/.test(clean)) {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: true, valid: false, reason: 'format' }),
      };
    }

    const url = `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(clean)}`;
    const resp = await fetch(url, { redirect: 'follow' });
    if (!resp.ok) {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: false }),
      };
    }

    const data = await resp.json();
    const out = {
      ok: true,
      valid: !!data.valid,
      country: data.country_code || clean.slice(0, 2),
      vat: clean,
      name: data.name || '',
      address: data.address || '',
    };

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(out),
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false }),
    };
  }
};
