# AUDIT — SENTINEL

Engineering audit for the FISAT Hack2Pitch submission.
Everything below reflects the actual state of the repository at
release time.

---

## 1. Implemented features

### P0 — Essential (all complete)

- **Application shell**: responsive navbar (desktop + mobile menu),
  footer with emergency numbers, skip-to-content link, landing page.
- **TraceTrust** (`/analyze`):
  - Conversation input with validation (empty, >20,000 chars).
  - Analyze button with loading / success / error states.
  - 13 deterministic detection rules (see README table).
  - Message-level findings: matched signal, severity, confidence,
    verbatim supporting excerpt, explanation, recommendation,
    uncertainty/limitation, and expandable full messages.
  - Escalation panel: message counts, warning-sign categories,
    severity trend (least-squares slope over dated, message-level
    findings), repeated-contact analysis, date-coverage reporting.
  - Chronological transcript with finding highlighting.
  - Aggregated recommendations and limitations.
  - Immediate-safety banner when severe findings appear.
  - User-context labels (always marked user-reported, never
    driving the automated concern level).
  - Four fictional demo scenarios, plus `?demo=<id>` deep links
    from the dashboard.
  - Privacy notice; clear-input and clear-results controls.
- **Safety & Reporting Centre** (`/safety-center`): country selector
  (IN, US, UK, AU, CA), incident-type selector, per-type safety
  steps, verified official resources with phone links, explicit
  "guidance ≠ official complaint" distinction, device-monitoring
  caution.
- **Privacy notice & safe input handling**: analysis is browser-side;
  no raw conversation is ever transmitted or logged.

### P1 — Important (all complete)

- **Incident Timeline** (`/timeline`): create/edit/delete incidents,
  categories, explicit "date unknown" handling, chronological
  sorting (unknown dates grouped last), repeated-category pattern
  alert, local .txt/.json export (factual, user-reported, unverified),
  opt-in localStorage persistence with clear warnings, clear-all.
- **TRACELESS** (`/privacy-scan`): real on-device OCR (Tesseract.js),
  image type/size validation (≤5 MB, PNG/JPEG/WebP/GIF/BMP),
  object-URL lifecycle (created and revoked), OCR progress bar,
  verbatim OCR text section clearly separated from inferred-risk
  findings, caption analysis (phone/email/address/PIN/document
  keywords + location phrases/hashtags), documented limitations
  panel, failure handling for unreadable images.
- **Accessibility**: semantic HTML, labels, focus indicators,
  `prefers-reduced-motion` support, severity always labelled in text
  (never color-only).

### P2 — Not implemented (deliberately)

- Additional countries (structure is extensible; only verified
  sources were included).
- Accounts/cloud persistence (deliberately omitted — spec says not to
  overbuild authentication).
- Public-source investigation module (no genuine integration was
  available within the timebox; the spec forbids pretending to
  search external sites).
- Advanced image redaction/recognition.
- Machine-learning models.

---

## 2. Actual test & build results

Commands executed in this workspace (Node 26.3.0, npm 11.16.0):

| Command | Result |
|---|---|
| `npm install` | OK (postinstall scripts blocked by npm allow-scripts policy; esbuild/tesseract.js verified working) |
| `npm test` (vitest run) | **128 tests / 8 files — all passing** |
| `npm run typecheck` (tsc --noEmit, strict) | **0 errors** |
| `npm run lint` (next lint) | **0 errors**, 1 warning (`<img>` for local object-URL preview — `next/image` does not support object URLs) |
| `npm run build` | **success** — 10 routes, all static |
| `npm run start` + HTTP smoke test | all 7 routes return 200; landing, analyze, and safety-centre content verified |

Test coverage by area:

- `tests/unit/analysis/parse-conversation.test.ts` (11) — parser,
  timestamp formats, WhatsApp/exporter formats, plain-line fallback,
  multi-line joining, unknown-date handling.
- `tests/unit/analysis/rules.test.ts` (37) — every rule, negation
  controls, benign controls.
- `tests/unit/analysis/analyze-conversation.test.ts` (33) — all four
  demo scenarios, false-positive controls, determinism, validation.
- `tests/unit/privacy-scanner/detect-exposures.test.ts` (23) —
  exposure detectors, caption analysis, image validation.
- `tests/unit/timeline/incidents.test.ts` (10) — validation, sorting,
  patterns, export content.
- `tests/unit/reporting/resources.test.ts` (6) — resource integrity,
  https-only, verified numbers.
- `tests/unit/components/findings-list.test.tsx` (4) — safe rendering
  of untrusted content (HTML escaped, not executed), severity labels.
- `tests/integration/analysis-flow.test.ts` (4) — end-to-end parse →
  analyze → escalate on the demo scenarios.

---

## 3. Verified official resources (checked against authoritative sources)

| Resource | Verification |
|---|---|
| cybercrime.gov.in | Official National Cyber Crime Reporting Portal (Ministry of Home Affairs / I4C); special focus on crimes against women and children |
| 1930 | National Cyber Crime Helpline, 24×7, integrated with the fraud-reporting system (MHA / PIB release) |
| 112 | Emergency Response Support System (112.gov.in, MHA Nirbhaya funds) — police, fire, ambulance |
| 181 | Women Helpline, Ministry of Women and Child Development (wcd.gov.in); note: availability varies by state/UT |
| 1098 | Childline (childline.gov.in) |
| ic3.gov | FBI Internet Crime Complaint Center (US) |
| 911 | US emergency |
| reportfraud.police.uk / 0300 123 2040 | City of London Police — replaced Action Fraud in Dec 2025 (gov.uk announcement) |
| 999 / 101 | UK emergency / non-emergency |
| revengepornhelpline.org.uk | UK specialist image-abuse support |
| cyber.gov.au/report | Australian ReportCyber (ACSC) |
| esafety.gov.au | eSafety Commissioner — official image-based abuse removal scheme |
| 000 | AU emergency |
| antifraudcentre-centreantifraude.ca | Canadian Anti-Fraud Centre (RCMP/OPP) |

No portal, number, or service was invented. The data structure
(`src/data/reporting-resources.ts`) allows adding countries without
UI changes.

---

## 4. Privacy decisions

- No server routes exist; the app is a static Next.js build.
- Conversations and images are never uploaded, stored, or logged.
- Tesseract.js is loaded dynamically in the browser only.
- Incident retention is memory-only unless the user opts in; the
  opt-in warns that localStorage is not a secure evidence vault.
- Exports are generated client-side via Blob downloads.
- No analytics, cookies, or third-party scripts.
- User text is rendered via React escaping only — never `dangerouslySetInnerHTML`.

---

## 5. Known limitations

1. Heuristic rules cannot understand sarcasm, jokes, quoting, or
   cultural context; false positives and false negatives are possible.
2. `dd/mm/yyyy` is parsed day-first (Indian convention); ambiguous
   numeric dates are an accepted limitation.
3. Escalation analysis works only with user-supplied dates/timestamps;
   missing dates are reported as unknown.
4. OCR is approximate; the scanner's scope is a documented, limited
   set of exposures; it cannot detect faces, objects, GPS metadata,
   or locations depicted in images, and a clean scan is not a
   guarantee of safety.
5. Frequency detection requires sender dominance (≥75% of traffic in
   the window) to avoid flagging ordinary two-way conversations.
6. The concern level is triage guidance, documented in the UI and
   README; it is not a validated prediction.
7. Only five countries' resources are included — all verified; more
   will be added as they are verified.

## 6. Demo data

All demo conversations are fictional and written for this project.
No real victim conversations, images, or personal information are
used anywhere in the repository.
