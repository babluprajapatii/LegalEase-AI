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

---

## Phase Roadmap

### ✅ Phase 1 — Foundation (complete)

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

### Phase 2 — Document Ingestion (next)

- Multipart upload via Multer → Cloud Storage.
- Firestore metadata persistence.
- Document listing, retrieval, deletion.
- Firebase Admin SDK initialization (env vars promoted from optional to required).
- Integration tests.

### Phase 3 — AI Analysis

- Backend-only Gemini / Vertex AI integration.
- Document Q&A, comparison, risk detection, plain-language simplification.
- Structured, citation-aware analysis results.

### Phase 4 — History, UX, and Deployment

- Analysis history.
- Cloud Run deployment.
- CI / validation workflow.

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
│   │   │   ├── api.ts              # /api/* stub routes (501 until Phase 2)
│   │   │   └── health.ts           # GET /api/health
│   │   ├── services/
│   │   │   └── documentService.ts  # DocumentService scaffold (no storage yet)
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
│   ├── unit/                       # (empty — Phase 2 adds coverage)
│   ├── integration/                # (empty — Phase 2 adds coverage)
│   └── e2e/                        # (empty — Phase 4 adds coverage)
├── shared/
│   └── types/                      # (empty — cross-package types placeholder)
├── .env.example                    # Placeholder-only env template
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslint.config.mjs               # ESLint 9 flat config (TypeScript-aware)
└── package.json                    # Workspace root (npm workspaces)
```

---

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

**Phase 2+ (not yet active):**

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

---

## Development

### Backend

```bash
cd backend
npm run dev        # tsx --watch src/index.ts (hot-reload)
```

### Frontend

```bash
cd frontend
npm run dev        # next dev
```

---

## Production Build

### Backend

```bash
cd backend
npm run build      # tsc → dist/
npm start          # node dist/index.js
```

### Frontend

```bash
cd frontend
npm run build      # next build
```

---

## Verification Commands

Run from the **repo root**:

```bash
npm run typecheck   # TypeScript — backend + frontend
npm run lint        # ESLint 9 across all workspaces
npm run format      # Prettier check
npm run test        # Node --test runner (no tests yet in Phase 1)
```

### Phase 1 Verification Results

```
npm run typecheck  → ✅ 0 errors
npm run lint       → ✅ 0 errors  (89 warnings — no-explicit-any / no-unused-vars in stub placeholders)
npm run format     → ✅ All matched files use Prettier code style!
npm run test       → ✅ 0 fail, 0 cancelled  (test suite empty — expected for Phase 1)
GET /api/health    → ✅ {"status":"ok","timestamp":"...","uptime":...}
```

---

## API Endpoints (Phase 1)

| Method   | Path                 | Auth | Status        |
| -------- | -------------------- | ---- | ------------- |
| `GET`    | `/api/health`        | None | ✅ Live       |
| `POST`   | `/api/upload`        | JWT  | 501 — Phase 2 |
| `GET`    | `/api/documents`     | JWT  | 501 — Phase 2 |
| `GET`    | `/api/documents/:id` | JWT  | 501 — Phase 2 |
| `DELETE` | `/api/documents/:id` | JWT  | 501 — Phase 2 |
| `POST`   | `/api/analyze`       | JWT  | 501 — Phase 3 |

---

## Security Notes

- `.env` is in `.gitignore` and is never committed.
- `.env.example` contains placeholder strings only — no real credentials.
- No API keys, private keys, or documents appear anywhere in the repository.
- `ANTHROPIC_API_KEY` or any other tool key must never be placed in source files.
- Backend-only AI access prevents browser credential exposure (Phase 3).
- Helmet CSP restricts `defaultSrc: 'none'` in Phase 1.
- Rate limiting protects all routes (100 req / 15 min window).

---

## Testing

Phase 1 has no tests. The test runner is configured and the directory structure is in place:

- `tests/unit/` — Unit tests (Phase 2+).
- `tests/integration/` — Integration tests (Phase 2+).
- `tests/e2e/` — End-to-end tests (Phase 4+).

Root `npm run test` runs `node --test tests/**/*.test.ts` — exits clean with 0 tests in Phase 1.

---

## Assumptions

- Evaluators supply their own Firebase and Google Cloud credentials.
- Documents containing sensitive data are never stored in the repository.
- Backend API keys are never exposed to the browser.
- Phase 1 intentionally excludes: Gemini, file uploads, Cloud Storage, Firestore, Q&A, comparison, risk detection, simplification, history, and CI/CD deployment.

---

## Repository

- Public GitHub repository.
- Single `main` branch.
- Repository size kept under 10 MB.
- Clean, submission-ready state.
