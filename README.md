# LegalEase-AI

GenAI-powered legal assistant for simplifying, analyzing, comparing, and understanding legal documents.

## Challenge Vertical

Legal technology / document intelligence.

## Problem

Legal documents are dense, technical, and time-consuming to review. Users need fast, plain-language explanations, risk detection, and document comparison without giving up privacy or control.

## Solution Approach

LegalEase-AI uses a secure, backend-first architecture:

- **Frontend:** Next.js 15 + React 19 + TypeScript, strict mode — minimal scaffold only in Phase 1.
- **Backend:** Express.js, Node.js, TypeScript, compiled to CommonJS.
- **Security:** Helmet, CORS, rate limiting, JWT auth middleware, environment validation, centralized error handling.
- **AI:** Gemini / Vertex AI access will be backend-only (Phase 3), never exposed to the browser.
- **Storage:** Cloud Storage for documents, Firestore for metadata — integrated in Phase 2.
- **Logging:** Winston-based structured logging.

## Phase Roadmap

### ✅ Phase 1 — Foundation (code-verified)

Backend Express scaffold with full security hardening:

- **Environment validation** — Zod schema; `PORT`, `NODE_ENV`, `FRONTEND_URL`, `JWT_SECRET` required at startup. Firebase/Gemini keys are optional and validated only when the integrating feature is active.
- **Security middleware** — Helmet with strict Content-Security-Policy, CORS locked to `FRONTEND_URL`, `express-rate-limit` (100 req / 15 min).
- **JWT auth middleware** — `authenticateToken`, `requireAuth`, `requireOwnership` guards; ready for Firebase token verification in Phase 2.
- **Input validation** — `express-validator` middleware wired to routes.
- **Error handling** — Centralized `errorHandler` (Zod-aware, strips stack in production) and `notFoundHandler`.
- **Health endpoint** — `GET /api/health` returns `{ status, timestamp, uptime }`.
- **Stub routes** — `/api/upload`, `/api/documents`, `/api/documents/:id`, `/api/analyze` all protected by `authenticateToken`, returning `501 Not Implemented` until Phase 2.
- **Document service scaffold** — `DocumentService` with `validateDocumentUpload`, `createDocumentMetadata`, `updateDocumentStatus`; Firestore persistence added in Phase 2.
- **Shared types** — `DocumentMetadata`, `ProcessingStatus`, `AnalysisResult`, `AnalysisType`, `AnalysisStatus`, `ApiResponse`, `SecurityValidationResult`, `AIGroundingResult` — all defined and exported.
- **Frontend scaffold** — Next.js 15 + React 19 minimal shell (`layout.tsx`, `page.tsx`). No UI work in Phase 1.
- **Toolchain** — ESLint 9 (TypeScript-aware), Prettier, root-level `typecheck` / `lint` / `format` / `test` scripts wired across both workspaces.
- **Winston logging** — Structured JSON logs; console transport in non-production.

### ✅ Phase 1 — Foundation (code-verified)

Backend Express scaffold with full security hardening, type definitions, and initial environment configuration.

### ✅ Phase 2 — Authentication & Document Pipeline (code-verified)

Full end-to-end document ingestion pipeline and frontend user interface:

- **Firebase Authentication** — Backend token verification via Firebase Admin SDK with ownership verification (`req.user.uid === document.userId`); Frontend `useAuth` context supporting Google OAuth popups and session token auto-refresh.
- **User Profile Management** — `POST /api/users/me` endpoint to upsert user profiles into Firestore on sign-in.
- **Signed-URL Document Upload** — Direct-to-GCS upload flow via backend signed URLs (`POST /api/documents/upload`), enforcing 10 MB file limits, content type validation, and filename sanitization.
- **Text Extraction & Normalization** — Extraction service supporting PDF (pdf-parse), DOCX (mammoth), and TXT files with magic-byte header verification, text cleaning, and <=3,000 word chunking.
- **Firestore Metadata Storage** — Full document lifecycle tracking (`uploading` → `validating` → `extracting` → `complete` / `failed`) with document listing and server-side ownership filters.
- **Frontend UI (Figma Aligned)** — Full pixel-perfect design system alignment with exported Figma Make UI/UX specifications:
  - SVG stroke icon library (`Icons.tsx`) matching Figma visual tokens.
  - Landing page (`/`) with branding, hero CTAs, capability grid, and Google Sign-In trigger.
  - Login page (`/login`) with Google OAuth authentication card.
  - Responsive Sidebar navigation layout with active indicators and user drawer.
  - Dashboard (`/dashboard`) with quick-action tiles, search bar, recent document list, and activity feed.
  - Upload page (`/upload`) featuring dashed dropzone, multi-stage processing indicators, and sample document loader.
  - Documents list (`/documents`) with category filter pills (`all`, `analyzed`, `processing`, `uploaded`).
  - Compare page (`/compare`), History (`/history`), and Settings (`/settings`) matching Figma screens.
