# LegalEase-AI — Project Memory

Source-of-truth documents: `PRD.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`.

## Project Identity

- **Project:** LegalEase-AI
- **Hackathon:** PromptWars Virtual — "AI for Legal Assistance & Access"
- **Problem Statement:** AI for Legal Assistance & Access
- **Core purpose:** GenAI-powered legal document understanding and assistance tool.
- **Core principle:** "An AI-powered legal document understanding and assistance tool — not an AI lawyer."
- **Core workflow:** Understand → Ground → Explain → Highlight → Compare → Prepare (never Predict → Decide → Guarantee).

## Product Memory

### Core MVP

- Google OAuth authentication via Firebase.
- Secure legal document upload (PDF, DOCX, TXT, max 10 MB).
- Document processing: validate, store, extract text, normalize, chunk.
- AI document analysis via Gemini (summary, key clauses, obligations, important dates, risks).
- Plain-language simplification.
- Document-grounded Q&A with source attribution.
- Two-document comparison.
- Actionable next steps and risk explanations using educational language.
- Document history scoped to authenticated user.
- AI disclaimers and limitations messaging.

### Optional

- "Explain This Clause" — only if it does not destabilize MVP.

### Future

- Vertex AI Vector Search / advanced retrieval.
- Multilingual support.
- Lawyer matching / scheduling.
- Real-time collaboration.
- Browser extension / mobile app.
- Advanced analytics.

## Architecture Memory

- **Frontend:** Next.js / React / TypeScript.
- **Authentication:** Firebase Authentication + Google OAuth.
- **Backend:** Cloud Run API; all business logic and AI orchestration here.
- **AI:** Gemini / Vertex AI, called **only from backend**.
- **File storage:** Google Cloud Storage, user-scoped paths `users/{userId}/documents/{docId}/original`.
- **Database:** Firestore for metadata/history only; never store full document text.
- **Observability:** Cloud Logging / Cloud Monitoring.
- **Secrets:** environment variables (`.env` dev), Google Secret Manager (production).
- **Frontend must not call Gemini directly.**
- **Authentication is separate from authorization.** Every document access requires server-side ownership verification.
- **Uploaded documents are untrusted data.**
- **AI output must be validated before rendering or storing.**
- **Secrets remain server-side.**

## Google Services Memory

- **Gemini / Vertex AI:** GenAI analysis, Q&A, comparison, simplification, risk detection, guidance.
- **Firebase Authentication:** Google OAuth and identity.
- **Cloud Storage:** Secure legal document storage.
- **Firestore:** Metadata, history, analysis/Q&A/comparison records.
- **Cloud Run:** Backend API and AI orchestration.
- **Cloud Logging / Monitoring:** Logs, errors, latency, operational monitoring.
- **Secret Manager:** Production secrets where appropriate.

## AI / GenAI Memory

Gemini is used for document analysis, summarization, simplification, clause extraction, obligation extraction, important dates, risk detection, Q&A, comparison, and next-step guidance.

AI rules:

- AI calls happen through backend only.
- Responses are dynamically generated per document.
- AI must be grounded in uploaded document content; relevant chunks/context are supplied.
- AI must not invent clauses, dates, facts, or obligations.
- AI must state when information is not present in the document.
- AI should express uncertainty textually, not numerically.
- AI output uses structured schemas where required and is validated before storage/rendering.
- Source attribution is preserved where available.
- Uploaded document instructions must never override system instructions.
- User questions are treated as untrusted input.

## AI Safety Boundaries

LegalEase-AI:

- **IS:** an educational legal-document understanding assistant.
- **IS NOT:** a lawyer, legal representative, source of guaranteed legal outcomes, or replacement for professional legal advice.

AI must explain document content, identify areas that may deserve attention, provide grounded information, express uncertainty, and recommend professional review when appropriate.

AI must not invent legal provisions, invent facts, guarantee outcomes, declare something illegal/invalid without authoritative basis, or provide unsupported jurisdiction-specific legal conclusions.

Every AI response contains the appropriate disclaimer.

## Security Memory

