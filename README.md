# SENTINEL — Digital Safety & Threat Intelligence Platform

> **Detect threats. Protect privacy. Take action.**

Built for **FISAT Hack2Pitch — Track 03: The Human Attack Surface**.

SENTINEL helps people — particularly women — recognize digital threats, catch
early warning signs and escalating behavioural patterns, reduce
personal-information exposure, organize incidents, and reach official
reporting resources. It targets the gap where modern security systems keep
getting smarter, yet most attacks still exploit human behaviour, trust, and
lack of awareness.

---

## Quick start

```bash
npm install        # install dependencies
npm run dev        # development server (http://localhost:3000)
npm test           # run the full test suite (Vitest)
npm run typecheck  # TypeScript strict type check
npm run lint       # ESLint
npm run build      # production build
npm run start      # serve the production build
```

**No account, no server, no API keys, no database.** Everything runs in the
browser.

---

## What's inside

| Module | Route | What it does |
|---|---|---|
| **TraceTrust** | `/analyze` | Conversation-level behavioural threat analysis with explainable, per-message findings |
| **TRACELESS** | `/privacy-scan` | On-device image & caption privacy scanner (real OCR via Tesseract.js) |
| **Incident Timeline** | `/timeline` | Chronological incident organizer with pattern detection and export |
| **Safety & Reporting Centre** | `/safety-center` | Verified official reporting channels, helplines, and safety steps |
| **Dashboard** | `/dashboard` | Overview, demo shortcuts, privacy snapshot, recent retained incidents |
| **Privacy & Settings** | `/settings` | Full transparency: what is stored, the complete rule set, data controls |

### Four outcomes (per the track)

1. **Recognize** threats — plain-language warning-sign explanations.
2. **Prevent** exposure — scan photos/captions before publishing.
3. **Detect early** — patterns across messages and over time, as early as
   the evidence permits.
4. **Take action** — official reporting channels and practical next steps.

---

## The analysis engine (TraceTrust)

**A transparent, deterministic rule engine — not a machine-learning model.**
The same input always produces the same findings. All 13 rules are visible
in Settings and independently unit-tested.

| Rule | Signal | Typical severity |
|---|---|---|
| `explicit-threats` | Direct threats of violence or harm | Elevated |
| `intimidation` | Claims to know your location/family; conditional threats | Elevated / Caution |
| `image-abuse-threat` | Threats to share intimate images (sextortion) | Elevated |
| `sexual-request` | Requests for intimate content | Caution |
| `boundary-ignore` | Contact continuing after a stated boundary | Caution / Elevated |
| `repeated-contact` | Chasing messages; high-frequency dominant senders | Caution / Elevated |
| `sensitive-info` | Requests for passwords, OTPs, card or identity details | Caution / Elevated |
| `money-pressure` | Payment demands, scam and extortion patterns | Caution / Elevated |
| `urgency-secrecy` | Manufactured urgency; secrecy demands | Caution |
| `impersonation` | Fake-authority claims; official-notice language | Caution |
| `location-probe` | Probing for address, area, or location | Caution |
| `channel-bypass` | Moving contact to another platform | Informational / Caution |
| `manipulation` | Guilt-tripping and emotional pressure | Informational |

Users can also attach **context labels** (new account, boundary ignored,
intimate images involved, worry about physical safety…). Labels are always
marked *user-reported* and never drive the automated concern level.

### Severity model (documented, understandable)

- **Informational** — weak signal, worth noticing.
- **Caution** — a warning sign that deserves review.
- **Elevated concern** — a severe or repeated warning sign.

**Concern level** is computed from detected findings only (user labels are
context, not detections): elevated concern when ≥2 elevated findings, or
≥1 elevated + ≥2 caution findings, or a weighted score ≥12; caution when
≥1 elevated, ≥2 caution, or score ≥5; otherwise no strong indicators.

**Escalation analysis** uses only *message-level* findings (conversation-level
rules would flatten the trend). It fits a least-squares slope of severity
over the dated messages and reports *increasing / stable / decreasing /
insufficient data* — only when messages span ≥24 hours and ≥3 dated
signal messages exist. Missing dates are reported as **unknown**, never
fabricated.

### What SENTINEL never claims

- A score is never "the probability of a crime".
- Findings never prove anyone's identity, guilt, or intent.
- A clean result never guarantees safety.
- SENTINEL never contacts anyone, files complaints, or accuses a named
  person.

---

## Privacy model (by design)

- **Conversation analysis**: 100% in-browser. Nothing is sent anywhere.
- **Image scanning**: Tesseract.js runs locally. Images are never uploaded;
  object URLs are revoked; files are type- and size-validated (≤5 MB).
