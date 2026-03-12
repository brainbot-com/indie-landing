# Tasks: User Management with Roles

**Input**: Design documents from `/specs/001-user-management/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not explicitly requested in spec — test tasks omitted. Manual verification via quickstart.md testing checklist.

**Organization**: Tasks grouped by user story to enable independent implementation and testing. US4 (System Initialization) merged into Foundational phase since bootstrap is a prerequisite for all other stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Admin pages**: `admin/*.html` (DE) and `en/admin/*.html` (EN)
- **Backend**: `backend/src/index.mjs` (endpoints, middleware), `backend/src/store.mjs` (DB schema, queries)
- **Shared assets**: `style.css`, `script.js`
- Tasks name the exact files they touch

---

## Phase 1: Setup

**Purpose**: Confirm implementation patterns and scope before editing

- [x] T001 Review existing admin page structure (admin/orders.html split-pane pattern, script.js login/rendering logic, style.css admin classes, backend/src/index.mjs auth middleware, backend/src/store.mjs DDL patterns) to confirm approach

---

## Phase 2: Foundational (Blocking Prerequisites) — includes US4

**Purpose**: Database schema, auth infrastructure, and bootstrap that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Add users table DDL (CREATE TABLE IF NOT EXISTS with all columns per data-model.md) and indexes (idx_users_username, idx_users_role_status) to `backend/src/store.mjs`
- [x] T003 [P] Extract `hashPassword(password)` and `verifyPassword(password, hash)` utility functions from existing inline scrypt logic in `backend/src/index.mjs`
- [x] T004 Add user query functions to `backend/src/store.mjs`: findByUsername, findById, getAllUsers (with optional role/status filters), createUser, updateUser, deleteUser, updatePassword, updateLastLogin, countActiveAdmins
- [x] T005 Refactor session cookie to `{userId}:{expiresAt}.{hmac(userId:expiresAt, secret)}` format — update cookie creation (setCookie/createSession) and validation (parseCookie/validateSession) in `backend/src/index.mjs`
- [x] T006 Implement two-tier auth middleware in `backend/src/index.mjs`: `requireAuth` (validates session cookie, looks up user by ID, checks status=active, attaches req.user) and updated `requireAdmin` (calls requireAuth then checks req.user.role==='admin' or API token path sets req.user=null)
- [x] T007 [US4] Implement bootstrap admin creation in `backend/src/store.mjs`: on server startup, if users table is empty, create default admin from `ADMIN_LOGIN_HASH` (password hash) and `ADMIN_DEFAULT_USERNAME` (default: 'admin') env vars. Call bootstrap from startup sequence in `backend/src/index.mjs`

**Checkpoint**: Foundation ready — database, auth, and bootstrap functional. User story implementation can begin.

---

## Phase 3: User Story 1 — Admin Logs In with Personal Account (Priority: P1) MVP

**Goal**: Replace shared-password auth with individual username+password login that identifies the specific user. After login, system displays username and role.

**Independent Test**: Start with empty DB → verify bootstrap admin is created → log in with username+password → verify session response includes username and role → verify wrong credentials show generic error → verify disabled account shows inactive error.

### Implementation for User Story 1

- [x] T008 [US1] Update `POST /api/admin/session` to accept `{username, password}`, authenticate against users table via `verifyPassword`, reject disabled accounts with "Account disabled" error, update `last_login_at`, set session cookie with userId in `backend/src/index.mjs`
- [x] T009 [US1] Update `GET /api/admin/session` to return `{authenticated: true, user: {id, username, displayName, role}}` for cookie auth and `{authenticated: true, user: null}` for API token auth in `backend/src/index.mjs`
- [x] T010 [US1] Implement `DELETE /api/admin/session` to clear `indiebox_admin_session` cookie and return 200 in `backend/src/index.mjs`
- [x] T011 [P] [US1] Add username input field (with label) to the login form in `admin/inventory.html` and `admin/orders.html` (DE)
- [x] T012 [P] [US1] Add username input field (with label) to the login form in `en/admin/inventory.html` and `en/admin/orders.html` (EN)
- [x] T013 [US1] Update login form submission to send `{username, password}`, display logged-in username and role in session info area, and show generic error messages (no user enumeration) in `script.js`

**Checkpoint**: Admin can log in with personal username+password. Session identifies the user. This is the MVP — deploy and validate.

---

## Phase 4: User Story 2 — Admin Creates and Manages Users (Priority: P1)

**Goal**: Full user CRUD via a new admin user management page with split-pane layout. Admins can list, create, edit, disable/enable, delete users, and reset passwords.

**Independent Test**: Log in as admin → navigate to Users page → create a new user (verify appears in list) → edit display name and role → disable user (verify cannot log in) → enable user → reset password (verify new password works) → delete user (verify removed) → try to delete/disable last admin (verify blocked) → try to delete own account (verify blocked).

### Implementation for User Story 2

- [x] T014 [US2] Implement `GET /api/admin/users` (with optional `role` and `status` query param filters) and `GET /api/admin/users/:userId` endpoints behind `requireAdmin` in `backend/src/index.mjs`
- [x] T015 [US2] Implement `POST /api/admin/users` with validation (username regex `/^[a-zA-Z0-9._-]+$/`, 3-50 chars, case-insensitive uniqueness, displayName 1-100 chars, password min 8 chars, role in admin/user) in `backend/src/index.mjs`
- [x] T016 [US2] Implement `PUT /api/admin/users/:userId` for partial update (displayName, role) with last-admin-demotion protection (409 if demoting last active admin) in `backend/src/index.mjs`
- [x] T017 [US2] Implement `DELETE /api/admin/users/:userId` with self-deletion prevention (409) and last-active-admin protection (409) in `backend/src/index.mjs`
- [x] T018 [US2] Implement `POST /api/admin/users/:userId/reset-password` (validate min 8 chars) and `POST /api/admin/users/:userId/toggle-status` (with last-admin protection; note: disabling a user should effectively invalidate their session via the existing lookup-on-access pattern) in `backend/src/index.mjs`
- [x] T019 [P] [US2] Create `admin/users.html` (DE) following `admin/orders.html` split-pane pattern: header with auth form and subnav (Inventar, Bestellungen, Benutzer), user list table with filter toolbar, detail/edit pane, create user button
- [x] T020 [P] [US2] Create `en/admin/users.html` (EN) matching `admin/users.html` structure with English labels and `data-locale="en"`
- [x] T021 [P] [US2] Add "Benutzer"/"Users" navigation link to admin page headers in `admin/inventory.html`, `admin/orders.html`, `en/admin/inventory.html`, `en/admin/orders.html`
- [x] T022 [P] [US2] Add user management styles in `style.css`: user list table, detail pane, active/disabled status dot indicators (following `.admin-dot` + `.admin-status-legend` pattern), filter toolbar, create/edit form styles, confirmation dialog — reuse existing `.admin-orders-split`, `.admin-table`, `.admin-form-*`, `.admin-card`, `.admin-toolbar` patterns
- [x] T023 [US2] Implement user management UI in `script.js`: user list rendering with role/status filter dropdowns, user detail pane, create user form, edit user form (displayName + role), delete confirmation dialog (UIR-007), disable/enable toggle (UIR-009), reset password form with confirmation field (UIR-008), inline validation errors (UIR-010), success/error toast notifications (UIR-011), i18n messages object for DE/EN

**Checkpoint**: Full user management is functional. All CRUD operations work. Admin can manage the complete user lifecycle.

---

## Phase 5: User Story 3 — Regular User Logs In with Limited Access (Priority: P2)

**Goal**: Users with "user" role can authenticate but cannot access admin pages (inventory, orders, user management) or admin API endpoints. Role enforcement works end-to-end.

**Independent Test**: Create a user with "user" role → log in as that user → verify admin nav links are hidden → verify admin pages show "not authorized" → verify admin API endpoints return 403 → verify non-admin areas (if any) work normally.

### Implementation for User Story 3

- [x] T024 [US3] Implement frontend role-based access control in `script.js`: after session check, if `user.role !== 'admin'`, hide admin-only navigation links (Inventar/Inventory, Bestellungen/Orders, Benutzer/Users) and display a "not authorized" / "Kein Zugriff" message on admin pages instead of admin content. Ensure `requireAdmin` middleware (from T006) already returns 403 for user-role API calls.

**Checkpoint**: Role enforcement works. Users with "user" role are properly restricted from admin functionality.

---

## Phase 6: User Story 5 — Admin Changes Their Own Password (Priority: P2)

**Goal**: Any authenticated user can change their own password by providing their current password and a new password. Distinct from admin "reset password" which doesn't require the old password.

**Independent Test**: Log in → change password (provide current + new) → log out → log in with new password (succeeds) → try old password (fails) → try change with wrong current password (rejected).

### Implementation for User Story 5

- [x] T025 [US5] Implement `POST /api/admin/change-password` endpoint behind `requireAuth` (not requireAdmin — any role): verify current password with `verifyPassword`, validate new password min 8 chars, update hash via `updatePassword` in `backend/src/index.mjs`
- [x] T026 [US5] Add change-password UI in `script.js`: form with current password and new password fields, accessible via click on logged-in username in header area, with validation (wrong current password, too short new password) and success feedback. Add i18n messages for DE/EN.

**Checkpoint**: Self-service password change works for all authenticated users.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UI quality, accessibility, responsive behavior, and cross-page consistency

- [x] T027 [P] Verify and fix all UI states in user management page: empty user list state, populated list, filtered list (by role, by status), create user form (empty, validation errors, success), edit mode, disable/enable toggle (active→disabled, disabled→active), delete confirmation dialog (show, confirm, cancel), reset password form (empty, validation errors, success), login form error states (wrong credentials, disabled account), last-admin protection errors, self-delete prevention error
- [x] T028 [P] Verify and fix accessibility: all form fields have associated `<label>` elements (UIR-012), full keyboard navigation through user list, detail pane, forms, and action buttons (UIR-013), status indicators use text labels alongside color dots (UIR-014), focus management (focus moves to detail pane on user select, returns to list after delete)
- [x] T029 [P] Verify and fix responsive behavior: split-pane collapses to stacked layout on mobile viewports (UIR-015), all action buttons have minimum 44x44px touch targets (UIR-016), forms remain usable on narrow viewports (full-width inputs, appropriately sized buttons)
- [x] T030 Final cross-page consistency check: login form with username field identical across all 6 admin pages (admin/inventory.html, admin/orders.html, admin/users.html + EN variants), "Users"/"Benutzer" nav link present and consistent, i18n complete for all DE/EN pairs, edge cases validated (last admin protection, self-delete prevention, session invalidation on disable/delete, duplicate username rejection)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational (Phase 2)
- **US2 (Phase 4)**: Depends on US1 (Phase 3) — needs working login to test user management
- **US3 (Phase 5)**: Depends on Foundational (Phase 2) — can run in parallel with US2
- **US5 (Phase 6)**: Depends on US1 (Phase 3) — can run in parallel with US2 and US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US4 (System Init)**: In Foundational phase — no story dependencies
- **US1 (Admin Login)**: Depends on Foundational — first story to implement
- **US2 (User CRUD)**: Depends on US1 — needs login to access user management page
- **US3 (User Role)**: Depends on Foundational only — can proceed after US1 (needs login) but doesn't depend on US2
- **US5 (Change Password)**: Depends on US1 only — can proceed in parallel with US2

### Within Each Phase

- Backend endpoints before frontend UI (API must exist for JS to call)
- HTML page structure before script.js UI logic (DOM must exist for JS to render into)
- Store queries (store.mjs) before endpoint handlers (index.mjs) within foundational
- style.css can be done in parallel with HTML pages (different files)

### Parallel Opportunities

- **Phase 2**: T002 (store.mjs) || T003 (index.mjs) — different files
- **Phase 3**: T011 (DE HTML) || T012 (EN HTML) — different files
- **Phase 4**: T019 (DE users.html) || T020 (EN users.html) || T021 (nav links) || T022 (style.css) — all different files
- **Phase 5 + 6**: US3 and US5 can proceed in parallel after US1 completes (both touch script.js but different sections; US5 also touches index.mjs)
- **Phase 7**: T027 || T028 || T029 — independent verification tasks

---

## Parallel Example: User Story 2

```bash
# After backend endpoints (T014-T018) are complete, launch frontend tasks in parallel:
Task: "Create admin/users.html (DE) with split-pane layout"          # T019 — admin/users.html
Task: "Create en/admin/users.html (EN) matching DE structure"        # T020 — en/admin/users.html
Task: "Add Users nav link to existing admin pages"                   # T021 — inventory.html, orders.html (4 files)
Task: "Add user management styles"                                   # T022 — style.css

# Then, after HTML structure exists:
Task: "Implement user management UI logic"                           # T023 — script.js
```

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3 = US4 + US1)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational + Bootstrap (T002–T007)
3. Complete Phase 3: US1 — Admin Login (T008–T013)
4. **STOP AND VALIDATE**: Bootstrap admin exists, login works with username+password, session identifies user
5. Deploy/demo if ready — system is usable with the bootstrapped admin

### Incremental Delivery

1. Setup + Foundational → Foundation ready (DB, auth, bootstrap)
2. **+US1** → Admin login works → **Deploy (MVP!)**
3. **+US2** → Full user management → Deploy
4. **+US3** → Role enforcement → Deploy
5. **+US5** → Self-service password change → Deploy
6. **+Polish** → UI states, accessibility, responsive → Final release

### Suggested MVP Scope

**Phases 1–3 (T001–T013)**: 13 tasks delivering working individual admin login with bootstrap. This is the minimum viable increment — replaces the shared password with individual accounts.

---

## Notes

- [P] tasks = different files, no dependencies — safe to run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after its dependencies
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate the story independently
- The `ADMIN_API_TOKEN` bearer token continues to work throughout — no changes needed (FR-021)
- Session invalidation for disabled/deleted users happens automatically via lookup-on-access pattern (R-001) — no explicit invalidation code needed beyond checking user status in `requireAuth`
