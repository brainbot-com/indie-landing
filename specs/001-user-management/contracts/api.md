# API Contracts: User Management

**Feature**: 001-user-management
**Date**: 2026-03-12

All endpoints use JSON request/response bodies. Authentication via `indiebox_admin_session` cookie or `Authorization: Bearer {ADMIN_API_TOKEN}` header.

---

## Authentication Endpoints

### POST /api/admin/session — Login

**Auth**: None (public)
**Rate limit**: `adminRateLimit` (60 req/60s per IP)

**Request**:
```json
{
  "username": "admin",
  "password": "secret123"
}
```

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "authenticated": true, "user": { "id", "username", "displayName", "role" } }` | Valid credentials, active user |
| 401 | `{ "error": "Invalid credentials" }` | Wrong username or password (FR-017: no detail) |
| 401 | `{ "error": "Account disabled" }` | User exists but status is `disabled` |
| 400 | `{ "error": "Username and password required" }` | Missing fields |
| 429 | `{ "error": "Too many requests" }` | Rate limited |

**Side effects**: Sets `indiebox_admin_session` cookie. Updates `last_login_at` on user record.

**Migration note**: Previously accepted `{ "password": "..." }` only. The username field is now required. Existing clients sending only password will receive 400.

---

### GET /api/admin/session — Check Session

**Auth**: Cookie or API token
**Rate limit**: `adminRateLimit`

**Response (authenticated)**:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "username": "admin",
    "displayName": "Admin User",
    "role": "admin"
  }
}
```

**Response (API token)**:
```json
{
  "authenticated": true,
  "user": null
}
```

**Response (not authenticated)**:
```json
{
  "authenticated": false
}
```

---

### DELETE /api/admin/session — Logout

**Auth**: Cookie
**Rate limit**: `adminRateLimit`

**Response**: `200` — Clears `indiebox_admin_session` cookie.

---

## User Management Endpoints (Admin Only)

All require `requireAdmin` middleware (admin role or API token).

### GET /api/admin/users — List Users

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `role` | string | (all) | Filter by role: `admin` or `user` |
| `status` | string | (all) | Filter by status: `active` or `disabled` |

**Response** `200`:
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "admin",
      "displayName": "Admin User",
      "role": "admin",
      "status": "active",
      "lastLoginAt": "2026-03-12T10:00:00Z",
      "createdAt": "2026-03-12T09:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/users — Create User

**Request**:
```json
{
  "username": "newuser",
  "displayName": "New User",
  "role": "user",
  "password": "initialpass123"
}
```

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ "user": { "id", "username", "displayName", "role", "status", "createdAt" } }` | Created |
| 400 | `{ "error": "Username is required" }` | Missing username |
| 400 | `{ "error": "Password must be at least 8 characters" }` | Password too short |
| 400 | `{ "error": "Invalid role" }` | Role not admin/user |
| 400 | `{ "error": "Invalid username format" }` | Username fails regex validation |
| 409 | `{ "error": "Username already exists" }` | Duplicate username (FR-014) |

---

### GET /api/admin/users/:userId — Get User Detail

**Response** `200`:
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "displayName": "Admin User",
    "role": "admin",
    "status": "active",
    "lastLoginAt": "2026-03-12T10:00:00Z",
    "createdAt": "2026-03-12T09:00:00Z",
    "updatedAt": "2026-03-12T10:30:00Z"
  }
}
```

| Status | Condition |
|--------|-----------|
| 404 | User not found |

---

### PUT /api/admin/users/:userId — Update User

Partial update — only provided fields are changed.

**Request** (any subset):
```json
{
  "displayName": "Updated Name",
  "role": "admin"
}
```

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "user": { ... } }` | Updated |
| 400 | `{ "error": "Invalid role" }` | Invalid role value |
| 404 | `{ "error": "User not found" }` | No user with ID |
| 409 | `{ "error": "Cannot demote the last active admin" }` | FR-011 violation |

---

### DELETE /api/admin/users/:userId — Delete User

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "success": true }` | Deleted |
| 404 | `{ "error": "User not found" }` | No user with ID |
| 409 | `{ "error": "Cannot delete the last active admin" }` | FR-011 violation |
| 409 | `{ "error": "Cannot delete your own account" }` | Self-deletion attempt |

---

### POST /api/admin/users/:userId/reset-password — Admin Reset Password

**Request**:
```json
{
  "newPassword": "newpass123"
}
```

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "success": true }` | Password reset |
| 400 | `{ "error": "Password must be at least 8 characters" }` | Too short |
| 404 | `{ "error": "User not found" }` | No user with ID |

---

### POST /api/admin/users/:userId/toggle-status — Enable/Disable User

Toggles between `active` and `disabled`.

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "user": { "id", "status" } }` | Toggled |
| 404 | `{ "error": "User not found" }` | No user with ID |
| 409 | `{ "error": "Cannot disable the last active admin" }` | FR-011 violation |

---

## Self-Service Endpoints (Authenticated Users)

### POST /api/admin/change-password — Change Own Password

**Auth**: `requireAuth` (any role)

**Request**:
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

**Responses**:

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "success": true }` | Password changed |
| 400 | `{ "error": "Password must be at least 8 characters" }` | New password too short |
| 401 | `{ "error": "Current password is incorrect" }` | Wrong current password |

---

## Error Response Format

All errors follow the same shape:
```json
{
  "error": "Human-readable error message"
}
```

This is consistent with the existing error format used by other admin endpoints in the project.

---

## Cookie Contract

**Name**: `indiebox_admin_session` (configurable via `ADMIN_SESSION_COOKIE_NAME`)

**Value format**: `{userId}:{expiresAtEpoch}.{hmacSignature}`

**HMAC input**: `{userId}:{expiresAtEpoch}`
**HMAC algorithm**: SHA-256 with `ADMIN_SESSION_SECRET`

**Cookie attributes**:
| Attribute | Value |
|-----------|-------|
| `HttpOnly` | true |
| `SameSite` | Strict |
| `Secure` | true (when `APP_ENV !== 'development'`) |
| `Path` | `/` |
| `Max-Age` | 2592000 (30 days, configurable) |

**Validation flow**:
1. Parse `userId` and `expiresAt` from cookie value
2. Verify HMAC signature
3. Check `expiresAt > now`
4. Look up user by `userId`
5. Check user exists and `status === 'active'`
6. Attach user to request: `req.user = { id, username, displayName, role }`

---

## Environment Variables

### New
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_DEFAULT_USERNAME` | No | `admin` | Username for the bootstrap admin user |

### Modified
| Variable | Change | Description |
|----------|--------|-------------|
| `ADMIN_LOGIN_HASH` | Repurposed | Now used only for bootstrap admin password hash on first run. No longer used for per-request auth. |

### Unchanged
| Variable | Description |
|----------|-------------|
| `ADMIN_SESSION_SECRET` | HMAC key for cookie signing (same as before) |
| `ADMIN_API_TOKEN` | Bearer token for programmatic access (FR-021, unchanged) |
| `ADMIN_SESSION_COOKIE_NAME` | Cookie name (same as before) |
| `ADMIN_SESSION_TTL_SECONDS` | Session duration (same as before) |
