// netlify/functions/shipping.js
// CommonJS style to keep Netlify Lambda compatibility even if package.json has "type": "module"
const fetch = require('node-fetch'); // v2.x

// --- DIAGNOSTIC BANNER ---
const FUNCTION_VERSION = 'shipping-2025-10-03-v3-insured-dap-no-icp';
console.info('[shipping] Loading function version:', FUNCTION_VERSION);

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

const FEDEX_BASE = process.env.FEDEX_API_BASE || 'https://apis.fedex.com';
const FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID;
const FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET;
const FEDEX_ACCOUNT_NUMBER = process.env.FEDEX_ACCOUNT_NUMBER;

// ✅ include insurance (declared value) inside QUOTES
const INCLUDE_INSURANCE_IN_QUOTES = true;

// ✅ show FEDEX_FIRST (early AM) domestically if available
const SHOW_DOMESTIC_FIRST = true;

// EU countries (no import duties within ES → EU)
const EU = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
]);

// --- YOUR ORIGIN (Barcelona) ---
const SHIPPER = {
  contact: {
    companyName: 'The DIT World Company S.L.U.',
    personName: 'The DIT World Company S.L.U.',
    phoneNumber: '+34999999999',
  },
  address: {
    streetLines: ['Carrer del Vallès 55, 1-2'],
    city: 'Barcelona',
    postalCode: '08030',
    countryCode: 'ES',
    stateOrProvinceCode: 'B', // helps FedEx routing in ES/Barcelona
  },
};

// --- PRODUCT → DIMENSIONS / WEIGHTS ---
const PACK_MAP = {
  // Single-box models
  'FilmRaid-4A (72TB/80TB/88TB)': { boxes: [{ w: 8, l: 40, wdt: 37, h: 36, units: 'CM' }] },
  'FilmRaid-6 (108TB/120TB/132TB)': { boxes: [{ w: 12, l: 40, wdt: 37, h: 36, units: 'CM' }] },
  'FilmRaid-8 (144TB/160TB/176TB)': { boxes: [{ w: 18, l: 40, wdt: 37, h: 36, units: 'CM' }] },

  // Two-box model (12E) → RAID + HDDs
  'FilmRaid-12E (216TB/240TB/264TB)': {
    boxes: [
      { w: 10, l: 53, wdt: 39, h: 43, units: 'CM' }, // RAID
      { w: 12, l: 53, wdt: 39, h: 43, units: 'CM' }, // HDDs
    ],
  },
};

// --- NAME NORMALIZATION ---
function pickFirstKnownItemName(items) {
  for (const it of items) if (PACK_MAP[it.name]) return it.name;
  return 'FilmRaid-6 (108TB/120TB/132TB)'; // safe fallback
}

// --- FedEx OAuth ---
async function getFedExToken() {
  const url = `${FEDEX_BASE}/oauth/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: FEDEX_CLIENT_ID,
    client_secret: FEDEX_CLIENT_SECRET,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const data = await safeJson(res);
    const err = new Error(`FedEx OAuth error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return res.json();
}

