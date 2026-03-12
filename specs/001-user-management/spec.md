# Feature Specification: User Management with Roles

**Feature Branch**: `001-user-management`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "I need users and roles (admin and user) in this system. We need for admins a user management page to create, disable, delete and modify users. Also reset password."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Logs In with Personal Account (Priority: P1)

An administrator logs into the system using their own username and password instead of a shared admin password. After successful login, they see the existing admin pages (inventory, orders) plus a new "Users" management page. The system knows who is logged in and can attribute actions to a specific admin.

**Why this priority**: This replaces the current single shared password with individual accounts, which is the foundation for all other user management features and improves security and accountability.

**Independent Test**: Can be tested by creating an admin user, logging in with their credentials, and verifying the session identifies the specific user.

**Acceptance Scenarios**:

1. **Given** an admin user exists in the system, **When** they enter their username and password on the login form, **Then** they are authenticated and see all admin pages including the user management page.
2. **Given** an admin is logged in, **When** they view their session, **Then** the system displays their username and role.
3. **Given** a user enters incorrect credentials, **When** they attempt to log in, **Then** the system rejects the attempt and shows an error message without revealing whether the username or password was wrong.
4. **Given** a disabled user account, **When** the user attempts to log in, **Then** the system rejects the login and informs the user their account is inactive.

---

### User Story 2 - Admin Creates and Manages Users (Priority: P1)

An administrator navigates to the user management page and sees a list of all users in the system. They can create new users by providing a username, display name, role (admin or user), and an initial password. They can edit existing users' details (display name, role), disable or re-enable accounts, delete users, and reset passwords.

**Why this priority**: This is the core feature requested — the ability for admins to manage the user base. Without this, there is no way to add or maintain users.

**Independent Test**: Can be tested by logging in as admin, creating a new user, verifying the user appears in the list, editing their details, disabling them, resetting their password, and deleting them.

**Acceptance Scenarios**:

1. **Given** an admin is on the user management page, **When** they click "Create User" and fill in username, display name, role, and initial password, **Then** the new user is created and appears in the user list.
2. **Given** an admin views the user list, **When** they click on a user, **Then** they see the user's details (username, display name, role, status, creation date, last login date).
3. **Given** an admin is viewing a user's details, **When** they change the display name or role and save, **Then** the changes are persisted and reflected in the user list.
4. **Given** an admin is viewing an active user, **When** they click "Disable", **Then** the user's status changes to disabled and they can no longer log in.
5. **Given** an admin is viewing a disabled user, **When** they click "Enable", **Then** the user's status changes to active and they can log in again.
6. **Given** an admin is viewing a user, **When** they click "Reset Password" and enter a new password, **Then** the user's password is updated and they must use the new password to log in.
7. **Given** an admin is viewing a user, **When** they click "Delete" and confirm the action, **Then** the user is permanently removed from the system.
8. **Given** an admin attempts to delete their own account, **When** they click "Delete", **Then** the system prevents the action and displays a message that they cannot delete their own account.

---

### User Story 3 - Regular User Logs In with Limited Access (Priority: P2)

A user with the "user" role logs into the system using their credentials. They can access general features but cannot access the admin pages (inventory, orders, user management). The system enforces role-based access so that only admins can reach admin functionality.

**Why this priority**: Role enforcement is essential for security, but the initial deployment may start with admin-only users. This story ensures the role system works correctly when non-admin users are introduced.

**Independent Test**: Can be tested by creating a user with the "user" role, logging in, and verifying that admin pages and admin API endpoints are inaccessible.

**Acceptance Scenarios**:

1. **Given** a user with the "user" role is logged in, **When** they attempt to access the user management page, **Then** they are denied access and see a "not authorized" message.
2. **Given** a user with the "user" role is logged in, **When** they attempt to access admin API endpoints, **Then** the system returns an authorization error.
3. **Given** a user with the "user" role is logged in, **When** they access non-admin areas of the system, **Then** they can use those areas normally.

---

### User Story 4 - System Initialization with First Admin (Priority: P1)

When the system starts for the first time with no users in the database, it automatically creates a default admin account using credentials from environment configuration (similar to the current `ADMIN_LOGIN_HASH` approach). This ensures admins can always access the system to create additional users.

**Why this priority**: Without a bootstrap mechanism, there would be no way to create the first admin user. This is critical for deployment and migration from the current single-password system.

**Independent Test**: Can be tested by starting the system with an empty user database and verifying a default admin account is created and can log in.

**Acceptance Scenarios**:

1. **Given** the system starts with no users in the database, **When** the application initializes, **Then** a default admin user is created from environment configuration.
2. **Given** the system already has users in the database, **When** the application restarts, **Then** no additional default users are created.
3. **Given** the default admin account exists, **When** an admin logs in and creates additional admin users, **Then** the system has multiple admin accounts that can independently manage users.

---

### User Story 5 - Admin Changes Their Own Password (Priority: P2)

A logged-in admin (or user) can change their own password by providing their current password and entering a new password. This is distinct from the admin "reset password" function which does not require knowing the old password.

**Why this priority**: Self-service password change reduces admin burden and is a standard security feature, but is less critical than the core user management capabilities.

**Independent Test**: Can be tested by logging in, navigating to account settings, entering current password and a new password, and verifying the new password works on next login.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they provide their current password and a new password, **Then** their password is updated.
2. **Given** a user is logged in, **When** they provide an incorrect current password, **Then** the password change is rejected.
3. **Given** a user has changed their password, **When** they log in again, **Then** only the new password is accepted.

---

### Edge Cases

- What happens when the last admin user is disabled or deleted? The system must prevent this — at least one active admin must always exist.
- What happens when an admin demotes themselves from admin to user? The system must prevent this if they are the last admin.
- What happens when a user is deleted while they have an active session? Their session must be invalidated.
- What happens when a user is disabled while they have an active session? Their session must be invalidated immediately.
- What happens if two admins simultaneously edit the same user? The last save wins, and the UI reflects the current state on next load.
- What happens when a username that already exists is used for a new user? The system must reject the duplicate and show an error.
- How does the user management page behave on mobile? It must remain usable with a responsive layout.
- What if the environment variable for the default admin is removed after initial setup? Existing users are unaffected; no new default user is created.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support individual user accounts with username, display name, hashed password, role, and active/disabled status.
- **FR-002**: The system MUST support two roles: "admin" and "user". Admins have full access to all admin pages and API endpoints. Users have restricted access based on their role.
- **FR-003**: The login flow MUST authenticate users by username and password, creating a session tied to the specific user.
- **FR-004**: The system MUST provide an admin-only user management page accessible from the admin navigation.
- **FR-005**: Admins MUST be able to create new users by specifying username, display name, role, and initial password.
- **FR-006**: Admins MUST be able to edit a user's display name and role.
- **FR-007**: Admins MUST be able to disable and re-enable user accounts. Disabled users cannot log in.
- **FR-008**: Admins MUST be able to delete user accounts. Deletion is permanent.
- **FR-009**: Admins MUST be able to reset any user's password without knowing the old password.
- **FR-010**: Users MUST be able to change their own password by providing their current password and a new password.
- **FR-011**: The system MUST prevent the last active admin from being deleted, disabled, or demoted to a non-admin role.
- **FR-012**: The system MUST invalidate active sessions when a user is deleted or disabled.
- **FR-013**: The system MUST create a default admin user on first startup if no users exist, using environment-provided credentials.
- **FR-014**: Usernames MUST be unique and case-insensitive.
- **FR-015**: Passwords MUST be stored as salted cryptographic hashes, never in plain text.
- **FR-016**: The user management page MUST be available in both German and English, consistent with the existing admin pages.
- **FR-017**: Login error messages MUST NOT reveal whether the username or password was incorrect (to prevent user enumeration).
- **FR-018**: The system MUST record the last login timestamp for each user.
- **FR-019**: A confirmation dialog MUST be shown before destructive actions (delete user, reset password).
- **FR-020**: The login endpoint MUST be rate-limited to prevent brute force attacks (consistent with existing rate limiting patterns on other endpoints).
- **FR-021**: The existing `ADMIN_API_TOKEN` bearer token mechanism MUST continue to work, granting admin-level access for programmatic use. Actions via this token are not attributed to a specific user.

### Key Entities

- **User**: An individual account in the system with a unique username, display name, hashed password, role (admin or user), status (active or disabled), creation timestamp, and last login timestamp.
- **Role**: A classification that determines a user's access level. Two roles exist: "admin" (full access to all admin features including user management) and "user" (restricted access, no admin features).
- **Session**: An authenticated session tied to a specific user, containing the user's identity and role. Sessions are invalidated when the user is deleted or disabled.

## UI/UX Specification

**UI-IMPACT**: Yes

### Layout & Structure

- **UIR-001**: The user management page MUST follow the same layout pattern as the existing admin pages (inventory.html, orders.html) — same header with navigation, same login form pattern, same split-pane style where applicable.
- **UIR-002**: A "Users" navigation link MUST be added to the admin page header, alongside the existing "Inventory" and "Orders" links.
- **UIR-003**: The user list MUST display in a table with columns: username, display name, role, status, last login.
- **UIR-004**: The user detail/edit view MUST appear in a detail pane (consistent with the split-pane pattern used in inventory and orders pages).
- **UIR-005**: The "Create User" action MUST be accessible via a prominent button above the user list.