- Never hardcode secrets, API keys, credentials, or tokens.
- Never commit secrets; `.env` is excluded from Git.
- Never expose backend AI credentials to the frontend.
- Use environment variables and Secret Manager for production secrets.
- Firebase ID tokens verified server-side on every API request.
- Authorization enforced server-side; users can access only their own documents.
- Firestore queries and Cloud Storage access are user-scoped.
- Uploaded files are validated server-side and never executed.
- AI output is sanitized/validated before rendering.
- Prompt injection is treated as a security concern; system prompt has highest priority.
- Full legal documents, auth tokens, API keys, and secrets are never logged.
- `.env` exists in repo root; never read or copy its contents into this file.

## Document Processing Memory

- Supported formats: PDF, DOCX, TXT.
- Maximum upload size: 10 MB.
- Processing flow: Upload → Validate → Store → Extract text → Normalize → Chunk if required → Prepare context → AI processing → Validate output → Store/display result.
- Empty, corrupt, or unreadable documents are rejected.
- Original uploaded files are not modified.
- Large documents require chunking/context management.
- Source metadata preserved where possible.

## Development Phase Memory

The project has exactly 6 phases in `phases.md`:

- **Phase 1:** Foundation, Project Setup & Security Baseline
- **Phase 2:** Authentication, Document Upload & Document Processing
- **Phase 3:** GenAI Legal Analysis & Document Understanding
- **Phase 4:** Document Q&A, Comparison & Advanced Legal Assistance
- **Phase 5:** Product Polish, Security Hardening & Comprehensive Testing
- **Phase 6:** Deployment, Observability & Hackathon Demo Readiness

Parallel notes:

- Unit testing starts during Phase 2 and continues.
- UI polish is incremental.
- Security reviews are continuous.
- Documentation is continuous.
- Phase 6 prepares final hackathon deployment/demo.

## Current Status

Phases 1–5 complete & verified locally. Phase 6 (Deployment & Observability) partially complete: Phase 6.1 Secret Manager SDK, Phase 6.2 container audit, Phase 6.2-A setup, Phase 6.2-B live GCP audit, Phase 6-FREE.1 backup audit, and Phase 6-FREE.2 GCP free/trial feasibility audit verified; ₹0 deployment of all 6 Google Cloud services confirmed IMPOSSIBLE without enabling project billing due to Cloud Run, Artifact Registry, Secret Manager, & Vertex AI API billing locks.

| Area                | Status        |
| ------------------- | ------------- |
| Foundation          | VERIFIED ✅   |
| Authentication      | VERIFIED ✅   |
| Upload              | VERIFIED ✅   |
| Document Processing | VERIFIED ✅   |
| Gemini Integration  | VERIFIED ✅   |
| Document Analysis   | VERIFIED ✅   |
| Simplification      | VERIFIED ✅   |
| Risk Detection      | VERIFIED ✅   |
| Q&A                 | VERIFIED ✅   |
| Comparison          | VERIFIED ✅   |
| Next Steps          | VERIFIED ✅   |
| History             | VERIFIED ✅   |
| Security            | HARDENED ✅   |
| Testing             | 84/84 PASS ✅ |
| Accessibility       | VERIFIED ✅   |
| Deployment (Local)  | VERIFIED ✅   |
| Deployment (Backup) | AUDITED READY ✅ (Render Free emergency fallback) |
| Deployment (Cloud)  | BLOCKED ⛔ (GCP Billing required for Cloud Run, Artifact Registry, Secret Manager, Vertex AI) |
| Hackathon Demo      | SCRIPT READY ✅ |

## Current Phase

Current Phase: Phase 6 — Deployment, Observability & Demo Readiness (Phase 6-FREE.2 GCP Feasibility Audited ⏳)

Objective: Provision GCP Secret Manager, deploy Cloud Run backend, record demo video.

Completed: `@google-cloud/secret-manager` SDK integration, container architecture audit, deployment environment check, live GCP audit specification, Zero-cost Render Free backup deployment audit, GCP Free/Trial Feasibility Audit, Secret Manager fallback & error handling, Docker setup, health & telemetry routes (`/api/health`, `/api/health/metrics`), demo script (`docs/DEMO_SCRIPT.md`), evaluation criteria (`docs/EVALUATION_CRITERIA.md`), 84/84 passing tests.