- **Local Environment Setup** — Clean `frontend/.env.local` configuration reading client-side Firebase environment variables (`NEXT_PUBLIC_FIREBASE_*`) with non-exposing validation (`validateFirebaseConfig`).

### ✅ Phase 3 — GenAI Legal Analysis & AI Orchestration (code-verified)

Grounded GenAI document analysis pipeline and interactive frontend report interface:

- **Google Cloud Vertex AI Integration** — Server-side AI orchestration layer (`backend/src/services/aiService.ts`) using Google Cloud Vertex AI SDK (`@google-cloud/vertexai`) exclusively — no Gemini Developer API fallback — with structured JSON schema output, and retry logic with exponential backoff.
- **AI Safety & Legal Fencing** — System prompts defining non-advisory educational role ("not a lawyer"), prompt fencing with `<document_content>` isolation tags, and prompt-injection defense against malicious document payloads.
- **Output Validation & Grounding** — Strict Zod schema validation on AI responses before saving to Firestore or returning to client; mandatory educational legal disclaimer banner attached to all results; uncertainty and `unpresentInformation` tracking.
- **Fallback Engine** — Rule-based grounded extraction fallback for offline/unconfigured local development and testing without failing builds.
- **Firestore Persistence & API Endpoints** — `analyses` collection integration with `POST /api/documents/:id/analyze` and `GET /api/documents/:id/analysis` endpoints with server-side document ownership enforcement.
- **Frontend Analysis View (`/documents/[id]`)** — Figma-aligned analysis report interface featuring tabbed navigation (Executive Summary, Key Clauses & Risks, Obligations, Important Dates, Actionable Guidance), risk level badges (High/Medium/Low), and an interactive Grounding Citation Drawer.
- **Verified Quality Gates** — 30/30 unit and integration tests passing, 0 TypeScript errors, 100% Prettier formatting compliance, secret scan clean, and production builds succeeding.

### ✅ Phase 4 — Document Q&A, Comparison & Advanced Legal Assistance (code-verified)

Interactive GenAI legal assistant capabilities and document comparison tools:

- **Grounded Document Q&A (`POST /api/documents/:id/qa`, `GET /api/documents/:id/qa`)** — Context-aware, grounded document Q&A using keyword scoring (`selectRelevantChunks`), prompt fencing (`<document_content>`), textual confidence ratings (`highly confident`, `moderately confident`, `limited information`), explicit `isNotPresent` absence banners, and source citation references.
- **Document Comparison Engine (`POST /api/documents/compare`, `GET /api/documents/comparisons`)** — Version-to-version document comparison with strict server-side dual-document ownership enforcement (`documentService.compareDocuments`), structural diff parsing (Added `+`, Removed `-`, Modified `▼`), document type compatibility warnings (`typeCompatibilityWarning`), and Firestore persistence.
- **Plain-English "Explain This Clause" (`POST /api/documents/:id/explain-clause`)** — Interactive clause simplification producing plain-language summaries, "Why It Matters" insights, and recommended party clarifications rendered inside a slide-over drawer modal.
- **Actionable Guidance & Search** — Automated checklist generation, lawyer consultation questions, counterparty clarifications, and document history search (`/documents`, `/history`, `/dashboard`).
- **Verified Quality Gates** — Unit test suite (`backend/src/services/phase4.test.ts`) 5/5 tests passing, zero TypeScript compilation errors, zero linter warnings, 100% Prettier format compliance, 0 hardcoded secrets found, and Next.js production build passing cleanly.

