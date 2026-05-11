import { createStore } from './store.mjs';

if (!process.env.DATA_ENCRYPTION_KEY) {
  console.error('DATA_ENCRYPTION_KEY env var required');
  process.exit(1);
}

const dataDir = process.argv[2] || '/app/data';
console.log(`Migrating PII encryption in: ${dataDir}`);
const store = await createStore({ dataDir });
const result = store.migrateEncryptPii();
console.log(`Done: ${result.orders} orders, ${result.stockDevices} stock devices, ${result.allocations} allocations encrypted.`);
