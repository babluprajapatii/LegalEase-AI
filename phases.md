# LegalEase-AI — Development Phases

> **Hackathon:** PromptWars Virtual — "AI for Legal Assistance & Access"
> **Project:** LegalEase-AI — GenAI-powered legal document understanding tool
> **Source of truth:** PRD.md, architecture.md, rules.md, design.md
> **Status:** Implementation plan

---

## Execution Overview

LegalEase-AI is built in **6 sequential phases** with overlapping testing and security work throughout. Each phase delivers a verifiable increment. The final phase produces a hackathon-ready deployment with demo script.

The MVP protection rule applies at every phase: if time runs short, the project must still ship working Authentication → Upload → Processing → Gemini Analysis → Summary → Clause/Risk Detection → Q&A → Comparison → Next Steps → Security → Disclaimer → Deployment.

Optional items never block the MVP.

---

## Phase Dependency Diagram

```
Phase 1: Foundation & Security Baseline
   ↓ (security baseline gates all later phases)
Phase 2: Auth, Upload & Document Processing
   ↓ (auth + document pipeline gates AI)
Phase 3: GenAI Legal Analysis & Document Understanding
   ↓ (analysis must be stable before interactive features)
Phase 4: Document Q&A, Comparison & Advanced Legal Assistance
   ↓ (interactive features complete the core feature set)
Phase 5: Polish, Security Hardening & Comprehensive Testing
   ↓ (hardening gates production)
Phase 6: Deployment, Observability & Demo Readiness
```

Work that happens **in parallel** with phases:

- Unit testing — starts Phase 2, continues through Phase 5
- UI polish — incremental, starts Phase 1, continues through Phase 5
- Security reviews — continuous, formal gates at Phase 1, Phase 5
- Documentation — continuous, finalize in Phase 6

---

## Phase 1 — Foundation, Project Setup & Security Baseline

### Phase Objective

Establish the secure technical foundation: project structure, Firebase/Google Cloud configuration, environment/secrets strategy, authentication architecture, frontend/backend boundaries, and security baselines that all later phases depend on.

### Why This Phase Exists

No AI, no upload, no document processing can be built safely without:

- A clean project structure that enforces frontend/backend separation
- Environment variable and secret management that prevents leaked credentials
- Firebase + Google Cloud projects configured with security rules
- Auth architecture prepared so Phase 2 can build on it immediately
- .gitignore and CI basics that prevent accidental secret commits

### Goals

- Next.js/React/TypeScript project initialized with strict mode
- Frontend/backend folder boundaries enforced
- Firebase project created and configured
- Google Cloud project created with required services enabled
- Environment variable strategy defined and `.env.example` created
- Secret management plan in place (Secret Manager for production)
- Firestore, Cloud Storage, Cloud Run configured at project level
- Git + GitHub setup with proper .gitignore
- Security baseline documented

### Detailed Tasks

#### Project Setup (MUST HAVE)

- [x] Initialize Next.js application with TypeScript strict mode (verified: `frontend/` uses Next.js ^15, React ^19, TypeScript strict mode; `npm run typecheck` passes)
- [x] Create folder structure per architecture.md §12 (frontend/backend/shared present; `shared/` is currently empty — see Phase 1 testing note)
- [x] Configure `tsconfig.json` with strict mode (backend and frontend both set `strict: true`; root `npm run typecheck` → 0 errors)
- [x] Set up frontend/backend separation (`frontend/`, `backend/`, `shared/`)
- [x] Create `shared/types/` for common TypeScript interfaces — `shared/types/index.ts` created with `ProcessingStatus`, `AnalysisType`, `AnalysisStatus`, `ApiResponse`, `DocumentMetadata`, `SecurityValidationResult`, `AIGroundingResult`
- [x] Add ESLint + Prettier with consistent rules — configured (`eslint.config.mjs`, `.prettierrc`); `npm run lint` → 0 errors, 84 warnings; `npm run format` → all files clean
- [x] Create `.gitignore` including `.env`, `node_modules`, build artifacts
- [x] Create `.env.example` with variable names only (no values)

#### Google Cloud / Firebase Foundation (MUST HAVE)

- [~] Create Firebase project, enable Authentication (Google OAuth) — config files present locally (`backend/src/config/firebase.ts`, `.env.example`); cloud provisioning not verified
- [~] Create Google Cloud project, enable: Cloud Run, Cloud Storage, Firestore, Vertex AI, Cloud Logging, Secret Manager — config references present in code/env; cloud provisioning not verified
- [x] Configure Firestore database (production rules placeholder) — `firestore.rules` created with user-scoped access rules (default deny, owner-only read/write)
- [x] Configure Cloud Storage bucket with user-scoped path structure — `storage.rules` created with user-scoped access, 10 MB limit, allowed content types
- [~] Create Cloud Run service skeleton (health endpoint) — `GET /api/health` implemented in `backend/src/index.ts`; not deployed to Cloud Run
- [~] Enable Cloud Logging and Cloud Monitoring — Winston structured logging implemented; Cloud Monitoring not configured
- [~] Configure IAM: least-privilege service accounts — not documented or verified
- [x] Record project IDs in `.env.example` (names only, no real values)

#### Security Baseline (MUST HAVE)

- [x] Define environment variable strategy: `.env` for dev, Secret Manager for production
- [x] Create `backend/src/config/env.ts` with validation (Zod or equivalent)
- [~] Document secret exposure rules per rules.md §7 — `secret-scan` script exists in package.json; rules §7 not cross-checked during this audit
- [x] Add secret-scan script to package.json (`npm audit`, grep for API keys)
- [x] Create CORS configuration (frontend origin only) — `cors({ origin: env.FRONTEND_URL })`
- [x] Create rate-limiting middleware skeleton — `express-rate-limit` applied globally
- [x] Document auth architecture (Firebase ID token → backend verification)
- [x] Prepare authorization model (user ownership, document-scoped access) — service-level ownership checks implemented; `requireOwnership` middleware available
- [x] Prepare user/document ownership model (Firestore schema draft) — `firestore.rules` defines `users/{userId}` and `documents/{documentId}` collections with ownership enforcement

