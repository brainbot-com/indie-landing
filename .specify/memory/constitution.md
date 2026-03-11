<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template Principle 1 -> I. Design-System First
- Template Principle 2 -> II. German Source, English Parity
- Template Principle 3 -> III. Claim Discipline and Detail Layers
- Template Principle 4 -> IV. Static Simplicity and Progressive Enhancement
- Template Principle 5 -> V. Cross-Page Consistency and Conversion Focus
Added sections:
- Additional Constraints
- Workflow and Quality Gates
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Follow-up TODOs:
- None
-->

# Indie.Box Constitution

## Core Principles

### I. Design-System First
All visual work MUST use the tokens, approved gradients, backgrounds, component
patterns, and naming rules defined in `STYLE_GUIDE.md` and `style.css`. New
visual tokens or component variants MUST be added to both files in the same
change. Page-specific styling that bypasses the shared design system is not
allowed unless the exception is documented in the implementation artifact for
that change.

Rationale: this repository is judged primarily on visual quality and cohesion.
The design system is the guardrail that keeps pages premium, consistent, and
maintainable.

### II. German Source, English Parity
German content is the source of truth. Any change to German copy, structure, or
information architecture MUST be mirrored in the matching English page in the
same change set. For `index.html`, translations MUST follow `TRANSLATION.md`,
including stable `data-i18n` keys, updates to
`i18n/index.html.lang.en.json`, and regenerated output in `en/index.html`. For
other static pages, English counterparts MUST remain materially equivalent in
content, structure, and user intent.

Rationale: the project ships static pages per language. Drift between German and
English would create broken promises, inconsistent positioning, and extra manual
maintenance.

### III. Claim Discipline and Detail Layers
Copy MUST be specific enough to withstand a critical reader. Any claim about
privacy, telemetry, support access, operational model, specifications, pricing,
readiness, or product behavior MUST be supportable by the surrounding page or a
clearly discoverable detail layer such as an overlay, FAQ entry, compact info
box, or dedicated follow-up page. Vague superlatives, hidden conditions, and
copy that contradicts legal, checkout, privacy, or operations pages are not
allowed.

Rationale: this repository sells trust through language. Strong positioning only
works if details are easy to find and consistent across the site.

### IV. Static Simplicity and Progressive Enhancement
The default implementation model is static HTML, shared CSS, and minimal
vanilla JavaScript. New frameworks, build steps, external runtime dependencies,
or client-side complexity MUST have a clear justification tied to user value.
Core reading, navigation, legal access, and CTA access MUST remain available
without JavaScript where feasible; JavaScript is reserved for enhancement
behaviors such as overlays, animation, tabs, and redirects. Any touched
interaction MUST remain usable on mobile, keyboard-accessible, and tolerant of
reduced-motion preferences when animation is involved.

Rationale: simplicity is a product quality here, not a shortcut. The site must
stay fast, understandable, and robust.

### V. Cross-Page Consistency and Conversion Focus
Every page and section MUST serve at least one of these roles: positioning,
explanation, trust-building, legal clarity, or conversion. Decorative additions
without a clear communication job are not acceptable. Changes that touch shared
facts, including pricing, delivery framing, privacy guarantees, support access,
or hardware/software capabilities, MUST be reviewed across all relevant pages so
that no contradiction remains between landing, checkout, operations, privacy,
terms, and legal pages.

Rationale: this repository is a commercial narrative, not a loose set of
documents. Users decide based on the whole site, not on a single page in
isolation.

## Additional Constraints

- `STYLE_GUIDE.md` is the single source of truth for typography, gradients,
  backgrounds, and component usage.
- `TRANSLATION.md` is the single source of truth for the DE -> EN translation
  workflow.
- `index.html` is the German master for the generated English home page.
- Asset references in generated English pages MUST continue to resolve from the
  `/en/` directory.
- New pages MUST have matching German and English versions unless the page is
  intentionally language-neutral and that decision is documented.
- Analytics or tracking changes MUST not silently weaken existing privacy
  promises in site copy.

## Workflow and Quality Gates

- Small edits may be implemented directly, but they MUST still pass the
  constitution checks above.
- Non-trivial changes MUST begin with a written spec or plan when they
  introduce a new page, materially change information architecture, change core
  claims, alter checkout or legal framing, modify translation generation, or
  add a new interaction pattern.
- Every implementation artifact for a non-trivial change MUST state:
  affected pages, affected languages, affected claims, required cross-page
  sync, and any `STYLE_GUIDE.md` or `TRANSLATION.md` updates.
- A change is not complete until all of the following are true:
  the German source is updated, English parity is updated, impacted static pages
  are cross-checked for contradictions, and touched interactions are verified on
  desktop and mobile.
- If a change introduces a new design token, UI pattern, or translation rule,
  the corresponding source-of-truth document MUST be updated in the same
  change.

## Governance

This constitution supersedes informal repo habits and generic Speckit defaults
where they conflict. Reviews and implementation plans MUST check compliance with
all five core principles. Amendments require:

- an explicit update to this file,
- a semantic version decision with rationale,
- synchronized updates to any affected templates or guidance files, and
- a brief sync impact report at the top of the constitution.

Versioning policy:

- MAJOR: removes or redefines a core principle in a backward-incompatible way.
- MINOR: adds a new principle, a new mandatory workflow gate, or a materially
  stronger constraint.
- PATCH: clarifies wording, fixes ambiguity, or improves guidance without
  changing expected behavior.

Compliance review expectations:

- Plans MUST identify which principles are in scope.
- Implementations MUST call out any deliberate exception and justify it.
- Reviews MUST block changes that break DE/EN parity, design-token discipline,
  cross-page consistency, or claim substantiation.

**Version**: 1.0.0 | **Ratified**: 2026-03-06 | **Last Amended**: 2026-03-06
