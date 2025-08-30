// netlify/functions/submit-email.js
// Serverless: reCAPTCHA Enterprise gate + EmailJS (@emailjs/nodejs)

import emailjs from '@emailjs/nodejs';

const {
  // reCAPTCHA
  GCP_PROJECT_ID,
  RECAPTCHA_ENTERPRISE_API_KEY,
  RECAPTCHA_MIN_SCORE,

  // EmailJS
  EMAILJS_PUBLIC_KEY,
  EMAILJS_PRIVATE_KEY,
  EMAILJS_SERVICE_ID, // Default (orders@)
  EMAILJS_SERVICE_ID_2, // Optional (hello@) — si no existe, se usa el default
} = process.env;

// Umbral mínimo de score; por defecto 0.4
const MIN_SCORE = Number.isFinite(Number(RECAPTCHA_MIN_SCORE)) ? Number(RECAPTCHA_MIN_SCORE) : 0.4;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'method_not_allowed' }),
    };
  }

  try {
    // Validación de envs
    if (!GCP_PROJECT_ID || !RECAPTCHA_ENTERPRISE_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'recaptcha_env_missing' }),
      };
    }
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY || !EMAILJS_SERVICE_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'emailjs_env_missing' }),
      };
    }

    const {
      token,
      siteKey,
      expectedAction,
      templateId,
      templateParams,
      // opcional: permitir forzar serviceId desde el front
      serviceId: serviceIdOverride,
      // opcional: modo diagnóstico (no envía email)
      dryRun,
    } = JSON.parse(event.body || '{}');

    if (!token || !siteKey || !expectedAction || !templateId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'missing_params' }),
      };
    }

    // 1) Evaluar reCAPTCHA Enterprise
    const assessRes = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(
        GCP_PROJECT_ID,
      )}/assessments?key=${encodeURIComponent(RECAPTCHA_ENTERPRISE_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          event: { token, siteKey, expectedAction },
        }),
      },
    );

    const assess = await assessRes.json();

    if (!assessRes.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'recaptcha_assessment_failed',
          details: assess,
        }),
      };
    }

    const tokenProps = assess.tokenProperties || {};
    if (!tokenProps.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'recaptcha_invalid',
          details: tokenProps,
        }),
      };
    }
    if (tokenProps.action !== expectedAction) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'recaptcha_invalid_action',
          details: tokenProps,
        }),
      };
    }

    const score =
      (assess.riskAnalysis && assess.riskAnalysis.score) != null ? assess.riskAnalysis.score : 0;
    const reasons = (assess.riskAnalysis && assess.riskAnalysis.reasons) || [];

    if (score < MIN_SCORE) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'low_score', score, reasons }),
      };
    }

    // Si pediste dryRun → no enviamos correo
    if (dryRun) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, score, reasons, email: 'skipped' }),
      };
    }

    // 2) Preparar EmailJS
    // Mapea service por plantilla (si no pones EMAILJS_SERVICE_ID_2, usa el default)
    const serviceByTemplate = {
      template_gvnlb36: EMAILJS_SERVICE_ID_2 || EMAILJS_SERVICE_ID, // Contact → hello@
      template_bic87oh: EMAILJS_SERVICE_ID, // Quote/Order → orders@
    };

    // Permite override desde el body
    let serviceId = serviceByTemplate[templateId] || EMAILJS_SERVICE_ID;
    if (serviceIdOverride) serviceId = String(serviceIdOverride);

    // Fallbacks de destinatario por plantilla (por si la plantilla no define To)
    const defaultToByTemplate = {
      template_gvnlb36: { to_email: 'hello@filmraid.pro', to_name: 'FilmRAID Contact' },
      template_bic87oh: { to_email: 'orders@filmraid.pro', to_name: 'FilmRAID Orders' },
    };
    const defaultTo = defaultToByTemplate[templateId] || {
      to_email: 'orders@filmraid.pro',
      to_name: 'FilmRAID',
    };

    // Payload final para la plantilla
    const payload = { ...(templateParams || {}), ...defaultTo };

    // 3) Enviar
    const resp = await emailjs.send(serviceId, templateId, payload, {
      publicKey: EMAILJS_PUBLIC_KEY,
      privateKey: EMAILJS_PRIVATE_KEY,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        score,
        reasons,
        email: 'sent',
        emailjs: { status: resp.status, text: resp.text },
      }),
    };
  } catch (err) {
    const message = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'server_error', message }),
    };
  }
}
