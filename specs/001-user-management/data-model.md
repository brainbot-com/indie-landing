# Data Model: User Management with Roles

**Feature**: 001-user-management
**Date**: 2026-03-12

## Entities

### User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT (UUID) | PRIMARY KEY | Unique identifier, generated via `crypto.randomUUID()` |
| `username` | TEXT | NOT NULL, UNIQUE, COLLATE NOCASE | Login identifier. Case-insensitive uniqueness (FR-014). |
| `display_name` | TEXT | NOT NULL | Human-readable name shown in UI |
| `password_hash` | TEXT | NOT NULL | Scrypt hash in `salt:hash` format (FR-015) |
| `role` | TEXT | NOT NULL, CHECK(IN ('admin','user')), DEFAULT 'user' | Access level (FR-002) |
| `status` | TEXT | NOT NULL, CHECK(IN ('active','disabled')), DEFAULT 'active' | Account status (FR-007) |
| `last_login_at` | TEXT | NULLABLE | ISO 8601 timestamp of last successful login (FR-018) |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') | Account creation timestamp |
| `updated_at` | TEXT | NOT NULL, DEFAULT datetime('now') | Last modification timestamp |

**SQL**:
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Relationships

```
User 1 ──── * Session (implicit via cookie, not stored)
User 1 ──── * Order (future: attribute actions to users)
```

- **No explicit session table.** Sessions are stateless HMAC-signed cookies containing the user ID. Validation happens via user lookup on each request (see research R-001).
- **No explicit user-order relationship in this feature.** Orders remain attributed to the `ADMIN_API_TOKEN` or the session. Future work may add `performed_by` tracking to admin actions.

## Validation Rules

### Username
- Required, non-empty
- Case-insensitive uniqueness (stored as-is, compared case-insensitively via `COLLATE NOCASE`)
- Allowed characters: alphanumeric, dots, hyphens, underscores (`/^[a-zA-Z0-9._-]+$/`)
- Length: 3–50 characters
- Cannot be changed after creation (stable identifier)

### Display Name
- Required, non-empty
- Length: 1–100 characters
- Any characters allowed (sanitized for HTML output)

### Password
- Minimum 8 characters (per spec assumptions)
- No maximum length enforced (scrypt hashes any length)
- Stored as `salt:scryptHash` (64-byte scrypt output, hex-encoded)

### Role
- Enum: `admin` | `user`
- Default: `user`
- Constraint: at least one active admin must exist at all times (FR-011)

### Status
- Enum: `active` | `disabled`
- Default: `active`
- Constraint: cannot disable the last active admin (FR-011)

## State Transitions

### User Status

```
                 ┌──── disable ────┐
                 │                 ▼
  [created] → active          disabled
                 ▲                 │
                 └──── enable ─────┘

  active ──── delete ────→ [removed]
  disabled ── delete ────→ [removed]
```

**Transition rules**:
| From | To | Guard |
|------|----|-------|
| active | disabled | Cannot disable last active admin |
| disabled | active | Always allowed |
| active | deleted | Cannot delete last active admin; cannot delete self |
| disabled | deleted | Cannot delete self |

### User Role

```
  admin ←──→ user
```

**Transition rules**:
| From | To | Guard |
|------|----|-------|
| admin | user | Cannot demote last active admin |
| user | admin | Always allowed |

## Indexes

```sql
-- Username lookup (login). Already covered by UNIQUE constraint, but explicit for clarity:
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Role + status queries (last admin check, user list filters):
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
```

## Migration Strategy

This is a new table — no migration from existing data is needed. The bootstrap mechanism (research R-003) handles first-admin creation:

1. Server starts → check `SELECT COUNT(*) FROM users`
2. If 0 → insert default admin from `ADMIN_LOGIN_HASH` and `ADMIN_DEFAULT_USERNAME` env vars
3. If > 0 → skip

## Impact on Existing Tables

**None.** The `users` table is standalone. Existing tables (`orders`, `payment_events`, `inventory`, `device_models`, `supplier_orders`, `stock_devices`, `order_allocations`) are not modified.

Future consideration: adding a `performed_by_user_id` column to tables that track admin actions (e.g., `orders.updated_by`). This is explicitly out of scope per the spec assumptions (audit logging deferred).
