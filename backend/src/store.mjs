import crypto from 'node:crypto';
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

function minimizePaymentPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload ?? null;

  const compact = {};
  const scalarKeys = [
    'id',
    'resource',
    'status',
    'method',
    'description',
    'profileId',
    'sequenceType',
    'createdAt',
    'paidAt',
    'expiresAt',
    'canceledAt',
    'failedAt',
    'failureReason',
    'message',
    'title',
    'detail',
    'field'
  ];

  for (const key of scalarKeys) {
    if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
      compact[key] = payload[key];
    }
  }

  if (payload.amount?.currency && payload.amount?.value) {
    compact.amount = {
      currency: payload.amount.currency,
      value: payload.amount.value
    };
  }

  if (payload._links?.checkout?.href) {
    compact.checkoutUrl = payload._links.checkout.href;
  }

  if (payload.metadata && typeof payload.metadata === 'object') {
    const metadata = {};
    for (const key of ['orderId', 'locale', 'runtime']) {
      if (payload.metadata[key] !== undefined && payload.metadata[key] !== null && payload.metadata[key] !== '') {
        metadata[key] = payload.metadata[key];
      }
    }
    if (Object.keys(metadata).length > 0) {
      compact.metadata = metadata;
    }
  }

  return Object.keys(compact).length > 0 ? compact : null;
}

function normalizeOrder(order) {
  return {
    id: order.id,
    orderNumber: Number.isInteger(order.orderNumber) ? order.orderNumber : null,
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
    statusToken: order.statusToken || crypto.randomUUID(),
    checkoutUrl: order.checkoutUrl || '',
    mollieMode: order.mollieMode || '',
    mollieProfileId: order.mollieProfileId || '',
	    molliePayload: minimizePaymentPayload(order.molliePayload),
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
    orderNumber: row.order_number,
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
    statusToken: row.status_token,
    checkoutUrl: row.checkout_url,
    mollieMode: row.mollie_mode,
    mollieProfileId: row.mollie_profile_id,
	    molliePayload: minimizePaymentPayload(parseJson(row.mollie_payload_json, null)),
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
	    payload: minimizePaymentPayload(parseJson(row.payload_json, null)),
    createdAt: row.created_at
  };
}

function mapInventoryRow(row) {
  if (!row) return null;

  return {
    productKey: row.product_key,
    productName: row.product_name,
    availableUnits: row.available_units,
    leadTimeMinBusinessDays: row.lead_time_min_business_days,
    leadTimeMaxBusinessDays: row.lead_time_max_business_days,
    updatedAt: row.updated_at
  };
}

function mapDeviceModelRow(row) {
  if (!row) return null;

  const legacyParts = [
    row.cpu,
    row.gpu,
    row.vram_gb ? `${row.vram_gb} GB VRAM` : '',
    row.ram_gb ? `${row.ram_gb} GB RAM` : '',
    row.storage_gb ? `${row.storage_gb} GB SSD` : ''
  ].filter(Boolean);

  return {
    productKey: row.product_key,
    productName: row.product_name,
    manufacturer: row.manufacturer || '',
    systemSpec: row.system_spec || legacyParts.join(', '),
    updatedAt: row.updated_at
  };
}

function mapSupplierOrderRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    productKey: row.product_key,
    supplierName: row.supplier_name,
    supplierReference: row.supplier_reference || '',
    quantity: row.quantity,
    pricePerItem: row.price_per_item || '',
    priceIncludesVat: row.price_includes_vat === 1,
    orderedAt: row.ordered_at,
    expectedDeliveryAt: row.expected_delivery_at,
    receivedAt: row.received_at,
    status: row.status,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapStockDeviceRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    productKey: row.product_key,
    modelName: row.model_name || '',
    manufacturer: row.manufacturer || '',
    serialNumber: row.serial_number || '',
    deviceUsername: row.device_username || '',
    devicePassword: row.device_password || '',
    status: row.status || 'available',
    assignedOrderId: row.assigned_order_id || null,
    supplierOrderId: row.supplier_order_id || null,
    supplierName: row.supplier_name || '',
    orderedAt: row.ordered_at || null,
    expectedDeliveryAt: row.expected_delivery_at || null,
    receivedAt: row.received_at || null,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOrderAllocationRow(row) {
  if (!row) return null;

  return {
    orderId: row.order_id,
    productKey: row.product_key,
    quantity: row.quantity,
    status: row.status,
    allocatedAt: row.allocated_at,
    fulfilledAt: row.fulfilled_at,
    releasedAt: row.released_at,
    serialNumber: row.serial_number || '',
    deviceUsername: row.device_username || '',
    devicePassword: row.device_password || '',
    trackingNumber: row.tracking_number || '',
    trackingCarrier: row.tracking_carrier || '',
    installedAt: row.installed_at || null,
    packedAt: row.packed_at || null,
    shippedAt: row.shipped_at || null,
    deliveredAt: row.delivered_at || null,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
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
      order_number INTEGER UNIQUE,
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
      status_token TEXT,
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

    CREATE TABLE IF NOT EXISTS inventory (
      product_key TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      available_units INTEGER NOT NULL DEFAULT 0,
      lead_time_min_business_days INTEGER NOT NULL DEFAULT 3,
      lead_time_max_business_days INTEGER NOT NULL DEFAULT 5,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS device_models (
      product_key TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      system_spec TEXT,
      cpu TEXT,
      gpu TEXT,
      vram_gb INTEGER,
      ram_gb INTEGER,
      storage_gb INTEGER,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS supplier_orders (
      id TEXT PRIMARY KEY,
      product_key TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      supplier_reference TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      ordered_at TEXT,
      expected_delivery_at TEXT,
      received_at TEXT,
      status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(product_key) REFERENCES device_models(product_key) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_supplier_orders_product_key ON supplier_orders(product_key, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON supplier_orders(status, updated_at DESC);

    CREATE TABLE IF NOT EXISTS order_allocations (
      order_id TEXT PRIMARY KEY,
      product_key TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL,
      allocated_at TEXT,
      fulfilled_at TEXT,
      released_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(product_key) REFERENCES device_models(product_key) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_order_allocations_product_key ON order_allocations(product_key, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_order_allocations_status ON order_allocations(status, updated_at DESC);

    CREATE TABLE IF NOT EXISTS stock_devices (
      id TEXT PRIMARY KEY,
      product_key TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      device_username TEXT,
      device_password TEXT,
      status TEXT NOT NULL DEFAULT 'available',
      assigned_order_id TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(product_key) REFERENCES device_models(product_key) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_stock_devices_product_key ON stock_devices(product_key, status);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_devices_serial ON stock_devices(serial_number);
  `);

  function ensureColumn(tableName, columnName, columnSql) {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    if (!columns.some((column) => column.name === columnName)) {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnSql}`);
    }
  }

  ensureColumn('device_models', 'system_spec', 'system_spec TEXT');
  ensureColumn('device_models', 'manufacturer', 'manufacturer TEXT');
  ensureColumn('stock_devices', 'supplier_name', 'supplier_name TEXT');
  ensureColumn('stock_devices', 'supplier_order_id', 'supplier_order_id TEXT');
  ensureColumn('stock_devices', 'ordered_at', 'ordered_at TEXT');
  ensureColumn('stock_devices', 'expected_delivery_at', 'expected_delivery_at TEXT');
  ensureColumn('stock_devices', 'received_at', 'received_at TEXT');
  ensureColumn('supplier_orders', 'price_per_item', 'price_per_item TEXT');
  ensureColumn('supplier_orders', 'price_includes_vat', 'price_includes_vat INTEGER NOT NULL DEFAULT 0');
  ensureColumn('orders', 'status_token', 'status_token TEXT');
  ensureColumn('orders', 'order_number', 'order_number INTEGER');
  ensureColumn('orders', 'is_archived', 'is_archived INTEGER NOT NULL DEFAULT 0');
  ensureColumn('order_allocations', 'serial_number', 'serial_number TEXT');
  ensureColumn('order_allocations', 'device_username', 'device_username TEXT');
  ensureColumn('order_allocations', 'device_password', 'device_password TEXT');
  ensureColumn('order_allocations', 'tracking_number', 'tracking_number TEXT');
  ensureColumn('order_allocations', 'tracking_carrier', 'tracking_carrier TEXT');
  ensureColumn('order_allocations', 'installed_at', 'installed_at TEXT');
  ensureColumn('order_allocations', 'packed_at', 'packed_at TEXT');
  ensureColumn('order_allocations', 'shipped_at', 'shipped_at TEXT');
  ensureColumn('order_allocations', 'delivered_at', 'delivered_at TEXT');
  db.exec('CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number DESC)');

  const upsertOrderStatement = db.prepare(`
    INSERT INTO orders (
      id,
      order_number,
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
	      status_token,
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
      @order_number,
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
	      @status_token,
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
      order_number = excluded.order_number,
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
	      status_token = excluded.status_token,
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
  const getMaxOrderNumberStatement = db.prepare('SELECT COALESCE(MAX(order_number), 0) AS max_order_number FROM orders');
  const listOrdersWithoutOrderNumberStatement = db.prepare(`
    SELECT id
    FROM orders
    WHERE order_number IS NULL
    ORDER BY datetime(created_at) ASC, id ASC
  `);
  const listOrdersWithoutStatusTokenStatement = db.prepare(`
    SELECT id
    FROM orders
    WHERE status_token IS NULL OR status_token = ''
  `);
  const getOrderByPaymentIdStatement = db.prepare('SELECT * FROM orders WHERE payment_id = ? LIMIT 1');
  const listOrdersStatement = db.prepare(`
    SELECT
      id,
      order_number,
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
    WHERE COALESCE(is_archived, 0) = 0
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `);
  const listOrdersOverviewStatement = db.prepare(`
    SELECT
      o.id,
      o.order_number,
      o.created_at,
      o.updated_at,
      o.status,
      o.payment_status,
      o.payment_method,
      o.payment_method_requested,
      o.amount,
      o.currency,
      o.customer_email,
      o.customer_first_name,
      o.customer_last_name,
      o.customer_company,
      o.product,
      o.billing_address_json,
      o.shipping_address_json,
      a.status AS allocation_status,
      a.serial_number AS allocation_serial_number,
      a.installed_at AS allocation_installed_at,
      a.packed_at AS allocation_packed_at,
      a.shipped_at AS allocation_shipped_at,
      a.delivered_at AS allocation_delivered_at,
      a.tracking_number AS allocation_tracking_number
    FROM orders o
    LEFT JOIN order_allocations a ON a.order_id = o.id
    WHERE COALESCE(o.is_archived, 0) = 0
    ORDER BY datetime(o.created_at) DESC
    LIMIT ?
  `);
	  const listPaymentEventsStatement = db.prepare(`
    SELECT *
    FROM payment_events
    WHERE order_id = ?
    ORDER BY datetime(created_at) DESC, id DESC
	  `);
  const listOrdersWithPayloadStatement = db.prepare(`
    SELECT id
    FROM orders
    WHERE mollie_payload_json IS NOT NULL AND mollie_payload_json != ''
  `);
  const listPaymentEventsWithPayloadStatement = db.prepare(`
    SELECT id, payload_json
    FROM payment_events
    WHERE payload_json IS NOT NULL AND payload_json != ''
  `);
  const updatePaymentEventPayloadStatement = db.prepare(`
    UPDATE payment_events
    SET payload_json = @payload_json
    WHERE id = @id
  `);
  const archiveOrderStatement = db.prepare(`UPDATE orders SET is_archived = 1, updated_at = @updated_at WHERE id = @id`);
  const orderExistsStatement = db.prepare('SELECT 1 FROM orders WHERE id = ? LIMIT 1');
  const getInventoryStatement = db.prepare('SELECT * FROM inventory WHERE product_key = ?');
  const getDeviceModelStatement = db.prepare('SELECT * FROM device_models WHERE product_key = ?');
  const listDeviceModelsStatement = db.prepare('SELECT * FROM device_models ORDER BY product_name ASC');
  const upsertDeviceModelStatement = db.prepare(`
    INSERT INTO device_models (
      product_key,
      product_name,
      manufacturer,
      system_spec,
      cpu,
      gpu,
      vram_gb,
      ram_gb,
      storage_gb,
      updated_at
    ) VALUES (
      @product_key,
      @product_name,
      @manufacturer,
      @system_spec,
      @cpu,
      @gpu,
      @vram_gb,
      @ram_gb,
      @storage_gb,
      @updated_at
    )
    ON CONFLICT(product_key) DO UPDATE SET
      product_name = excluded.product_name,
      manufacturer = excluded.manufacturer,
      system_spec = excluded.system_spec,
      cpu = excluded.cpu,
      gpu = excluded.gpu,
      vram_gb = excluded.vram_gb,
      ram_gb = excluded.ram_gb,
      storage_gb = excluded.storage_gb,
      updated_at = excluded.updated_at
  `);
  const getSupplierOrderStatement = db.prepare('SELECT * FROM supplier_orders WHERE id = ?');
  const listSupplierOrdersStatement = db.prepare(`
    SELECT *
    FROM supplier_orders
    WHERE (@product_key IS NULL OR product_key = @product_key)
    ORDER BY
      CASE status
        WHEN 'in_stock' THEN 1
        WHEN 'ordered' THEN 2
        WHEN 'in_transit' THEN 3
        WHEN 'received' THEN 4
        ELSE 9
      END,
      COALESCE(expected_delivery_at, ordered_at, created_at) ASC,
      created_at DESC
  `);
  const upsertSupplierOrderStatement = db.prepare(`
    INSERT INTO supplier_orders (
      id,
      product_key,
      supplier_name,
      supplier_reference,
      quantity,
      price_per_item,
      price_includes_vat,
      ordered_at,
      expected_delivery_at,
      received_at,
      status,
      notes,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @product_key,
      @supplier_name,
      @supplier_reference,
      @quantity,
      @price_per_item,
      @price_includes_vat,
      @ordered_at,
      @expected_delivery_at,
      @received_at,
      @status,
      @notes,
      @created_at,
      @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      product_key = excluded.product_key,
      supplier_name = excluded.supplier_name,
      supplier_reference = excluded.supplier_reference,
      quantity = excluded.quantity,
      price_per_item = excluded.price_per_item,
      price_includes_vat = excluded.price_includes_vat,
      ordered_at = excluded.ordered_at,
      expected_delivery_at = excluded.expected_delivery_at,
      received_at = excluded.received_at,
      status = excluded.status,
      notes = excluded.notes,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at
  `);
  const sumInStockUnitsStatement = db.prepare(`
    SELECT COALESCE(SUM(quantity), 0) AS available_units
    FROM supplier_orders
    WHERE product_key = ? AND status = 'in_stock'
  `);
  const sumAllocatedUnitsStatement = db.prepare(`
    SELECT COALESCE(SUM(quantity), 0) AS allocated_units
    FROM order_allocations
    WHERE product_key = ? AND status IN ('reserved', 'fulfilled', 'installed', 'packed', 'shipped', 'delivered')
  `);
  const getOrderAllocationStatement = db.prepare('SELECT * FROM order_allocations WHERE order_id = ?');
  const listOrderAllocationsStatement = db.prepare(`
    SELECT *
    FROM order_allocations
    WHERE (@product_key IS NULL OR product_key = @product_key)
    ORDER BY datetime(updated_at) DESC, datetime(created_at) DESC
  `);
  const upsertOrderAllocationStatement = db.prepare(`
    INSERT INTO order_allocations (
      order_id,
      product_key,
      quantity,
      status,
      allocated_at,
      fulfilled_at,
      released_at,
      serial_number,
      device_username,
      device_password,
      tracking_number,
      tracking_carrier,
      installed_at,
      packed_at,
      shipped_at,
      delivered_at,
      notes,
      created_at,
      updated_at
    ) VALUES (
      @order_id,
      @product_key,
      @quantity,
      @status,
      @allocated_at,
      @fulfilled_at,
      @released_at,
      @serial_number,
      @device_username,
      @device_password,
      @tracking_number,
      @tracking_carrier,
      @installed_at,
      @packed_at,
      @shipped_at,
      @delivered_at,
      @notes,
      @created_at,
      @updated_at
    )
    ON CONFLICT(order_id) DO UPDATE SET
      product_key = excluded.product_key,
      quantity = excluded.quantity,
      status = excluded.status,
      allocated_at = excluded.allocated_at,
      fulfilled_at = excluded.fulfilled_at,
      released_at = excluded.released_at,
      serial_number = excluded.serial_number,
      device_username = excluded.device_username,
      device_password = excluded.device_password,
      tracking_number = excluded.tracking_number,
      tracking_carrier = excluded.tracking_carrier,
      installed_at = excluded.installed_at,
      packed_at = excluded.packed_at,
      shipped_at = excluded.shipped_at,
      delivered_at = excluded.delivered_at,
      notes = excluded.notes,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at
  `);
  const stockDeviceSelect = `
    SELECT sd.*, dm.product_name AS model_name, dm.manufacturer AS manufacturer
    FROM stock_devices sd
    LEFT JOIN device_models dm ON dm.product_key = sd.product_key
  `;
  const getStockDeviceStatement = db.prepare(`${stockDeviceSelect} WHERE sd.id = ?`);
  const getDevicesByOrderIdStatement = db.prepare(`${stockDeviceSelect} WHERE sd.assigned_order_id = ? ORDER BY sd.created_at ASC`);
  const listStockDevicesStatement = db.prepare(`${stockDeviceSelect} WHERE sd.product_key = ? ORDER BY sd.created_at DESC`);
  const listAllStockDevicesStatement = db.prepare(`${stockDeviceSelect} ORDER BY sd.created_at DESC`);
  const upsertStockDeviceStatement = db.prepare(`
    INSERT INTO stock_devices (
      id, product_key, serial_number, device_username, device_password,
      status, assigned_order_id, supplier_order_id, supplier_name, ordered_at, expected_delivery_at,
      received_at, notes, created_at, updated_at
    ) VALUES (
      @id, @product_key, @serial_number, @device_username, @device_password,
      @status, @assigned_order_id, @supplier_order_id, @supplier_name, @ordered_at, @expected_delivery_at,
      @received_at, @notes, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      serial_number = excluded.serial_number,
      device_username = excluded.device_username,
      device_password = excluded.device_password,
      status = excluded.status,
      assigned_order_id = excluded.assigned_order_id,
      supplier_order_id = excluded.supplier_order_id,
      supplier_name = excluded.supplier_name,
      ordered_at = excluded.ordered_at,
      expected_delivery_at = excluded.expected_delivery_at,
      received_at = excluded.received_at,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `);

  const upsertInventoryStatement = db.prepare(`
    INSERT INTO inventory (
      product_key,
      product_name,
      available_units,
      lead_time_min_business_days,
      lead_time_max_business_days,
      updated_at
    ) VALUES (
      @product_key,
      @product_name,
      @available_units,
      @lead_time_min_business_days,
      @lead_time_max_business_days,
      @updated_at
    )
    ON CONFLICT(product_key) DO UPDATE SET
      product_name = excluded.product_name,
      available_units = excluded.available_units,
      lead_time_min_business_days = excluded.lead_time_min_business_days,
      lead_time_max_business_days = excluded.lead_time_max_business_days,
      updated_at = excluded.updated_at
  `);

  function serializeOrder(order) {
    const normalized = normalizeOrder(order);

    return {
      id: normalized.id,
      order_number: normalized.orderNumber,
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
	      status_token: normalized.statusToken,
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
    const normalized = normalizeOrder(order);
    if (!Number.isInteger(normalized.orderNumber)) {
      normalized.orderNumber = Number(getMaxOrderNumberStatement.get().max_order_number || 0) + 1;
    }
    upsertOrderStatement.run(serializeOrder(normalized));
    return getOrder(normalized.id);
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
      orderNumber: row.order_number,
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

  function listOrdersOverview(limit = 200) {
    return listOrdersOverviewStatement.all(limit).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
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
      customerCompany: row.customer_company || '',
      product: row.product,
      billingAddress: parseJson(row.billing_address_json, {}),
      shippingAddress: parseJson(row.shipping_address_json, {}),
      allocationStatus: row.allocation_status || null,
      allocationSerialNumber: row.allocation_serial_number || '',
      allocationInstalledAt: row.allocation_installed_at || null,
      allocationPackedAt: row.allocation_packed_at || null,
      allocationShippedAt: row.allocation_shipped_at || null,
      allocationDeliveredAt: row.allocation_delivered_at || null,
      allocationTrackingNumber: row.allocation_tracking_number || ''
    }));
  }

  function archiveOrder(orderId) {
    archiveOrderStatement.run({ id: orderId, updated_at: new Date().toISOString() });
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
      payload_json: stringifyJson(minimizePaymentPayload(payload)),
      created_at: new Date().toISOString()
    });

    return {
      inserted: Number(result.changes || 0) > 0
    };
  }

  function saveInventory(item) {
    const now = new Date().toISOString();
    upsertInventoryStatement.run({
      product_key: item.productKey,
      product_name: item.productName,
      available_units: Math.max(0, Number.parseInt(item.availableUnits || '0', 10) || 0),
      lead_time_min_business_days: Math.max(1, Number.parseInt(item.leadTimeMinBusinessDays || '3', 10) || 3),
      lead_time_max_business_days: Math.max(1, Number.parseInt(item.leadTimeMaxBusinessDays || '5', 10) || 5),
      updated_at: now
    });

    return getInventory(item.productKey);
  }

  function getInventory(productKey) {
    return mapInventoryRow(getInventoryStatement.get(productKey));
  }

  function refreshInventoryAvailability(productKey) {
    const current = getInventory(productKey);
    if (!current) return null;

    const inStockUnits = sumInStockUnitsStatement.get(productKey)?.available_units || 0;
    const allocatedUnits = sumAllocatedUnitsStatement.get(productKey)?.allocated_units || 0;
    const availableUnits = Math.max(0, inStockUnits - allocatedUnits);
    return saveInventory({
      ...current,
      availableUnits
    });
  }

  function saveDeviceModel(item) {
    const now = new Date().toISOString();
    upsertDeviceModelStatement.run({
      product_key: item.productKey,
      product_name: item.productName,
      manufacturer: item.manufacturer || null,
      system_spec: item.systemSpec || null,
      cpu: null,
      gpu: null,
      vram_gb: null,
      ram_gb: null,
      storage_gb: null,
      updated_at: now
    });

    return getDeviceModel(item.productKey);
  }

  function getDeviceModel(productKey) {
    return mapDeviceModelRow(getDeviceModelStatement.get(productKey));
  }

  function listDeviceModels() {
    return listDeviceModelsStatement.all().map(mapDeviceModelRow);
  }

  function saveSupplierOrder(order) {
    const now = new Date().toISOString();
    const normalized = {
      id: order.id,
      productKey: order.productKey,
      supplierName: order.supplierName,
      supplierReference: order.supplierReference || null,
      quantity: Math.max(1, Number.parseInt(order.quantity || '1', 10) || 1),
      pricePerItem: order.pricePerItem || null,
      priceIncludesVat: order.priceIncludesVat ? 1 : 0,
      orderedAt: order.orderedAt || null,
      expectedDeliveryAt: order.expectedDeliveryAt || null,
      receivedAt: order.receivedAt || null,
      status: order.status,
      notes: order.notes || null,
      createdAt: order.createdAt || now,
      updatedAt: now
    };

    upsertSupplierOrderStatement.run({
      id: normalized.id,
      product_key: normalized.productKey,
      supplier_name: normalized.supplierName,
      supplier_reference: normalized.supplierReference,
      quantity: normalized.quantity,
      price_per_item: normalized.pricePerItem,
      price_includes_vat: normalized.priceIncludesVat,
      ordered_at: normalized.orderedAt,
      expected_delivery_at: normalized.expectedDeliveryAt,
      received_at: normalized.receivedAt,
      status: normalized.status,
      notes: normalized.notes,
      created_at: normalized.createdAt,
      updated_at: normalized.updatedAt
    });

    refreshInventoryAvailability(normalized.productKey);
    return getSupplierOrder(normalized.id);
  }

  function getSupplierOrder(id) {
    return mapSupplierOrderRow(getSupplierOrderStatement.get(id));
  }

  function listSupplierOrders(productKey = null) {
    return listSupplierOrdersStatement.all({ product_key: productKey || null }).map(mapSupplierOrderRow);
  }

  function saveOrderAllocation(allocation) {
    const now = new Date().toISOString();
    const normalized = {
      orderId: allocation.orderId,
      productKey: allocation.productKey,
      quantity: Math.max(1, Number.parseInt(allocation.quantity || '1', 10) || 1),
      status: allocation.status,
      allocatedAt: allocation.allocatedAt || null,
      fulfilledAt: allocation.fulfilledAt || null,
      releasedAt: allocation.releasedAt || null,
      serialNumber: allocation.serialNumber || null,
      deviceUsername: allocation.deviceUsername || null,
      devicePassword: allocation.devicePassword || null,
      trackingNumber: allocation.trackingNumber || null,
      trackingCarrier: allocation.trackingCarrier || null,
      installedAt: allocation.installedAt || null,
      packedAt: allocation.packedAt || null,
      shippedAt: allocation.shippedAt || null,
      deliveredAt: allocation.deliveredAt || null,
      notes: allocation.notes || null,
      createdAt: allocation.createdAt || now,
      updatedAt: now
    };

    upsertOrderAllocationStatement.run({
      order_id: normalized.orderId,
      product_key: normalized.productKey,
      quantity: normalized.quantity,
      status: normalized.status,
      allocated_at: normalized.allocatedAt,
      fulfilled_at: normalized.fulfilledAt,
      released_at: normalized.releasedAt,
      serial_number: normalized.serialNumber,
      device_username: normalized.deviceUsername,
      device_password: normalized.devicePassword,
      tracking_number: normalized.trackingNumber,
      tracking_carrier: normalized.trackingCarrier,
      installed_at: normalized.installedAt,
      packed_at: normalized.packedAt,
      shipped_at: normalized.shippedAt,
      delivered_at: normalized.deliveredAt,
      notes: normalized.notes,
      created_at: normalized.createdAt,
      updated_at: normalized.updatedAt
    });

    refreshInventoryAvailability(normalized.productKey);
    return getOrderAllocation(normalized.orderId);
  }

  function getOrderAllocation(orderId) {
    return mapOrderAllocationRow(getOrderAllocationStatement.get(orderId));
  }

  function listOrderAllocations(productKey = null) {
    return listOrderAllocationsStatement.all({ product_key: productKey || null }).map(mapOrderAllocationRow);
  }

  function getStockDevice(id) {
    return mapStockDeviceRow(getStockDeviceStatement.get(id));
  }

  function listStockDevices(productKey) {
    return listStockDevicesStatement.all(productKey).map(mapStockDeviceRow);
  }

  function listAllStockDevices() {
    return listAllStockDevicesStatement.all().map(mapStockDeviceRow);
  }

  function listDevicesByOrderId(orderId) {
    return getDevicesByOrderIdStatement.all(orderId).map(mapStockDeviceRow);
  }

  const deleteDeviceModelStatement = db.prepare('DELETE FROM device_models WHERE product_key = ?');
  const deleteStockDeviceStatement = db.prepare('DELETE FROM stock_devices WHERE id = ?');
  const deleteSupplierOrderStatement = db.prepare('DELETE FROM supplier_orders WHERE id = ?');
  const deleteStockDevicesBySupplierOrderStatement = db.prepare("DELETE FROM stock_devices WHERE supplier_order_id = ? AND status = 'ordered'");
  const listDevicesBySupplierOrderStatement = db.prepare(`${stockDeviceSelect} WHERE sd.supplier_order_id = ? ORDER BY sd.created_at ASC`);

  function deleteDeviceModel(productKey) {
    deleteDeviceModelStatement.run(productKey);
  }

  function deleteStockDevice(id) {
    deleteStockDeviceStatement.run(id);
  }

  function deleteSupplierOrder(id) {
    deleteStockDevicesBySupplierOrderStatement.run(id);
    deleteSupplierOrderStatement.run(id);
  }

  function listDevicesBySupplierOrder(supplierOrderId) {
    return listDevicesBySupplierOrderStatement.all(supplierOrderId).map(mapStockDeviceRow);
  }

  function saveStockDevice(device) {
    const now = new Date().toISOString();
    upsertStockDeviceStatement.run({
      id: device.id,
      product_key: device.productKey,
      serial_number: device.serialNumber,
      device_username: device.deviceUsername || null,
      device_password: device.devicePassword || null,
      status: device.status || 'available',
      assigned_order_id: device.assignedOrderId || null,
      supplier_order_id: device.supplierOrderId || null,
      supplier_name: device.supplierName || null,
      ordered_at: device.orderedAt || null,
      expected_delivery_at: device.expectedDeliveryAt || null,
      received_at: device.receivedAt || null,
      notes: device.notes || null,
      created_at: device.createdAt || now,
      updated_at: now
    });
    return getStockDevice(device.id);
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
  for (const row of listOrdersWithPayloadStatement.all()) {
    const existingOrder = getOrder(row.id);
    if (!existingOrder) continue;
    saveOrder(existingOrder);
  }
  for (const row of listPaymentEventsWithPayloadStatement.all()) {
    updatePaymentEventPayloadStatement.run({
      id: row.id,
      payload_json: stringifyJson(minimizePaymentPayload(parseJson(row.payload_json, null)))
    });
  }
  for (const row of listOrdersWithoutStatusTokenStatement.all()) {
    const existingOrder = getOrder(row.id);
    if (!existingOrder) continue;
    saveOrder({
      ...existingOrder,
      statusToken: crypto.randomUUID()
    });
  }
  let nextOrderNumber = Number(getMaxOrderNumberStatement.get().max_order_number || 0) + 1;
  for (const row of listOrdersWithoutOrderNumberStatement.all()) {
    const existingOrder = getOrder(row.id);
    if (!existingOrder) continue;
    saveOrder({
      ...existingOrder,
      orderNumber: nextOrderNumber
    });
    nextOrderNumber += 1;
  }
  if (!getDeviceModel('indiebox-ai-workstation')) {
    saveDeviceModel({
      productKey: 'indiebox-ai-workstation',
      productName: 'Indiebox AI-Workstation',
      systemSpec: 'AMD Ryzen AI Max+ 395, Radeon 8060S, 128 GB RAM, 2 TB SSD'
    });
  }
  if (!getInventory('indiebox-ai-workstation')) {
    saveInventory({
      productKey: 'indiebox-ai-workstation',
      productName: 'Indiebox AI-Workstation',
      availableUnits: 1,
      leadTimeMinBusinessDays: 3,
      leadTimeMaxBusinessDays: 5
    });
  }
  if (listSupplierOrders('indiebox-ai-workstation').length === 0) {
    saveSupplierOrder({
      id: 'supplier-seed-indiebox-1',
      productKey: 'indiebox-ai-workstation',
      supplierName: 'Initial stock',
      supplierReference: 'seed',
      quantity: 1,
      orderedAt: new Date().toISOString().slice(0, 10),
      expectedDeliveryAt: new Date().toISOString().slice(0, 10),
      receivedAt: new Date().toISOString().slice(0, 10),
      status: 'in_stock',
      notes: 'Initial seeded stock item for inventory separation.'
    });
  } else {
    refreshInventoryAvailability('indiebox-ai-workstation');
  }

  return {
    dbPath,
    saveOrder,
    getOrder,
    getOrderByPaymentId,
    listOrders,
    listOrdersOverview,
    listPaymentEvents,
    recordPaymentEvent,
    getInventory,
    saveInventory,
    getDeviceModel,
    saveDeviceModel,
    listDeviceModels,
    getSupplierOrder,
    saveSupplierOrder,
    listSupplierOrders,
    getOrderAllocation,
    saveOrderAllocation,
    listOrderAllocations,
    archiveOrder,
    getStockDevice,
    listStockDevices,
    listAllStockDevices,
    listDevicesByOrderId,
    saveStockDevice,
    deleteDeviceModel,
    deleteStockDevice,
    deleteSupplierOrder,
    listDevicesBySupplierOrder
  };
}
