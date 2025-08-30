// netlify/functions/submit-email.js
const emailjs = require('@emailjs/nodejs');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: 'ok' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: cors,
      body: JSON.stringify({ error: 'method_not_allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { token, siteKey, expectedAction, templateId, templateParams, dryRun } = body;

    // --- RECAPTCHA ---
    const { RECAPTCHA_ENTERPRISE_API_KEY, GCP_PROJECT_ID } = process.env;
    if (!RECAPTCHA_ENTERPRISE_API_KEY || !GCP_PROJECT_ID) {
      return {
        statusCode: 500,
        headers: cors,
        body: JSON.stringify({
          error: 'recaptcha_env_missing',
          missing: {
            RECAPTCHA_ENTERPRISE_API_KEY: !!RECAPTCHA_ENTERPRISE_API_KEY,
            GCP_PROJECT_ID: !!GCP_PROJECT_ID,
          },
        }),
      };
    }
    if (!token || !siteKey || !expectedAction) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'bad_request' }) };
    }

    // fetch nativo (Node 18+)
    const assessUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${GCP_PROJECT_ID}/assessments?key=${RECAPTCHA_ENTERPRISE_API_KEY}`;
    const assessRes = await fetch(assessUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: { token, siteKey, expectedAction } }),
    });
    const assessJson = await assessRes.json();

    if (!assessRes.ok) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({ error: 'recaptcha_assessment_failed', details: assessJson }),
      };
    }

    const score = assessJson?.riskAnalysis?.score ?? null;
    const reasons = assessJson?.riskAnalysis?.reasons || [];
    const action = assessJson?.event?.expectedAction || expectedAction;
    const validAction = !assessJson?.tokenProperties?.invalidReason && action === expectedAction;

    if (!validAction) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({
          error: 'recaptcha_invalid_action',
          details: assessJson?.tokenProperties,
        }),
      };
    }
    if (typeof score === 'number' && score < 0.5) {
      return {
        statusCode: 403,
        headers: cors,
        body: JSON.stringify({ ok: false, score, reasons }),
      };
    }

    if (dryRun) {
      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify({ ok: true, score, reasons, email: 'skipped' }),
      };
    }

    // --- EMAILJS ---
    const {
      EMAILJS_SERVICE_ID,
      EMAILJS_PUBLIC_KEY,
      EMAILJS_PRIVATE_KEY,
      EMAILJS_USER_ID, // fallback por si prefieres este
    } = process.env;
    const PUBLIC_KEY = EMAILJS_PUBLIC_KEY || EMAILJS_USER_ID;

    if (!EMAILJS_SERVICE_ID || !PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
      return {
        statusCode: 500,
        headers: cors,
        body: JSON.stringify({
          error: 'emailjs_env_missing',
          present: {
            EMAILJS_SERVICE_ID: !!EMAILJS_SERVICE_ID,
            EMAILJS_PUBLIC_KEY: !!EMAILJS_PUBLIC_KEY,
            EMAILJS_USER_ID: !!EMAILJS_USER_ID,
            EMAILJS_PRIVATE_KEY: !!EMAILJS_PRIVATE_KEY,
          },
        }),
      };
    }

    const resp = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams || {}, {
      publicKey: PUBLIC_KEY,
      privateKey: EMAILJS_PRIVATE_KEY,
    });

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        ok: true,
        score,
        reasons,
        email: 'sent',
        emailjs: { status: resp?.status },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: 'server_error', message: err?.message || String(err) }),
    };
  }
};