// --- Build FedEx Rate body (quote, DAP-friendly: no customs block) ---
function buildRateBody({ destination, items, total }) {
  const itemName = pickFirstKnownItemName(items);
  const spec = PACK_MAP[itemName];
  const boxes = spec?.boxes || PACK_MAP['FilmRaid-6 (108TB/120TB/132TB)'].boxes;

  const totalWeight = boxes.reduce((s, b) => s + Number(b.w || 0), 0) || 1;
  const declaredTotal = Math.max(1, Number(total) || 1);

  // Split insured value across boxes proportional to weight
  const lineItems = boxes.map((b) => {
    const share = Number(b.w || 0) / totalWeight || 0;
    const insured = round2(declaredTotal * share);

    const li = {
      weight: { units: 'KG', value: Number(b.w) },
      dimensions: { length: Number(b.l), width: Number(b.wdt), height: Number(b.h), units: 'CM' },
    };

    if (INCLUDE_INSURANCE_IN_QUOTES && insured > 0) {
      li.insuredValue = { amount: insured, currency: 'EUR' };
    }
    return li;
  });

  const requestedShipment = {
    shipper: SHIPPER,
    recipient: {
      contact: {
        companyName: 'Customer',
        personName: 'Recipient',
        phoneNumber: destination.phone || '+00000000',
      },
      address: {
        streetLines: [destination.address1 || 'Address'],
        city: destination.city || '',
        postalCode: destination.postalCode,
        countryCode: destination.country,
        residential: true,
      },
    },
    preferredCurrency: 'EUR',
    rateRequestType: ['ACCOUNT'],
    pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
    packagingType: 'YOUR_PACKAGING',

    // Shipment-level declared value
    ...(INCLUDE_INSURANCE_IN_QUOTES
      ? { totalDeclaredValue: { amount: declaredTotal, currency: 'EUR' } }
      : {}),

    // Shipment-level special service for insured value
    ...(INCLUDE_INSURANCE_IN_QUOTES && declaredTotal > 0
      ? {
          specialServicesRequested: {
            specialServiceTypes: ['INSURED_VALUE'],
            insuredValue: { amount: declaredTotal, currency: 'EUR' },
          },
        }
      : {}),

    requestedPackageLineItems: lineItems,

    // ❗️No customsClearanceDetail here (Samuel’s guidance) to keep quotes working for DAP or DDP later.
  };

  // US/CA need state/province when provided
  if ((destination.country === 'US' || destination.country === 'CA') && destination.state) {
    requestedShipment.recipient.address.stateOrProvinceCode = destination.state;
  }

  return {
    accountNumber: { value: FEDEX_ACCOUNT_NUMBER },
    requestedShipment,
  };
}

