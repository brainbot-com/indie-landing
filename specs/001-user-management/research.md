# Research: User Management with Roles

**Feature**: 001-user-management
**Date**: 2026-03-12

## R-001: Session Invalidation When User Is Deleted or Disabled

**Context**: The current session mechanism is stateless — an HMAC-signed cookie containing `{expiresAt}.{hmac}`. FR-012 requires that sessions be invalidated immediately when a user is deleted or disabled.

**Decision**: Validate user status on every authenticated request (lookup-on-access pattern).

**Rationale**: The new cookie format will include the user ID. On each request, the `requireAdmin` middleware already needs to look up the user to determine their role. During this lookup, it checks:
- User exists (handles deletion → session rejected)
- User status is `active` (handles disabling → session rejected)

This provides "immediate" invalidation: the very next API call after deletion or disabling will fail. The browser retains the cookie, but it becomes a dead token. No server-side session store, no background invalidation job, no added complexity.

**Alternatives considered**:
- **Server-side session table**: Adds write overhead on every login and a cleanup job. Rejected because lookup-on-access achieves the same guarantee with zero extra state.
- **Token version / nonce in cookie**: Adds a `session_version` integer to the user row, included in the cookie HMAC. Incrementing it invalidates all sessions. Rejected as unnecessary — checking user existence and status during the existing lookup is simpler and equivalent.

---

## R-002: Cookie Format Change for User Identity

**Context**: Current cookie format is `{expiresAt}.{hmac(expiresAt, secret)}`. The new system needs to identify which user the session belongs to and their role.

**Decision**: New cookie format: `{userId}:{expiresAt}.{hmac(userId:expiresAt, secret)}`

**Rationale**:
- Minimal change: same HMAC-SHA256 signing, same secret, same cookie attributes.
- The user ID is a UUID (not sensitive), and the role is looked up from the database on each request rather than embedded in the cookie. This prevents role escalation via cookie manipulation and ensures the freshest role/status data.
- The HMAC covers `userId:expiresAt`, so tampering with either value invalidates the signature.
- Backward compatibility: during migration (first deploy), all existing cookies lack a user ID and will fail validation. Admins will need to re-login once. This is acceptable since the single-password system is being replaced.

**Alternatives considered**:
- **JWT tokens**: More standard but adds a dependency, introduces token refresh complexity, and the existing HMAC pattern works well. Rejected for over-engineering.
- **Embedding role in cookie**: Would avoid a DB lookup per request but creates a stale-role risk and the lookup is needed anyway for status checks. Rejected.

---

## R-003: User Bootstrap / First Admin Creation

**Context**: FR-013 requires automatic creation of a default admin user on first startup if no users exist. The spec assumes `ADMIN_LOGIN_HASH` will be repurposed.

**Decision**: On server startup, if the `users` table is empty:
1. Read `ADMIN_LOGIN_HASH` (existing `salt:scryptHash` format) as the password hash.
2. Read `ADMIN_DEFAULT_USERNAME` (new env var, default: `admin`) as the username.
3. Create a user with role `admin`, status `active`, display name from username.
4. Log the creation to stdout.

If users already exist, skip entirely (FR-013 acceptance scenario 2).

**Rationale**: Reuses the existing env var and hash format, so deployments that already have `ADMIN_LOGIN_HASH` configured will seamlessly create the first admin with the same password. The optional `ADMIN_DEFAULT_USERNAME` allows customization without breaking existing setups.

**Alternatives considered**:
- **New env var with plaintext password, hash at startup**: Simpler for new setups but puts plaintext passwords in environment configs. Rejected for security.
- **Interactive setup wizard**: Not feasible for Docker/automated deployments. Rejected.
- **Separate setup CLI command**: Adds operational complexity. Rejected — automatic bootstrap is simpler.

---

## R-004: Password Hashing for New Users

**Context**: The existing system uses scrypt with a specific format (`salt:scryptHash`, 64-byte output). FR-015 requires salted cryptographic hashes.

**Decision**: Reuse the existing scrypt implementation from `index.mjs` for all user password operations (create, change, reset). Extract the `hashPassword` and `verifyPassword` functions into shared utilities within the same module.

**Rationale**: The existing implementation is already production-tested, uses `crypto.scryptSync` with 64-byte output and `crypto.timingSafeEqual` for verification. No reason to switch algorithms or add dependencies.

**Alternatives considered**:
- **bcrypt via npm package**: Well-known but adds an external dependency. The project has only `express` as a dependency. Rejected to maintain minimal dependency footprint.
- **argon2 via npm package**: More modern but same dependency concern. Rejected.

---

## R-005: Role-Based Access Control Middleware

**Context**: FR-002 requires admin vs. user role enforcement. The current `requireAdmin` middleware is a single-level gate.

**Decision**: Extend `requireAdmin` into a two-tier system:
1. `requireAuth` — validates session, attaches `req.user` (any role). Used for endpoints available to all authenticated users (e.g., change own password).
2. `requireAdmin` — calls `requireAuth`, then checks `req.user.role === 'admin'`. Returns 403 if not admin. Used for all current admin endpoints plus user management.

The `ADMIN_API_TOKEN` path continues to grant admin-level access (FR-021), setting `req.user = null` to indicate no specific user attribution.

