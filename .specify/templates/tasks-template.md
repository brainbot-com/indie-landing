---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Static pages**: root `*.html` files and matching `en/*.html`
- **Translations**: `i18n/*.json` and `scripts/generate-lang.js`
- **Shared assets**: `style.css`, `script.js`, images, and supporting static files
- Tasks MUST name the exact page pairs, assets, and generator files they touch

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Context)

**Purpose**: Capture scope, affected pages, and shared constraints before editing

- [ ] T001 List affected German and English pages from the implementation plan
- [ ] T002 Identify impacted shared claims, CTAs, and detail layers
- [ ] T003 [P] Identify affected design-system tokens, components, and shared assets

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on the feature):

- [ ] T004 Update shared copy, IA, or claim inventory for all affected pages
- [ ] T005 [P] Prepare translation key changes and English page updates
- [ ] T006 [P] Prepare shared CSS/JS changes required by multiple pages
- [ ] T007 Confirm whether new detail layers, overlays, or navigation changes are needed
- [ ] T008 Confirm whether `STYLE_GUIDE.md` or `TRANSLATION.md` must change
- [ ] T009 Document any justified deviation from static HTML/CSS/minimal JS

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Verify changed German and English pages for structural parity
- [ ] T011 [P] [US1] Verify desktop/mobile behavior and keyboard access for touched interactions

### Implementation for User Story 1

- [ ] T012 [P] [US1] Update German source copy and structure in the specified root HTML file
- [ ] T013 [P] [US1] Update matching English page or translation JSON for the same story
- [ ] T014 [US1] Update shared styles in `style.css` if the story needs design-system changes
- [ ] T015 [US1] Update `script.js` only if the story requires progressive enhancement behavior
- [ ] T016 [US1] Add or refine a detail layer for any strong claim introduced by the story
- [ ] T017 [US1] Cross-check the same claim on checkout, legal, privacy, and operations pages as needed

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Verify updated translation output and asset paths in `/en/`
- [ ] T019 [P] [US2] Verify claim consistency across all affected pages

### Implementation for User Story 2

- [ ] T020 [P] [US2] Update the next affected German page pair
- [ ] T021 [US2] Update shared assets or generator logic required by the story
- [ ] T022 [US2] Add supporting copy, detail UI, or navigation refinements
- [ ] T023 [US2] Reconcile shared claims with User Story 1 outputs where needed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T024 [P] [US3] Verify final desktop/mobile visual polish on touched sections
- [ ] T025 [P] [US3] Verify no regression in keyboard access, overlays, or navigation

### Implementation for User Story 3

- [ ] T026 [P] [US3] Implement the final page-pair or shared-asset changes
- [ ] T027 [US3] Update any affected source-of-truth docs in the repo
- [ ] T028 [US3] Perform final cross-page consistency pass for all changed claims

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Update `STYLE_GUIDE.md`, `TRANSLATION.md`, or README if required
- [ ] TXXX Regenerate English output and verify paths
- [ ] TXXX Review final copy for unsupported claims or missing detail layers
- [ ] TXXX Review final pages on desktop and mobile
- [ ] TXXX Review touched legal, privacy, checkout, and operations pages for contradictions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Validation tasks (if included) MUST be defined before implementation
- German source changes before English parity and generation
- Shared design-system or JS changes before page-level polish
- Claim substantiation and cross-page review before story closeout
- Story complete before moving to next priority

### Parallel Opportunities

- All scoped page-inventory tasks marked [P] can run in parallel
- Translation, shared-asset, and validation tasks marked [P] can run in parallel when they touch different files
- Once foundational claim and parity work completes, user stories can proceed in parallel
- Different page pairs can be updated in parallel if shared claims are reconciled before merge

---

## Parallel Example: User Story 1

```bash
# Launch parity and behavior checks together:
Task: "Verify changed German and English pages for structural parity"
Task: "Verify desktop/mobile behavior and keyboard access for touched interactions"

# Launch file updates that do not conflict:
Task: "Update German source copy in index.html"
Task: "Update matching English translation keys in i18n/index.html.lang.en.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