#### UI Foundation (SHOULD HAVE)

- [ ] Create basic page routing (Landing, Dashboard, Upload placeholders) — only `/` landing placeholder exists; no `/dashboard` or `/upload` route
- [ ] Set up design token system (colors, spacing, typography per design.md §4–§5) — not implemented
- [ ] Create basic accessible layout shell (semantic HTML, skip-nav link) — not implemented
- [ ] Add focus state styles (2px `--color-focus` outline, 2px offset) — not implemented

#### CI/CD Foundation (NICE TO HAVE)

- [ ] Create basic GitHub Actions workflow for lint/typecheck — not found
- [ ] Add build verification step — present in `package.json` `prepare` script; `npm run build` not executed in this audit

### Features/Components Built

- Project skeleton (frontend/backend/shared)
- Environment configuration with validation
- Firebase project configured (config code present locally; cloud provisioning not verified)
- Google Cloud project configured (config references present; cloud provisioning not verified)
- Security baseline documented
- Basic routing shell (landing only)

### AI/GenAI Work

None in this phase. No Gemini integration yet.

### Security Requirements

- `.env` in `.gitignore` (verified)
- `.env.example` has variable names only
- No API keys in source code
- CORS restricted to frontend origin
- Rate-limiting middleware skeleton
- Secret exposure scan script
- IAM least-privilege draft

### Testing Requirements

- [x] Project builds without errors — `npm run typecheck` passes; backend `npm run build (tsc)` → 0 errors; frontend `npm run build (next build)` → compiled, 4/4 static pages
- [x] TypeScript strict mode passes (`npm run typecheck` → 0 errors)
- [x] Lint passes (`npm run lint` → 0 errors; 84 warnings, mostly no-explicit-any / no-unused-vars)
- [x] Folder structure matches architecture.md §12 — frontend/backend/shared present; `shared/types/index.ts` populated
- [x] Tests pass → 16/16 tests (4 auth middleware, 7 document validation, 4 extraction service, 1 integration pipeline)
- [x] Format clean → `npm run format` reports all files use Prettier code style
- [x] Secret scan clean → `npm run secret-scan` reports no hardcoded secrets
- [x] `.env` not committed (verified by grep)

### Google Cloud / Firebase Work

- Firebase project created, Google OAuth enabled (config code present; cloud provisioning not verified)
- Google Cloud project created (config references present; cloud provisioning not verified)
- Cloud Storage bucket created (user-scoped path structure defined in code)
- Firestore database created (security rules drafted in `firestore.rules`)
- Cloud Run service skeleton deployed (health endpoint implemented locally; not deployed)
- Vertex AI / Gemini API enabled (but not integrated yet)
- Cloud Logging + Monitoring enabled (Winston logging implemented; Cloud Monitoring not configured)
- Secret Manager access configured (env optional; not verified)

### Deliverables

- Initialized repo with folder structure
- `.env.example` with all required variable names
- Firebase + Google Cloud project IDs documented
- Security baseline documented
- Health endpoint responding locally

### Definition of Done

- [x] `npm run build` succeeds — backend `tsc` → 0 errors; frontend `next build` → compiled, 4/4 static pages
- [x] TypeScript strict mode passes
- [~] Firebase project exists and Google OAuth is configured — config code present locally; cloud project not verified
- [~] Google Cloud project has Cloud Run, Storage, Firestore, Vertex AI, Logging enabled — config references present; cloud provisioning not verified
- [x] `.env.example` contains all required variable names (PORT, NODE_ENV, FRONTEND_URL, JWT_SECRET, Firebase, GCS, Gemini), no real secrets
- [x] `.gitignore` excludes `.env`, `node_modules`, build artifacts
- [~] Health endpoint returns 200 on Cloud Run — `GET /api/health` exists locally; not deployed
- [x] CORS configuration exists (frontend origin only)
- [x] Secret scan script runs and reports clean — `npm run secret-scan` → ✅ No hardcoded secrets found
- [x] Folder structure matches architecture.md §12 — `shared/types/index.ts` populated
- [x] All 16 tests pass — `npm run test` → 16 pass, 0 fail
- [x] `npm run format` → all files clean

### Dependencies

None — this phase has no upstream dependencies.

### Exit Criteria

- Project builds clean
- Google Cloud + Firebase projects exist and are configured
- Security baseline documented
- Auth architecture prepared for Phase 2

---

## Phase 2 — Authentication, Document Upload & Document Processing

### Phase Objective

Build the complete document ingestion pipeline: authenticated users can upload valid PDFs/DOCX/TXT files, files are validated securely, text is extracted, metadata is stored in Firestore, and processing states are tracked end-to-end.

### Why This Phase Exists

The document pipeline is the prerequisite for all AI features. Without reliable upload, validation, extraction, and metadata tracking, Phase 3 (Gemini analysis) has nothing to analyze. This phase also establishes the auth boundary that protects every later phase.

### Goals

- Users sign in via Google OAuth (Firebase)
- Backend verifies Firebase ID tokens on every request
- Protected routes enforce authentication
- Document upload accepts PDF/DOCX/TXT ≤ 10 MB
- Multi-layer validation: client extension, MIME type, server content inspection
- Secure upload via signed Cloud Storage URLs
- User-scoped storage paths: `users/{userId}/documents/{docId}/original`
- Text extraction (pdf-parse, mammoth, TXT reader)
- Document normalization + metadata extraction
- Chunking for large documents (≤ 3,000 words/chunk)
- Firestore metadata stored (filename, upload date, processing status)
- Processing states tracked (uploading → validating → extracting → ready/failed)
- Unauthorized document access prevented

### Detailed Tasks

#### Authentication (MUST HAVE)

