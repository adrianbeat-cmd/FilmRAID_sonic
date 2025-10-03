// netlify/functions/shipping.js
// CommonJS style to keep Netlify Lambda compatibility even if package.json has "type": "module"
const fetch = require('node-fetch'); // v2.x
const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
};

const FEDEX_BASE = process.env.FEDEX_API_BASE || 'https://apis.fedex.com';
const FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID;
const FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET;
const FEDEX_ACCOUNT_NUMBER = process.env.FEDEX_ACCOUNT_NUMBER;

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
    stateOrProvinceCode: 'B', // optional but helps FedEx routing in ES/Barcelona
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
      { w: 10, l: 53, wdt: 39, h: 43, units: 'CM' }, // Box A (RAID)
      { w: 12, l: 53, wdt: 39, h: 43, units: 'CM' }, // Box B (HDDs)
    ],
  },
};

// --- NAME NORMALIZATION ---
function pickFirstKnownItemName(items) {
  // We use first item to determine package mapping.
  for (const it of items) {
    if (PACK_MAP[it.name]) return it.name;
  }
  // If unknown, default to 12kg medium box (safe fallback)
  return 'FilmRaid-6 (108TB/120TB/132TB)';
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

// --- Build FedEx Rate body ---
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
    // Include insuredValue to carry declared value cost into quote
    if (insured > 0) {
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

    // Total declared value helps some lanes compute fuel/fees consistently
    totalDeclaredValue: { amount: declaredTotal, currency: 'EUR' },

    requestedPackageLineItems: lineItems,

    // For now we keep DDP OFF here (customs block omitted) until Marta habilite DAP/DeclaredValue everywhere.
    // When switching to DAP: add customsClearanceDetail with dutiesPayment RECIPIENT + termsOfSale DAP
  };

  // US/CA require state/province code.
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

// --- Filter/Map services to neat options ---
function mapServicesToRates(destinationCountry, fedexOutput) {
  if (!fedexOutput?.output?.rateReplyDetails?.length) return [];

  const isDomesticES = destinationCountry === 'ES';
  const list = fedexOutput.output.rateReplyDetails;

  // International: EXCLUDE ICP (Connect Plus).
  const ALLOW_INTL = new Set([
    'FEDEX_INTERNATIONAL_PRIORITY',
    'FEDEX_INTERNATIONAL_ECONOMY', // some regions
    'INTERNATIONAL_ECONOMY', // legacy alias in others
  ]);

  // Spain domestic: exact codes FedEx returns
  const ALLOW_ES = new Set([
    'FEDEX_FIRST', // early morning
    'FEDEX_PRIORITY_EXPRESS', // express (before 10/12h)
    'FEDEX_PRIORITY', // standard (24–48h)
  ]);

  const results = [];

  for (const r of list) {
    const code = r.serviceType;
    if (!code) continue;

    // Filter per lane
    if (isDomesticES) {
      if (!ALLOW_ES.has(code)) continue;
    } else {
      if (!ALLOW_INTL.has(code)) continue;
    }

    const priced = pickBestRated(r);
    if (!priced || typeof priced.netCharge !== 'number') continue;

    const id = `FEDEX_${code}`;
    const cost = round2(priced.netCharge);

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
        name = 'Express (1–3 days)';
        description = 'International Priority (1–3 días)';
      } else if (code === 'FEDEX_INTERNATIONAL_ECONOMY' || code === 'INTERNATIONAL_ECONOMY') {
        name = 'Economy (4–7 days)';
        description = 'International Economy (4–7 días)';
      }
    }

    results.push({ id, name, description, cost });
  }

  results.sort((a, b) => a.cost - b.cost);
  return results;
}

function pickBestRated(rateReplyDetail) {
  // prefer ACCOUNT rate with netCharge (netCharge = netFedExCharge + taxes typically)
  const rsd = rateReplyDetail?.ratedShipmentDetails || [];
  for (const d of rsd) {
    const pkg = (d?.ratedPackages && d.ratedPackages[0]) || {};
    const pr = pkg.packageRateDetail || d.shipmentRateDetail || {};
    // Some responses have netCharge or totalNetCharge; normalize to netCharge for UI
    const netCharge =
      numberOrNull(pr.netCharge) ??
      numberOrNull(pr.totalNetCharge) ??
      numberOrNull(d.totalNetCharge);
    if (typeof netCharge === 'number') {
      return { netCharge };
    }
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

    // Parse payload
    const payload = JSON.parse(event.body || '{}');
    const content = payload.content || {};
    let destination = content.shippingAddress || {};
    const items = Array.isArray(content.items) ? content.items : [];
    const total =
      Number(content.total || 0) ||
      items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

    // --- Address guard ---
    // Snipcart calls the webhook repeatedly while the user types. If we don't have country+postal yet,
    // return a placeholder so the UI doesn't flash "No methods".
    // If we don't have enough address info yet, return NO rates.
    // This prevents Snipcart from allowing payment without shipping.
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

    // Normalize minimal fields to keep FedEx happy even if city/street are missing
    destination = {
      ...destination,
      city: destination.city || '',
      address1: destination.address1 || 'Address',
    };

    // --- OAuth ---
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

    // --- Build body & call FedEx ---
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

    // Success
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ rates }),
    };
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