Blockers: Official Cloud Run production deployment requires enabling billing on GCP project `legalease-ai-78a55` to unlock `run.googleapis.com`, `artifactregistry.googleapis.com`, `secretmanager.googleapis.com`, and `aiplatform.googleapis.com`.

Next: Enable billing / link credit card or GCP Free Trial credits on `legalease-ai-78a55` for Cloud Run deployment, or use Render emergency backup path for demo.

## Important Decisions

### Decision: Backend-only Gemini/Vertex AI integration

Reason: API keys must never be exposed to the frontend; backend enables auth, prompt construction, and output validation.
Status: Active

### Decision: Firebase Authentication + Google OAuth

Reason: Secure identity and token-based authorization aligned with PRD/architecture.
Status: Active

### Decision: Cloud Run backend API

Reason: Stateless, auto-scaling backend for API logic and AI orchestration.
Status: Active

### Decision: Cloud Storage with user-scoped paths

Reason: Secure document persistence via signed URLs and IAM/user ownership boundaries.
Status: Active

### Decision: Firestore for metadata/history only

Reason: Fast metadata storage without storing full document text; user-scoped security rules.
Status: Active

### Decision: Lightweight document grounding for MVP

Reason: Full/relevant document chunks are sufficient for MVP; advanced vector search deferred.
Status: Active

### Decision: Structured JSON AI output with schema validation

Reason: Consistent rendering and safe handling before Firestore storage/frontend rendering.
Status: Active

### Decision: System prompt has highest priority

Reason: Uploaded documents and user questions are untrusted; prompt injection defense is required.
Status: Active

### Decision: Educational legal-safety boundary

Reason: Product assists understanding; it does not replace professional legal advice.
Status: Active

### Decision: TypeScript strict mode

Reason: Engineering standard per `rules.md`.
Status: Active

## Known Limitations

- AI can make mistakes; outputs are informational.
- AI output is not legal advice.
- Users should verify important information with qualified professionals.
- Complex or high-risk matters should be reviewed by a qualified legal professional.
- MVP supports English documents only.
- Supported formats are PDF/DOCX/TXT; max upload size 10 MB.
- Document-grounded answers depend on successful extraction/context retrieval.
- Advanced retrieval/vector search may be future scope.

## Current Blockers

No known blockers identified from project documentation.

## Next Actions

### MUST HAVE

- Initialize Next.js/React/TypeScript strict-mode project using `architecture.md` folder structure.
- Configure Firebase Auth (Google OAuth) and Google Cloud services.
- Create `.env.example` with variable names only and `.gitignore` including `.env`.
- Build authentication flow and backend Firebase ID-token verification middleware.
- Implement document upload pipeline: validation, signed URLs, text extraction, chunking, Firestore metadata.
- Integrate Gemini/Vertex AI via backend with structured output validation and AI safety prompts.
- Implement core document analysis: summary, clauses, obligations, dates, risks with educational language and disclaimers.
- Implement grounded Q&A with source attribution and explicit "not found" handling.
- Implement two-document comparison with added/removed/modified clause detection.
- Ensure all AI outputs show disclaimers and AI transparency.

### SHOULD HAVE

- Plain-language simplification.
- "Explain This Clause" if timeline permits.
- Document history and search.
- Loading/empty/error states across features.
- WCAG 2.1 AA accessibility and responsive UI per `design.md`.

### NICE TO HAVE

- CI/CD, advanced UX polish, non-MVP niceties.

## Deferred / Future Work

- Vertex AI Vector Search / advanced retrieval.
- Multilingual support.
- Lawyer matching / scheduling.
- Real-time collaboration.
- Browser extension / mobile app.
- Advanced analytics.

## Hackathon Requirements

- Demo video under 4 minutes with complete user flow.
- Inputs entered live; real dynamic AI output demonstrated.
- GenAI usage unmistakable and not hardcoded.
- Show success case and edge/error case.
- Cursor visible; key results readable.
- AI disclaimer visible throughout.
- Public Google Drive or unlisted YouTube submission; verify submitted video access.

