import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';

import { createStore } from './store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  await fs.readFile(path.resolve(__dirname, '..', 'package.json'), 'utf8')
);

const app = express();

const config = {
  appEnv: process.env.APP_ENV || 'development',
  appBaseUrl: (process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  appRuntimeName: process.env.APP_RUNTIME_NAME || process.env.APP_ENV || 'development',
  mollieMode: process.env.MOLLIE_MODE || 'test',
  mollieApiKey: process.env.MOLLIE_API_KEY || '',
  mollieProfileId: process.env.MOLLIE_PROFILE_ID || '',
  checkoutPriceEur: process.env.CHECKOUT_PRICE_EUR || '3999.00',
  checkoutProductName: process.env.CHECKOUT_PRODUCT_NAME || 'Indiebox AI-Workstation',
  checkoutProductKey: process.env.CHECKOUT_PRODUCT_KEY || 'indiebox-ai-workstation',
  adminApiToken: process.env.ADMIN_API_TOKEN || '',
  proxyInternalToken: process.env.PROXY_INTERNAL_TOKEN || '',
  adminLoginHash: process.env.ADMIN_LOGIN_HASH || '',
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET || '',
  adminSessionCookieName: process.env.ADMIN_SESSION_COOKIE_NAME || 'indiebox_admin_session',
  adminSessionTtlSeconds: Number.parseInt(process.env.ADMIN_SESSION_TTL_SECONDS || '2592000', 10),
  dataDir: process.env.DATA_DIR || '/app/data',
  enableAdminApi: process.env.ENABLE_ADMIN_API === 'true' || (process.env.APP_ENV || 'development') === 'development',
  port: Number.parseInt(process.env.PORT || '8080', 10)
};

const supportedPaymentMethods = {
  creditcard: {
    labels: {
      de: 'Kreditkarte',
      en: 'Credit card'
    },
    descriptions: {
      de: 'Visa, Mastercard und weitere Karten über Mollie',
      en: 'Visa, Mastercard, and other cards through Mollie'
    },
    sortOrder: 10
  },
  paypal: {
    labels: {
      de: 'PayPal',
      en: 'PayPal'
    },
    descriptions: {
      de: 'Zahlung über das PayPal-Konto',
      en: 'Pay using a PayPal account'
    },
    sortOrder: 20
  },
  banktransfer: {
    labels: {
      de: 'Überweisung',
      en: 'Bank transfer'
    },
    descriptions: {
      de: 'Klassische Banküberweisung über Mollie',
      en: 'Standard bank transfer through Mollie'
    },
    sortOrder: 30
  }
};

const store = await createStore({ dataDir: config.dataDir, logger: console });
const rateLimitBuckets = new Map();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.json({ limit: '20kb' }));

function localePrefix(locale) {
  return locale === 'en' ? '/en/' : '/';
}

function paymentMethodForMollie(input) {
  switch (input) {
    case 'creditcard':
      return 'creditcard';
    case 'paypal':
      return 'paypal';
    case 'banktransfer':
      return 'banktransfer';
    case 'visa':
    case 'mastercard':
      return 'creditcard';
    default:
      return null;
  }
}

function orderStatusFromPayment(payment) {
  switch (payment.status) {
    case 'paid':
      return 'paid';
    case 'failed':
      return 'failed';
    case 'canceled':
      return 'cancelled';
    case 'expired':
      return 'failed';
    case 'authorized':
      return 'authorized';
    case 'pending':
      return 'pending';
    case 'open':
    default:
      return 'payment_created';
  }
}

function isFinalOrderStatus(status) {
  return ['paid', 'failed', 'cancelled'].includes(status);
}

function requiredField(body, fieldName, maxLength = 300) {
  const value = typeof body[fieldName] === 'string' ? body[fieldName].trim() : '';
  return value.slice(0, maxLength);
}

