# Quickstart: User Management with Roles

**Feature**: 001-user-management
**Date**: 2026-03-12

## Prerequisites

- Node.js 22+
- Existing environment with `ADMIN_LOGIN_HASH` and `ADMIN_SESSION_SECRET` configured

## New Environment Variables

Add to your `.env` or Docker environment:

```bash
# Optional — defaults to "admin" if not set
ADMIN_DEFAULT_USERNAME=admin
```

Existing variables (`ADMIN_LOGIN_HASH`, `ADMIN_SESSION_SECRET`, `ADMIN_API_TOKEN`, etc.) continue to work as before.

## What Changes

### Backend (`backend/src/index.mjs`, `backend/src/store.mjs`)

1. **New `users` table** in SQLite — created automatically on startup
2. **Bootstrap admin** — if `users` table is empty on startup, creates a default admin from `ADMIN_LOGIN_HASH` and `ADMIN_DEFAULT_USERNAME`
3. **Login accepts username + password** — `POST /api/admin/session` now requires `{ username, password }` instead of `{ password }`
4. **Session cookie includes user ID** — format changes from `{expiresAt}.{hmac}` to `{userId}:{expiresAt}.{hmac}`
5. **New API endpoints** — user CRUD, password reset, toggle status, self-service password change
6. **New middleware** — `requireAuth` (any role) alongside existing `requireAdmin` (admin only)

### Frontend (`script.js`)

1. **Login form** — username field added to the header auth form
2. **User management UI** — new admin page section for listing, creating, editing, disabling, deleting users
3. **Session display** — shows logged-in username and role
4. **Self-service password change** — accessible from header

### Static Files

1. **New pages**: `admin/users.html`, `en/admin/users.html`
2. **Updated pages**: `admin/inventory.html`, `admin/orders.html`, `en/admin/inventory.html`, `en/admin/orders.html` (navigation link added)
3. **Updated CSS**: `style.css` (user management page styles, using existing admin patterns)

## Migration Path

1. Deploy updated backend — `users` table is auto-created
2. On first startup with empty `users` table, the bootstrap admin is created from existing `ADMIN_LOGIN_HASH`
3. Existing admin sessions will be invalidated (cookie format changed) — admins must re-login once
4. `ADMIN_API_TOKEN` continues to work unchanged (FR-021)
5. After first admin logs in, they can create additional users via the user management page

## Key Files to Modify

| File | Changes |
|------|---------|
| `backend/src/store.mjs` | Add `users` table schema, user CRUD queries, bootstrap logic |
| `backend/src/index.mjs` | New endpoints, updated auth middleware, updated session handling |
| `script.js` | User management UI, updated login form, session display |
| `style.css` | User management page styles (minimal — reuses existing admin patterns) |
| `admin/users.html` | New file — German user management page |
| `en/admin/users.html` | New file — English user management page |
| `admin/inventory.html` | Add "Users" nav link |
| `admin/orders.html` | Add "Users" nav link |
| `en/admin/inventory.html` | Add "Users" nav link |
| `en/admin/orders.html` | Add "Users" nav link |

## Testing Checklist

- [ ] Start with empty database → verify bootstrap admin is created
- [ ] Login with bootstrap admin username + password
- [ ] Create a new admin user
- [ ] Create a new regular user
- [ ] Edit user display name and role
- [ ] Disable a user → verify they cannot log in
- [ ] Enable a disabled user → verify they can log in again
- [ ] Delete a user → verify they are removed
- [ ] Reset a user's password → verify new password works
- [ ] Change own password → verify new password works, old one doesn't
- [ ] Try to delete/disable/demote last admin → verify it's blocked
- [ ] Try to delete own account → verify it's blocked
- [ ] Login with wrong credentials → verify generic error (no user enumeration)
- [ ] Disable a user while they have a session → verify next API call fails
- [ ] Verify `ADMIN_API_TOKEN` still works for all admin endpoints
- [ ] Verify user management page works in German and English
- [ ] Verify responsive layout on mobile
- [ ] Verify keyboard navigation on user management page
