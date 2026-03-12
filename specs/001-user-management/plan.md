# Implementation Plan: User Management with Roles

**Branch**: `001-user-management` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-user-management/spec.md`

## Summary

Add individual user accounts with admin/user roles to replace the current shared-password admin authentication. The backend gains a `users` table in SQLite, user CRUD endpoints, and a session cookie that identifies the specific logged-in user. The frontend gains a username+password login form, a new admin user management page (split-pane, matching existing admin page patterns), and self-service password change. A bootstrap mechanism auto-creates the first admin from the existing `ADMIN_LOGIN_HASH` environment variable on first startup.

## Technical Context

**Language/Version**: Node.js 22 (ES modules), Express.js 4, vanilla JavaScript frontend, HTML5, CSS3
**Primary Dependencies**: `express@^4.21.2` (only npm dependency), `node:sqlite` (built-in), `node:crypto` (built-in)
**Storage**: SQLite via `node:sqlite` — new `users` table added to existing `indiebox.sqlite` database
**Testing**: Manual desktop/mobile verification, API endpoint testing, session validation testing
**Target Platform**: Express.js backend + static HTML/JS/CSS frontend served via Caddy reverse proxy
**Project Type**: E-commerce admin system with static marketing site
**Performance Goals**: User lookups add ~1ms per authenticated request (SQLite indexed query). No measurable impact on page load.
**Constraints**: German/English parity for admin pages, design-system compliance via `style.css`, progressive enhancement, backward compatibility with `ADMIN_API_TOKEN`
**Scale/Scope**: New admin page pair, backend auth refactor, login form update across 4 existing admin pages
**Affected Pages**: `admin/users.html` (new), `en/admin/users.html` (new), `admin/inventory.html`, `admin/orders.html`, `en/admin/inventory.html`, `en/admin/orders.html`, `script.js`, `style.css`, `backend/src/index.mjs`, `backend/src/store.mjs`
**Affected Claims**: N/A — no public-facing claims affected. This feature is admin-internal.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Design-System First**: PASS — All new UI uses existing admin CSS classes (`.admin-orders-split`, `.admin-table`, `.admin-form-*`, `.admin-card`, `.admin-toolbar`). No new design tokens required. New status styles (active/disabled) follow the existing `.admin-dot` + `.admin-status-legend` pattern.
- **II. German Source, English Parity**: PASS — New `admin/users.html` (DE) and `en/admin/users.html` (EN) created as a pair. Navigation link added to both language versions of existing admin pages. JS-based i18n follows the existing locale-conditional messages pattern.
- **III. Claim Discipline**: N/A — No public-facing claims are affected. User management is admin-internal. No privacy, pricing, or positioning content changes.
- **IV. Static Simplicity**: PASS WITH JUSTIFIED DEVIATION — The admin area already uses dynamic JavaScript with API calls (established pattern). Adding user management endpoints and UI follows this existing pattern. The deviation from "static HTML" is already established and justified by the admin functionality requirement.
- **V. Cross-Page Consistency**: PASS — No public-facing pages are affected. Admin page navigation is updated consistently across all admin pages.

**Post-Phase 1 re-check**: All gates remain PASS. The data model, API contracts, and UI design all stay within the existing architectural patterns. No new dependencies, no new build steps, no new frameworks.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-management/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technical decisions and rationale
├── data-model.md        # Phase 1: Users table schema, validation, state transitions
├── quickstart.md        # Phase 1: Developer setup and migration guide
├── contracts/
│   └── api.md           # Phase 1: API endpoint contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (affected files)

```text
backend/src/
├── index.mjs            # Auth middleware, session endpoints, user CRUD endpoints
└── store.mjs            # Users table DDL, user queries, bootstrap logic

admin/
├── inventory.html       # Add "Users" nav link (DE)
├── orders.html          # Add "Users" nav link (DE)
└── users.html           # NEW: User management page (DE)

en/admin/
├── inventory.html       # Add "Users" nav link (EN)
├── orders.html          # Add "Users" nav link (EN)
└── users.html           # NEW: User management page (EN)

style.css                # User management styles (reusing existing admin patterns)
script.js                # User management UI, updated login form, session display
```

**Structure Decision**: All changes work within the existing architecture. No new directories, frameworks, or build steps. The `users` table is added to the same SQLite database. The new admin page follows the exact file and layout pattern of existing admin pages.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Cookie format change (`expiresAt.hmac` → `userId:expiresAt.hmac`) | Must identify the specific user in the session to support individual accounts | No simpler alternative — the session must carry user identity |
| Login form adds username field | Individual accounts require username+password authentication | Single-password login cannot distinguish users |
| User lookup on every authenticated request | Session invalidation on user disable/delete (FR-012) requires checking user status | Stateless validation without lookup cannot detect disabled/deleted users |

## Design Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [research.md](research.md) | 12 technical decisions with rationale and alternatives |
| Data Model | [data-model.md](data-model.md) | Users table schema, validation rules, state transitions, indexes |
| API Contracts | [contracts/api.md](contracts/api.md) | 10 endpoints: auth (3), user CRUD (6), self-service (1), cookie contract |
| Quickstart | [quickstart.md](quickstart.md) | Migration path, key files, testing checklist |

## UI Verification Coverage

*Required because `UI-IMPACT=Yes` in spec.*

### States to Verify
- User list: empty state, populated state, filtered state (by role, by status)
- User detail pane: view mode, edit mode
- Create user form: empty, validation errors, success
- Disable/enable toggle: active → disabled, disabled → active
- Delete confirmation dialog: shown, confirmed, cancelled
- Reset password form: empty, validation errors, success
- Change own password form: empty, wrong current password, success
- Login form: empty, error state (wrong credentials), disabled account error
- Last admin protection: error states for delete/disable/demote attempts
- Self-delete protection: error state

### Accessibility Verification
- All form fields have associated `<label>` elements (UIR-012)
- Full keyboard navigation through user list, detail pane, forms, and action buttons (UIR-013)
- Status indicators use text labels alongside color (UIR-014)
- Focus management: focus moves to detail pane when user is selected, returns to list after delete

### Responsive Behavior Verification
- Desktop: side-by-side split-pane layout (list + detail)
- Mobile: stacked layout or list/detail navigation (UIR-015)
- Touch targets: minimum 44x44px for all action buttons (UIR-016)
- Forms remain usable on mobile (full-width inputs, appropriately sized buttons)

### UI Evidence Capture
- Desktop screenshots: user list, user detail, create form, confirmation dialog
- Mobile screenshots: same views in stacked/responsive layout
- Keyboard navigation: tab order through interactive elements
- Error states: inline validation, toast notifications, protection error messages