function sanitizeSingleLineInput(value, maxLength = 300) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeMultilineInput(value, maxLength = 1000) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeEmail(value) {
  return sanitizeSingleLineInput(value, 320).toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeName(value, maxLength = 120) {
  const normalized = sanitizeSingleLineInput(value, maxLength);
  return /^[\p{L}\p{N} .,'&()\/+-]+$/u.test(normalized) ? normalized : '';
}

function normalizeAddressLine(value, maxLength = 180) {
  const normalized = sanitizeSingleLineInput(value, maxLength);
  return /^[\p{L}\p{N} .,'&()\/+#-]+$/u.test(normalized) ? normalized : '';
}

function normalizePostalCodeDe(value) {
  const normalized = sanitizeSingleLineInput(value, 10);
  return /^\d{5}$/.test(normalized) ? normalized : '';
}

function normalizePhone(value) {
  const normalized = sanitizeSingleLineInput(value, 40);
  return !normalized || /^[\d+()\/ -]+$/.test(normalized) ? normalized : '';
}

function normalizeVatId(value) {
  const normalized = sanitizeSingleLineInput(value, 40).toUpperCase();
  return !normalized || /^[A-Z0-9 .-]+$/.test(normalized) ? normalized : '';
}

function normalizeCountryCode(value) {
  const normalized = sanitizeSingleLineInput(value, 2).toUpperCase();
  return normalized === 'DE' ? 'DE' : '';
}

function normalizeIsoDate(value) {
  const normalized = sanitizeSingleLineInput(value, 32);
  return !normalized || /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : '';
}

function normalizeIsoDateTime(value) {
  const normalized = sanitizeSingleLineInput(value, 50);
  return !normalized || /^\d{4}-\d{2}-\d{2}(?:T[\d:.+-]+Z?)?$/.test(normalized) ? normalized : '';
}

function normalizeEnum(value, allowedValues) {
  const normalized = sanitizeSingleLineInput(value, 64);
  return allowedValues.has(normalized) ? normalized : '';
}

function createRateLimit({ bucketName, windowMs, maxRequests }) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${bucketName}:${ip}`;
    const now = Date.now();
    const bucket = rateLimitBuckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      rateLimitBuckets.set(key, {
        count: 1,
        resetAt: now + windowMs
      });
      return next();
    }

    if (bucket.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        error: 'rate_limited',
        retryAfterSeconds
      });
    }

    bucket.count += 1;
    return next();
  };
}

const checkoutRateLimit = createRateLimit({
  bucketName: 'checkout',
  windowMs: 60_000,
  maxRequests: 8
});

const statusRateLimit = createRateLimit({
  bucketName: 'order-status',
  windowMs: 60_000,
  maxRequests: 30
});

const adminRateLimit = createRateLimit({
  bucketName: 'admin',
  windowMs: 60_000,
  maxRequests: 60
});

const webhookRateLimit = createRateLimit({
  bucketName: 'mollie-webhook',
  windowMs: 60_000,
  maxRequests: 120
});

function adminAuthEnabled() {
  return config.enableAdminApi;
}

function parseCookies(req) {
  const cookieHeader = req.get('cookie') || '';
  if (!cookieHeader) return {};

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf('=');
      if (index === -1) return cookies;
      const key = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function signAdminSession(expiresAt) {
  return crypto
    .createHmac('sha256', config.adminSessionSecret)
    .update(`admin:${expiresAt}`)
    .digest('hex');
}

function verifyAdminPassword(password) {
  if (!config.adminLoginHash || !password) return false;
  const [salt, storedHash] = config.adminLoginHash.split(':');
  if (!salt || !storedHash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  const left = Buffer.from(derived, 'utf8');
  const right = Buffer.from(storedHash, 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function getAdminSession(req) {
  if (!config.adminSessionSecret) return { authenticated: false };
  const cookies = parseCookies(req);
  const raw = cookies[config.adminSessionCookieName];
  if (!raw) return { authenticated: false };

  const [expiresAtRaw, signature] = raw.split('.');
  const expiresAt = Number.parseInt(expiresAtRaw || '', 10);
  if (!expiresAt || !signature) return { authenticated: false };
  if (Date.now() >= expiresAt) return { authenticated: false };
  const expectedSignature = signAdminSession(expiresAt);
  const left = Buffer.from(signature, 'utf8');
  const right = Buffer.from(expectedSignature, 'utf8');
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    expiresAt
  };
}

function setAdminSessionCookie(res) {
  const expiresAt = Date.now() + (config.adminSessionTtlSeconds * 1000);
  const value = `${expiresAt}.${signAdminSession(expiresAt)}`;
  const parts = [
    `${config.adminSessionCookieName}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${config.adminSessionTtlSeconds}`
  ];
  if (config.appEnv !== 'development') {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearAdminSessionCookie(res) {
  const parts = [
    `${config.adminSessionCookieName}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0'
  ];
  if (config.appEnv !== 'development') {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function readAdminToken(req) {
  const authHeader = req.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  return req.get('x-admin-token') || '';
}

function requireAdmin(req, res, next) {
  if (!adminAuthEnabled()) {
    return res.status(404).json({ error: 'not_found' });
  }

  if (config.proxyInternalToken) {
    const proxyAuth = req.get('x-proxy-auth') || '';
    if (proxyAuth !== config.proxyInternalToken) {
      return res.status(401).json({ error: 'admin_auth_required' });
    }
  }

  if (getAdminSession(req).authenticated) {
    return next();
  }

  if (!config.adminApiToken) {
    return res.status(401).json({ error: 'admin_auth_required' });
  }

  if (readAdminToken(req) !== config.adminApiToken) {
    return res.status(401).json({ error: 'admin_auth_required' });
  }

  return next();
}

function summarizeOrder(order) {
  if (!order) return null;

  return {
    id: order.id,
    runtime: order.runtime,
    locale: order.locale,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentId: order.paymentId,
    statusToken: order.statusToken,
    paymentMethod: order.paymentMethod,
    paymentMethodRequested: order.paymentMethodRequested,
    amount: order.amount,
    currency: order.currency,
    product: order.product,
    customer: {
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      email: order.customer.email,
      company: order.customer.company
    },
    inventorySnapshot: order.metadata.inventorySnapshot || null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.paidAt
  };
}

function inventoryPayload(item, locale) {
  const inStock = Number(item?.availableUnits || 0) > 0;
  const minDays = item?.leadTimeMinBusinessDays || 3;
  const maxDays = item?.leadTimeMaxBusinessDays || 5;

  return {
    productKey: item?.productKey || config.checkoutProductKey,
    productName: item?.productName || config.checkoutProductName,
    availableUnits: Number(item?.availableUnits || 0),
    leadTimeMinBusinessDays: minDays,
    leadTimeMaxBusinessDays: maxDays,
    inStock,
    shippingCountryScope: 'DE',
    leadTimeLabel: locale === 'en'
      ? (inStock
          ? `Usually ships ${minDays}-${maxDays} business days after order.`
          : 'Delivery timing will be confirmed after the order.')
      : (inStock
          ? `In der Regel ${minDays}-${maxDays} Werktage nach Bestellung.`
          : 'Lieferzeit wird nach der Bestellung bestätigt.'),
    stockLabel: locale === 'en'
      ? (inStock ? 'In stock' : 'Built and shipped after confirmation')
      : (inStock ? 'Auf Lager' : 'Wird nach Bestätigung gebaut und versendet')
  };
}

function deviceModelPayload(model) {
  if (!model) return null;

  return {
    productKey: model.productKey,
    productName: model.productName,
    manufacturer: model.manufacturer || '',
    systemSpec: model.systemSpec,
    updatedAt: model.updatedAt
  };
}

function supplierOrderPayload(order) {
  if (!order) return null;

  return {
    id: order.id,
    productKey: order.productKey,
    supplierName: order.supplierName,
    supplierReference: order.supplierReference,
    quantity: order.quantity,
    pricePerItem: order.pricePerItem || '',
    priceIncludesVat: Boolean(order.priceIncludesVat),
    orderedAt: order.orderedAt,
    expectedDeliveryAt: order.expectedDeliveryAt,
    receivedAt: order.receivedAt,
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

function orderAllocationPayload(allocation) {
  if (!allocation) return null;

  return {
    orderId: allocation.orderId,
    productKey: allocation.productKey,
    quantity: allocation.quantity,
    status: allocation.status,
    allocatedAt: allocation.allocatedAt,
    fulfilledAt: allocation.fulfilledAt,
    releasedAt: allocation.releasedAt,
    serialNumber: allocation.serialNumber || '',
    deviceUsername: allocation.deviceUsername || '',
    devicePassword: allocation.devicePassword || '',
    trackingNumber: allocation.trackingNumber || '',
    trackingCarrier: allocation.trackingCarrier || '',
    installedAt: allocation.installedAt || null,
    packedAt: allocation.packedAt || null,
    shippedAt: allocation.shippedAt || null,
    deliveredAt: allocation.deliveredAt || null,
    notes: allocation.notes,
    createdAt: allocation.createdAt,
    updatedAt: allocation.updatedAt
  };
}

function stockDevicePayload(device) {
  if (!device) return null;
  return {
    id: device.id,
    productKey: device.productKey,
    modelName: device.modelName || '',
    manufacturer: device.manufacturer || '',
    serialNumber: device.serialNumber,
    deviceUsername: device.deviceUsername,
    devicePassword: device.devicePassword,
    status: device.status,
    assignedOrderId: device.assignedOrderId,
    supplierName: device.supplierName || '',
    orderedAt: device.orderedAt || null,
    expectedDeliveryAt: device.expectedDeliveryAt || null,
    receivedAt: device.receivedAt || null,
    notes: device.notes,
    createdAt: device.createdAt,
    updatedAt: device.updatedAt
  };
}

function paymentMethodPayload(methodId, locale) {
  const method = supportedPaymentMethods[methodId];
  if (!method) return null;

  return {
    id: methodId,
    label: method.labels[locale] || method.labels.de,
    description: method.descriptions[locale] || method.descriptions.de,
    sortOrder: method.sortOrder
  };
}

function wantsJsonResponse(req) {
  const accept = req.get('accept') || '';
  const requestMode = req.get('x-checkout-request') || '';
  return requestMode === 'fetch' || accept.includes('application/json');
}

function sendCheckoutError(req, res, status, message, code = 'checkout_error') {
  if (wantsJsonResponse(req)) {
    return res.status(status).json({
      error: code,
      message
    });
  }

  return res.status(status).send(message);
}

async function mollieRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.mollieApiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const detail = payload?.detail || payload?.title || 'Mollie request failed';
    const error = new Error(detail);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function fetchAvailablePaymentMethods(locale) {
  const methodsPayload = await mollieRequest('https://api.mollie.com/v2/methods', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const methods = methodsPayload?._embedded?.methods || [];

  return methods
    .map((method) => paymentMethodPayload(method.id, locale))
    .filter(Boolean)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(({ sortOrder, ...method }) => method);
}

function buildOrderFromRequest(body) {
  const firstName = normalizeName(body.firstName);
  const lastName = normalizeName(body.lastName);
  const email = normalizeEmail(body.email);
  const company = normalizeName(body.company, 160);
  const billingStreet = normalizeAddressLine(body.billingStreet);
  const billingZip = normalizePostalCodeDe(body.billingZip);
  const billingCity = normalizeName(body.billingCity, 120);
  const billingCountry = normalizeCountryCode(body.billingCountry);
  const shippingStreet = normalizeAddressLine(body.shippingStreet);
  const shippingZip = normalizePostalCodeDe(body.shippingZip);
  const shippingCity = normalizeName(body.shippingCity, 120);
  const shippingCountry = normalizeCountryCode(body.shippingCountry) || 'DE';
  const paymentMethodInput = normalizeEnum(body.paymentMethod, new Set(['creditcard', 'paypal', 'banktransfer', 'visa', 'mastercard']));
  const locale = body.locale === 'en' ? 'en' : 'de';
  const paymentMethod = paymentMethodForMollie(paymentMethodInput);
  const termsAccepted = body.termsAccepted === 'on';
  const isCompanyOrder = body.isCompanyOrder === 'on';
  const shippingDifferent = body.shippingDifferent === 'on';
  const hasValidEmail = isValidEmail(email);
  const hasValidBillingZip = Boolean(billingZip);
  const hasValidShippingZip = !shippingDifferent || Boolean(shippingZip);

  const hasRequiredFields = Boolean(
    firstName.length >= 2 &&
      lastName.length >= 2 &&
      hasValidEmail &&
      billingStreet &&
      hasValidBillingZip &&
      billingCity &&
      billingCountry === 'DE' &&
      paymentMethod &&
      termsAccepted &&
      (!isCompanyOrder || company) &&
      (!shippingDifferent || (shippingStreet && hasValidShippingZip && shippingCity && shippingCountry === 'DE'))
  );

  if (!hasRequiredFields) return null;

  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    statusToken: crypto.randomUUID(),
    locale,
    runtime: config.appRuntimeName,
    status: 'draft',
    product: sanitizeSingleLineInput(body.product, 160) || config.checkoutProductName,
    amount: config.checkoutPriceEur,
    currency: 'EUR',
    customer: {
      firstName,
      lastName,
      email,
      phone: normalizePhone(body.phone),
      company,
      vatId: normalizeVatId(body.vatId)
    },
    billingAddress: {
      street: billingStreet,
      zip: billingZip,
      city: billingCity,
      country: billingCountry
    },
    shippingAddress: {
      careOf: normalizeName(body.shippingCareOf, 160),
      street: shippingStreet,
      zip: shippingZip,
      city: shippingCity,
      country: shippingDifferent ? shippingCountry : ''
    },
    notes: sanitizeMultilineInput(body.notes, 2000),
    paymentProvider: 'mollie',
    paymentMethodRequested: paymentMethodInput,
    paymentMethod,
    paymentId: '',
    paymentStatus: '',
    checkoutUrl: '',
    mollieMode: config.mollieMode,
    mollieProfileId: config.mollieProfileId,
    molliePayload: null,
    metadata: {
      isCompanyOrder,
      shippingDifferent
    },
    createdAt: now,
    updatedAt: now,
    paidAt: null
  };
}

function mergePaymentIntoOrder(order, payment) {
  const nextStatus = orderStatusFromPayment(payment);
  const paidAt = nextStatus === 'paid' ? (order.paidAt || new Date().toISOString()) : order.paidAt;

  return {
    ...order,
    status: nextStatus,
    paymentStatus: payment.status,
    paymentId: payment.id,
    paymentMethod: payment.method || order.paymentMethod,
    checkoutUrl: payment?._links?.checkout?.href || order.checkoutUrl,
    mollieMode: config.mollieMode,
    mollieProfileId: config.mollieProfileId,
    molliePayload: payment,
    updatedAt: new Date().toISOString(),
    paidAt
  };
}

function syncOrderAllocation(order) {
  const existing = store.getOrderAllocation(order.id);

  if (order.status === 'paid') {
    if (existing && ['reserved', 'fulfilled'].includes(existing.status)) {
      return existing;
    }

    return store.saveOrderAllocation({
      orderId: order.id,
      productKey: config.checkoutProductKey,
      quantity: 1,
      status: 'reserved',
      allocatedAt: order.paidAt || new Date().toISOString(),
      notes: `Reserved automatically for paid order ${order.id}.`
    });
  }

  if (existing && existing.status === 'reserved' && ['failed', 'cancelled'].includes(order.status)) {
    return store.saveOrderAllocation({
      ...existing,
      status: 'released',
      releasedAt: new Date().toISOString(),
      notes: `Released automatically after order status changed to ${order.status}.`
    });
  }

  return existing;
}

function bootstrapOrderAllocations() {
  for (const orderSummary of store.listOrders(500)) {
    if (orderSummary.status !== 'paid') continue;
    const fullOrder = store.getOrder(orderSummary.id);
    if (fullOrder) {
      syncOrderAllocation(fullOrder);
    }
  }
}

bootstrapOrderAllocations();

async function syncOrderPaymentStatus(order, source = 'status_check') {
  if (!config.mollieApiKey || !order?.paymentId) {
    return order;
  }

  const payment = await mollieRequest(`https://api.mollie.com/v2/payments/${order.paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const nextOrder = mergePaymentIntoOrder(order, payment);
  const idempotencyKey = `${source}:${payment.id}:${payment.status}`;
  const eventResult = store.recordPaymentEvent({
    orderId: nextOrder.id,
    paymentId: payment.id,
    source,
    eventType: 'payment_status_sync',
    paymentStatus: payment.status,
    idempotencyKey,
    payload: payment
  });

  if (!eventResult.inserted && order.paymentStatus === payment.status && order.status === nextOrder.status) {
    return order;
  }

  const savedOrder = store.saveOrder(nextOrder);
  syncOrderAllocation(savedOrder);
  return savedOrder;
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    runtime: config.appRuntimeName,
    env: config.appEnv,
    version: packageJson.version,
    storage: config.appEnv === 'development'
      ? {
          type: 'sqlite',
          dbPath: store.dbPath
        }
      : {
          type: 'sqlite'
        }
  });
});

app.get('/api/version', (_req, res) => {
  res.json({
    name: packageJson.name,
    version: packageJson.version,
    runtime: config.appRuntimeName
  });
});

app.get('/api/admin/session', (req, res) => {
  if (!adminAuthEnabled()) {
    return res.status(404).json({ error: 'not_found' });
  }

  const session = getAdminSession(req);
  return res.json({
    authenticated: session.authenticated,
    expiresAt: session.expiresAt || null
  });
});

app.post('/api/admin/session', adminRateLimit, (req, res) => {
  if (!adminAuthEnabled()) {
    return res.status(404).json({ error: 'not_found' });
  }
  if (!config.adminLoginHash || !config.adminSessionSecret) {
    return res.status(503).json({ error: 'admin_login_not_configured' });
  }

  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: 'admin_login_failed' });
  }

  setAdminSessionCookie(res);
  return res.status(204).end();
});

app.delete('/api/admin/session', (req, res) => {
  clearAdminSessionCookie(res);
  return res.status(204).end();
});

app.get('/api/payment-methods', async (req, res) => {
  if (!config.mollieApiKey) {
    return res.status(503).json({ error: 'mollie_not_configured' });
  }

  const locale = req.query.locale === 'en' ? 'en' : 'de';

  try {
    const methods = await fetchAvailablePaymentMethods(locale);
    return res.json({
      runtime: config.appRuntimeName,
      locale,
      methods
    });
  } catch (error) {
    return res.status(error.status || 502).json({
      error: 'payment_methods_unavailable',
      ...(config.appEnv === 'development' ? { detail: error.message } : {})
    });
  }
});

app.get('/api/inventory/:productKey', (req, res) => {
  const locale = req.query.locale === 'en' ? 'en' : 'de';
  const item = store.getInventory(req.params.productKey);
  const deviceModel = store.getDeviceModel(req.params.productKey);
  if (!item) {
    return res.status(404).json({ error: 'inventory_not_found' });
  }

  return res.json({
    runtime: config.appRuntimeName,
    inventory: inventoryPayload(item, locale),
    deviceModel: deviceModelPayload(deviceModel)
  });
});

app.get('/api/orders/status', statusRateLimit, async (req, res) => {
  const orderId = typeof req.query.order_id === 'string' ? req.query.order_id : '';
  const statusToken = typeof req.query.status_token === 'string' ? req.query.status_token.trim() : '';
  if (!orderId) {
    return res.status(400).json({ error: 'order_id is required' });
  }
  if (!statusToken) {
    return res.status(400).json({ error: 'status_token is required' });
  }

  const order = store.getOrder(orderId);
  if (!order) {
    return res.status(404).json({ error: 'order not found' });
  }
  if (order.statusToken !== statusToken) {
    return res.status(404).json({ error: 'order not found' });
  }

  let currentOrder = order;

  if (currentOrder.paymentId && !isFinalOrderStatus(currentOrder.status)) {
    try {
      currentOrder = await syncOrderPaymentStatus(currentOrder, 'status_check');
    } catch (error) {
      return res.status(error.status || 502).json({
        error: 'status_sync_failed',
        detail: error.message,
        id: currentOrder.id,
        status: currentOrder.status,
        paymentStatus: currentOrder.paymentStatus,
        paymentId: currentOrder.paymentId,
        runtime: config.appRuntimeName,
        locale: currentOrder.locale
      });
    }
  }

  return res.json({
    id: currentOrder.id,
    status: currentOrder.status,
    paymentStatus: currentOrder.paymentStatus,
    paymentId: currentOrder.paymentId,
    runtime: config.appRuntimeName,
    locale: currentOrder.locale
  });
});

app.get('/api/orders', adminRateLimit, requireAdmin, (req, res) => {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '50', 10), 1), 200);
  return res.json({
    runtime: config.appRuntimeName,
    orders: store.listOrders(limit)
  });
});

app.get('/api/admin/orders-overview', adminRateLimit, requireAdmin, (req, res) => {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '200', 10), 1), 500);
  const productKey = config.checkoutProductKey;
  const inventory = store.getInventory(productKey);
  const supplierOrders = store.listSupplierOrders(productKey);
  const inStockUnits = supplierOrders.filter((s) => s.status === 'in_stock').reduce((sum, s) => sum + s.quantity, 0);
  const allocatedUnits = store.listOrderAllocations(productKey)
    .filter((a) => ['reserved', 'fulfilled', 'installed', 'packed', 'shipped', 'delivered'].includes(a.status))
    .reduce((sum, a) => sum + a.quantity, 0);
  const pendingSupplierOrders = supplierOrders
    .filter((s) => ['ordered', 'in_transit'].includes(s.status))
    .map((s) => ({
      id: s.id,
      supplierName: s.supplierName,
      quantity: s.quantity,
      status: s.status,
      expectedDeliveryAt: s.expectedDeliveryAt,
      orderedAt: s.orderedAt
    }));

  return res.json({
    runtime: config.appRuntimeName,
    orders: store.listOrdersOverview(limit),
    stock: {
      productKey,
      inStock: inStockUnits,
      allocated: allocatedUnits,
      available: Math.max(0, inStockUnits - allocatedUnits),
      availableUnits: inventory?.availableUnits ?? 0
    },
    pendingSupplierOrders,
    availableDevices: store.listStockDevices(productKey).filter((d) => d.status === 'available').map((d) => ({ id: d.id, serialNumber: d.serialNumber }))
  });
});

app.post('/api/admin/orders/:orderId/archive', adminRateLimit, requireAdmin, (req, res) => {
  const orderId = req.params.orderId;
  if (!store.getOrder(orderId)) {
    return res.status(404).json({ error: 'order not found' });
  }
  store.archiveOrder(orderId);
  return res.json({ ok: true });
});

app.post('/api/admin/orders/:orderId/order-device', adminRateLimit, requireAdmin, (req, res) => {
  const orderId = req.params.orderId;
  const order = store.getOrder(orderId);
  if (!order) {
    return res.status(404).json({ error: 'order_not_found' });
  }

  const productKey = sanitizeSingleLineInput(req.body.productKey, 80) || config.checkoutProductKey;
  const product = store.getDeviceModel(productKey);
  if (!product) {
    return res.status(400).json({ error: 'unknown_product_key' });
  }

  const supplierName = normalizeName(req.body.supplierName, 160);
  if (!supplierName) {
    return res.status(400).json({ error: 'supplier_name_required' });
  }

  const quantity = Math.max(1, Number.parseInt(req.body.quantity, 10) || 1);
  const orderedAt = normalizeIsoDate(req.body.orderedAt) || null;
  const expectedDeliveryAt = normalizeIsoDate(req.body.expectedDeliveryAt) || null;
  const notes = sanitizeMultilineInput(req.body.notes, 500) || '';

  const devices = [];
  for (let i = 0; i < quantity; i++) {
    const id = crypto.randomUUID();
    const serial = `PENDING-${id.slice(0, 8).toUpperCase()}`;
    const saved = store.saveStockDevice({
      id,
      productKey,
      serialNumber: serial,
      deviceUsername: '',
      devicePassword: '',
      status: 'ordered',
      assignedOrderId: orderId,
      supplierName,
      orderedAt,
      expectedDeliveryAt,
      receivedAt: null,
      notes
    });
    devices.push(stockDevicePayload(saved));
  }

  return res.status(201).json({ devices });
});

app.get('/api/orders/:orderId', adminRateLimit, requireAdmin, (req, res) => {
  const orderId = req.params.orderId;
  const order = store.getOrder(orderId);
  if (!order) {
    return res.status(404).json({ error: 'order not found' });
  }

  return res.json({
    order,
    events: store.listPaymentEvents(orderId),
    allocation: orderAllocationPayload(store.getOrderAllocation(orderId)),
    devices: store.listDevicesByOrderId(orderId).map(stockDevicePayload)
  });
});

app.put('/api/inventory/:productKey', adminRateLimit, requireAdmin, (req, res) => {
  const current = store.getInventory(req.params.productKey);
  const availableUnits = Number.parseInt(req.body.availableUnits, 10);
  const leadTimeMinBusinessDays = Number.parseInt(req.body.leadTimeMinBusinessDays, 10);
  const leadTimeMaxBusinessDays = Number.parseInt(req.body.leadTimeMaxBusinessDays, 10);

  if (!Number.isInteger(availableUnits) || availableUnits < 0) {
    return res.status(400).json({ error: 'invalid_available_units' });
  }

  if (!Number.isInteger(leadTimeMinBusinessDays) || !Number.isInteger(leadTimeMaxBusinessDays) || leadTimeMinBusinessDays < 1 || leadTimeMaxBusinessDays < leadTimeMinBusinessDays) {
    return res.status(400).json({ error: 'invalid_lead_time' });
  }

  const saved = store.saveInventory({
    productKey: req.params.productKey,
    productName: current?.productName || config.checkoutProductName,
    availableUnits,
    leadTimeMinBusinessDays,
    leadTimeMaxBusinessDays
  });

  return res.json({
    inventory: inventoryPayload(saved, 'de')
  });
});

app.get('/api/device-models', adminRateLimit, requireAdmin, (req, res) => {
  return res.json({
    runtime: config.appRuntimeName,
    deviceModels: store.listDeviceModels().map(deviceModelPayload)
  });
});

app.post('/api/device-models', adminRateLimit, requireAdmin, (req, res) => {
  const productName = normalizeName(req.body.productName, 160);
  if (!productName) {
    return res.status(400).json({ error: 'product_name_required' });
  }

  const manufacturer = sanitizeSingleLineInput(req.body.manufacturer, 200) || '';
  // Generate a URL-safe product key from manufacturer + product name
  const base = [manufacturer, productName].filter(Boolean).join('-')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  let productKey = base || 'article';
  // Ensure uniqueness by appending a suffix if needed
  let suffix = 0;
  while (store.getDeviceModel(productKey)) {
    suffix += 1;
    productKey = `${base}-${suffix}`;
  }

  const saved = store.saveDeviceModel({
    productKey,
    productName,
    manufacturer,
    systemSpec: sanitizeSingleLineInput(req.body.systemSpec, 500) || ''
  });

  return res.status(201).json({ deviceModel: deviceModelPayload(saved) });
});

app.put('/api/device-models/:productKey', adminRateLimit, requireAdmin, (req, res) => {
  const existing = store.getDeviceModel(req.params.productKey);
  const normalizedProductName = normalizeName(req.body.productName, 160) || existing?.productName || config.checkoutProductName;
  if (!normalizedProductName) {
    return res.status(400).json({ error: 'product_name_required' });
  }

  const saved = store.saveDeviceModel({
    productKey: req.params.productKey,
    productName: normalizedProductName,
    manufacturer: sanitizeSingleLineInput(req.body.manufacturer, 200) || existing?.manufacturer || '',
    systemSpec: sanitizeSingleLineInput(req.body.systemSpec, 500) || existing?.systemSpec || ''
  });

  return res.json({
    deviceModel: deviceModelPayload(saved)
  });
});

app.delete('/api/device-models/:productKey', adminRateLimit, requireAdmin, (req, res) => {
  const productKey = req.params.productKey;
  if (!store.getDeviceModel(productKey)) {
    return res.status(404).json({ error: 'device_model_not_found' });
  }
  store.deleteDeviceModel(productKey);
  return res.json({ ok: true });
});

app.get('/api/supplier-orders', adminRateLimit, requireAdmin, (req, res) => {
  const productKey = typeof req.query.productKey === 'string' ? req.query.productKey : null;
  return res.json({
    runtime: config.appRuntimeName,
    supplierOrders: store.listSupplierOrders(productKey).map(supplierOrderPayload)
  });
});

app.get('/api/order-allocations', adminRateLimit, requireAdmin, (req, res) => {
  const productKey = typeof req.query.productKey === 'string' ? req.query.productKey : null;
  return res.json({
    runtime: config.appRuntimeName,
    allocations: store.listOrderAllocations(productKey).map(orderAllocationPayload)
  });
});

app.put('/api/order-allocations/:orderId', adminRateLimit, requireAdmin, (req, res) => {
  const orderId = req.params.orderId;
  let existing = store.getOrderAllocation(orderId);
  if (!existing) {
    const order = store.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'order_not_found' });
    }
    const now = new Date().toISOString();
    existing = {
      orderId,
      productKey: order.product || config.checkoutProductKey,
      quantity: 1,
      status: 'reserved',
      allocatedAt: now,
      fulfilledAt: null,
      releasedAt: null,
      serialNumber: '',
      deviceUsername: '',
      devicePassword: '',
      trackingNumber: '',
      trackingCarrier: '',
      installedAt: null,
      packedAt: null,
      shippedAt: null,
      deliveredAt: null,
      notes: '',
      createdAt: now,
      updatedAt: now
    };
  }

  const status = requiredField(req.body, 'status') || existing.status;
  const allowedStatuses = new Set(['reserved', 'installed', 'packed', 'shipped', 'delivered', 'fulfilled', 'released', 'cancelled']);
  if (!allowedStatuses.has(status)) {
    return res.status(400).json({ error: 'invalid_allocation_status' });
  }

  // If a deviceId is provided, copy credentials from the stock device and mark it assigned
  let deviceToAssign = null;
  if (req.body.deviceId) {
    deviceToAssign = store.getStockDevice(req.body.deviceId);
    if (!deviceToAssign || !['available', 'reserved'].includes(deviceToAssign.status)) {
      return res.status(400).json({ error: 'device_not_available' });
    }
  }

  const fulfilledAt = normalizeIsoDateTime(req.body.fulfilledAt);
  const releasedAt = normalizeIsoDateTime(req.body.releasedAt);
  const installedAt = normalizeIsoDateTime(req.body.installedAt);
  const packedAt = normalizeIsoDateTime(req.body.packedAt);
  const shippedAt = normalizeIsoDateTime(req.body.shippedAt);
  const deliveredAt = normalizeIsoDateTime(req.body.deliveredAt);

  const now = new Date().toISOString();
  const saved = store.saveOrderAllocation({
    ...existing,
    status,
    serialNumber: deviceToAssign ? deviceToAssign.serialNumber : (sanitizeSingleLineInput(req.body.serialNumber, 100) || existing.serialNumber),
    deviceUsername: existing.deviceUsername,
    devicePassword: existing.devicePassword,
    trackingNumber: sanitizeSingleLineInput(req.body.trackingNumber, 200) || existing.trackingNumber,
    trackingCarrier: sanitizeSingleLineInput(req.body.trackingCarrier, 100) || existing.trackingCarrier,
    installedAt: status === 'installed' || status === 'packed' || status === 'shipped' || status === 'delivered' || status === 'fulfilled'
      ? (installedAt || existing.installedAt || now)
      : existing.installedAt,
    packedAt: status === 'packed' || status === 'shipped' || status === 'delivered' || status === 'fulfilled'
      ? (packedAt || existing.packedAt || now)
      : existing.packedAt,
    shippedAt: status === 'shipped' || status === 'delivered'
      ? (shippedAt || existing.shippedAt || now)
      : existing.shippedAt,
    deliveredAt: status === 'delivered'
      ? (deliveredAt || existing.deliveredAt || now)
      : existing.deliveredAt,
    fulfilledAt: status === 'fulfilled'
      ? (fulfilledAt || existing.fulfilledAt || now)
      : existing.fulfilledAt,
    releasedAt: status === 'released' || status === 'cancelled'
      ? (releasedAt || existing.releasedAt || now)
      : existing.releasedAt,
    notes: sanitizeMultilineInput(req.body.notes, 1000) || existing.notes
  });

  if (deviceToAssign) {
    store.saveStockDevice({ ...deviceToAssign, status: 'reserved', assignedOrderId: orderId });
  }

  return res.json({
    allocation: orderAllocationPayload(saved),
    inventory: inventoryPayload(store.getInventory(saved.productKey), 'de')
  });
});

app.post('/api/supplier-orders', adminRateLimit, requireAdmin, (req, res) => {
  const productKey = sanitizeSingleLineInput(req.body.productKey, 80) || config.checkoutProductKey;
  const product = store.getDeviceModel(productKey);
  if (!product) {
    return res.status(400).json({ error: 'unknown_product_key' });
  }

  const supplierName = normalizeName(req.body.supplierName, 160);
  const status = normalizeEnum(req.body.status, new Set(['ordered', 'in_transit', 'received', 'in_stock', 'cancelled'])) || 'ordered';
  const quantity = Number.parseInt(req.body.quantity, 10);

  if (!supplierName) {
    return res.status(400).json({ error: 'supplier_name_required' });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'invalid_quantity' });
  }

  const orderedAt = normalizeIsoDate(req.body.orderedAt);
  const expectedDeliveryAt = normalizeIsoDate(req.body.expectedDeliveryAt);
  const receivedAt = normalizeIsoDate(req.body.receivedAt);
  if (req.body.orderedAt && !orderedAt) return res.status(400).json({ error: 'invalid_ordered_at' });
  if (req.body.expectedDeliveryAt && !expectedDeliveryAt) return res.status(400).json({ error: 'invalid_expected_delivery_at' });
  if (req.body.receivedAt && !receivedAt) return res.status(400).json({ error: 'invalid_received_at' });

  const pricePerItem = sanitizeSingleLineInput(req.body.pricePerItem, 40) || null;
  const priceIncludesVat = req.body.priceIncludesVat === true || req.body.priceIncludesVat === 'true' || req.body.priceIncludesVat === '1';

  const supplierOrderId = crypto.randomUUID();
  const saved = store.saveSupplierOrder({
    id: supplierOrderId,
    productKey,
    supplierName,
    supplierReference: sanitizeSingleLineInput(req.body.supplierReference, 120),
    quantity,
    pricePerItem,
    priceIncludesVat,
    orderedAt,
    expectedDeliveryAt,
    receivedAt,
    status,
    notes: sanitizeMultilineInput(req.body.notes, 1000)
  });

  // Auto-create device records for this supplier order
  const now = new Date().toISOString();
  const createdDevices = [];
  for (let i = 0; i < quantity; i++) {
    const deviceId = crypto.randomUUID();
    const placeholderSerial = `PENDING-${deviceId.slice(0, 8).toUpperCase()}`;
    const device = store.saveStockDevice({
      id: deviceId,
      productKey,
      serialNumber: placeholderSerial,
      deviceUsername: '',
      devicePassword: '',
      status: 'ordered',
      assignedOrderId: null,
      supplierName,
      orderedAt: orderedAt || null,
      expectedDeliveryAt: expectedDeliveryAt || null,
      receivedAt: null,
      notes: `Auto-created from supplier order ${supplierOrderId}`,
      createdAt: now
    });
    createdDevices.push(stockDevicePayload(device));
  }

  return res.status(201).json({
    supplierOrder: supplierOrderPayload(saved),
    devices: createdDevices,
    inventory: inventoryPayload(store.getInventory(productKey), 'de')
  });
});

app.put('/api/supplier-orders/:supplierOrderId', adminRateLimit, requireAdmin, (req, res) => {
  const existing = store.getSupplierOrder(req.params.supplierOrderId);
  if (!existing) {
    return res.status(404).json({ error: 'supplier_order_not_found' });
  }

  const status = normalizeEnum(req.body.status, new Set(['ordered', 'in_transit', 'received', 'in_stock', 'cancelled'])) || existing.status;
  if (!status) {
    return res.status(400).json({ error: 'invalid_status' });
  }

  const quantity = Number.parseInt(req.body.quantity, 10);
  const orderedAt = normalizeIsoDate(req.body.orderedAt);
  const expectedDeliveryAt = normalizeIsoDate(req.body.expectedDeliveryAt);
  const receivedAt = normalizeIsoDate(req.body.receivedAt);
  if (req.body.orderedAt && !orderedAt) return res.status(400).json({ error: 'invalid_ordered_at' });
  if (req.body.expectedDeliveryAt && !expectedDeliveryAt) return res.status(400).json({ error: 'invalid_expected_delivery_at' });
  if (req.body.receivedAt && !receivedAt) return res.status(400).json({ error: 'invalid_received_at' });

  const pricePerItem = req.body.pricePerItem !== undefined ? (sanitizeSingleLineInput(req.body.pricePerItem, 40) || null) : existing.pricePerItem;
  const priceIncludesVat = req.body.priceIncludesVat !== undefined
    ? (req.body.priceIncludesVat === true || req.body.priceIncludesVat === 'true' || req.body.priceIncludesVat === '1')
    : existing.priceIncludesVat;

  const saved = store.saveSupplierOrder({
    ...existing,
    supplierName: normalizeName(req.body.supplierName, 160) || existing.supplierName,
    supplierReference: sanitizeSingleLineInput(req.body.supplierReference, 120) || existing.supplierReference,
    quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : existing.quantity,
    pricePerItem,
    priceIncludesVat,
    orderedAt: orderedAt || existing.orderedAt,
    expectedDeliveryAt: expectedDeliveryAt || existing.expectedDeliveryAt,
    receivedAt: receivedAt || existing.receivedAt,
    status,
    notes: sanitizeMultilineInput(req.body.notes, 1000) || existing.notes
  });

  return res.json({
    supplierOrder: supplierOrderPayload(saved),
    inventory: inventoryPayload(store.getInventory(saved.productKey), 'de')
  });
});

app.get('/api/admin/stock-devices', adminRateLimit, requireAdmin, (req, res) => {
  const productKey = typeof req.query.productKey === 'string' ? req.query.productKey : config.checkoutProductKey;
  return res.json({
    devices: store.listStockDevices(productKey).map(stockDevicePayload)
  });
});

app.post('/api/admin/stock-devices', adminRateLimit, requireAdmin, (req, res) => {
  const productKey = sanitizeSingleLineInput(req.body.productKey, 80) || config.checkoutProductKey;
  const serialNumber = sanitizeSingleLineInput(req.body.serialNumber, 100);
  if (!serialNumber) {
    return res.status(400).json({ error: 'serial_number_required' });
  }
  const product = store.getDeviceModel(productKey);
  if (!product) {
    return res.status(400).json({ error: 'unknown_product_key' });
  }
  const saved = store.saveStockDevice({
    id: crypto.randomUUID(),
    productKey,
    serialNumber,
    deviceUsername: sanitizeSingleLineInput(req.body.deviceUsername, 100) || '',
    devicePassword: sanitizeSingleLineInput(req.body.devicePassword, 100) || '',
    status: 'available',
    assignedOrderId: null,
    supplierName: sanitizeSingleLineInput(req.body.supplierName, 160) || '',
    orderedAt: normalizeIsoDate(req.body.orderedAt) || null,
    expectedDeliveryAt: normalizeIsoDate(req.body.expectedDeliveryAt) || null,
    receivedAt: normalizeIsoDate(req.body.receivedAt) || null,
    notes: sanitizeMultilineInput(req.body.notes, 500) || ''
  });
  return res.status(201).json({ device: stockDevicePayload(saved) });
});

app.put('/api/admin/stock-devices/:deviceId', adminRateLimit, requireAdmin, (req, res) => {
  const existing = store.getStockDevice(req.params.deviceId);
  if (!existing) {
    return res.status(404).json({ error: 'device_not_found' });
  }
  const allowedStatuses = new Set(['available', 'ordered', 'reserved', 'assigned', 'retired', 'unavailable', 'in_stock']);
  const status = normalizeEnum(req.body.status, allowedStatuses) || existing.status;
  const serialNumber = sanitizeSingleLineInput(req.body.serialNumber, 100) || existing.serialNumber;

  let saved = store.saveStockDevice({
    ...existing,
    serialNumber,
    deviceUsername: req.body.deviceUsername !== undefined ? (sanitizeSingleLineInput(req.body.deviceUsername, 100) || '') : existing.deviceUsername,
    devicePassword: req.body.devicePassword !== undefined ? (sanitizeSingleLineInput(req.body.devicePassword, 100) || '') : existing.devicePassword,
    status,
    assignedOrderId: req.body.assignedOrderId !== undefined ? (req.body.assignedOrderId || null) : existing.assignedOrderId,
    supplierName: req.body.supplierName !== undefined ? (sanitizeSingleLineInput(req.body.supplierName, 160) || '') : existing.supplierName,
    orderedAt: req.body.orderedAt !== undefined ? (normalizeIsoDate(req.body.orderedAt) || null) : existing.orderedAt,
    expectedDeliveryAt: req.body.expectedDeliveryAt !== undefined ? (normalizeIsoDate(req.body.expectedDeliveryAt) || null) : existing.expectedDeliveryAt,
    receivedAt: req.body.receivedAt !== undefined ? (normalizeIsoDate(req.body.receivedAt) || null) : existing.receivedAt,
    notes: req.body.notes !== undefined ? (sanitizeMultilineInput(req.body.notes, 500) || '') : existing.notes
  });

  // Auto-assign to customer order when device becomes in_stock and has a real serial
  if (status === 'in_stock' && saved.assignedOrderId && !serialNumber.startsWith('PENDING-')) {
    const allocation = store.getOrderAllocation(saved.assignedOrderId);
    if (allocation && !['fulfilled', 'released', 'cancelled'].includes(allocation.status)) {
      store.saveOrderAllocation({ ...allocation, serialNumber });
      saved = store.saveStockDevice({ ...saved, status: 'assigned' });
    }
  }

  return res.json({ device: stockDevicePayload(saved) });
});

app.post('/api/orders/checkout', checkoutRateLimit, async (req, res) => {
  if (!config.mollieApiKey) {
    return sendCheckoutError(req, res, 503, 'Mollie is not configured for this environment.', 'mollie_not_configured');
  }

  const inventory = store.getInventory(config.checkoutProductKey);
  const order = buildOrderFromRequest(req.body);
  if (!order) {
    return sendCheckoutError(req, res, 400, 'Required checkout fields are missing.', 'checkout_fields_missing');
  }

  if (inventory) {
    order.metadata.inventorySnapshot = {
      availableUnits: inventory.availableUnits,
      leadTimeMinBusinessDays: inventory.leadTimeMinBusinessDays,
      leadTimeMaxBusinessDays: inventory.leadTimeMaxBusinessDays,
      capturedAt: new Date().toISOString()
    };
  }

  store.saveOrder(order);
  store.recordPaymentEvent({
    orderId: order.id,
    source: 'checkout',
    eventType: 'checkout_started',
    paymentStatus: null,
    idempotencyKey: `checkout-started:${order.id}`,
    payload: summarizeOrder(order)
  });

  try {
    const payment = await mollieRequest('https://api.mollie.com/v2/payments', {
      method: 'POST',
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: config.checkoutPriceEur
        },
        description: `${config.checkoutProductName} ${order.id}`,
        method: order.paymentMethod,
        redirectUrl: `${config.appBaseUrl}${localePrefix(order.locale)}checkout-status.html?order_id=${order.id}&status_token=${encodeURIComponent(order.statusToken)}`,
        webhookUrl: `${config.appBaseUrl}/api/mollie/webhook`,
        metadata: {
          orderId: order.id,
          locale: order.locale,
          runtime: config.appRuntimeName
        }
      })
    });

    const nextOrder = mergePaymentIntoOrder(order, payment);
    store.saveOrder(nextOrder);
    store.recordPaymentEvent({
      orderId: nextOrder.id,
      paymentId: nextOrder.paymentId,
      source: 'mollie',
      eventType: 'payment_created',
      paymentStatus: nextOrder.paymentStatus,
      idempotencyKey: `payment-created:${nextOrder.paymentId}`,
      payload: payment
    });

    if (!nextOrder.checkoutUrl) {
      return sendCheckoutError(req, res, 502, 'Mollie did not return a checkout URL.', 'missing_checkout_url');
    }

    if (wantsJsonResponse(req)) {
      return res.status(200).json({
        orderId: nextOrder.id,
        checkoutUrl: nextOrder.checkoutUrl
      });
    }

    return res.redirect(303, nextOrder.checkoutUrl);
  } catch (error) {
    const failedOrder = store.saveOrder({
      ...order,
      status: 'failed',
      molliePayload: error.payload || { message: error.message },
      updatedAt: new Date().toISOString()
    });

    store.recordPaymentEvent({
      orderId: failedOrder.id,
      source: 'mollie',
      eventType: 'payment_create_failed',
      paymentStatus: null,
      idempotencyKey: `payment-create-failed:${failedOrder.id}`,
      payload: error.payload || { message: error.message }
    });

    return sendCheckoutError(req, res, error.status || 502, error.message, 'checkout_create_failed');
  }
});

app.post('/api/mollie/webhook', webhookRateLimit, async (req, res) => {
  const paymentId = requiredField(req.body, 'id');
  if (!paymentId) {
    return res.status(400).send('Missing payment id');
  }

  try {
    const payment = await mollieRequest(`https://api.mollie.com/v2/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const orderId = payment?.metadata?.orderId;
    if (!orderId) {
      return res.status(202).send('No order metadata found');
    }

    const order = store.getOrder(orderId) || store.getOrderByPaymentId(paymentId);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    const nextOrder = await syncOrderPaymentStatus(order, 'mollie_webhook');
    if (nextOrder.paymentStatus === order.paymentStatus && nextOrder.status === order.status) {
      return res.status(200).send('ok');
    }

    return res.status(200).send('ok');
  } catch (error) {
    return res.status(error.status || 502).send(error.message);
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'not_found',
    path: req.path
  });
});

app.listen(config.port, () => {
  console.log(
    JSON.stringify({
      msg: 'backend started',
      port: config.port,
      runtime: config.appRuntimeName,
      env: config.appEnv,
      storage: 'sqlite'
    })
  );
});