**Rationale**: Clean separation. Minimal refactoring of existing endpoints — they already use `requireAdmin`, which now simply adds a role check. New "user" role endpoints can use `requireAuth`.

**Alternatives considered**:
- **Permission-based system (RBAC with fine-grained permissions)**: Over-engineered for two roles. Rejected.
- **Middleware parameter pattern `requireRole('admin')`**: Slightly more flexible but unnecessary for two roles. Could be introduced later if roles expand.

---

## R-006: Admin Page Structure and Navigation

**Context**: UIR-001 through UIR-005 require a new user management page following existing admin patterns.

**Decision**: Create `admin/users.html` and `en/admin/users.html` following the exact pattern of `admin/orders.html`:
- Same HTML structure: header with auth form, subnav, split-pane layout
- Same CSS classes: `.admin-orders-split` pattern (renamed conceptually to split-pane in users context)
- Same JS patterns: fetch API calls, DOM rendering, locale-based messages
- Add "Users" navigation link to all admin page headers (inventory, orders, users)

**Rationale**: Consistency with existing admin pages (UIR-001). The orders page split-pane (list + detail) is the closest analog to the user management UX.

**Alternatives considered**:
- **Modal-based editing (no split pane)**: Less consistent with existing pages. Rejected per UIR-004.
- **Separate page for user detail**: More page navigation, less fluid UX. Rejected — split-pane is the established pattern.

---

## R-007: Login Flow Migration

**Context**: The current login form accepts only a password. The new system requires username + password (FR-003).

**Decision**:
- Modify the login form in all admin page headers to include a username field alongside the existing password field.
- Update `POST /api/admin/session` to accept `{ username, password }` instead of `{ password }`.
- The login form remains in the admin page header (existing pattern), expanding from a single password input to username + password.
- For backward compatibility during the transition: if no users exist in the DB and `ADMIN_LOGIN_HASH` is set, the old single-password login still works (but this state only exists momentarily before the bootstrap creates the first user).

**Rationale**: Minimal UI change. The header auth form is already the login entry point; adding a username field is straightforward.

**Alternatives considered**:
- **Dedicated login page**: More work, breaks existing flow where admin pages self-contain their auth. Rejected — the inline auth form is the established pattern.
- **Email-based login**: Over-engineered for this use case (no email infrastructure). Rejected.

---

## R-008: Serving Admin Static Files

**Context**: The existing admin pages are served as static files. Need to understand how to add the new users page.

**Decision**: The new `admin/users.html` and `en/admin/users.html` files are served by the same static file serving mechanism (Caddy reverse proxy serves static files from `/srv/site`). No backend route changes needed for serving the HTML.

**Rationale**: Follows existing pattern exactly. The backend only needs the new API endpoints; the HTML files are static assets.

---

## R-009: Last Admin Protection

**Context**: FR-011 requires preventing deletion, disabling, or demotion of the last active admin.

**Decision**: Before any operation that would reduce the active admin count (delete admin, disable admin, change admin role to user), query: `SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active' AND id != :targetUserId`. If count is 0, reject the operation with a 409 Conflict response and descriptive error message.

**Rationale**: Simple, race-condition-safe check (SQLite is serialized). The check happens in the same transaction as the mutation.

**Alternatives considered**:
- **Soft-lock flag on the "last" admin**: Adds state management complexity. Rejected.
- **Client-side only prevention**: Insufficient — must be enforced server-side. Rejected.

---

## R-010: Rate Limiting for Login Endpoint

**Context**: FR-020 requires rate limiting on the login endpoint, consistent with existing patterns.

**Decision**: Keep the existing `adminRateLimit` (60 req/60s) on `POST /api/admin/session`. This is already in place and consistent with the spec requirement.

**Rationale**: The existing rate limit tier is appropriate. A tighter limit (e.g., 10 req/60s) could be considered but the current limit already prevents brute force at scale while allowing legitimate use.

---

## R-011: i18n Approach for User Management Page

**Context**: FR-016 requires the user management page in both German and English.

**Decision**: Follow the existing admin page i18n pattern:
- Two HTML files: `admin/users.html` (DE, `data-locale="de"`) and `en/admin/users.html` (EN, `data-locale="en"`)
- JavaScript messages object in `script.js` with locale-conditional strings
- UI labels rendered dynamically based on `locale` variable

**Rationale**: Exact consistency with existing inventory and orders pages. No new i18n infrastructure needed.

---

## R-012: Self-Service Password Change

**Context**: FR-010 requires users to change their own password by providing current + new password.

**Decision**: Add `POST /api/admin/change-password` endpoint protected by `requireAuth` (not `requireAdmin`), accepting `{ currentPassword, newPassword }`. Verify current password with scrypt, then update hash. The UI for this will be a small form accessible from the header area (e.g., clicking on the logged-in username).

**Rationale**: Available to all authenticated users (admin and user roles). Separate from the admin "reset password" function which doesn't require the old password.

**Alternatives considered**:
- **Dedicated settings page**: Over-engineered for a single form. A dropdown/popover from the username in the header is sufficient.
- **Same endpoint as admin reset**: Mixing self-service and admin-reset in one endpoint adds complexity. Rejected — separate endpoints with clear semantics.
