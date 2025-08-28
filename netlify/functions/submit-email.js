// netlify/functions/submit-email.js
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
    const {
      RECAPTCHA_ENTERPRISE_API_KEY,
      GCP_PROJECT_ID,
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID, // fallback
      EMAILJS_PRIVATE_KEY, // recomendado
      EMAILJS_USER_ID, // fallback si no hay PRIVATE_KEY
      EMAILJS_TO_EMAIL, // opcional
    } = process.env;

    if (!RECAPTCHA_ENTERPRISE_API_KEY || !GCP_PROJECT_ID) {
      return json(500, { error: 'Missing reCAPTCHA env vars' });
    }
    if (!EMAILJS_SERVICE_ID) {
      return json(500, { error: 'Missing EMAILJS_SERVICE_ID' });
    }

    const body = JSON.parse(event.body || '{}');
    const { token, siteKey, expectedAction, templateId, templateParams } = body;

    if (!token || !siteKey || !expectedAction || !templateParams) {
      return json(400, { error: 'Missing token/siteKey/expectedAction/templateParams' });
    }

    // 1) reCAPTCHA Enterprise Assessment
    const assessUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${GCP_PROJECT_ID}/assessments?key=${RECAPTCHA_ENTERPRISE_API_KEY}`;
    const assessPayload = {
      event: { token, siteKey, expectedAction },
    };

    const assessRes = await fetch(assessUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessPayload),
    });
    const assessJson = await assessRes.json();

    if (!assessRes.ok) {
      return json(400, { error: 'Assessment API error', details: assessJson });
    }

    const tokenProps = assessJson?.tokenProperties;
    const risk = assessJson?.riskAnalysis;

    if (!tokenProps?.valid) {
      return json(400, { error: 'Invalid token', details: tokenProps });
    }
    if (tokenProps?.action && tokenProps.action !== expectedAction) {
      return json(400, { error: 'Action mismatch', details: tokenProps });
    }

    const score = typeof risk?.score === 'number' ? risk.score : 0;
    const THRESHOLD = 0.3; // ajusta si quieres ser más o menos estricto
    if (score < THRESHOLD) {
      return json(403, { error: 'Low score', score, reasons: risk?.reasons || [] });
    }

    // 2) Enviar Email vía EmailJS REST
    const finalTemplateId = templateId || EMAILJS_TEMPLATE_ID;
    if (!finalTemplateId) {
      return json(500, { error: 'Missing templateId (none in request or env)' });
    }

    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: finalTemplateId,
      user_id: EMAILJS_PRIVATE_KEY ? '' : EMAILJS_USER_ID || '', // solo si no hay PRIVATE KEY
      template_params: {
        to_email: EMAILJS_TO_EMAIL || 'orders@filmraid.pro',
        ...templateParams,
      },
    };

    const headers = { 'Content-Type': 'application/json' };
    if (EMAILJS_PRIVATE_KEY) headers.Authorization = `Bearer ${EMAILJS_PRIVATE_KEY}`;

    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text().catch(() => '');
      return json(502, { error: 'Email send failed', details: errText });
    }

    return json(200, {
      ok: true,
      score,
      reasons: risk?.reasons || [],
      action: tokenProps?.action,
      hostname: tokenProps?.hostname,
    });
  } catch (e) {
    return json(500, { error: e?.message || String(e) });
  }
};