- [ ] Implement Firebase Auth SDK in frontend (Google OAuth button) — not implemented
- [x] Implement backend token verification middleware (verify Firebase ID token on every request) — `backend/src/middleware/auth.ts` calls `getFirebaseAuth().verifyIdToken(token)`; test mock-token support present
- [~] Implement protected route middleware (redirect unauthenticated users to login) — `requireAuth` middleware exists; no client-side redirect/login route implemented
- [ ] Implement session management (httpOnly cookies or secure token storage) — not implemented
- [ ] Implement logout (clear client + server session) — not implemented
- [ ] Implement session expiry handling (redirect to login with message) — not implemented

#### Document Upload (MUST HAVE)

- [ ] Create upload UI component (drag-drop + file picker) — not implemented (frontend has only `page.tsx` and `layout.tsx`)
- [ ] Client-side validation: file type (PDF/DOCX/TXT), size ≤ 10 MB — not implemented
- [x] Backend validation: MIME type, file signature/content inspection, size re-check — `DocumentService.validateDocumentUpload` + `ExtractionService.validateFileSignature`
- [x] Generate signed upload URLs from backend (Cloud Storage, user-scoped path) — `StorageService.generateSignedUploadUrl`; falls back to `http://localhost:3001/api/documents/{documentId}/mock-upload` if GCS unavailable
- [ ] Frontend uploads directly to Cloud Storage via signed URL — not implemented
- [x] Filename sanitization (strip path traversal, generate unique storage names) — `sanitizeFilename` + UUID document ID
- [x] Empty/corrupt file handling (reject with clear error message) — validation + magic-byte rejection
- [ ] Upload progress display to user — not implemented

#### Document Processing (MUST HAVE)

- [x] Text extraction: PDF (pdf-parse), DOCX (mammoth), TXT (direct read) — `ExtractionService.extractText`
- [x] Empty document detection (0 bytes or no extractable text → reject) — throws `Empty or unextractable document content.`
- [x] Document normalization (standardize whitespace, encoding) — `normalizeText`
- [x] Metadata extraction (page count, filename, upload date, file size) — `pageCount`, `wordCount`, `chunksCount` tracked
- [x] Chunking for large documents (≤ 3,000 words per chunk, per architecture.md §16.1) — `chunkText`
- [~] Store document metadata in Firestore (userId, filename, uploadDate, processingStatus, analysisIds[]) — `FirestoreService` implements CRUD; uses in-memory fallback when Firestore credentials unavailable
- [~] Processing status tracking (uploading → validating → extracting → analyzing → complete/failed) — `uploading`, `validating`, `extracting`, `complete`, `failed` implemented; `analyzing` status not yet used (Phase 3)
- [x] Document history foundation (list documents per user, scoped to userId) — `getUserDocuments` with userId filter

#### Security (MUST HAVE)

- [~] User ownership check on every document access — enforced inside `DocumentService` methods; routes do not consistently apply `requireOwnership` middleware
- [x] Unauthorized document access prevented (cross-user access test) — integration test verifies 403
- [x] Malicious/invalid upload handling (HTML/JS disguised as PDF rejected server-side) — magic-byte + extension + content-type validation
- [~] Input sanitization on all user-provided text — filename sanitization implemented; other text fields not yet covered
- [ ] File content not executed or rendered directly — no evidence of rendering path; not independently verified

#### UI States (SHOULD HAVE)

- [ ] Upload progress indicator — not implemented
- [ ] Processing status display — not implemented
- [ ] Success/error states with retry — not implemented
- [ ] Empty state (no documents yet) — not implemented

### Features/Components Built

- Backend token verification middleware
- Protected route enforcement (server-side)
- Upload initiation API (`POST /api/upload`, `POST /api/documents/:id/confirm`)
- Multi-layer file validation (client + server)
- Signed URL upload to Cloud Storage (code path; mock fallback)
- Text extraction pipeline (PDF/DOCX/TXT)
- Document normalization + chunking
- Firestore metadata CRUD (in-memory fallback)
- Processing status tracking
- Document history list (user-scoped)

### AI/GenAI Work

None in this phase. Text extraction only — no Gemini calls yet.

### Security Requirements

- Firebase ID token verified on every API request
- User ownership verified server-side on every document access
- Signed URLs for Cloud Storage (user-scoped, time-limited)
- MIME type + file signature validation server-side
- Filename sanitization
- No execution of uploaded files
- HTML/JS stripped from user inputs
- CORS restricted to frontend origin

### Testing Requirements

- [~] Valid PDF upload → accepted, metadata stored — `pdf-parse` dependency present; integration test verified with TXT only
- [~] Valid DOCX upload → accepted — `mammoth` dependency present; not runtime-tested
- [x] Valid TXT upload → accepted — integration test passes
- [x] Invalid file type (JPG, EXE, HTML) → rejected with specific error — unit test covers extension rejection
- [x] File > 10 MB → rejected with specific error — unit test covers
- [~] Empty file → rejected — unit test covers size 0; corrupt PDF not runtime-tested
- [~] Corrupted PDF → rejected with clear error — `validateFileSignature` covers magic bytes; not runtime-tested with corrupt PDF
- [ ] Unauthenticated upload → redirected to login — no test; frontend auth absent
- [x] Cross-user document access → denied (403) — integration test verifies
- [~] Prompt injection in filename → sanitized, rejected if malicious — `sanitizeFilename` exists; injection-specific test absent

### Google Cloud / Firebase Work

- Firebase Authentication fully integrated (Google OAuth, session management) — backend token verification present; frontend OAuth absent
- Cloud Storage bucket with user-scoped paths operational — code path implemented; not verified with live bucket
- Firestore collections: `users`, `documents` operational — code present; in-memory fallback used locally
- Signed URL generation from backend working — code present; not verified with live GCS

### Deliverables

- [~] Working sign-in/sign-out flow — backend JWT/Firebase token verification exists; frontend sign-in/sign-out absent
- [ ] Upload UI with validation — absent
- [~] Document processing pipeline (extract → normalize → chunk → store metadata) — backend pipeline implemented; in-memory storage fallback
- [~] Firestore metadata for uploaded documents — in-memory fallback only
- [ ] Processing status visible to user — absent

### Definition of Done

