// netlify/functions/shipping.js
// Node 18+ (Netlify Functions runtime). Uses global fetch.
// Returns live FedEx rates for all destinations now.
// When DHL creds are added, EU routes will auto-switch to DHL.

// ---- Config (origin + behavior) ----
const ORIGIN = {
  countryCode: 'ES',
  postalCode: '08030',
  city: 'Barcelona',
  addressLine: 'Carrer del Vallès 55, 1-2',
  company: 'The DIT World Company S.L.U.',
  phone: '+34 000 000 000',
};

const CURRENCY_FALLBACK = 'EUR';
const BILLABLE_DIVISOR = 5000; // volumetric kg = (LxWxH)/5000 (cm)

// Services to return (keep labels stable for Snipcart)
const SERVICE_LABELS = {
  FEDEX_INTL_ECONOMY:
    'FedEx International Economy — DAP (duties not included) — Signature required',
  FEDEX_INTL_PRIORITY:
    'FedEx International Priority — DAP (duties not included) — Signature required',
  DHL_ECONOMY: 'DHL Economy Select — DAP (duties not included) — Signature required',
  DHL_EXPRESS: 'DHL Express Worldwide — DAP (duties not included) — Signature required',
};

// EU country codes (ISO2)
const EU_CODES = new Set([
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
  'PT',
]);

// Env
const {
  FEDEX_CLIENT_ID,
  FEDEX_CLIENT_SECRET,
  FEDEX_ACCOUNT_NUMBER,
  FEDEX_METER_NUMBER, // optional
  DHL_CLIENT_ID,
  DHL_CLIENT_SECRET,
  DHL_ACCOUNT_NUMBER,
} = process.env;

const DHL_ENABLED = !!(DHL_CLIENT_ID && DHL_CLIENT_SECRET && DHL_ACCOUNT_NUMBER);
const FEDEX_ENABLED = !!(FEDEX_CLIENT_ID && FEDEX_CLIENT_SECRET && FEDEX_ACCOUNT_NUMBER);

// ---- Helpers: logging safe objects ----
const log = (...args) => console.log('[shipping]', ...args);

// ---- Snipcart handler ----
exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const content = payload.content || payload.cart || payload || {};
    const currency = (content.currency && content.currency.toUpperCase()) || CURRENCY_FALLBACK;

    const shippingAddr = resolveDestination(content);
    if (!shippingAddr || !shippingAddr.countryCode) {
      log('Missing destination address; returning no rates.');
      return ok({ rates: [] });
    }

    // Build packages from items using FilmRAID model matrix
    const items = Array.isArray(content.items) ? content.items : [];
    const parcels = buildParcelsFromItems(items);
    if (!parcels.length) {
      // Fallback: allow quoting a single 1kg/40x37x36 cm parcel if nothing matched
      parcels.push(pkg('GENERIC', 1, 40, 37, 36));
    }

    // Declared value: sum of item price*qty (best effort).
    const declared = declaredValueFromItems(items, content.total, currency);

    // Route selection (EU → DHL if enabled; else FedEx)
    const isEU = EU_CODES.has(shippingAddr.countryCode);
    let rates = [];

    // If DHL creds present and destination is EU: use DHL, else FedEx
    if (isEU && DHL_ENABLED) {
      // Placeholder until DHL creds are added; will return DHL rates then.
      rates = await getDhlRates(shippingAddr, parcels, declared, currency);
    } else {
      if (!FEDEX_ENABLED) {
        log('FedEx not configured; returning no rates.');
        return ok({ rates: [] });
      }
      rates = await getFedexRates(shippingAddr, parcels, declared, currency);
    }

    // Snipcart wants: [{ cost (in cents), description, guaranteed_days_to_delivery? }]
    return ok({ rates });
  } catch (err) {
    console.error('Shipping webhook error:', err);
    // Keep 200 so Snipcart UI doesn't hard fail
    return ok({ rates: [] });
  }
};

// ---------------- Address & items parsing ----------------

