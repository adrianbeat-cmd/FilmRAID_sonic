/* eslint-disable */
const emailjs = require('@emailjs/nodejs');

const {
  RECAPTCHA_ENTERPRISE_API_KEY,
  GCP_PROJECT_ID,
  EMAILJS_SERVICE_ID,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_PRIVATE_KEY,
} = process.env;

const MIN_SCORE = 0.3; // umbral (ajustable)

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  try {
    if (!RECAPTCHA_ENTERPRISE_API_KEY || !GCP_PROJECT_ID) {
      return {
        statusCode: 500,
        headers: cors,
        body: JSON.stringify({ error: 'recaptcha_env_missing' }),
      };
    }
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
      return {
        statusCode: 500,
        headers: cors,
        body: JSON.stringify({ error: 'emailjs_env_missing' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { token, siteKey, expectedAction, templateId, templateParams, dryRun } = body;

    if (!token || !siteKey || !expectedAction || !templateId) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'bad_request' }) };
    }

    // 1) Verificar reCAPTCHA Enterprise
    const assessUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${GCP_PROJECT_ID}/assessments?key=${RECAPTCHA_ENTERPRISE_API_KEY}`;
    const assessRes = await fetch(assessUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: { token, expectedAction, siteKey },
      }),
    });
    const assess = await assessRes.json();

    if (!assessRes.ok) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({ error: 'recaptcha_assessment_failed', details: assess }),
      };
    }

    const score = assess.riskAnalysis?.score ?? 0;
    const reasons = assess.riskAnalysis?.reasons || [];
    if (score < MIN_SCORE) {
      return {
        statusCode: 403,
        headers: cors,
        body: JSON.stringify({ error: 'low_score', score, reasons }),
      };
    }

    // 2) Si es dryRun, no enviamos email (modo diagnóstico)
    if (dryRun) {
      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify({ ok: true, score, reasons, email: 'skipped' }),
      };
    }

    // 3) Enviar email con EmailJS (Node SDK) usando privateKey
    const resp = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams || {}, {
      publicKey: EMAILJS_PUBLIC_KEY,
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
        emailjs: { status: resp.status, text: resp.text },
      }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: 'server_error', message: String(err) }),
    };
  }
};