- [ ] Authenticated user can upload a valid PDF/DOCX/TXT ≤ 10 MB — pipeline implemented; not end-to-end verified with live auth + storage
- [ ] Unauthenticated user cannot upload (redirected to login) — not implemented
- [ ] Invalid file type rejected with specific error message — unit tested
- [ ] File > 10 MB rejected with specific error message — unit tested
- [ ] Corrupted/empty file rejected with specific error message — partially tested
- [ ] Unauthorized user cannot access another user's document (403 verified) — integration test passes
- [ ] Document text extracted successfully from PDF/DOCX/TXT — extraction service tested with TXT only
- [ ] Firestore metadata stored: userId, filename, uploadDate, processingStatus — in-memory fallback only
- [ ] Cloud Storage path follows `users/{userId}/documents/{docId}/original` — code path implemented
- [ ] Processing status transitions visible to user (uploading → validating → extracting → ready/failed) — not visible to user (no frontend)
- [ ] Upload progress shown to user — not implemented
- [ ] All security rules from rules.md §8–§9 satisfied — not independently verified

### Dependencies

- Phase 1 complete (project scaffold, Firebase/Google Cloud projects configured, env/secrets strategy defined)

### Exit Criteria

- Authenticated upload pipeline works end-to-end
- Document text extraction reliable for PDF/DOCX/TXT
- Firestore metadata stored correctly
- Security boundaries verified (auth + ownership)

---

## Phase 3 — GenAI Legal Analysis & Document Understanding

### Phase Objective

Implement real Gemini/Vertex AI integration: document analysis produces structured JSON output including summary, key clauses, obligations, important dates, risk/attention areas, and actionable next steps — all dynamically generated per document, grounded in the uploaded text, with source attribution and AI disclaimers.

### Why This Phase Exists

This is the core AI phase that delivers the product's primary value. The document pipeline from Phase 2 provides clean, validated text. Now Gemini must analyze that text and produce structured, safe, grounded output. AI safety rules (no invented clauses, no legal advice, educational language only) are enforced here.

### Goals

- Gemini/Vertex AI backend integration working
- AI orchestration layer in backend (not frontend)
- Document analysis prompt producing structured JSON
- System prompt defines AI role (educational only, not a lawyer)
- Grounding: AI answers only from provided document text
- Source/page/section attribution on all findings
- JSON schema validation on AI responses
- Malformed AI response handling with graceful fallback
- Risk detection with educational language ("may deserve attention")
- AI disclaimer on every analysis output
- Uncertainty handling ("I'm not confident...")
- "Information not present in document" behavior
- Prompt injection defense (document treated as untrusted data)

### Detailed Tasks

#### Gemini Integration (MUST HAVE)

- [ ] Create `aiService.ts` in backend: Gemini API calls via Vertex AI — not implemented
- [ ] System prompt: educational purpose only, not a lawyer, refuse definitive legal advice — not implemented
- [ ] Document analysis prompt: summary, key clauses, obligations, dates, risks, next steps — not implemented
- [ ] Structured JSON output prompt with schema (per architecture.md §6.2, §7.1) — not implemented
- [ ] Backend-only AI calls (API keys never exposed to frontend) — not implemented

#### Document Analysis (MUST HAVE)

- [ ] Full document text sent as context to Gemini (or relevant chunks for large docs) — not implemented
- [ ] AI generates: executive summary, key clauses with descriptions, obligations per party, important dates, risk flags with explanations — not implemented
- [ ] Risk categories: liability, termination, indemnity, auto-renewal, limitation of liability, confidentiality, IP assignment, jurisdiction, payment obligations, penalties — not implemented
- [ ] Each risk includes: clause description, why it may deserve attention, suggested clarification question — not implemented
- [ ] Educational language only: "may deserve attention", "consider reviewing", "consider asking a qualified legal professional" — not implemented
- [ ] Never label clauses "illegal", "invalid", "guaranteed risk" — not implemented

#### Output Validation (MUST HAVE)

- [ ] JSON schema validation on AI response (required fields, types) — not implemented
- [ ] Malformed JSON handling: log error, return user-friendly message, allow retry — not implemented
- [ ] Missing fields filled with defaults, not crashed — not implemented
- [ ] AI response validation BEFORE storing to Firestore and BEFORE sending to frontend — not implemented

#### AI Safety (MUST HAVE)

- [ ] Hallucination mitigation: system prompt instructs "do not invent information" — not implemented
- [ ] Uncertainty handling: AI states "I'm not confident about this detail" when uncertain — not implemented
- [ ] "Information not present" behavior: explicit statement, not fabricated answer — not implemented
- [ ] Prompt injection defense: uploaded document treated as untrusted data; system instructions have higher priority — not implemented
- [ ] User question treated as untrusted input; sanitized before sending to Gemini — not implemented
- [ ] AI disclaimer visible on every analysis output — not implemented

#### Source Attribution (MUST HAVE)

- [ ] Every AI claim that references document content shows source (section/page) — not implemented
- [ ] Source format: `Section X.X · Page Y` — not implemented
- [ ] If source unavailable: omit citation, never fabricate — not implemented

#### Processing Flow (SHOULD HAVE)

- [ ] AI analysis runs asynchronously (not blocking upload) — not implemented
- [ ] Processing status updated: analyzing → complete/failed — not implemented
- [ ] AI latency logged for observability — not implemented
- [ ] Retry logic for transient AI failures (max 2 retries, exponential backoff) — not implemented

### Features/Components Built

No Phase 3 components implemented.

### AI/GenAI Work

None implemented. `/api/analyze` remains a `501 Not Implemented` stub in `backend/src/routes/api.ts`.

### Security Requirements

- AI API keys stored in environment variables/Secret Manager (never frontend) — `GEMINI_API_KEY` optional in env schema only
- Backend-only AI calls — not implemented
- Document text treated as untrusted (prompt injection defense) — not implemented
- User questions sanitized before AI call — not implemented
- System instructions have higher priority than document content — not implemented
- AI outputs validated before rendering (XSS prevention) — not implemented
- No full document content in logs — not independently verified

### Testing Requirements

All Phase 3 testing requirements remain [ ] (not implemented).

