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

    // --- reCAPTCHA Enterprise ---
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

    // --- EMAILJS (debug detallado) ---
    const {
      EMAILJS_SERVICE_ID,
      EMAILJS_PUBLIC_KEY,
      EMAILJS_PRIVATE_KEY,
      EMAILJS_USER_ID, // fallback
    } = process.env;
    const PUBLIC_KEY = EMAILJS_PUBLIC_KEY || EMAILJS_USER_ID;

    // Log no sensible
    console.log('[EMAILJS ENV]', {
      SERVICE: !!EMAILJS_SERVICE_ID,
      PUBLIC_KEY: !!PUBLIC_KEY,
      PRIVATE_KEY: !!EMAILJS_PRIVATE_KEY,
      TEMPLATE_FROM_CLIENT: !!templateId,
      PARAM_KEYS: Object.keys(templateParams || {}),
    });

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

    try {
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
    } catch (e) {
      console.error('[EMAILJS SEND ERROR]', {
        status: e?.status,
        text: e?.text,
        message: e?.message,
      });
      return {
        statusCode: 502,
        headers: cors,
        body: JSON.stringify({
          error: 'emailjs_send_failed',
          details: {
            status: e?.status,
            text: e?.text,
            message: e?.message,
          },
        }),
      };
    }
  } catch (err) {
    console.error('[SERVER ERROR]', err);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: 'server_error', message: err?.message || String(err) }),
    };
  }
};