### Phase 5 — Product Polish, Security Hardening & Comprehensive Testing

- System reliability, edge-case testing, accessibility validation, and hackathon readiness — coming in Phase 5.

---

## Project Structure

```
LegalEase-AI/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts              # Zod environment validation
│   │   ├── handlers/
│   │   │   ├── auth.ts             # Dev-mode JWT login stub
│   │   │   └── documents.ts        # Document CRUD handlers (stub)
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT authenticateToken / requireAuth / requireOwnership
│   │   │   ├── errorHandler.ts     # Centralized error + not-found handlers
│   │   │   ├── rateLimit.ts        # express-rate-limit (100 req/15 min)
│   │   │   └── validation.ts       # express-validator result handler
│   │   ├── routes/
│   │   │   ├── api.ts              # /api/* stub routes (501 until Phase 2); /api/analyze 501 stub (Phase 3)
│   │   │   └── health.ts           # GET /api/health
│   │   ├── services/
│   │   │   └── documentService.ts  # DocumentService scaffold (with storage fallback)
│   │   ├── shared/
│   │   │   └── types/
│   │   │       └── document.ts     # Zod schemas + shared document interfaces
│   │   ├── types/
│   │   │   └── index.ts            # Core domain types and enums
│   │   ├── utils/
│   │   │   └── logging.ts          # Winston logger
│   │   └── index.ts                # Express app entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── page.tsx            # Landing page placeholder
│   │   ├── components/             # (empty — Phase 1 scaffold)
│   │   ├── lib/                    # (empty — Phase 1 scaffold)
│   │   ├── styles/                 # (empty — Phase 1 scaffold)
│   │   └── utils/                  # (empty — Phase 1 scaffold)
│   ├── next.config.mjs
│   ├── package.json
│   └── tsconfig.json
├── tests/
│   ├── unit/                       # Unit tests (16 tests, all passing)
│   ├── integration/                # Integration tests (1 pipeline test, passing)
│   └── e2e/                        # End-to-end tests (Phase 4+)
├── shared/
│   └── types/
│       └── index.ts                # Cross-package shared types (ProcessingStatus, AnalysisType, ApiResponse, etc.)
├── scripts/
│   └── secret-scan.js              # Cross-platform secret scanner (Node.js)
├── firestore.rules                 # Firestore security rules (user-scoped access)
├── storage.rules                   # Cloud Storage security rules (user-scoped, 10 MB limit)
├── .env.example                    # Placeholder-only env template (all variables documented)
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslint.config.mjs               # ESLint 9 flat config (TypeScript-aware)
├── package.json                    # Workspace root (npm workspaces)
```

## Technologies Used

| Layer              | Technology         | Version |
| ------------------ | ------------------ | ------- |
| Frontend framework | Next.js            | ^15.0.0 |
| UI library         | React              | ^19.0.0 |
| Backend framework  | Express.js         | ^4.21.0 |
| Runtime            | Node.js            | 20+     |
| Language           | TypeScript         | ^5.7.0  |
| Schema validation  | Zod                | ^3.23.8 |
| Auth (stub)        | jsonwebtoken       | ^9.0.3  |
| Security headers   | Helmet             | ^7.0.0  |
| Rate limiting      | express-rate-limit | ^8.7.0  |
| Input validation   | express-validator  | ^7.3.2  |
| Logging            | Winston            | ^3.19.0 |
| HTTP transport     | cors               | ^2.8.5  |
| Env loading        | dotenv             | ^16.4.5 |
| Linter             | ESLint             | ^9.0.0  |
| Formatter          | Prettier           | ^3.3.0  |

**Phase 2+ (dependencies installed but not all fully integrated):**

- Firebase Authentication / Google OAuth
- Firebase Admin SDK
- Cloud Storage
- Firestore
- Gemini / Vertex AI
- Cloud Run

---

## Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Firebase project _(Phase 2+)_
- Google Cloud project _(Phase 2+)_

### Install

```bash
npm install
```

This installs all workspace dependencies (root + `frontend/` + `backend/`).

### Environment

```bash
cp .env.example .env
```

