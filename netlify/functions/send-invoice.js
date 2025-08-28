// netlify/functions/send-invoice.js
const json = (status, body) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY; // recomendado
    const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID; // fallback
    const EMAILJS_TO_EMAIL = process.env.EMAILJS_TO_EMAIL || 'orders@filmraid.pro';

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      return json(500, { error: 'Missing EMAILJS service/template envs' });
    }

    const { payload } = JSON.parse(event.body || '{}'); // adapta a tu forma de enviar datos
    if (!payload) return json(400, { error: 'Missing payload' });

    const emailPayload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PRIVATE_KEY ? '' : EMAILJS_USER_ID || '', // si no hay private, usa public key
      template_params: {
        ...payload,
        to_email: EMAILJS_TO_EMAIL,
      },
    };

    const headers = { 'Content-Type': 'application/json' };
    if (EMAILJS_PRIVATE_KEY) {
      headers.Authorization = `Bearer ${EMAILJS_PRIVATE_KEY}`;
    }

    const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(emailPayload),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return json(502, { error: 'Email send failed', details: errText });
    }

    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: e?.message || String(e) });
  }
};
