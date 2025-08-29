// netlify/functions/submit-email.js
const JSON_HEADERS = { 'content-type': 'application/json' };

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { token, siteKey, expectedAction, templateId, templateParams } = body;

    if (!token || !siteKey) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing token or siteKey' }) };
    }

    // --- ENV checks
    const PROJECT_ID = process.env.GCP_PROJECT_ID;
    const RECAPTCHA_API_KEY = process.env.RECAPTCHA_ENTERPRISE_API_KEY;

    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = templateId || process.env.EMAILJS_TEMPLATE_ID;
    const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID || 'server'; // algunos flujos lo requieren
    const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    if (!PROJECT_ID || !RECAPTCHA_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing reCAPTCHA env vars' }) };
    }
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PRIVATE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing EmailJS env vars' }) };
    }

    // --- Verify reCAPTCHA (Enterprise Assessments)
    const assessUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${RECAPTCHA_API_KEY}`;
    const assessPayload = {
      event: {
        token,
        siteKey,
        expectedAction: expectedAction || undefined,
      },
    };

    const assessRes = await fetch(assessUrl, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(assessPayload),
    });
    const assessJson = await assessRes.json();

    if (!assessRes.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'recaptcha_assessment_failed', details: assessJson }),
      };
    }

    const valid = !!assessJson?.tokenProperties?.valid;
    const action = assessJson?.tokenProperties?.action || null;
    const actionMatch = expectedAction ? action === expectedAction : true;
    const score =
      typeof assessJson?.riskAnalysis?.score === 'number' ? assessJson.riskAnalysis.score : 0;
    const reasons = assessJson?.riskAnalysis?.reasons || [];

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
      };
    }

    // --- Send email via EmailJS REST
    // Usamos /email/send con accessToken (private key) en el payload
    const emailPayload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_USER_ID, // requerido por la API aunque sea "server"
      accessToken: EMAILJS_PRIVATE_KEY, // PRIVATE KEY del servidor
      template_params: templateParams || {},
    };

    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(emailPayload),
    });

    const maybeJson = await emailRes.text(); // a veces no devuelven JSON
    if (!emailRes.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'emailjs_send_failed', details: maybeJson }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, score, reasons }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'server_error',
        message: err instanceof Error ? err.message : String(err),
      }),
    };
  }
};
