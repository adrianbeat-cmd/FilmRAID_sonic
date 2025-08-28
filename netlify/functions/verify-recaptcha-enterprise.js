// netlify/functions/verify-recaptcha-enterprise.js
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
    const { token, expectedAction, siteKey } = JSON.parse(event.body || '{}');

    if (!token || !siteKey) {
      return json(400, { success: false, error: 'Missing token or siteKey' });
    }

    const API_KEY = process.env.RECAPTCHA_ENTERPRISE_API_KEY;
    const PROJECT_ID = process.env.GCP_PROJECT_ID;

    if (!API_KEY || !PROJECT_ID) {
      return json(500, { success: false, error: 'Missing API key or project id' });
    }

    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${API_KEY}`;
    const payload = {
      event: {
        token,
        siteKey,
        expectedAction: expectedAction || undefined,
      },
    };

    const assessRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const assessJson = await assessRes.json();

    if (!assessRes.ok) {
      return json(400, { success: false, error: 'Assessment API error', details: assessJson });
    }

    const tokenProps = assessJson?.tokenProperties;
    const risk = assessJson?.riskAnalysis;

    // 1) Token válido
    if (!tokenProps?.valid) {
      return json(400, { success: false, reason: 'Invalid token', details: tokenProps });
    }

    // 2) Action (si la enviaste)
    if (expectedAction && tokenProps?.action && tokenProps.action !== expectedAction) {
      return json(400, { success: false, reason: 'Action mismatch', details: tokenProps });
    }

    // 3) Score mínimo
    const score = typeof risk?.score === 'number' ? risk.score : 0;
    const THRESHOLD = 0.5; // ajusta 0.3–0.7 según tolerancia
    if (score < THRESHOLD) {
      return json(403, {
        success: false,
        reason: 'Low score',
        score,
        reasons: risk?.reasons || [],
      });
    }

    // OK
    return json(200, {
      success: true,
      score,
      reasons: risk?.reasons || [],
      action: tokenProps?.action,
      hostname: tokenProps?.hostname,
    });
  } catch (err) {
    return json(500, { success: false, error: err?.message || String(err) });
  }
};