Evaluation areas: Code Quality, Security, Efficiency, Testing, Accessibility, Problem Statement Alignment, Google Services Usage, Real GenAI Usage.

## Data Privacy Memory

- Documents are private and user-scoped.
- Document content must not appear in normal application logs.
- Authentication data and secrets must be protected.
- Minimum necessary data is stored.
- Documents must not be publicly exposed.
- Users cannot access another user's documents.
- This file stores no secrets, tokens, API keys, passwords, or private document content.

## Instructions for Future AI Agents

1. Read `PRD.md` before changing product requirements.
2. Read `architecture.md` before changing architecture.
3. Read `rules.md` before writing or modifying code.
4. Read `phases.md` before determining development priorities.
5. Read `design.md` before modifying UI/UX.
6. Read `memory.md` for current project context.
7. Never contradict higher-priority project documentation.
8. Never invent requirements.
9. Never invent implementation status.
10. Never expose secrets.
11. Never bypass authentication.
12. Never bypass authorization.
13. Never expose another user's documents.
14. Treat uploaded documents as untrusted data.
15. Treat user prompts as untrusted input.
16. Keep AI responses grounded in available document evidence.
17. Validate AI output before rendering or storing.
18. Preserve the legal-safety boundary.
19. Prefer simple maintainable solutions.
20. Update `memory.md` after major project decisions or meaningful status changes.

## Memory Maintenance Rules

- `memory.md` is a living document.
- Keep it concise.
- Do not duplicate `PRD.md`, `architecture.md`, `rules.md`, or `phases.md`.
- Update current status when verified.
- Update current phase when project advances.
- Record major architecture decisions, security decisions, and blockers.
- Remove obsolete decisions.
- Never store secrets, passwords, API keys, tokens, or unnecessary private data.
- Do not store temporary debugging information unless it affects future development.
- Never copy `.env` contents or other secret files into this file.

## Project Memory Changelog

### 2026-09-20

- Change: Phase 3 (GenAI Legal Analysis) implemented, tested, and marked complete.
- Reason: Implemented Gemini / Vertex AI backend orchestration service (`AIService`) with structured JSON schema output, prompt fencing (`<document_content>`), prompt injection defense, Zod validation, retry logic, and rule-based grounded fallback. Added Firestore `analyses` collection persistence and REST endpoints (`POST /api/documents/:id/analyze`, `GET /api/documents/:id/analysis`). Built interactive frontend analysis report interface (`/documents/[id]`) matching Figma design with tabbed navigation (Summary, Key Clauses, Obligations, Important Dates, Guidance), risk badges, educational disclaimer banner, and interactive Grounding Citation Drawer. 28/28 unit and integration tests passing, TypeScript typecheck passing, ESLint passing, Prettier format passing, secret scan clean, backend and frontend production builds passing cleanly.
- Impact: Core GenAI document analysis pipeline is complete and verified. Ready for Phase 4 (History, Comparison, Deployment).

### 2026-09-20

- Change: Phase 2 implemented, tested, and marked complete.
- Reason: Full end-to-end implementation of authentication (Firebase Auth, Google OAuth, `useAuth` context), user upsert (`POST /api/users/me`), signed-URL document upload flow (PDF/DOCX/TXT ≤10MB, client validation, progress tracking), text extraction & chunking, Firestore metadata, and Figma-aligned frontend UI (Landing, Login, Dashboard, Upload, Documents pages). Real safe sample document feature implemented. 22/22 unit and integration tests passing, frontend and backend builds passing cleanly, secret scan clean.
- Impact: Document ingestion & authentication pipeline is fully operational. Project is ready for Phase 3 (GenAI analysis).

### 2026-09-19

- Change: Phase 1 verified and marked complete.
- Reason: Full verification pass — formatting fixed, both builds pass, 16/16 tests pass, shared types populated, security rules created, secret scan cross-platform.
- Impact: Phase 1 is ready; Phase 2 can begin after user approval.

### 2026-09-15

- Change: Created/updated project memory.
- Reason: Establish persistent development context for future developers and AI agents.
- Impact: Future agents can quickly understand project goals, architecture, security boundaries, and current unverified status.
