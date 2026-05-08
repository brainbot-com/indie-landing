# Indie.Box Devices API — Provisioning Spec

Internal specification for the HTTP API used by the **box-side install script** to read and write its own device record on the Indie.Box backend.

This document is the contract between:
- the install-script developer (calls the API from the box)
- the backend (serves the API)

> **Implementation status:** The API key auth layer is implemented and live. The `/api/v1/devices/*` endpoints described below are **not yet implemented in the backend** — this spec defines the contract that will be built. Until then, calls to these paths return `404`.

---

## 1. Purpose

Each Indie.Box ships with an install script that runs on first boot. The script needs to:

1. Verify with the backend that the device serial is known and assigned.
2. Read its target hostname and assigned-order ID.
3. Write back the chosen hostname and the post-install device credentials.
4. Mark itself as `installed` once the box is ready for shipping.

This API is **device-scoped**: a script authenticated with an API key can only operate on its own serial number. It must **not** expose customer PII (name, email, address) to the box.

---

## 2. Environments

| Environment | Base URL                         | API key prefix    |
| ----------- | -------------------------------- | ----------------- |
| Live        | `https://indiebox.ai/api/v1`     | `ind_bo_live_…`   |
| Staging     | `https://staging.indiebox.ai/api/v1` | `ind_bo_stg_…` |
| Local dev   | `http://127.0.0.1:8080/api/v1`   | `ind_bo_dev_…`    |

The prefix encodes the environment so a leaked or misused key is easy to detect.

---

## 3. Authentication

All requests must include a Bearer token in the `Authorization` header:

```
Authorization: Bearer ind_bo_live_<64-hex-chars>
```

- Tokens are SHA-256 hashed at rest in the backend; the plaintext is shown **once** at creation and never again.
- A revoked or deleted key returns `401 unauthorized` for every request.
- Each call updates the key's `last_used_at` timestamp (visible in the admin UI).

### How to get a key

1. An admin signs in to `https://staging.indiebox.ai/admin/configuration.html` (or the live equivalent).
2. Switches to the **API Keys** tab.
3. Clicks **+ Create Key**, enters a label (e.g. `install-script-staging`), and submits.
4. Copies the token from the modal — it is shown only once.
5. Stores the token in the install-script's secrets storage.

Keys can be **disabled** (soft revoke, can audit) or **deleted** (hard removal) from the same UI.

---

## 4. Endpoints

### 4.1 `GET /api/v1/devices/{serial}`

Fetch the device record for a given serial number.

**Path parameters**
- `serial` — the device's serial number, URL-encoded.

**Response 200**
```json
{
  "device": {
    "serialNumber": "MX24A1B0019",
    "productKey": "indiebox-ai-workstation",
    "modelName": "NUC 14 Pro AI",
    "manufacturer": "ASUS",
    "hostname": "",
    "status": "in_stock",
    "assignedOrderId": null,
    "createdAt": "2026-04-12T08:14:22.000Z",
    "updatedAt": "2026-04-12T08:14:22.000Z"
  }
}
```

**Notes**
- `assignedOrderId` is an opaque internal ID. It is exposed so the box can correlate logs server-side; it does **not** unlock customer data.
- `device_username` and `device_password` are write-only via this API. They are never returned in `GET` responses.
- `status` values: `ordered`, `in_stock`, `available`, `reserved`, `assigned`, `installed`, `retired`.

**Errors**
- `401 unauthorized` — missing/invalid key.
- `404 device_not_found` — no device with that serial.

---

### 4.2 `PATCH /api/v1/devices/{serial}`

Update writable fields on the device record. Send only the fields you want to change.

**Body**
```json
{
  "hostname": "indiebox-aurora-01",
  "deviceUsername": "indie",
  "devicePassword": "<generated-during-install>",
  "notes": "OS image v1.4.2; ai pack v0.9"
}
```

