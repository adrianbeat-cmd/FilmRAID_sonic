// netlify/functions/submit-email.js
const https = require('https');

const JSON_HEADERS = { 'content-type': 'application/json' };

/** POST JSON con https nativo, devuelve { status, bodyText, bodyJson? } */
function postJson(url, payloadObj) {
  const data = Buffer.from(JSON.stringify(payloadObj), 'utf8');
  const u = new URL(url);
  const opts = {
    method: 'POST',
    hostname: u.hostname,
    path: u.pathname + (u.search || ''),
    headers: {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(data),
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const bodyText = Buffer.concat(chunks).toString('utf8');
        let bodyJson = null;
        try {
          bodyJson = JSON.parse(bodyText);
        } catch {}
        resolve({ status: res.statusCode || 0, bodyText, bodyJson });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { token, siteKey, expectedAction, templateId, templateParams, dryRun } = body;

    if (!token || !siteKey) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing token or siteKey' }) };
    }

    // ENV
    const PROJECT_ID = process.env.GCP_PROJECT_ID;
    const RECAPTCHA_API_KEY = process.env.RECAPTCHA_ENTERPRISE_API_KEY;

    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = templateId || process.env.EMAILJS_TEMPLATE_ID;
    const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID || 'server';
    const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    if (!PROJECT_ID || !RECAPTCHA_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing reCAPTCHA env vars' }) };
    }

    // 1) Verify reCAPTCHA (Enterprise Assessments)
    const assessUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${RECAPTCHA_API_KEY}`;
    const assessPayload = {
      event: {
        token,
        siteKey,
        expectedAction: expectedAction || undefined,
      },
    };

    const assess = await postJson(assessUrl, assessPayload);
    if (assess.status < 200 || assess.status >= 300) {
      // Log para Netlify
      try {
        console.error('recaptcha_assessment_failed', assess.status, assess.bodyText);
      } catch {}
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'recaptcha_assessment_failed',
          httpStatus: assess.status,
          details: assess.bodyJson || assess.bodyText,
        }),
        headers: JSON_HEADERS,
      };
    }

    const aj = assess.bodyJson || {};
    const valid = !!(aj.tokenProperties && aj.tokenProperties.valid);
    const action = aj.tokenProperties ? aj.tokenProperties.action : null;
    const actionMatch = expectedAction ? action === expectedAction : true;
    const score =
      aj.riskAnalysis && typeof aj.riskAnalysis.score === 'number' ? aj.riskAnalysis.score : 0;
    const reasons = (aj.riskAnalysis && aj.riskAnalysis.reasons) || [];

    if (!valid || !actionMatch || score < 0.2) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'recaptcha_rejected',
          score,
          reasons,
          actionReceived: action,
          actionExpected: expectedAction || null,
        }),
        headers: JSON_HEADERS,
      };
    }

    // ✅ DRY RUN: salir antes de enviar email para aislar el problema
    if (dryRun === true) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, score, reasons, email: 'skipped' }),
        headers: JSON_HEADERS,
      };
    }

    // Comprueba env de EmailJS solo si vamos a enviar
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PRIVATE_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing EmailJS env vars' }),
        headers: JSON_HEADERS,
      };
    }

    // 2) Send email via EmailJS REST
    const emailPayload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_USER_ID,
      accessToken: EMAILJS_PRIVATE_KEY, // PRIVATE KEY
      template_params: templateParams || {},
    };

    const email = await postJson('https://api.emailjs.com/api/v1.0/email/send', emailPayload);
    if (email.status < 200 || email.status >= 300) {
      // Log para Netlify
      try {
        console.error('emailjs_send_failed', email.status, email.bodyText);
      } catch {}
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: 'emailjs_send_failed',
          httpStatus: email.status,
          details: email.bodyJson || email.bodyText,
        }),
        headers: JSON_HEADERS,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, score, reasons }),
      headers: JSON_HEADERS,
    };
  } catch (err) {
    try {
      console.error('server_error', err && err.message ? err.message : String(err));
    } catch {}
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'server_error',
        message: err && err.message ? err.message : String(err),
      }),
      headers: JSON_HEADERS,
    };
  }
};