function resolveDestination(content) {
  // Snipcart can send shippingAddress or deliveryAddress; fallback to billingAddress
  const a =
    content.shippingAddress ||
    content.deliveryAddress ||
    content.shipment?.deliveryAddress ||
    content.billingAddress ||
    {};

  // Normalize keys
  return {
    countryCode: (a.country || a.country_code || a.countryCode || '').toUpperCase(),
    postalCode: a.postalCode || a.postal_code || a.zip || '',
    city: a.city || a.locality || '',
    stateOrProvinceCode: a.province || a.state || a.region || '',
    addressLine1: a.address1 || a.address || '',
    addressLine2: a.address2 || '',
    company: a.company || '',
    personName:
      [a.name, a.fullName, a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : ''].filter(
        Boolean,
      )[0] || '',
    phoneNumber: a.phone || '',
    email: a.email || '',
  };
}

function declaredValueFromItems(items, cartTotalMaybe, currency) {
  // Try items first
  let sum = 0;
  for (const it of items) {
    const price = toNumber(it.price);
    const qty = toNumber(it.quantity) || 1;
    if (isFinite(price) && isFinite(qty)) sum += price * qty;
  }

  // If items look empty, try cart total (guess units)
  if (sum <= 0 && typeof cartTotalMaybe === 'number') {
    // Heuristic: if it's big (>= 1000), assume cents
    sum = cartTotalMaybe >= 1000 ? cartTotalMaybe / 100 : cartTotalMaybe;
  }
  if (!isFinite(sum) || sum <= 0) sum = 1; // never 0

  return { amount: round2(sum), currency: (currency || CURRENCY_FALLBACK).toUpperCase() };
}

function toNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v.replace(',', '.'));
  return NaN;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ---- FilmRAID packing rules ----

function buildParcelsFromItems(items) {
  const parcels = [];
  for (const it of items) {
    const model = resolveModel(it);
    const qty = Number(it.quantity || 1);

    if (!model || qty <= 0) continue;

    switch (model) {
      case 'FR-4A': {
        for (let i = 0; i < qty; i++) parcels.push(pkg(model, 8, 40, 37, 36));
        break;
      }
      case 'FR-6': {
        for (let i = 0; i < qty; i++) parcels.push(pkg(model, 12, 40, 37, 36));
        break;
      }
      case 'FR-8': {
        for (let i = 0; i < qty; i++) parcels.push(pkg(model, 18, 40, 37, 41));
        break;
      }
      case 'FR-12E': {
        // Two boxes per unit: 10kg & 12kg, both 53×39×43 cm
        for (let i = 0; i < qty; i++) {
          parcels.push(pkg(model + '-A', 10, 53, 39, 43));
          parcels.push(pkg(model + '-B', 12, 53, 39, 43));
        }
        break;
      }
      default: {
        // Unknown model → conservative 10kg mid-size
        for (let i = 0; i < qty; i++) parcels.push(pkg('GENERIC', 10, 40, 37, 36));
      }
    }
  }
  return parcels;
}

function resolveModel(item) {
  // Prefer explicit metadata
  const meta = item.customFields || item.metadata || item.custom_fields || {};
  const mMeta = (meta.model || meta.Model || '').toString().toUpperCase();
  if (/^FR-(4A|6|8|12E)$/.test(mMeta)) return mMeta;

  // Derive from id/sku/name
  const s = [item.id, item.sku, item.itemId, item.name].filter(Boolean).join(' ').toLowerCase();

  if (s.includes('filmraid-4a') || s.includes('fr-4a')) return 'FR-4A';
  if (s.includes('filmraid-6') || s.includes('fr-6')) return 'FR-6';
  if (s.includes('filmraid-8') || s.includes('fr-8')) return 'FR-8';
  if (s.includes('filmraid-12e') || s.includes('fr-12e')) return 'FR-12E';

  return null;
}

function pkg(ref, kg, L, W, H) {
  const dim = (L * W * H) / BILLABLE_DIVISOR;
  const billable = Math.max(kg, round2(dim));
  return { ref, kg, L, W, H, billable };
}

// ---------------- FedEx Rates ----------------

let FEDEX_TOKEN = { value: null, expiresAt: 0 };