### Google Cloud / Firebase Work

- Vertex AI / Gemini API configured and integrated — not implemented
- Cloud Logging captures AI latency and errors — not implemented
- Firestore stores analysis results (analysis collection) — not implemented

### Deliverables

None implemented.

### Definition of Done

All Phase 3 Definition of Done items remain [ ] (not implemented).

### Dependencies

- Phase 2 complete (document pipeline stable: upload → extract → chunk → store metadata)

### Exit Criteria

- Gemini analysis produces valid structured JSON for uploaded documents
- AI safety rules enforced (no invented clauses, no legal advice, educational language)
- Source attribution present on all findings
- Malformed AI output handled gracefully

---

## Phase 4 — Document Q&A, Comparison & Advanced Legal Assistance

### Phase Objective

Build interactive AI capabilities on top of the stable document pipeline: users can ask questions about uploaded documents and receive grounded, source-attributed answers; upload/select two documents for comparison; receive actionable next-step guidance; and access "Explain This Clause" as an optional high-value feature.

### Why This Phase Exists

Phase 3 delivers one-way analysis (document → AI → results). Phase 4 makes the system interactive: users ask questions, compare documents, and get actionable guidance. These features complete the core MVP feature set defined in PRD.md §5.1.

### Goals

- Document-grounded Q&A with source citations
- Explicit "not found" handling for out-of-scope questions
- Document comparison (added/removed/modified clauses, changed obligations/dates/amounts)
- Actionable next-step guidance (checklist, lawyer questions, documents needed)
- "Explain This Clause" optional feature (if timeline permits, must not destabilize core MVP)
- Document history, search, analysis history, comparison history
- Dashboard integration with all features
- Loading states, empty states, error states on every interactive feature

### Detailed Tasks

#### Document Q&A (MUST HAVE)

- [ ] Q&A input component on analysis page — not implemented
- [ ] Retrieve relevant document context (keyword matching + proximity, top 3-5 chunks) — not implemented
- [ ] Send question + relevant chunks to Gemini with grounding instructions — not implemented
- [ ] Display answer with source references (clickable, opens document at section/page) — not implemented
- [ ] Confidence indicator: textual only ("highly confident", "moderately confident", "limited information") — not implemented
- [ ] "Not found" response when information absent from document — not implemented
- [ ] Prompt injection resistance (user question sanitized, system instructions enforced) — not implemented
- [ ] Multiple questions supported within a session (conversation context where appropriate) — not implemented
- [ ] Q&A history stored in Firestore (qa_sessions collection) — not implemented

#### Document Comparison (MUST HAVE)

