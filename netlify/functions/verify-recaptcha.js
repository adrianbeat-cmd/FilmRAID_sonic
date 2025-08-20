const emailjs = require('@emailjs/nodejs');
const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body);
  const { token, formData } = body; // token: reCAPTCHA v3 token, formData: your EmailJS params

  // Verify reCAPTCHA v3 token
  const secret = process.env.RECAPTCHA_SECRET_KEY; // Your v3 secret key from Google
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

  try {
    const { data } = await axios.post(verifyUrl);
    if (!data.success || data.score < 0.5) {
      // Adjust threshold as needed (0.5 is moderate)
      return { statusCode: 403, body: JSON.stringify({ error: 'reCAPTCHA verification failed' }) };
    }

    // If valid, send to EmailJS
    const emailResponse = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      formData,
      process.env.EMAILJS_USER_ID,
    );

    return { statusCode: 200, body: JSON.stringify({ success: true, emailResponse }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
