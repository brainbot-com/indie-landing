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

app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

function requiredField(body, fieldName, maxLength = 300) {
  const value = typeof body[fieldName] === 'string' ? body[fieldName].trim() : '';
  return value.slice(0, maxLength);
}

function adminAuthEnabled() {
  return config.enableAdminApi;
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
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.paidAt
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
  const firstName = requiredField(body, 'firstName');
  const lastName = requiredField(body, 'lastName');
  const email = requiredField(body, 'email');
  const company = requiredField(body, 'company');
  const billingStreet = requiredField(body, 'billingStreet');
  const billingZip = requiredField(body, 'billingZip');
  const billingCity = requiredField(body, 'billingCity');
  const billingCountry = requiredField(body, 'billingCountry');
  const shippingStreet = requiredField(body, 'shippingStreet');
  const shippingZip = requiredField(body, 'shippingZip');
  const shippingCity = requiredField(body, 'shippingCity');
  const shippingCountry = requiredField(body, 'shippingCountry') || 'DE';
  const paymentMethodInput = requiredField(body, 'paymentMethod');
  const locale = body.locale === 'en' ? 'en' : 'de';
  const paymentMethod = paymentMethodForMollie(paymentMethodInput);
  const termsAccepted = body.termsAccepted === 'on';
  const isCompanyOrder = body.isCompanyOrder === 'on';
  const shippingDifferent = body.shippingDifferent === 'on';
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasValidBillingZip = /^\d{5}$/.test(billingZip);
  const hasValidShippingZip = !shippingDifferent || /^\d{5}$/.test(shippingZip);

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
    locale,
    runtime: config.appRuntimeName,
    status: 'draft',
    product: requiredField(body, 'product') || config.checkoutProductName,
    amount: config.checkoutPriceEur,
    currency: 'EUR',
    customer: {
      firstName,
      lastName,
      email,
      phone: requiredField(body, 'phone'),
      company,
      vatId: requiredField(body, 'vatId')
    },
    billingAddress: {
      street: billingStreet,
      zip: billingZip,
      city: billingCity,
      country: billingCountry
    },
    shippingAddress: {
      careOf: requiredField(body, 'shippingCareOf'),
      street: shippingStreet,
      zip: shippingZip,
      city: shippingCity,
      country: shippingDifferent ? shippingCountry : ''
    },
    notes: requiredField(body, 'notes', 4000),
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

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    runtime: config.appRuntimeName,
    env: config.appEnv,
    version: packageJson.version,
    storage: {
      type: 'sqlite',
      dbPath: store.dbPath
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
      detail: error.message
    });
  }
});

app.get('/api/orders/status', (req, res) => {
  const orderId = typeof req.query.order_id === 'string' ? req.query.order_id : '';
  if (!orderId) {
    return res.status(400).json({ error: 'order_id is required' });
  }

  const order = store.getOrder(orderId);
  if (!order) {
    return res.status(404).json({ error: 'order not found' });
  }

  return res.json({
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentId: order.paymentId,
    runtime: config.appRuntimeName,
    locale: order.locale
  });
});

app.get('/api/orders', (req, res) => {
  if (!adminAuthEnabled()) {
    return res.status(404).json({ error: 'not_found' });
  }

  const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '50', 10), 1), 200);
  return res.json({
    runtime: config.appRuntimeName,
    orders: store.listOrders(limit)
  });
});

app.get('/api/orders/:orderId', (req, res) => {
  if (!adminAuthEnabled()) {
    return res.status(404).json({ error: 'not_found' });
  }

  const orderId = req.params.orderId;
  const order = store.getOrder(orderId);
  if (!order) {
    return res.status(404).json({ error: 'order not found' });
  }

  return res.json({
    order,
    events: store.listPaymentEvents(orderId)
  });
});

app.post('/api/orders/checkout', async (req, res) => {
  if (!config.mollieApiKey) {
    return res.status(503).send('Mollie is not configured for this environment.');
  }

  const order = buildOrderFromRequest(req.body);
  if (!order) {
    return res.status(400).send('Required checkout fields are missing.');
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
        redirectUrl: `${config.appBaseUrl}${localePrefix(order.locale)}checkout-status.html?order_id=${order.id}`,
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
      return res.status(502).send('Mollie did not return a checkout URL.');
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

    return res.status(error.status || 502).send(error.message);
  }
});

app.post('/api/mollie/webhook', async (req, res) => {
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

    const eventKey = `webhook:${payment.id}:${payment.status}`;
    const eventResult = store.recordPaymentEvent({
      orderId,
      paymentId,
      source: 'mollie_webhook',
      eventType: 'payment_status_sync',
      paymentStatus: payment.status,
      idempotencyKey: eventKey,
      payload: payment
    });

    if (!eventResult.inserted && order.paymentStatus === payment.status) {
      return res.status(200).send('ok');
    }

    store.saveOrder(mergePaymentIntoOrder(order, payment));
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