- [ ] Comparison selector UI (choose 2 documents from user's history) — not implemented
- [ ] Verify both documents belong to user and are analyzed — not implemented
- [ ] Send both documents to Gemini for comparison — not implemented
- [ ] Identify: added clauses, removed clauses, modified clauses, changed obligations/dates/amounts/conditions — not implemented
- [ ] Incompatible document type warning (lease vs. privacy policy) — not implemented
- [ ] Structured comparison display with change types (+, –, ▼) — not implemented
- [ ] Source references for each difference where available — not implemented
- [ ] Comparison results stored in Firestore (comparisons collection) — not implemented
- [ ] Recommended next steps based on comparison results — not implemented

#### Actionable Guidance (MUST HAVE)

- [ ] Next Steps section on analysis page — not implemented
- [ ] Checklist of action items (concrete, document-specific) — not implemented
- [ ] Questions to ask a lawyer (open-ended, ≥ 2 per document) — not implemented
- [ ] Documents/information user may need — not implemented
- [ ] Things to clarify with the other party — not implemented
- [ ] "Consider professional legal help" section for high-risk situations — not implemented

#### Optional Feature: Explain This Clause (SHOULD HAVE — NICE TO HAVE if timeline tight)

- [ ] User selects a clause in analysis results — not implemented
- [ ] "Explain This Clause" button triggers Gemini explanation — not implemented
- [ ] Display: what clause says, plain-language explanation, why it may matter, what to clarify, source reference — not implemented
- [ ] Marked as AI-generated with disclaimer — not implemented
- [ ] Must not destabilize core MVP if implemented — not applicable

#### History & Search (SHOULD HAVE)

- [ ] Document history list (filename, upload date, status) — not implemented
- [ ] Search history by filename keyword — not implemented
- [ ] Analysis history re-access (re-run analysis on old documents) — not implemented
- [ ] Comparison history where appropriate — not implemented
- [ ] Delete document with confirmation dialog (permanent deletion, no undo) — not implemented

#### Dashboard Integration (SHOULD HAVE)

- [ ] Dashboard shows recent documents with status badges — not implemented
- [ ] Quick actions: Upload, Compare — not implemented
- [ ] Recent activity feed — not implemented
- [ ] Empty states for all lists — not implemented
- [ ] Loading/skeleton states on all async operations — not implemented

### Features/Components Built

None implemented.

### AI/GenAI Work

None implemented.

### Security Requirements

All Phase 4 security requirements remain [ ] (not implemented).

### Testing Requirements

All Phase 4 testing requirements remain [ ] (not implemented).

### Google Cloud / Firebase Work

- Firestore collections: `qa_sessions`, `comparisons` operational — not implemented
- Cloud Logging captures Q&A and comparison latency/errors — not implemented
- Cloud Storage retrieves documents for Q&A context and comparison — not implemented

### Deliverables

None implemented.

### Definition of Done

All Phase 4 Definition of Done items remain [ ] (not implemented).

### Dependencies

- Phase 3 complete (Gemini analysis stable, structured JSON output validated)

### Exit Criteria

- Q&A returns grounded answers with source citations
- Comparison identifies meaningful differences between documents
- Next Steps checklist generated per document
- All core MVP features working end-to-end

---

## Phase 5 — Product Polish, Security Hardening & Comprehensive Testing

### Phase Objective

Make the system reliable, safe, accessible, and hackathon-ready. This phase performs COMPLETE final validation: security hardening across all layers, AI safety testing, functional testing of all flows, edge-case testing, accessibility validation, and performance benchmarking.

### Why This Phase Exists

Earlier phases build features. Phase 5 validates everything together under real conditions. Security is not "tested only here" — it was considered throughout, but Phase 5 is where formal hardening and comprehensive testing happen. Testing started in earlier phases (unit/integration per phase); Phase 5 completes the full suite.

### Goals

- Security hardening: auth review, authorization review, cross-user access testing, Firebase rules, input/output validation, XSS, prompt injection, rate limiting, abuse protection
- AI safety testing: hallucination resistance, grounding, missing information, misleading questions, malformed output
- Functional testing: login, logout, upload, processing, analysis, simplification, Q&A, comparison, history, delete, errors, retry flows
- Edge-case testing: empty/corrupt/huge documents, unsupported files, AI timeout, storage failure, network failure
- Accessibility validation: WCAG 2.1 AA, keyboard navigation, focus states, semantic HTML, screen reader compatibility
- Performance validation: upload, processing, AI latency, Firestore reads/writes, frontend performance
- UX polish: loading states, skeletons, empty states, error messages, retry buttons, progress indicators, responsive layout, mobile usability

### Detailed Tasks

#### Security Hardening (MUST HAVE)

- [ ] Authentication review: verify Firebase ID token validation on every endpoint — not verified
- [ ] Authorization review: verify user ownership on every document access — not verified
- [ ] Cross-user access testing: attempt to access another user's document → verify denied — integration test covers backend 403 only
- [ ] Firebase security rules: finalize and test (request.auth.uid == userId) — no rules file found
- [ ] Firestore security rules: finalize and test — no rules file found
- [ ] Cloud Storage access controls: signed URLs, user-scoped, IAM policies — not verified
- [ ] API authorization: every endpoint requires auth + ownership check — not fully verified
- [ ] Input validation: file type, size, content checks at client + server — backend only; client missing
- [ ] Output validation: sanitize AI outputs before rendering (XSS prevention) — not applicable (no AI output yet)
- [ ] XSS protection: HTML tags stripped from user inputs, JS events neutralized — not verified
- [ ] Prompt injection testing: submit injection prompts → verify neutralized — not tested
- [ ] Malicious document testing: HTML/JS disguised as PDF → rejected server-side — not tested
- [ ] Secret exposure check: grep for API keys, tokens, passwords in source — `npm run secret-scan` present; source scan returned no repository secrets
- [ ] Environment variable review: no secrets in frontend, .env in .gitignore — `.env` not tracked; `.env.example` has placeholders only
- [ ] Dependency security audit: `npm audit`, fix vulnerabilities — not executed in this audit
- [ ] Rate limiting: per-user-per-hour limits on AI endpoints, upload endpoints — global rate limit present; per-endpoint limits not configured
- [ ] Abuse protection: exponential backoff for exceeded limits — not implemented
- [ ] Sensitive logging review: verify no document content, tokens, API keys in logs — not independently verified

#### AI Safety Testing (MUST HAVE)

All Phase 5 AI safety testing requirements remain [ ] (not implemented; Phase 3 not started).

#### Functional Testing (MUST HAVE)

All Phase 5 functional testing requirements remain [ ] (not implemented; Phase 3–4 not started).

#### Edge-Case Testing (MUST HAVE)

All Phase 5 edge-case testing requirements remain [ ] (not implemented).

#### Accessibility Validation (MUST HAVE)

All Phase 5 accessibility validation requirements remain [ ] (not implemented).

#### Performance Validation (SHOULD HAVE)

All Phase 5 performance validation requirements remain [ ] (not implemented).

#### UX Polish (SHOULD HAVE)

All Phase 5 UX polish requirements remain [ ] (not implemented).

### Features/Components Built

No new features — this phase validates and hardens all existing features.

### AI/GenAI Work

None implemented.

### Security Requirements

All Phase 5 security requirements remain [ ] (not implemented).

### Testing Requirements

- [~] Unit tests exist for document validation, extraction, auth middleware — `tests/unit/` present; do not execute due to import-path issues
- [~] Integration test exists for document pipeline — `tests/integration/documentPipeline.test.ts` present; does not execute due to import-path issues
- [ ] Test pass rate ≥ 80% — tests do not currently run

### Google Cloud / Firebase Work

- Cloud Logging verified capturing structured logs — not verified
- Cloud Monitoring verified capturing metrics — not verified
- Firestore security rules finalized and tested — not implemented
- Cloud Storage IAM policies verified — not implemented
- Secret Manager production secrets configured — not implemented

### Deliverables

None implemented.

### Definition of Done

All Phase 5 Definition of Done items remain [ ] (not implemented).

### Dependencies

- Phase 4 complete (all core features implemented)

### Exit Criteria

- Security hardening verified
- All tests passing ≥ 80%
- Accessibility WCAG 2.1 AA verified
- Performance targets met
- MVP core feature list fully functional

---

## Phase 6 — Deployment, Observability & Hackathon Demo Readiness

### Phase Objective

Deploy to production: frontend hosted, Cloud Run backend deployed, Firebase/Firestore/Storage configured for production, observability enabled, hackathon demo prepared with live demo script, backup plan, and evaluation criteria verification.

### Why This Phase Exists

A working local application is not a hackathon submission. Phase 6 produces a production-deployed, observable, demo-ready system that judges can access and evaluate against all criteria.

### Goals

- Production build and deployment (frontend + Cloud Run backend)
- Firebase production configuration (auth, Firestore rules, Storage rules)
- Gemini/Vertex AI production configuration
- Environment variables and Secret Manager configured
- Observability: Cloud Logging, Cloud Monitoring, health endpoint, structured logs
- Reliability: retries, graceful AI failure, storage failure handling, user-friendly fallback
- Hackathon demo: 4-minute live demo flow with script, backup plan, demo documents
- Evaluation criteria verification: code quality, security, efficiency, testing, accessibility, problem statement alignment, Google Services usage, GenAI usage, real dynamic AI behavior

### Detailed Tasks

#### Deployment (MUST HAVE)

All Phase 6 deployment requirements remain [ ] (not implemented).

#### Observability (MUST HAVE)

All Phase 6 observability requirements remain [ ] (not implemented).

#### Reliability (MUST HAVE)

All Phase 6 reliability requirements remain [ ] (not implemented).

#### Hackathon Demo (MUST HAVE)

All Phase 6 hackathon demo requirements remain [ ] (not implemented).

#### Evaluation Criteria Verification (MUST HAVE)

All Phase 6 evaluation criteria requirements remain [ ] (not implemented).

#### Production Hardening (SHOULD HAVE)

All Phase 6 production hardening requirements remain [ ] (not implemented).

### Features/Components Built

No new features — this phase deploys and validates what exists.

### AI/GenAI Work

None implemented.

### Security Requirements

All Phase 6 security requirements remain [ ] (not implemented).

### Testing Requirements

All Phase 6 testing requirements remain [ ] (not implemented).

### Google Cloud / Firebase Work

All Phase 6 Google Cloud / Firebase work requirements remain [ ] (not implemented).

### Deliverables

None implemented.

### Definition of Done

All Phase 6 Definition of Done items remain [ ] (not implemented).

### Dependencies

- Phase 5 complete (all features implemented, tested, hardened)

### Exit Criteria

- Production deployment successful and accessible
- Demo flow completed within 4 minutes on production URL
- All evaluation criteria verified passing
- Backup plan tested and ready

---

## Cross-Phase Engineering Rules

These rules apply to ALL phases, not just one:

### Security (applies to every phase)

- API keys never in frontend code — backend only
- Firebase ID tokens verified on every API request
- User ownership verified server-side on every document access
- Input validated at every layer (client + server)
- Output sanitized before rendering (XSS prevention)
- Secrets in `.env` (dev) or Secret Manager (prod), never in Git
- CORS restricted to frontend origin
- Rate limiting on expensive endpoints

### AI Safety (applies to every phase with AI)

- System prompt has highest priority (prompt injection defense)
- AI never invents clauses, dates, obligations, or facts
- AI never provides definitive legal advice
- Educational language only ("may deserve attention", "consider reviewing")
- Disclaimer on every AI output
- Uncertainty expressed textually, never numerically
- "Not found" response for missing information

### Legal Safety (applies to every phase)

- Never label clauses "illegal" or "invalid" without authoritative basis
- Never claim AI output is verified, accurate, or authoritative
- Always recommend consulting a qualified legal professional for high-risk matters
- High-risk document types trigger enhanced disclaimer

### Testing (starts Phase 2, continues through Phase 5)

- Unit tests for auth, upload validation, AI response parsing
- Integration tests for upload → extraction → analysis flow
- AI workflow tests for grounding, dynamic output, risk detection
- Security tests for API key exposure, prompt injection, authorization
- Edge-case tests for all error scenarios
- Accessibility tests for keyboard nav, screen reader, contrast
- Performance tests for dashboard load, analysis time, Q&A time

### Accessibility (applies to every phase with UI)

- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`)
- Keyboard navigation (all interactive elements reachable via Tab)
- Focus states visible (2px `--color-focus` outline)
- Labels on all inputs
- ARIA labels on dynamic content regions
- Color not used alone (icon + text + color)
- Screen reader support (ARIA, live regions)
- Contrast ≥ 4.5:1 normal, ≥ 3:1 large

### Performance (applies to every phase)

- No unnecessary AI calls (cache valid analysis)
- Document size ≤ 10 MB, ≤ 50 pages
- Chunk large documents (≤ 3,000 words/chunk)
- Only relevant context sent to AI (not entire document for Q&A)
- Firestore queries indexed and paginated
- Frontend rendering optimized (no unnecessary re-renders)

### Google Services (every service has real technical responsibility)

- Gemini = the brain (GenAI)
- Firebase Auth = the gatekeeper (security)
- Cloud Storage = the vault (file persistence)
- Firestore = the memory (structured data)
- Cloud Run = the engine (processing orchestration)
- Cloud Logging = the nervous system (observability)

### Logging Rules (apply to every phase)

- Log: request ID, timestamp, endpoint, processing status, response time, error category, service failure, AI latency, file processing status, userId (audit trail)
- Never log: full legal documents, full extracted text, auth tokens, API keys, passwords, sensitive user data, full prompts containing private documents, full AI responses containing private documents

---

## MVP Priority Matrix

If time is limited, ship this minimum viable product in order:

| Priority     | Feature                                                       | Phase          | MVP Protection                          |
| ------------ | ------------------------------------------------------------- | -------------- | --------------------------------------- |
| MUST         | Authentication (Google OAuth)                                 | 2              | Core — no upload or AI without auth     |
| MUST         | Document Upload (PDF/DOCX/TXT ≤ 10 MB)                        | 2              | Core — input pipeline                   |
| MUST         | Document Processing (text extraction, chunking)               | 2              | Core — prepares text for AI             |
| MUST         | Gemini Analysis (summary, clauses, obligations, dates, risks) | 3              | Core — primary value                    |
| MUST         | Risk Detection with educational language                      | 3              | Core — differentiates from generic AI   |
| MUST         | Document Q&A (grounded, source-cited)                         | 4              | Core — interactive feature              |
| MUST         | Document Comparison (added/removed/modified)                  | 4              | Core — two-document feature             |
| MUST         | Next Steps (checklist, lawyer questions)                      | 4              | Core — actionable output                |
| MUST         | AI Disclaimer on all outputs                                  | 3              | Core — legal safety                     |
| MUST         | Security (auth, authorization, input validation)              | 1–5            | Core — no demo without it               |
| MUST         | Deployment (Cloud Run + frontend)                             | 6              | Core — judges must access it            |
| SHOULD       | Simplification (plain-language version)                       | 3              | Important but not MVP-blocking          |
| SHOULD       | Document history + search                                     | 4              | Useful but not MVP-blocking             |
| SHOULD       | "Explain This Clause"                                         | 4              | Nice-to-have optional                   |
| SHOULD       | Accessibility polish                                          | 5              | Important for scoring, not MVP-blocking |
| SHOULD       | Performance optimization                                      | 5              | Important for scoring, not MVP-blocking |
| NICE TO HAVE | Vector search (Vertex AI Vector Search)                       | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Multilingual support                                          | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Lawyer matching/scheduling                                    | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Advanced analytics                                            | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Collaboration features                                        | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Microservices architecture                                    | Post-hackathon | Over-engineering for MVP                |

---

## Final Definition of Done

The project is hackathon-ready when ALL of the following are met:

### Code Quality

- [ ] Clean, modular code (frontend/backend/AI separated)
- [ ] Consistent naming conventions
- [ ] No hardcoded AI responses — all AI output dynamically generated
- [ ] Code documented with comments for complex logic
- [ ] Error handling for all known edge cases

### Security

- [ ] No API keys exposed in frontend or browser DevTools
- [ ] All secrets in `.env` (dev) or Secret Manager (prod), excluded by `.gitignore`
- [ ] Firebase ID tokens validated on every API request
- [ ] File uploads validated on client + server
- [ ] Input sanitization on all user-provided text
- [ ] Prompt injection handled gracefully
- [ ] HTTPS enforced, CORS configured

### Efficiency

- [ ] Dashboard loads ≤ 2 seconds
- [ ] Document analysis ≤ 30 seconds (≤ 50 pages)
- [ ] Q&A ≤ 10 seconds
- [ ] Comparison ≤ 45 seconds
- [ ] Resource usage optimized (no unnecessary API calls)

### Testing

- [ ] Unit tests for auth, upload validation, AI response parsing
- [ ] Integration tests for full document processing flow
- [ ] AI workflow tests verifying dynamic output and grounding
- [ ] Security tests (API key exposure, prompt injection, authorization)
- [ ] Edge-case tests for all error scenarios
- [ ] Accessibility tests (keyboard, screen-reader, contrast)
- [ ] Test pass rate ≥ 80%

### Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation for all interactive elements
- [ ] Screen-reader compatible
- [ ] Sufficient color contrast
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Clear, descriptive error messages

### Problem Statement Alignment

- [ ] Product addresses "AI for Legal Assistance & Access"
- [ ] AI provides information and assistance, NOT replacement for legal advice
- [ ] All AI outputs grounded in uploaded documents
- [ ] System does not invent facts or clauses
- [ ] System encourages professional legal consultation for high-risk matters
- [ ] Disclaimer clearly visible on all AI outputs

### Google Services Usage

- [ ] Gemini / Vertex AI used for GenAI features
- [ ] Firebase Auth used for authentication
- [ ] Cloud Storage used for document storage
- [ ] Firestore used for metadata/history
- [ ] Cloud Run used for backend API
- [ ] Cloud Logging used for observability
- [ ] Each service serves clear, necessary function (not decorative)

### Demo Readiness

- [ ] Full demo flow fits within 4 minutes
- [ ] Live user input/data demonstrated
- [ ] Real working functionality shown (not mockups)
- [ ] Clear GenAI integration visible
- [ ] Dynamic AI responses (not hardcoded)
- [ ] At least one success case demonstrated
- [ ] At least one error/edge case demonstrated

---

## Release Readiness Checklist

Before submitting to hackathon, verify:

### Pre-Submission

- [ ] Production URL accessible and stable
- [ ] Demo dry-run completed (timed, fits 4 minutes)
- [ ] Demo documents prepared and tested
- [ ] Demo user account created with clean database state
- [ ] Backup demo plan tested (upload failure → pre-analyzed results; AI failure → screenshots; network failure → local copies)
- [ ] No API keys in frontend code or browser DevTools
- [ ] No secrets in Git history (rotate if leaked)
- [x] `.env` in `.gitignore`, `.env.example` has variable names only
- [ ] Firebase Auth Google OAuth working in production
- [ ] Firestore production rules enforced (`request.auth.uid == userId`)
- [ ] Cloud Storage production IAM verified (user-scoped access)
- [ ] Cloud Run backend deployed with Secret Manager secrets
- [ ] Vertex AI API key from Secret Manager, backend calls only
- [ ] Cloud Logging capturing structured logs (no sensitive data)
- [ ] Health endpoint `/api/health` returning 200
- [ ] All 6 Google Services genuinely operational in production
- [ ] AI disclaimer visible on all AI outputs
- [ ] Source attribution present on all AI-cited content
- [ ] Dynamic AI output verified (different documents → different results)
- [ ] Prompt injection neutralized (tested and verified)
- [ ] "Not found" behavior works for out-of-scope questions
- [ ] Accessibility: keyboard nav, screen reader, contrast, responsive verified
- [ ] All edge cases handled gracefully (empty doc, corrupt doc, AI timeout, network failure, unauthorized access)
- [ ] README synchronized with architecture
- [ ] Demo script written and rehearsed
- [ ] Judges can access production URL without authentication issues
- [ ] Demo video recorded (if required) or backup plan ready

### Hackathon Evaluation Criteria

- [ ] Code Quality: clean, modular, maintainable
- [ ] Security: no leaked secrets, strong authorization, secure document handling
- [ ] Efficiency: controlled AI calls, optimized processing, sensible resource usage
- [ ] Testing: automated + manual validation, ≥ 80% pass rate
- [ ] Accessibility: WCAG-aware UI and accessible AI results
- [ ] Problem Statement Alignment: "AI for Legal Assistance & Access" addressed
- [ ] Google Services Usage: all 6 services genuinely integrated and working
- [ ] GenAI usage: real dynamic AI behavior, not hardcoded
- [ ] Real dynamic AI output verified on demo documents

---

_LegalEase-AI development phases — PromptWars Virtual hackathon._

_Phases based on PRD.md, architecture.md, rules.md, and design.md._

_Every phase protects the MVP. No optional feature blocks the core product._

_LegalEase-AI does not provide legal advice. These phases are an engineering plan, not legal advice._

_Audit update: statuses verified against actual codebase on 2026-09-19. Figma/screenshots treated as design artifacts only; production implementation verified from source code and test execution results._