- **Incident records**: memory-only by default. localStorage persistence is
  an explicit opt-in with a clear warning that browser storage is **not** a
  secure evidence vault. Every record can be edited, deleted, or cleared;
  exports are generated locally.
- **No accounts, no cookies, no analytics, no tracking.**

---

## Testing

```bash
npm test
```

**128 tests across 8 files**, all deterministic, all passing:

- every analysis rule (including negation handling, e.g. "I will not hurt
  you" is not a threat)
- multiple warning signs in one conversation
- repeated contact and supported escalation
- benign conversations and false-positive controls (family chats, work
  chats, ordinary affection)
- missing/invalid timestamps; empty and over-long inputs
- safe rendering of untrusted content (HTML is escaped, not executed)
- OCR exposure detection (phone, email, address, PIN, document keywords)
- image validation (type, size, empty files)
- caption privacy checks
- incident creation, validation, editing inputs, deletion, sorting, export
- reporting resource integrity (https-only, verified numbers)
- full-flow integration tests on all four fictional demo scenarios

---

## Demo script for judges (≈5 minutes)

1. **Dashboard** — overview of the four tools; quick-support numbers.
2. **TraceTrust** → load **Scenario 1** (fictional): watch the engine detect
   repeated chasing, an ignored boundary, location probing, secrecy demands,
   and an image-abuse threat — with escalation rated *increasing* across
   three dated days, per-message highlighting, and the immediate-safety
   banner.
3. Load **Scenario 2** (benign family chat): zero findings — the engine
   does not alarm on ordinary conversations.
4. Load **Scenario 3** (fake bank): impersonation, urgent OTP request,
   phishing language, urgency and secrecy.
5. **Scenario 4**: warning signs *without any violent language* — boundary
   ignored + chasing is enough.
6. **TRACELESS** — upload any photo containing text (e.g. a screenshot with
   a phone number) and a caption like "call me 98765 43210 #hometown":
   see verbatim OCR text, then the detected exposures with confidence
   levels and suggestions.
7. **Timeline** — record two incidents of the same category; see the
   repeated-pattern alert; export the factual summary.
8. **Safety Centre** — India resources (cybercrime.gov.in, 1930, 181, 112)
   plus US, UK, AU, CA; incident-type-specific guidance.
9. **Settings** — the complete rule set, data controls, delete-all.

All demonstration data is fictional. No real victim content is used.

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (platform)/         # dashboard, analyze, privacy-scan, timeline,
│   │                       # safety-center, settings
│   ├── layout.tsx          # shell: navbar, footer, skip-link
│   └── page.tsx            # landing
├── components/
│   ├── ui/                 # accessible primitives (Button, Card, Badge…)
│   ├── layout/             # Navbar, Footer
│   ├── analyzer/           # TraceTrust UI
│   ├── privacy-scanner/    # TRACELESS UI
│   ├── timeline/           # incident organizer UI
│   ├── safety-center/      # reporting centre UI
│   ├── dashboard/          # dashboard widgets
│   └── incidents/          # opt-in localStorage store (context)
├── lib/
│   ├── analysis/           # parser, 13 rules, escalation, orchestrator
│   ├── privacy-scanner/    # exposure detectors, OCR runner
│   ├── timeline/           # incident model, sorting, patterns, export
│   ├── validation/ utils/  # shared helpers
├── data/                   # demo scenarios, verified reporting resources
└── types/
tests/                      # unit + integration suites (Vitest)
```

Business logic lives in `src/lib` as pure, typed functions; components only
render and forward events. User-supplied text is always rendered as text
(React escaping), never injected as HTML.

## Known limitations

- Heuristic rules can produce false positives/negatives; they do not
  understand sarcasm, jokes, or cultural context.
- Day-first date parsing is assumed for `dd/mm/yyyy` (Indian convention).
- OCR is approximate; the scanner covers a deliberately limited set of
  exposures and cannot detect faces, objects, or GPS metadata.
- Escalation analysis requires user-supplied dates/timestamps.
- Browser localStorage is not a secure evidence vault.
- Reporting resources are limited to verified official sources (IN, US, UK,
  AU, CA at release).

See `AUDIT.md` for the full audit: verification notes, actual test results,
and unimplemented features.

## Ethics

SENTINEL is a triage and guidance tool — not a risk score, not a medical,
legal, or emergency service, and not a substitute for professional support.
It does not require users to prove they are victims before accessing
resources, does not blame victims, and does not confront or message alleged
perpetrators. Women's digital safety is a core requirement of the product,
not a secondary feature.