**Writable fields**
| Field            | Type           | Constraints                                   |
| ---------------- | -------------- | --------------------------------------------- |
| `hostname`       | string         | 1–63 chars, RFC 1123 hostname; lowercase      |
| `deviceUsername` | string         | 1–32 chars; encrypted at rest                 |
| `devicePassword` | string         | 8–128 chars; encrypted at rest                |
| `notes`          | string         | up to 2000 chars                              |

**Response 200**
Returns the updated record (same shape as `GET`, sans secrets).

**Errors**
- `400 invalid_field` — payload fails validation. The response includes `{ "error": "invalid_field", "field": "hostname" }`.
- `401 unauthorized`
- `404 device_not_found`
- `409 invalid_transition` — see status rules below.

---

### 4.3 `POST /api/v1/devices/{serial}/transition`

Move the device through the fulfilment lifecycle. Status transitions are validated server-side.

**Body**
```json
{ "action": "mark_installed" }
```

**Allowed actions and the transitions they perform**

| `action`             | From                | To           | Side effect                                        |
| -------------------- | ------------------- | ------------ | -------------------------------------------------- |
| `mark_installed`     | `available`, `assigned` | `installed`  | Records `installed_at` on the linked allocation.   |

Future actions (e.g. `mark_ready_for_shipping`) will be added as the workflow grows. Unknown actions return `400 unknown_action`.

**Response 200**
```json
{ "device": { "...": "..." } }
```

**Errors**
- `400 unknown_action`
- `401 unauthorized`
- `404 device_not_found`
- `409 invalid_transition` — current status does not permit this action.

---

## 5. Errors — common shape

Every non-2xx response is JSON with at minimum:

```json
{ "error": "machine_readable_code", "message": "Human-readable detail" }
```

Stable error codes:
- `unauthorized` (401)
- `device_not_found` (404)
- `invalid_field` (400) — also includes `field` naming the offender
- `invalid_transition` (409)
- `rate_limited` (429)
- `internal_error` (500)

---

## 6. Rate limiting

The provisioning endpoints share the per-IP admin-rate-limit pool: roughly 60 requests/minute/IP. An install script should call each endpoint at most once or twice per box and back off on `429`.

---

## 7. Idempotency

- `GET` is naturally safe to retry.
- `PATCH` is idempotent on the same payload — replays produce the same end state.
- `POST /transition` is idempotent for the same `action` once the target status is reached: replaying `mark_installed` on an already-`installed` device returns `200` without side effects.

The script can therefore retry on transient network errors without state checks.

---

## 8. Example session (curl)

```bash
SERIAL="MX24A1B0019"
KEY="ind_bo_stg_$YOURTOKEN"
BASE="https://staging.indiebox.ai/api/v1"

# 1. Verify the box is registered
curl -fsS -H "Authorization: Bearer $KEY" \
  "$BASE/devices/$SERIAL"

# 2. Write hostname + post-install credentials
curl -fsS -X PATCH \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"hostname":"indiebox-aurora-01","deviceUsername":"indie","devicePassword":"<generated>"}' \
  "$BASE/devices/$SERIAL"

# 3. Mark the box installed
curl -fsS -X POST \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"mark_installed"}' \
  "$BASE/devices/$SERIAL/transition"
```

---

## 9. Security notes for the install script

- **Never log the API key.** Redact `Authorization` headers from any debug output.
- **Never log `devicePassword`.** Only transmit it once via `PATCH` and discard it.
- The key is a long-lived secret. Rotate by creating a new key in admin, updating the script's secret store, then deleting the old key.
- A staging key cannot read live data and vice versa — the prefix is enforced server-side.

---

## 10. Open questions / out of scope

- **Bootstrap identity**: how the box discovers its own serial (BIOS, signed file, etc.) is the install-script's concern, not this API.
- **Telemetry / health**: not part of this spec. If needed later, a separate `/api/v1/devices/{serial}/health` POST can be added.
- **mTLS or device certificates**: out of scope for v1; revisit when the device fleet justifies it.