### Interaction & States

- **UIR-006**: The user list MUST support filtering by role (all, admin, user) and by status (all, active, disabled).
- **UIR-007**: The "Delete" button MUST trigger a confirmation dialog stating the action is permanent and showing the username being deleted.
- **UIR-008**: The "Reset Password" action MUST present a form to enter the new password with a confirmation field.
- **UIR-009**: The "Disable"/"Enable" toggle MUST update the user status immediately and reflect the change in the list without a full page reload.
- **UIR-010**: Form validation errors (duplicate username, empty required fields, password mismatch) MUST be displayed inline near the relevant field.
- **UIR-011**: Success and error notifications MUST appear as temporary feedback messages (toast/banner) consistent with existing admin page patterns.

### Accessibility

- **UIR-012**: All form fields MUST have associated labels.
- **UIR-013**: The user management page MUST be fully navigable by keyboard, including the user list, action buttons, and forms.
- **UIR-014**: Status indicators (active/disabled) MUST not rely solely on color — they must include text labels.

### Responsive Behavior

- **UIR-015**: On mobile viewports, the split-pane layout MUST collapse to a stacked layout (list on top, detail below) or navigate between list and detail views.
- **UIR-016**: Action buttons MUST remain accessible and tappable on touch devices (minimum 44x44px touch targets).

### UI Acceptance Criteria

- **UAC-001**: Admin can see the "Users" link in the admin navigation and navigate to the user management page.
- **UAC-002**: The user list loads and displays all users with their username, display name, role, status, and last login date.
- **UAC-003**: Clicking "Create User" opens a form; filling it in and submitting creates the user and adds them to the list.
- **UAC-004**: Clicking a user in the list opens the detail pane showing their full information and action buttons.
- **UAC-005**: Editing a user's display name or role and saving reflects the change immediately in the list.
- **UAC-006**: Clicking "Disable" on an active user changes their status to disabled; clicking "Enable" reverses it.
- **UAC-007**: Clicking "Delete" shows a confirmation dialog; confirming removes the user from the list.
- **UAC-008**: Clicking "Reset Password" shows a password form; submitting updates the user's password.
- **UAC-009**: Attempting to delete or disable the last active admin shows an error message preventing the action.
- **UAC-010**: All forms show inline validation errors for invalid input (empty fields, duplicate username, password mismatch).
- **UAC-011**: The page renders correctly and is usable on mobile viewport sizes.
- **UAC-012**: All interactive elements are reachable and operable via keyboard navigation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create, edit, disable, enable, delete users, and reset passwords — all operations complete successfully within 2 seconds of user action.
- **SC-002**: A newly created user can log in with their credentials and access features appropriate to their role within 1 minute of account creation.
- **SC-003**: A disabled user is locked out immediately — any active session is terminated and new login attempts are rejected.
- **SC-004**: The system always maintains at least one active admin account — attempts to remove the last admin are blocked 100% of the time.
- **SC-005**: The user management page is fully functional on desktop and mobile browsers, with all actions accessible via keyboard.
- **SC-006**: Migration from the current single-password admin system is seamless — a default admin is auto-created on first startup, and the system is immediately usable.

## Clarifications

### Session 2026-03-12

- Q: What should happen to the existing `ADMIN_API_TOKEN` bearer token mechanism? → A: Keep as-is for now — it grants admin-level access without being tied to a specific user. Actions via the shared token cannot be attributed to an individual user (accepted tradeoff).

## Assumptions

- The existing admin session mechanism (HMAC-signed cookie) will be extended to include user identity and role, rather than replaced with a fundamentally different approach.
- The current `ADMIN_LOGIN_HASH` environment variable will be repurposed to seed the initial admin user on first run.
- The "user" role currently has no specific features to access beyond logging in; the role exists to support future functionality. For now, users with the "user" role simply cannot access admin pages.
- Password complexity requirements are not specified — the system will accept any password of at least 8 characters. This can be revisited based on security policy.
- There is no self-service password reset via email. Admins must reset passwords for users who forget theirs.
- Audit logging of user management actions (who created/modified/deleted whom) is out of scope for this feature but may be added later.
- The shared `ADMIN_API_TOKEN` is kept for backward compatibility. Actions performed via this token cannot be attributed to a specific user — this is an accepted tradeoff until per-user API tokens are introduced in a future iteration.
