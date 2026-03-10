import fs from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

function stringifyJson(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  return JSON.stringify(value);
}

function parseJson(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeOrder(order) {
  return {
    id: order.id,
    locale: order.locale || 'de',
    runtime: order.runtime || 'development',
    status: order.status || 'draft',
    product: order.product || '',
    amount: order.amount || '',
    currency: order.currency || 'EUR',
    customer: {
      firstName: order.customer?.firstName || '',
      lastName: order.customer?.lastName || '',
      email: order.customer?.email || '',
      phone: order.customer?.phone || '',
      company: order.customer?.company || '',
      vatId: order.customer?.vatId || ''
    },
    billingAddress: order.billingAddress || {},
    shippingAddress: order.shippingAddress || {},
    notes: order.notes || '',
    paymentProvider: order.paymentProvider || 'mollie',
    paymentMethodRequested: order.paymentMethodRequested || '',
    paymentMethod: order.paymentMethod || '',
    paymentId: order.paymentId || '',
    paymentStatus: order.paymentStatus || '',
    checkoutUrl: order.checkoutUrl || '',
    mollieMode: order.mollieMode || '',
    mollieProfileId: order.mollieProfileId || '',
    molliePayload: order.molliePayload || null,
    metadata: order.metadata || {},
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.paidAt || null
  };
}

function mapOrderRow(row) {
  if (!row) return null;

  return normalizeOrder({
    id: row.id,
    locale: row.locale,
    runtime: row.runtime,
    status: row.status,
    product: row.product,
    amount: row.amount,
    currency: row.currency,
    customer: {
      firstName: row.customer_first_name,
      lastName: row.customer_last_name,
      email: row.customer_email,
      phone: row.customer_phone,
      company: row.customer_company,
      vatId: row.customer_vat_id
    },
    billingAddress: parseJson(row.billing_address_json, {}),
    shippingAddress: parseJson(row.shipping_address_json, {}),
    notes: row.notes,
    paymentProvider: row.payment_provider,
    paymentMethodRequested: row.payment_method_requested,
    paymentMethod: row.payment_method,
    paymentId: row.payment_id,
    paymentStatus: row.payment_status,
    checkoutUrl: row.checkout_url,
    mollieMode: row.mollie_mode,
    mollieProfileId: row.mollie_profile_id,
    molliePayload: parseJson(row.mollie_payload_json, null),
    metadata: parseJson(row.metadata_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at
  });
}

function mapEventRow(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    paymentId: row.payment_id,
    source: row.source,
    eventType: row.event_type,
    paymentStatus: row.payment_status,
    idempotencyKey: row.idempotency_key,
    payload: parseJson(row.payload_json, null),
    createdAt: row.created_at
  };
}

export async function createStore({ dataDir, logger = console }) {
  await fs.mkdir(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, 'indiebox.sqlite');
  const legacyOrdersDir = path.join(dataDir, 'orders');
  const db = new DatabaseSync(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      locale TEXT NOT NULL,
      runtime TEXT NOT NULL,
      status TEXT NOT NULL,
      product TEXT NOT NULL,
      amount TEXT NOT NULL,
      currency TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_first_name TEXT NOT NULL,
      customer_last_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_company TEXT,
      customer_vat_id TEXT,
      billing_address_json TEXT NOT NULL,
      shipping_address_json TEXT,
      notes TEXT,
      payment_provider TEXT NOT NULL DEFAULT 'mollie',
      payment_method_requested TEXT,
      payment_method TEXT,
      payment_id TEXT,
      payment_status TEXT,
      checkout_url TEXT,
      mollie_mode TEXT,
      mollie_profile_id TEXT,
      mollie_payload_json TEXT,
      metadata_json TEXT,
      paid_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

    CREATE TABLE IF NOT EXISTS payment_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT,
      payment_id TEXT,
      source TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payment_status TEXT,
      idempotency_key TEXT NOT NULL UNIQUE,
      payload_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON payment_events(order_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON payment_events(payment_id, created_at DESC);
  `);

  const upsertOrderStatement = db.prepare(`
    INSERT INTO orders (
      id,
      locale,
      runtime,
      status,
      product,
      amount,
      currency,
      customer_email,
      customer_first_name,
      customer_last_name,
      customer_phone,
      customer_company,
      customer_vat_id,
      billing_address_json,
      shipping_address_json,
      notes,
      payment_provider,
      payment_method_requested,
      payment_method,
      payment_id,
      payment_status,
      checkout_url,
      mollie_mode,
      mollie_profile_id,
      mollie_payload_json,
      metadata_json,
      paid_at,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @locale,
      @runtime,
      @status,
      @product,
      @amount,
      @currency,
      @customer_email,
      @customer_first_name,
      @customer_last_name,
      @customer_phone,
      @customer_company,
      @customer_vat_id,
      @billing_address_json,
      @shipping_address_json,
      @notes,
      @payment_provider,
      @payment_method_requested,
      @payment_method,
      @payment_id,
      @payment_status,
      @checkout_url,
      @mollie_mode,
      @mollie_profile_id,
      @mollie_payload_json,
      @metadata_json,
      @paid_at,
      @created_at,
      @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      locale = excluded.locale,
      runtime = excluded.runtime,
      status = excluded.status,
      product = excluded.product,
      amount = excluded.amount,
      currency = excluded.currency,
      customer_email = excluded.customer_email,
      customer_first_name = excluded.customer_first_name,
      customer_last_name = excluded.customer_last_name,
      customer_phone = excluded.customer_phone,
      customer_company = excluded.customer_company,
      customer_vat_id = excluded.customer_vat_id,
      billing_address_json = excluded.billing_address_json,
      shipping_address_json = excluded.shipping_address_json,
      notes = excluded.notes,
      payment_provider = excluded.payment_provider,
      payment_method_requested = excluded.payment_method_requested,
      payment_method = excluded.payment_method,
      payment_id = excluded.payment_id,
      payment_status = excluded.payment_status,
      checkout_url = excluded.checkout_url,
      mollie_mode = excluded.mollie_mode,
      mollie_profile_id = excluded.mollie_profile_id,
      mollie_payload_json = excluded.mollie_payload_json,
      metadata_json = excluded.metadata_json,
      paid_at = excluded.paid_at,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at
  `);

  const insertPaymentEventStatement = db.prepare(`
    INSERT OR IGNORE INTO payment_events (
      order_id,
      payment_id,
      source,
      event_type,
      payment_status,
      idempotency_key,
      payload_json,
      created_at
    ) VALUES (
      @order_id,
      @payment_id,
      @source,
      @event_type,
      @payment_status,
      @idempotency_key,
      @payload_json,
      @created_at
    )
  `);

  const getOrderStatement = db.prepare('SELECT * FROM orders WHERE id = ?');
  const getOrderByPaymentIdStatement = db.prepare('SELECT * FROM orders WHERE payment_id = ? LIMIT 1');
  const listOrdersStatement = db.prepare(`
    SELECT
      id,
      created_at,
      updated_at,
      status,
      payment_status,
      payment_method,
      payment_method_requested,
      amount,
      currency,
      customer_email,
      customer_first_name,
      customer_last_name,
      product
    FROM orders
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `);
  const listPaymentEventsStatement = db.prepare(`
    SELECT *
    FROM payment_events
    WHERE order_id = ?
    ORDER BY datetime(created_at) DESC, id DESC
  `);
  const orderExistsStatement = db.prepare('SELECT 1 FROM orders WHERE id = ? LIMIT 1');

  function serializeOrder(order) {
    const normalized = normalizeOrder(order);

    return {
      id: normalized.id,
      locale: normalized.locale,
      runtime: normalized.runtime,
      status: normalized.status,
      product: normalized.product,
      amount: normalized.amount,
      currency: normalized.currency,
      customer_email: normalized.customer.email,
      customer_first_name: normalized.customer.firstName,
      customer_last_name: normalized.customer.lastName,
      customer_phone: normalized.customer.phone || null,
      customer_company: normalized.customer.company || null,
      customer_vat_id: normalized.customer.vatId || null,
      billing_address_json: stringifyJson(normalized.billingAddress, '{}'),
      shipping_address_json: stringifyJson(normalized.shippingAddress, '{}'),
      notes: normalized.notes || null,
      payment_provider: normalized.paymentProvider,
      payment_method_requested: normalized.paymentMethodRequested || null,
      payment_method: normalized.paymentMethod || null,
      payment_id: normalized.paymentId || null,
      payment_status: normalized.paymentStatus || null,
      checkout_url: normalized.checkoutUrl || null,
      mollie_mode: normalized.mollieMode || null,
      mollie_profile_id: normalized.mollieProfileId || null,
      mollie_payload_json: stringifyJson(normalized.molliePayload),
      metadata_json: stringifyJson(normalized.metadata, '{}'),
      paid_at: normalized.paidAt || null,
      created_at: normalized.createdAt,
      updated_at: normalized.updatedAt
    };
  }

  function saveOrder(order) {
    upsertOrderStatement.run(serializeOrder(order));
    return getOrder(order.id);
  }

  function getOrder(orderId) {
    return mapOrderRow(getOrderStatement.get(orderId));
  }

  function getOrderByPaymentId(paymentId) {
    return mapOrderRow(getOrderByPaymentIdStatement.get(paymentId));
  }

  function listOrders(limit = 50) {
    return listOrdersStatement.all(limit).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      paymentMethodRequested: row.payment_method_requested,
      amount: row.amount,
      currency: row.currency,
      customerEmail: row.customer_email,
      customerName: `${row.customer_first_name} ${row.customer_last_name}`.trim(),
      product: row.product
    }));
  }

  function listPaymentEvents(orderId) {
    return listPaymentEventsStatement.all(orderId).map(mapEventRow);
  }

  function recordPaymentEvent({ orderId = null, paymentId = null, source, eventType, paymentStatus = null, idempotencyKey, payload = null }) {
    const result = insertPaymentEventStatement.run({
      order_id: orderId,
      payment_id: paymentId,
      source,
      event_type: eventType,
      payment_status: paymentStatus,
      idempotency_key: idempotencyKey,
      payload_json: stringifyJson(payload),
      created_at: new Date().toISOString()
    });

    return {
      inserted: Number(result.changes || 0) > 0
    };
  }

  async function migrateLegacyJsonOrders() {
    let fileNames = [];

    try {
      fileNames = (await fs.readdir(legacyOrdersDir)).filter((fileName) => fileName.endsWith('.json'));
    } catch {
      return;
    }

    for (const fileName of fileNames) {
      const filePath = path.join(legacyOrdersDir, fileName);

      try {
        const payload = JSON.parse(await fs.readFile(filePath, 'utf8'));
        if (!payload?.id || orderExistsStatement.get(payload.id)) continue;

        saveOrder({
          ...payload,
          paymentProvider: payload.paymentProvider || 'mollie',
          molliePayload: payload.payment || payload.molliePayload || payload.mollieError || null,
          metadata: payload.metadata || {}
        });

        recordPaymentEvent({
          orderId: payload.id,
          paymentId: payload.paymentId || null,
          source: 'migration',
          eventType: 'legacy_import',
          paymentStatus: payload.paymentStatus || null,
          idempotencyKey: `migration:${payload.id}`,
          payload
        });
      } catch (error) {
        logger.error?.(`Failed to import legacy order ${fileName}: ${error.message}`);
      }
    }
  }

  await migrateLegacyJsonOrders();

  return {
    dbPath,
    saveOrder,
    getOrder,
    getOrderByPaymentId,
    listOrders,
    listPaymentEvents,
    recordPaymentEvent
  };
}
