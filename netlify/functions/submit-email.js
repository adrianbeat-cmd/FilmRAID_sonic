// Serverless function: verifies reCAPTCHA Enterprise and sends email via EmailJS (node SDK)
// Node 18+ on Netlify (global fetch available)

const emailjs = require('@emailjs/nodejs');

// ---- Env (configure in Netlify) ---------------------------------------------
const PROJECT_ID = process.env.GCP_PROJECT_ID; // e.g. "my-project-123456"
const RECAPTCHA_KEY = process.env.RECAPTCHA_ENTERPRISE_API_KEY;

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID; // your Zoho service (works for both templates)
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

// Allow tweaking without code changes
const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? '0.6');

// -----------------------------------------------------------------------------
const json = (status, body) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'method_not_allowed' });
  }

  try {
    if (!PROJECT_ID || !RECAPTCHA_KEY) {
      return json(500, { error: 'recaptcha_env_missing' });
    }
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
      return json(500, { error: 'emailjs_env_missing' });
    }

    const body = JSON.parse(event.body || '{}');

    const { token, siteKey, expectedAction, templateId, templateParams, dryRun } = body || {};
    if (!token || !siteKey || !expectedAction || !templateId) {
      return json(400, { error: 'missing_parameters' });
    }

    // ---- Verify reCAPTCHA Enterprise ----------------------------------------
    const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${RECAPTCHA_KEY}`;

    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: {
          token,
          siteKey,
          expectedAction, // lets Google know what we expect this token to be for
        },
      }),
    });

    const verifyJson = await verifyRes.json();

    if (!verifyRes.ok) {
      // Bubble up Google’s error (keeps debugging easy)
      return json(400, { error: 'recaptcha_assessment_failed', details: verifyJson });
    }

    const props = verifyJson.tokenProperties || {};
    const score = verifyJson.riskAnalysis?.score ?? null;
    const reasons = verifyJson.riskAnalysis?.reasons ?? [];

    if (!props.valid) {
      return json(400, { error: 'recaptcha_invalid', details: { tokenProperties: props } });
    }
    if (props.action && props.action !== expectedAction) {
      return json(400, {
        error: 'recaptcha_invalid_action',
        details: { expectedAction, got: props.action },
      });
    }
    if (score !== null && Number(score) < MIN_SCORE) {
      return json(403, { error: 'recaptcha_low_score', score, reasons, threshold: MIN_SCORE });
    }

    // ---- EmailJS send (skip when dryRun) ------------------------------------
    if (dryRun) {
      return json(200, { ok: true, score, reasons, email: 'skipped' });
    }

    // If your templates are already configured with “To” addresses in EmailJS,
    // you don’t need to pass to_email here. If you prefer to route explicitly,
    // uncomment DEFAULT_TO and spread it into the params.
    //
    // const DEFAULT_TO = {
    //   to_email: templateId === 'template_gvnlb36' ? 'hello@filmraid.pro' : 'orders@filmraid.pro',
    //   to_name:  templateId === 'template_gvnlb36' ? 'FilmRAID Hello'     : 'FilmRAID Orders',
    // };

    const resp = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      {
        ...(templateParams || {}),
        // ...DEFAULT_TO, // <- enable if you prefer routing via variables
      },
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      },
    );

    // EmailJS returns { status: 200, text: 'OK' } when successful
    if (resp?.status !== 200) {
      return json(502, { error: 'emailjs_send_failed', response: resp });
    }

    return json(200, { ok: true, score, reasons });
  } catch (err) {
    console.error('submit-email error', err);
    return json(500, { error: 'server_error' });
  }
};