async function getFedexToken() {
  const now = Date.now();
  if (FEDEX_TOKEN.value && now < FEDEX_TOKEN.expiresAt - 30_000) {
    return FEDEX_TOKEN.value;
  }
  const url = 'https://apis.fedex.com/oauth/token';
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
    const t = await res.text();
    throw new Error(`FedEx OAuth failed: ${res.status} ${t}`);
  }
  const json = await res.json();
  FEDEX_TOKEN.value = json.access_token;
  // expires_in is seconds
  FEDEX_TOKEN.expiresAt = Date.now() + (json.expires_in || 300) * 1000;
  return FEDEX_TOKEN.value;
}

async function getFedexRates(dest, parcels, declared, currency) {
  const token = await getFedexToken();

  // Split declared value evenly per piece (insured value per pkg)
  const perPkgValue = round2(declared.amount / parcels.length);

  const requestedPackageLineItems = parcels.map((p, idx) => ({
    groupPackageCount: 1,
    sequenceNumber: (idx + 1).toString(),
    weight: { units: 'KG', value: Number(p.billable) || Number(p.kg) || 1 },
    dimensions: { length: p.L, width: p.W, height: p.H, units: 'CM' },
    insuredValue: { amount: perPkgValue, currency },
  }));

  const body = {
    accountNumber: { value: FEDEX_ACCOUNT_NUMBER },
    requestedShipment: {
      shipper: {
        accountNumber: { value: FEDEX_ACCOUNT_NUMBER },
        address: {
          countryCode: ORIGIN.countryCode,
          postalCode: ORIGIN.postalCode,
          city: ORIGIN.city,
          addressLine1: ORIGIN.addressLine,
        },
        contact: { personName: ORIGIN.company, phoneNumber: ORIGIN.phone },
      },

      recipient: {
        address: {
          countryCode: dest.countryCode,
          postalCode: dest.postalCode,
          city: dest.city,
          stateOrProvinceCode: dest.stateOrProvinceCode || '', // ✅ add state (e.g., CA)
          residential: false,
        },
        contact: {
          personName: dest.personName || 'Recipient',
          phoneNumber: dest.phoneNumber || '000',
        },
      },
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      packagingType: 'YOUR_PACKAGING',
      preferredCurrency: currency,
      rateRequestType: ['LIST', 'ACCOUNT'],
      requestedPackageLineItems,
      shipmentSpecialServices: {
        specialServiceTypes: ['SIGNATURE_OPTION'],
        signatureOptionDetail: { optionType: 'DIRECT' },
      },
      totalDeclaredValue: { amount: declared.amount, currency },
      shippingChargesPayment: {
        paymentType: 'SENDER',
        payor: {
          responsibleParty: {
            accountNumber: { value: FEDEX_ACCOUNT_NUMBER }, // payor = same account
          },
        },
      },
    },
  };
  // ===== FDX DEBUG: what we are sending (accounts, origin/dest, packages) =====
  log('FDX DEBUG accounts:', {
    rootAccount: body?.accountNumber?.value,
    shipperAccount: body?.requestedShipment?.shipper?.accountNumber?.value,
    payorAccount:
      body?.requestedShipment?.shippingChargesPayment?.payor?.responsibleParty?.accountNumber
        ?.value,
  });

  log('FDX DEBUG origin/dest:', {
    origin: {
      countryCode: ORIGIN.countryCode,
      postalCode: ORIGIN.postalCode,
      city: ORIGIN.city,
    },
    dest: {
      countryCode: body?.requestedShipment?.recipient?.address?.countryCode,
      postalCode: body?.requestedShipment?.recipient?.address?.postalCode,
      state: body?.requestedShipment?.recipient?.address?.stateOrProvinceCode,
      city: body?.requestedShipment?.recipient?.address?.city,
    },
  });

  log(
    'FDX DEBUG packages:',
    (body?.requestedShipment?.requestedPackageLineItems || []).map((p) => ({
      weight: p?.weight?.value,
      units: p?.weight?.units,
      dims: [
        p?.dimensions?.length,
        p?.dimensions?.width,
        p?.dimensions?.height,
        p?.dimensions?.units,
      ],
    })),
  );
  // ===== END FDX DEBUG (pre-request) =====

  const res = await fetch('https://apis.fedex.com/rate/v1/rates/quotes', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-locale': 'en_US',
    },
    body: JSON.stringify(body),
  });

  // ---- TEMP DEBUG LOGGING ----
  const rawText = await res.text();

  if (!res.ok) {
    log('FedEx rate error:', res.status, rawText);
    return [];
  }

  let out;
  try {
    out = JSON.parse(rawText);
  } catch (e) {
    log('FedEx parse error:', e, rawText);
    return [];
  }

  // Optional: see which services came back
  const serviceTypes = (out?.output?.rateReplyDetails || []).map((d) => d.serviceType);
  log('FedEx OK:', serviceTypes);

  const details = out?.output?.rateReplyDetails || [];

  // Find the two services we want
  const pick = (svcType) => details.find((d) => (d.serviceType || '').includes(svcType));

  const econ = pick('INTERNATIONAL_ECONOMY');
  const pri = pick('INTERNATIONAL_PRIORITY');

  const toCents = (amt) => Math.max(0, Math.round(Number(amt || 0) * 100));

  const rates = [];

  if (econ) {
    const amount = resolveNetChargeAmount(econ, currency);
    rates.push({
      description: SERVICE_LABELS.FEDEX_INTL_ECONOMY,
      cost: toCents(amount),
      guaranteed_days_to_delivery: parseTransitDays(econ),
    });
  }

  if (pri) {
    const amount = resolveNetChargeAmount(pri, currency);
    rates.push({
      description: SERVICE_LABELS.FEDEX_INTL_PRIORITY,
      cost: toCents(amount),
      guaranteed_days_to_delivery: parseTransitDays(pri),
    });
  }

  // If neither found but FedEx returned something, pick the cheapest 1–2
  if (!rates.length && Array.isArray(details) && details.length) {
    const byCost = details
      .map((d) => ({
        d,
        amount: resolveNetChargeAmount(d, currency),
      }))
      .filter((x) => isFinite(x.amount))
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 2);

    for (const x of byCost) {
      rates.push({
        description: `FedEx ${beautifyServiceName(x.d.serviceType)} — DAP (duties not included) — Signature required`,
        cost: toCents(x.amount),
        guaranteed_days_to_delivery: parseTransitDays(x.d),
      });
    }
  }

  return rates;
}