// --- Call FedEx /rates/quotes ---
async function getFedExRates(token, rateBody) {
  const url = `${FEDEX_BASE}/rate/v1/rates/quotes`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
      'X-locale': 'en_US',
    },
    body: JSON.stringify(rateBody),
  });

  if (!res.ok) {
    const data = await safeJson(res);
    const err = new Error(`FedEx rates error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return res.json();
}

// --- HARD FILTER for ICP (International Connect Plus) ---
function isICP(rateReplyDetail) {
  const code = (rateReplyDetail?.serviceType || '').toString().toUpperCase();
  const name = (rateReplyDetail?.serviceName || rateReplyDetail?.serviceDescription || '')
    .toString()
    .toUpperCase();
  return (
    code.includes('FEDEX_INTERNATIONAL_CONNECT_PLUS') ||
    code.includes('INTERNATIONAL_CONNECT_PLUS') ||
    code.includes('FICP') ||
    name.includes('CONNECT PLUS')
  );
}

// --- Filter/Map services to neat options ---
function mapServicesToRates(destinationCountry, fedexOutput) {
  const details = fedexOutput?.output?.rateReplyDetails;
  if (!Array.isArray(details) || details.length === 0) return [];

  try {
    console.info(
      '[shipping] FedEx serviceTypes seen:',
      details.map((r) => r?.serviceType).filter(Boolean),
    );
  } catch {}

  const dest = (destinationCountry || '').toUpperCase();
  const isDomesticES = dest === 'ES';
  const isEUExport = !isDomesticES && EU.has(dest); // ES → EU
  const isNonEUExport = !isDomesticES && !EU.has(dest); // ES → non-EU (e.g., US, UK, CH)

  let list = details.filter((r) => !isICP(r)); // ❌ remove ICP everywhere

  const ALLOW_INTL = new Set([
    'FEDEX_INTERNATIONAL_PRIORITY',
    'FEDEX_INTERNATIONAL_ECONOMY',
    'INTERNATIONAL_ECONOMY',
    'FEDEX_REGIONAL_ECONOMY',
  ]);

  // ✅ Correct domestic codes returned by FedEx Spain
  const ALLOW_ES = new Set([
    'FEDEX_PRIORITY',
    'FEDEX_PRIORITY_EXPRESS',
    ...(SHOW_DOMESTIC_FIRST ? ['FEDEX_FIRST'] : []),
  ]);

  const results = [];

  for (const r of list) {
    const code = r?.serviceType;
    if (!code) continue;

    if (isDomesticES) {
      if (!ALLOW_ES.has(code)) continue;
    } else {
      if (!ALLOW_INTL.has(code)) continue;
    }

    const priced = pickBestRated(r);
    if (!priced || typeof priced.netCharge !== 'number') continue;

    let name = code;
    let description = '';

    if (isDomesticES) {
      if (code === 'FEDEX_FIRST') {
        name = 'First (early AM)';
        description = 'Entrega temprana (pre-8/9h si disponible)';
      } else if (code === 'FEDEX_PRIORITY_EXPRESS') {
        name = 'Express (before 10/12h)';
        description = 'Express (antes de 10/12h)';
      } else if (code === 'FEDEX_PRIORITY') {
        name = 'Standard (24–48h)';
        description = 'Estándar (24–48h)';
      }
    } else {
      if (code === 'FEDEX_INTERNATIONAL_PRIORITY') {
        name = 'International Priority (1–3 días)';
        description = 'International Priority (1–3 días)';
      } else if (
        code === 'FEDEX_INTERNATIONAL_ECONOMY' ||
        code === 'INTERNATIONAL_ECONOMY' ||
        code === 'FEDEX_REGIONAL_ECONOMY'
      ) {
        name = 'International/Regional Economy (3–7 días)';
        description = 'International/Regional Economy (3–7 días)';
      }
      // 👉 add DAP note for non-EU exports
      if (isNonEUExport) {
        description += ' — DAP: taxes & import duties payable at destination';
        // If you prefer Spanish:
        // description += ' — DAP: aranceles e impuestos de importación a cargo del destinatario';
      }
    }

    results.push({
      id: `FEDEX_${code}`,
      name,
      description,
      cost: round2(priced.netCharge),
    });
  }

  results.sort((a, b) => a.cost - b.cost);
  return results;
}

function pickBestRated(rateReplyDetail) {
  const rsd = rateReplyDetail?.ratedShipmentDetails || [];
  for (const d of rsd) {
    const pkg = (d?.ratedPackages && d.ratedPackages[0]) || {};
    const pr = pkg.packageRateDetail || d.shipmentRateDetail || {};
    const netCharge =
      numberOrNull(pr.netCharge) ??
      numberOrNull(pr.totalNetCharge) ??
      numberOrNull(d.totalNetCharge);
    if (typeof netCharge === 'number') return { netCharge };
  }
  return null;
}

// --- Utils ---
function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
function numberOrNull(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

// ----------------- Netlify handler -----------------
exports.handler = async (event) => {
  try {
    console.info('FEDEX env present?:', {
      id: !!FEDEX_CLIENT_ID,
      secret: !!FEDEX_CLIENT_SECRET,
      account: !!FEDEX_ACCOUNT_NUMBER,
    });

    const payload = JSON.parse(event.body || '{}');
    const content = payload.content || {};
    let destination = content.shippingAddress || {};
    const items = Array.isArray(content.items) ? content.items : [];
    const total =
      Number(content.total || 0) ||
      items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

    // Guard: missing address → no methods yet
    if (!destination?.country || !destination?.postalCode) {
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          rates: [],
          error: 'shipping_error',
          message: 'Waiting for address',
        }),
      };
    }

    // Normalize minimal fields
    destination = {
      ...destination,
      city: destination.city || '',
      address1: destination.address1 || 'Address',
    };

    // OAuth
    let token;
    try {
      token = await getFedExToken();
    } catch (e) {
      const status = e.status || 400;
      const data = e.data || {};
      console.error(`FedEx OAuth error catch (${status}):`, JSON.stringify(data, null, 2));
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          rates: [],
          error: 'shipping_error',
          message: `FedEx OAuth error ${status}`,
        }),
      };
    }

    // Build & call
    const rateBody = buildRateBody({ destination, items, total });
    console.info('FedEx request payload:', JSON.stringify(rateBody, null, 2));

    let fedexJson;
    try {
      fedexJson = await getFedExRates(token, rateBody);
    } catch (e) {
      const status = e.status || 400;
      const data = e.data || {};
      console.error(`FedEx rates error ${status}:`, JSON.stringify(data, null, 2));
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          rates: [],
          error: 'shipping_error',
          message: `FedEx rates error ${status}`,
        }),
      };
    }

    const rates = mapServicesToRates(destination.country, fedexJson);
    if (!rates.length) {
      console.warn('FedEx returned no mappable rates:', JSON.stringify(fedexJson, null, 2));
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          rates: [],
          error: 'shipping_error',
          message: 'No carrier rates available',
        }),
      };
    }

    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ rates }) };
  } catch (err) {
    console.error('shipping_unexpected_error:', err);
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        rates: [],
        error: 'shipping_error',
        message: 'Unexpected error',
      }),
    };
  }
};
