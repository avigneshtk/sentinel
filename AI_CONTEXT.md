# AI_CONTEXT.md — SENTINEL

> Read this file first at the start of a coding session. Then inspect
> only the files relevant to the requested task.

## 1. Project purpose

**SENTINEL — Digital Safety & Threat Intelligence Platform**, built for
FISAT Hack2Pitch, **Track 03: The Human Attack Surface**. It helps
people — particularly women — recognize digital threats, detect early
warning signs and escalating behavioural patterns, reduce
personal-information exposure, organize incidents, and reach verified
official reporting resources. Tagline: *"Detect threats. Protect
privacy. Take action."*

Target users: people receiving threatening, manipulative, or coercive
messages; people experiencing harassment, cyberstalking, impersonation,
or image-based abuse; people worried about doxxing or privacy exposure.
General safety resources must never require users to prove they are
victims.

## 2. Tech stack

- **Next.js 14.2.30** (App Router), **React 18.3.1**, **TypeScript**
  (strict), **Tailwind CSS 3.4.x**
- **Vitest 1.x + jsdom + @testing-library/react** for tests
- **Tesseract.js ^5.1.1** — browser-side OCR, dynamically imported
- **No backend, no database, no accounts, no external AI, no API keys.**
  The app is a static client-side build; all analysis runs in the
  browser. Node 26.3.0 / npm 11.16.0 was used for development.

## 3. Main features (routes)

| Route | Module | Behaviour |
|---|---|---|
| `/` | Landing | Product explanation, four outcomes, emergency numbers |
| `/dashboard` | Dashboard | Tool cards, demo shortcuts (`/analyze?demo=<id>`), privacy snapshot, recent retained incidents |
| `/analyze` | **TraceTrust** | Paste a conversation → deterministic rule engine → explainable findings, escalation summary, chronological transcript, recommendations, limitations, immediate-safety banner |
| `/privacy-scan` | **TRACELESS** | On-device OCR of a user-selected image (≤5 MB, PNG/JPEG/WebP/GIF/BMP) + caption analysis; verbatim OCR text shown separately from inferred exposures |
| `/timeline` | Incident Timeline | Create/edit/delete incidents, categories, "date unknown", chronological order (unknowns last), repeated-category pattern alert, local .txt/.json export |
| `/safety-center` | Safety Centre | Country selector (IN, US, UK, AU, CA) + incident-type selector → safety steps and verified official resources with phone links |
| `/settings` | Privacy & Settings | Full rule list, data controls (working delete-all), storage explanation, scanner scope/limits |

## 4. Important directories and files

```
src/
├── app/
│   ├── layout.tsx            # root shell: Navbar, Footer, skip-link, metadata
│   ├── page.tsx              # landing page
│   ├── globals.css           # Tailwind + focus/reduced-motion/scrollbar styles
│   └── (platform)/           # IncidentsProvider wraps the 6 platform pages
│       ├── layout.tsx        # provides useIncidents() context
│       ├── dashboard/page.tsx
│       ├── analyze/page.tsx  # client page; runs analyzeConversation()
│       ├── privacy-scan/page.tsx
│       ├── timeline/page.tsx
│       ├── safety-center/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── ui/                   # Button, Card, Badge (SeverityBadge/Tag), Alert, fields, states
│   ├── layout/navbar.tsx     # Navbar (desktop + mobile menu), Footer, Logo
│   ├── analyzer/             # ConversationForm, FindingsList, EscalationPanel,
│   │                         # ImmediateSafetyBanner, TranscriptView
│   ├── privacy-scanner/scan-panel.tsx   # file validation, OCR flow, results
│   ├── timeline/timeline-panel.tsx      # incident form, list, export, storage toggle
│   ├── safety-center/safety-center-panel.tsx
│   ├── dashboard/dashboard-widgets.tsx
│   └── incidents/incidents-provider.tsx # opt-in localStorage store (context)
├── lib/
│   ├── analysis/types.ts     # Severity, Confidence, ConversationMessage,
│   │                         # SignalMatch, EscalationAssessment, AnalysisResult
│   ├── analysis/parse-conversation.ts  # parser: [ts] Sender: text, WhatsApp
│   │                         # format, plain-line fallback; never fabricates data
│   ├── analysis/rules/*.ts   # 13 independent rules + helpers.ts + index.ts
│   │                         # registry + user-labels.ts (user-reported context)
│   ├── analysis/analyze-escalation.ts  # trend (least-squares slope),
│   │                         # repeated contact, date coverage, pattern summary
│   ├── analysis/analyze-conversation.ts # orchestrator: validation, runs rules,
│   │                         # computes concern level, recommendations, limitations
│   ├── privacy-scanner/detect-exposures.ts  # pure detectors: phone, email,
│   │                         # address clue, PIN, document keywords, caption
│   ├── privacy-scanner/ocr.ts          # runOcr() (dynamic Tesseract import),
│   │                         # validateImageFile(), ALLOWED_IMAGE_TYPES, 5 MB limit
│   ├── timeline/incidents.ts # Incident model, validation, sortIncidents,
│   │                         # findRepeatedCategories, buildIncidentExport(.json)
│   ├── validation/input.ts, lib/utils/format.ts  # helpers, downloadTextFile
├── data/demo-scenarios.ts    # 4 fictional demo scenarios
└── data/reporting-resources.ts  # verified country resources + per-type guidance
tests/                        # 8 test files, 128 tests (unit + integration)
```