Edit `.env` with your values. For Phase 1 only `PORT`, `NODE_ENV`, `FRONTEND_URL`, and `JWT_SECRET` matter. Firebase and Gemini keys are not required until Phase 2.

> **Never commit `.env`** — it is in `.gitignore`.

### Run from the repository root:

#### Backend

```bash
cd backend
npm run dev        # tsx --watch src/index.ts (hot-reload)
npm run build      # tsc → dist/
npm start          # node dist/index.js
```

#### Frontend

```bash
cd frontend
npm run dev        # next dev
npm run build      # next build
```

---

## Verification Commands

Run from the **repo root**:

```bash
npm run typecheck   # TypeScript — backend + frontend
npm run lint        # ESLint 9 across all workspaces
npm run format      # Prettier check
npm run format:fix  # Prettier fix
npm run test        # tsx test runner — 30 tests across unit + integration
npm run secret-scan # Cross-platform Node.js secret scanner
```

### Phase 3 Verification Results

```
npm run typecheck   → ✅ 0 errors (backend + frontend)
npm run lint        → ✅ 0 errors
npm run format      → ✅ All files clean
npm run test        → ✅ 30 pass, 0 fail (unit + integration + AI analysis endpoints)
npm run secret-scan → ✅ No hardcoded secrets found
npm run build (be)  → ✅ tsc compiles with 0 errors
npm run build (fe)  → ✅ next build — compiled, static + dynamic routes generated
GET /api/health     → ✅ {"status":"ok","timestamp":"...","uptime":...}
```

### API Endpoints (Phase 3 Verified)

| Method   | Path                          | Auth | Status  |
| -------- | ----------------------------- | ---- | ------- |
| `GET`    | `/api/health`                 | None | ✅ Live |
| `POST`   | `/api/documents/upload`       | Auth | ✅ Live |
| `GET`    | `/api/documents`              | Auth | ✅ Live |
| `GET`    | `/api/documents/:id`          | Auth | ✅ Live |
| `DELETE` | `/api/documents/:id`          | Auth | ✅ Live |
| `POST`   | `/api/documents/:id/analyze`  | Auth | ✅ Live |
| `GET`    | `/api/documents/:id/analysis` | Auth | ✅ Live |
| `POST`   | `/api/analyze`                | Auth | ✅ Live |

### Security Notes

- `.env` is in `.gitignore` and is never committed.
- `.env.example` contains placeholder strings only — no real credentials.
- No API keys, private keys, or documents appear anywhere in the repository.
- Backend-only Vertex AI and Gemini SDK access prevents browser credential exposure.
- Helmet CSP restricts `defaultSrc: 'none'`.
- Rate limiting protects all routes.

### Testing

Phase 3 test suite: **30 tests, 30 passing** via `npx tsx --test`:

- `tests/unit/authMiddleware.test.ts` — 4 tests (token validation, mock tokens, ownership checks)
- `tests/unit/documentValidation.test.ts` — 7 tests (file type, size, extension, path traversal)
- `tests/unit/extractionService.test.ts` — 4 tests (magic bytes, normalization, chunking, TXT extraction)
- `tests/unit/firebaseConfigValidation.test.ts` — 5 tests (Firebase environment validation)
- `tests/unit/aiService.test.ts` — 5 tests (prompt fencing, injection defense, Zod validation, disclaimer enforcement, fallback parser)
- `tests/integration/documentPipeline.test.ts` — 1 test (full pipeline: upload → extract → list → delete with ownership checks)
- `tests/integration/aiAnalysisEndpoint.test.ts` — 4 tests (analysis execution, persistence, retrieval, authorization)

Root `npm run test` runs `npx tsx --test tests/**/*.test.ts` → 30 pass, 0 fail.

### Assumptions

- Evaluators supply their own Firebase and Google Cloud credentials.
- Documents containing sensitive data are never stored in the repository.
- Backend API keys are never exposed to the browser.
- Phase 1 intentionally excludes: Gemini, file uploads, Cloud Storage, Firestore, Q&A, comparison, risk detection, simplification, history, and CI/CD deployment.

### Repository

- Public GitHub repository.
- Single `main` branch.
- Repository size kept under 10 MB.
- Clean, submission-ready state.
