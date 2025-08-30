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
    const tp = assessJson?.tokenProperties || {};

    // 1) Token must be valid (not expired/missing/duplicate/etc.)
    if (!tp.valid) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({
          error: 'recaptcha_token_invalid',
          details: {
            invalidReason: tp.invalidReason || 'UNKNOWN',
            hostname: tp.hostname,
            actionFromToken: tp.action,
          },
        }),
      };
    }

    // 2) If token contains an action, it must match what you expect
    if (tp.action && expectedAction && tp.action !== expectedAction) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({
          error: 'recaptcha_invalid_action',
          details: { expectedAction, actionFromToken: tp.action },
        }),
      };
    }

    // 3) Minimal score gate (0.5 default)
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
      EMAILJS_USER_ID, // fallback
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