Business logic lives in `src/lib` as pure typed functions; components
only render and forward events.

## 5. Development commands (from package.json)

```bash
npm install        # install dependencies
npm run dev        # Next.js dev server (default http://localhost:3000)
npm test           # vitest run — full suite
npm run test:watch # vitest watch mode
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # next lint
npm run build      # next build (production)
npm run start      # serve the production build
```

## 6. Validation status

Verified by running the commands in this workspace (Node 26.3.0, npm
11.16.0); also recorded in `AUDIT.md` §2:

- `npm test`: **128 tests / 8 files — all passing**
- `npm run typecheck`: **0 errors**
- `npm run lint`: **0 errors, 1 warning** — `<img>` used for the local
  object-URL preview (next/image does not support object URLs)
- `npm run build`: **success**, 10 routes, all static
- HTTP smoke test on `npm run start`: all 7 routes returned **200**

If you change code, re-run these before considering the change done.

## 7. Known limitations (documented in README/AUDIT)

- Heuristic rules: no sarcasm/joke/cultural understanding; false
  positives and negatives possible.
- `dd/mm/yyyy` parsed day-first (Indian convention).
- Escalation trend needs user-supplied dates; missing dates are
  "unknown", never fabricated.
- OCR is approximate; scanner scope is a documented, limited set of
  exposures; no face/object/GPS detection; a clean scan ≠ safe.
- Frequency detection requires sender dominance (≥75% of traffic in a
  60-minute window, ≥4 messages) to avoid flagging normal chats.
- Concern level is triage guidance, never a prediction or proof of
  guilt, identity, or intent.
- localStorage is not a secure evidence vault (UI says so).

## 8. Rules for future AI agents

1. **Read this file first.** Then inspect only files relevant to the
   task; do not re-explore the whole project.
2. **Verify against source before editing.** Do not assume a function,
   path, or behaviour exists — check the file.
3. **Do not weaken privacy guarantees**: no server routes, no
   analytics, no external AI, no uploads of conversations or images,
   no `dangerouslySetInnerHTML` with user text, no new data retention
   without an explicit opt-in and a documented deletion path.
4. **Do not remove existing functionality.** Keep every control's
   advertised behaviour working.
5. **Keep rules modular and deterministic.** Each detection rule is a
   pure function in `src/lib/analysis/rules/`; add unit tests for new
   or changed rules in `tests/unit/analysis/rules.test.ts` (or a new
   test file) and run `npm test`.
6. **Never invent reporting portals, phone numbers, or claims that a
   complaint was filed.** Add countries to
   `src/data/reporting-resources.ts` only after verifying the official
   source.
7. **All demo/test data must be fictional.** No real victim content.
8. **After every substantial change, update this file** (files changed,
   behaviour changed, tests run + results, unresolved issues, next
   step). Update existing sections — do not append logs.
9. **Never include secrets, API keys, tokens, or private user data**
   in the repo or in this file. `.env.example` exists only as a
   placeholder; no env vars are currently used.

## 9. Current status and next steps

**Completed:** all P0 and P1 features; 128 passing tests; clean
typecheck/lint; successful production build; verified IN/US/UK/AU/CA
resources; README, AUDIT.md, and this file written.

**Known issues:** none open. One lint warning (local `<img>` preview)
is accepted and documented.

**Deliberately deferred (P2):** more countries (after verification),
accounts/cloud persistence, public-source investigation module (no
genuine integration available — do not fake it), advanced redaction/ML.

**Suggested next steps, prioritised:**
1. Manual browser QA of the full demo script (README "Demo script").
2. Add more fictional demo scenarios for edge cases if needed.
3. Verify and add more countries to `reporting-resources.ts`.
