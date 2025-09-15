// netlify/functions/shipping.cjs
// Snipcart -> FedEx REST Rates (Production) | CommonJS (.cjs)

// --- Polyfill fetch for Node < 18 (Netlify CLI local suele ser Node 16) ---
let fetchFn = globalThis.fetch;
if (!fetchFn) {
  try {
    fetchFn = require('node-fetch');
  } catch (e) {
    console.error('Missing fetch and node-fetch not installed. Run: npm i node-fetch@2');
    throw e;
  }
}
const fetch = (...args) => fetchFn(...args);

// ---------------------------------------------------------------------------
const EU_COUNTRIES = new Set([
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

const FEDEX_OAUTH_URL = 'https://apis.fedex.com/oauth/token';
const FEDEX_RATE_URL = 'https://apis.fedex.com/rate/v1/rates/quotes';

const env = (k, def) => process.env[k] ?? def;

// Required
const FEDEX_CLIENT_ID = env('FEDEX_CLIENT_ID');
const FEDEX_CLIENT_SECRET = env('FEDEX_CLIENT_SECRET');
const FEDEX_ACCOUNT = env('FEDEX_ACCOUNT_NUMBER');

// Shipper defaults (Barcelona)
const SHIPPER_COMPANY = env('SHIPPER_COMPANY', 'The DIT World Company S.L.U.');
const SHIPPER_PERSON = env('SHIPPER_PERSON', 'The DIT World Company S.L.U.');
const SHIPPER_PHONE = env('SHIPPER_PHONE', '+34999999999');
const SHIPPER_ADDR1 = env('SHIPPER_ADDRESS1', 'Carrer del Vallès 55, 1-2');
const SHIPPER_CITY = env('SHIPPER_CITY', 'Barcelona');
const SHIPPER_POSTAL = env('SHIPPER_POSTAL', '08030');
const SHIPPER_STATE = env('SHIPPER_STATE', 'B'); // Barcelona
const SHIPPER_COUNTRY = env('SHIPPER_COUNTRY', 'ES');

const PICKUP_TYPE = env('PICKUP_TYPE', 'DROPOFF_AT_FEDEX_LOCATION'); // USE_SCHEDULED_PICKUP | CONTACT_FEDEX_TO_SCHEDULE
const CURRENCY = env('CURRENCY', 'EUR');
const COUNTRY_OF_MANUFACTURE = env('COUNTRY_OF_MANUFACTURE', 'DE');

const ENABLE_FALLBACK = String(env('ENABLE_FALLBACK_RATE', 'false')).toLowerCase() === 'true';
const FALLBACK_RATE = Number(env('FALLBACK_RATE_EUR', '99'));

// ---------- helpers ----------
function pkg(weightKg, L, W, H) {
  return {
    weight: { units: 'KG', value: Number(weightKg) },
    dimensions: { length: Number(L), width: Number(W), height: Number(H), units: 'CM' },
  };
}

function expandItemsToPackages(items = []) {
  const packages = [];
  for (const it of items) {
    const name = String(it.name || '').toUpperCase();

    if (name.includes('FILMRAID-4A')) {
      packages.push(pkg(8, 40, 37, 36));
      continue;
    }
    if (name.includes('FILMRAID-6')) {
      packages.push(pkg(12, 40, 37, 36));
      continue;
    }
    if (name.includes('FILMRAID-8')) {
      packages.push(pkg(18, 40, 37, 41));
      continue;
    }

    if (name.includes('FILMRAID-12E')) {
      packages.push(pkg(10, 53, 39, 43)); // Box A RAID
      packages.push(pkg(12, 53, 39, 43)); // Box B HDDs
      continue;
    }

    // default safe
    packages.push(pkg(10, 40, 37, 36));
  }
  const totalWeightKg = packages.reduce((s, p) => s + Number(p.weight.value || 0), 0);
  return { packages, totalWeightKg };
}

function isInternational(originCountry, destCountry) {
  if (originCountry === destCountry) return false;
  if (EU_COUNTRIES.has(originCountry) && EU_COUNTRIES.has(destCountry)) return false;
  return true;
}

// --- OAuth robust: try body creds first, then Basic Auth ---
async function getFedExToken() {
  // attempt #1: client_id/secret in body
  const body1 = new URLSearchParams();
  body1.set('grant_type', 'client_credentials');
  body1.set('client_id', process.env.FEDEX_CLIENT_ID);
  body1.set('client_secret', process.env.FEDEX_CLIENT_SECRET);

  let res = await fetch(FEDEX_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body1,
  });

  let data = await res.json().catch(() => ({}));
  if (res.ok && data.access_token) return data.access_token;
  console.error(
    'FedEx OAuth attempt#1 (body creds) failed:',
    JSON.stringify(data, null, 2),
    'status=',
    res.status,
  );

  // attempt #2: Authorization: Basic
  const body2 = new URLSearchParams();
  body2.set('grant_type', 'client_credentials');

  res = await fetch(FEDEX_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${process.env.FEDEX_CLIENT_ID}:${process.env.FEDEX_CLIENT_SECRET}`).toString(
          'base64',
        ),
    },
    body: body2,
  });

  data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    console.error(
      'FedEx OAuth attempt#2 (basic auth) failed:',
      JSON.stringify(data, null, 2),
      'status=',
      res.status,
    );
    throw Object.assign(new Error('fedex_oauth_error'), { status: res.status, data });
  }
  return data.access_token;
}

function buildShipper() {
  return {
    contact: {
      companyName: SHIPPER_COMPANY,
      personName: SHIPPER_PERSON,
      phoneNumber: SHIPPER_PHONE,
    },
    address: {
      streetLines: [SHIPPER_ADDR1],
      city: SHIPPER_CITY,
      postalCode: SHIPPER_POSTAL,
      countryCode: SHIPPER_COUNTRY,
      stateOrProvinceCode: SHIPPER_STATE,
    },
  };
}

function buildRecipient(addr) {
  const phone = addr.phone || addr.phoneNumber || '+34999999999';
  const contact = {
    companyName: addr.company || 'Customer',
    personName: addr.name || 'Recipient',
    phoneNumber: phone,
  };
  const address = {
    streetLines: [addr.address1].filter(Boolean),
    city: addr.city,
    postalCode: addr.postalCode,
    countryCode: addr.country,
    residential: true,
  };
  if (addr.state) address.stateOrProvinceCode = String(addr.state).toUpperCase();
  return { contact, address };
}

function buildCustomsIfNeeded(originCountry, destCountry, declaredAmount, totalWeightKg) {
  if (!isInternational(originCountry, destCountry)) return null;
  return {
    dutiesPayment: { paymentType: 'SENDER' }, // Temporary DDP (account disallows RECIPIENT)
    commercialInvoice: { termsOfSale: 'DDP', purpose: 'SOLD' },
    commodities: [
      {
        description: 'RAID storage system',
        harmonizedCode: '847170',
        countryOfManufacture: COUNTRY_OF_MANUFACTURE,
        quantity: 1,
        quantityUnits: 'PCS',
        weight: { units: 'KG', value: Number(totalWeightKg) || 1 },
        customsValue: { amount: Number(declaredAmount) || 1, currency: CURRENCY },
      },
    ],
  };
}

function buildRateBody({ destination, items, total }) {
  const shipper = buildShipper();
  const recipient = buildRecipient(destination);
  const { packages, totalWeightKg } = expandItemsToPackages(items);

  const requestedShipment = {
    shipper,
    recipient,
    preferredCurrency: CURRENCY,
    rateRequestType: ['ACCOUNT'],
    pickupType: PICKUP_TYPE,
    packagingType: 'YOUR_PACKAGING',
    totalDeclaredValue: { amount: Number(total), currency: CURRENCY },
    requestedPackageLineItems: packages,
    shippingChargesPayment: {
      paymentType: 'SENDER',
      payor: { responsibleParty: { accountNumber: { value: FEDEX_ACCOUNT } } },
    },
  };

  const customs = buildCustomsIfNeeded(
    shipper.address.countryCode,
    recipient.address.countryCode,
    total,
    totalWeightKg,
  );
  if (customs) requestedShipment.customsClearanceDetail = customs;

  // ⚠️ Do NOT include "serviceType"
  // ⚠️ Do NOT include "shipmentSpecialServices" (SIGNATURE_OPTION)

  return {
    accountNumber: { value: FEDEX_ACCOUNT },
    requestedShipment,
  };
}

async function fetchRates(body, token) {
  console.log('FedEx request payload:', JSON.stringify(body, null, 2));
  const res = await fetch(FEDEX_RATE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-locale': 'en_US',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`FedEx rates error ${res.status}:`, JSON.stringify(data, null, 2));
    const e = new Error('fedex_rate_error');
    e.status = res.status;
    e.data = data;
    throw e;
  }
  return data;
}

// --- robust mapping: accept numbers and { amount, currency } objects ---
function mapFedExToSnipcartRates(data) {
  const out = data?.output || data || {};
  const details =
    out.rateReplyDetails || out.rateResponseDetails || out.rates || out.serviceOptions || [];

  const rates = [];

  for (const d of details) {
    const serviceType =
      d.serviceType ||
      d.service ||
      d?.transitDetail?.serviceType ||
      d?.serviceDescription?.serviceType ||
      'FEDEX_SERVICE';

    const rsd = Array.isArray(d.ratedShipmentDetails)
      ? d.ratedShipmentDetails
      : d.ratedShipments || [];
    let amount = null;
    let currency = d.currency || CURRENCY;

    for (const r of rsd) {
      const srd =
        r.shipmentRateDetail ||
        r.shipmentRateDetails ||
        r.packageRateDetail ||
        r.packageRateDetails ||
        {};
      const candidates = [
        srd.totalNetCharge,
        srd.totalNetFedExCharge,
        srd.totalBaseCharge,
        r.totalNetCharge,
        r.totalNetFedExCharge,
        r.netCharge,
      ];
      for (const c of candidates) {
        if (c == null) continue;
        if (typeof c === 'number') {
          amount = Number(c);
          break;
        }
        if (typeof c === 'object' && c.amount != null) {
          amount = Number(c.amount);
          currency = c.currency || currency;
          break;
        }
      }
      if (!currency) {
        currency =
          srd.currency ||
          d.currency ||
          (srd.totalNetCharge && srd.totalNetCharge.currency) ||
          (srd.totalNetFedExCharge && srd.totalNetFedExCharge.currency) ||
          CURRENCY;
      }
      if (amount != null) break;
    }

    if (amount == null && d?.shipmentRateDetail?.totalNetCharge != null) {
      const tnc = d.shipmentRateDetail.totalNetCharge;
      if (typeof tnc === 'number') amount = Number(tnc);
      else if (typeof tnc === 'object' && tnc.amount != null) {
        amount = Number(tnc.amount);
        currency = tnc.currency || currency || CURRENCY;
      }
    }

    if (amount != null) {
      rates.push({
        id: `FEDEX_${serviceType}`,
        name: `FedEx ${d.serviceName || serviceType}`,
        cost: Number(amount),
      });
    }
  }

  rates.sort((a, b) => a.cost - b.cost);
  return rates;
}

// --- UX: filter & rename services (EN only) ---
function normalizeRates(rates, destCountry) {
  const isDomesticES = destCountry === 'ES';

  const labelMap = new Map([
    // International
    ['FEDEX_FEDEX_INTERNATIONAL_CONNECT_PLUS', 'Economy (3–5 days)'],
    ['FEDEX_FEDEX_INTERNATIONAL_PRIORITY', 'Express (1–3 days)'],
    ['FEDEX_FEDEX_INTERNATIONAL_PRIORITY_EXPRESS', 'Express AM (1–2 days)'],
    ['FEDEX_INTERNATIONAL_ECONOMY', 'Economy (4–7 days)'],
    ['FEDEX_INTERNATIONAL_FIRST', 'Early delivery (expensive)'],

    // Domestic ES
    ['FEDEX_FEDEX_PRIORITY', 'Standard (24–48h)'],
    ['FEDEX_FEDEX_PRIORITY_EXPRESS', 'Express (before 10/12h)'],
    ['FEDEX_FEDEX_FIRST', 'Early delivery (expensive)'],
  ]);

  let allow = new Set();
  if (isDomesticES) {
    // Domestic Spain: show Priority + Priority Express
    allow = new Set(['FEDEX_FEDEX_PRIORITY', 'FEDEX_FEDEX_PRIORITY_EXPRESS']);
  } else {
    // International: show ICP + Priority (+ Economy if present)
    allow = new Set([
      'FEDEX_FEDEX_INTERNATIONAL_CONNECT_PLUS',
      'FEDEX_FEDEX_INTERNATIONAL_PRIORITY',
      'FEDEX_INTERNATIONAL_ECONOMY',
    ]);
  }

  const filtered = rates
    .filter((r) => allow.has(r.id))
    .map((r) => ({ ...r, name: labelMap.get(r.id) || r.name }))
    .sort((a, b) => a.cost - b.cost);

  if (!filtered.length && rates.length) {
    const cheapest = [...rates].sort((a, b) => a.cost - b.cost)[0];
    cheapest.name = labelMap.get(cheapest.id) || cheapest.name;
    return [cheapest];
  }
  return filtered;
}

// ---------- Netlify handler (CommonJS) ----------
module.exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  const hasId = !!process.env.FEDEX_CLIENT_ID;
  const hasSec = !!process.env.FEDEX_CLIENT_SECRET;
  const hasAcc = !!process.env.FEDEX_ACCOUNT_NUMBER;
  console.log('FEDEX env present?:', { id: hasId, secret: hasSec, account: hasAcc });

  try {
    if (!hasId || !hasSec || !hasAcc) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          rates: [],
          error: 'shipping_error',
          message: 'FedEx not configured (missing env)',
        }),
      };
    }

    const payload = JSON.parse(event.body || '{}');
    const content = payload.content || {};
    const destination = content.shippingAddress || {};
    const items = Array.isArray(content.items) ? content.items : [];
    const total =
      Number(content.total || 0) ||
      items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

    if (
      !destination.country ||
      !destination.postalCode ||
      !destination.city ||
      !destination.address1
    ) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          rates: [],
          error: 'shipping_error',
          message: 'Invalid destination address',
        }),
      };
    }

    // --- OAuth (clear logging) ---
    let token;
    try {
      token = await getFedExToken();
    } catch (e) {
      const status = e.status || 400;
      const data = e.data || {};
      console.error(`FedEx OAuth error catch (${status}):`, JSON.stringify(data, null, 2));
      return {
        statusCode: 200,
        body: JSON.stringify({
          rates: [],
          error: 'shipping_error',
          message: `FedEx OAuth error ${status}`,
        }),
      };
    }

    const body = buildRateBody({ destination, items, total });

    let fedexData;
    try {
      fedexData = await fetchRates(body, token);
    } catch (e) {
      const status = e.status || 400;
      const data = e.data || {};
      console.error(`FedEx rates error catch (${status}):`, JSON.stringify(data, null, 2));

      if (ENABLE_FALLBACK) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            rates: [
              {
                id: 'FALLBACK_STANDARD',
                name: 'Standard Shipping (fallback)',
                cost: Number(FALLBACK_RATE),
              },
            ],
            warning: 'fedex_rates_unavailable_fallback',
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          rates: [],
          error: 'shipping_error',
          message: `FedEx rates error ${status}`,
        }),
      };
    }

    const rates = mapFedExToSnipcartRates(fedexData);
    const destCountry = (destination?.country || '').toUpperCase();
    const normalized = normalizeRates(rates, destCountry);

    if (!normalized.length) {
      console.warn(
        'FedEx returned rates but none selected after normalization:',
        JSON.stringify(rates, null, 2),
      );
      if (ENABLE_FALLBACK) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            rates: [
              {
                id: 'FALLBACK_STANDARD',
                name: 'Standard Shipping (fallback)',
                cost: Number(FALLBACK_RATE),
              },
            ],
            warning: 'fedex_no_rates_fallback',
          }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          rates: [],
          error: 'shipping_error',
          message: 'FedEx returned no rates',
        }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ rates: normalized }) };
  } catch (err) {
    console.error('shipping_unexpected_error:', err && err.stack ? err.stack : err);
    return {
      statusCode: 200,
      body: JSON.stringify({ rates: [], error: 'shipping_error', message: 'Unexpected error' }),
    };
  }
};