function resolveNetChargeAmount(detail, currency) {
  // Prefer totalNetCharge if present, else totalBaseCharge
  const totals =
    (detail.ratedShipmentDetails &&
      detail.ratedShipmentDetails[0] &&
      detail.ratedShipmentDetails[0].amount) ||
    {};
  // Newer responses might expose 'totalNetFedExCharge' or nested 'shipmentRateDetail'
  if (totals.totalNetCharge) return Number(totals.totalNetCharge);
  if (totals.totalNetFedExCharge) return Number(totals.totalNetFedExCharge);

  const srd = detail.shipmentRateDetail || {};
  if (srd.totalNetCharge) return Number(srd.totalNetCharge);
  if (srd.totalNetFedExCharge) return Number(srd.totalNetFedExCharge);
  if (srd.totalBaseCharge) return Number(srd.totalBaseCharge);

  // Last resort: sum surcharges if provided (rare)
  return Number(srd.totalNetChargeWithDutiesAndTaxes || 0);
}

function parseTransitDays(detail) {
  // FedEx often returns enumerations like "TWO_DAYS", "FOUR_DAYS"
  const tt = (detail && detail.transitTime) || '';
  const m = tt.match(/(\d+)/);
  if (m) return Number(m[1]);
  // If serviceType hints priority/economy, give typical windows
  const svc = (detail && detail.serviceType) || '';
  if (svc.includes('PRIORITY')) return 2;
  if (svc.includes('ECONOMY')) return 4;
  return undefined;
}

function beautifyServiceName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------- DHL Rates (stub until creds are added) ----------------

async function getDhlRates(dest, parcels, declared, currency) {
  if (!DHL_ENABLED) {
    return []; // Will fall back to FedEx in handler if EU + no DHL
  }

  // TODO: Implement MyDHL API when DHL provides your production Client ID/Secret + Account.
  // For now, return empty so handler can route to FedEx if you prefer a temporary global fallback.
  // If you want to *block* EU until DHL is live, leave as [] and remove FedEx fallback in the handler.
  return [];
}

// ---------------- HTTP helpers ----------------
function ok(body) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
