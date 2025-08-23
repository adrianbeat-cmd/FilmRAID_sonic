// netlify/functions/vat-verify.js

// VIES SOAP endpoint
const VIES_URL = 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService';

function buildSoap(countryCode, vatNumber) {
  return `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
                   xmlns:tns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <soap:Body>
        <tns:checkVat>
          <tns:countryCode>${countryCode}</tns:countryCode>
          <tns:vatNumber>${vatNumber}</tns:vatNumber>
        </tns:checkVat>
      </soap:Body>
    </soap:Envelope>
  `.trim();
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
    }

    const { vat } = JSON.parse(event.body || '{}');
    if (!vat || typeof vat !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing vat' }) };
    }

    const cleaned = vat.replace(/\s+/g, '').toUpperCase();
    const EU_VAT_REGEX = /^[A-Z]{2}[A-Z0-9]{8,12}$/;
    if (!EU_VAT_REGEX.test(cleaned)) {
      // Bad format → definitely invalid (but still ok:true so UI can show “format error” nicely)
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, valid: false, reason: 'format' }),
      };
    }

    const cc = cleaned.slice(0, 2);
    const num = cleaned.slice(2);

    const res = await fetch(VIES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'urn:ec.europa.eu:taxud:vies:services:checkVat/checkVat',
      },
      body: buildSoap(cc, num),
    });

    const text = await res.text();

    // Parse a few key bits
    const valid = /<valid>\s*true\s*<\/valid>/i.test(text);
    const nameMatch =
      text.match(/<name>\s*<!\[CDATA\[(.*?)\]\]>\s*<\/name>/i) ||
      text.match(/<name>\s*(.*?)\s*<\/name>/i);
    const addrMatch =
      text.match(/<address>\s*<!\[CDATA\[(.*?)\]\]>\s*<\/address>/i) ||
      text.match(/<address>\s*([\s\S]*?)\s*<\/address>/i);

    const name = nameMatch ? (nameMatch[1] || nameMatch[2] || '').trim() : '';
    const addressRaw = addrMatch ? (addrMatch[1] || addrMatch[2] || '').trim() : '';
    const address = addressRaw.replace(/\s*\n\s*/g, ', ');

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, valid, name, address }),
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      /* eslint-disable-next-line no-console */
      console.error('[vat-verify] VIES error:', err);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: false, error: 'VIES unavailable' }),
    };
  }
};
