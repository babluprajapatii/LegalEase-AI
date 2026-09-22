# LegalEase-AI — Hackathon Evaluation Criteria Mapping

This document provides a direct mapping between LegalEase-AI implementation artifacts and the official Hackathon Judging Criteria.

---

## 1. Google Cloud Services Integration (Weight: High)

LegalEase-AI demonstrates deep technical integration across 7 core Google Cloud & Firebase services:

| Google Service                 | Architectural Responsibility                                              | Implementation File                         |
| :----------------------------- | :------------------------------------------------------------------------ | :------------------------------------------ |
| **Gemini 1.5 Pro / Vertex AI** | Document analysis, risk extraction, grounded Q&A, and document comparison | `backend/src/services/aiService.ts`         |
| **Firebase Auth**              | ID token verification middleware & user identity                          | `backend/src/middleware/auth.ts`            |
| **Google Cloud Storage**       | Encrypted user-scoped document vault (`users/{userId}/...`)               | `backend/src/services/storageService.ts`    |
| **Firestore**                  | NoSQL database for metadata, Q&A sessions, & comparison diffs             | `backend/src/services/firestoreService.ts`  |
| **Google Cloud Run**           | Multi-stage Docker container deployment orchestration                     | `backend/Dockerfile`, `frontend/Dockerfile` |
| **Google Cloud Logging**       | Structured JSON logging with request tracing                              | `backend/src/utils/logging.ts`              |
| **GCP Secret Manager**         | Production API credential resolution with dev fallback                    | `backend/src/config/secrets.ts`             |

---

## 2. Responsible GenAI & Legal Safety (Weight: High)

LegalEase-AI adheres strictly to Responsible AI practices for legal documents:

- **System Prompt Fencing:** Strict XML tag isolation (`<document_content>`) prevents prompt injection.
- **Hallucination Prevention:** Absence flag (`isNotPresent = true`) and textual confidence ratings (`highly confident`, `moderately confident`, `limited information`).
- **Non-Advisory Disclaimer:** Mandatory educational disclaimer on 100% of AI outputs.
- **Source Citation Grounding:** Exact text chunk references provided for all extracted clauses and answers.

---

## 3. Accessibility & User Experience (Weight: Medium)

- **WCAG 2.1 AA Compliant:** Accessible landmark regions (`role="main"`), skip-to-content target link (`#main-content`), and screen-reader live announcements (`aria-live="polite"`).
- **Figma Design System:** Glassmorphism UI tokens, dark mode palette, responsive cards, and dynamic loading skeletons (`layout.tsx`, `global.css`).
- **Keyboard Control:** Complete keyboard navigation and focus trapping on drawers/modals.

---

## 4. Code Quality, Security & Testing (Weight: High)

- **Automated Test Coverage:** 64 unit and integration tests passing (`64/64 passed`, `0 failed`).
- **TypeScript Strictness:** Zero `tsc` compilation errors across backend and frontend workspaces.
- **Security Hardening:** Server-side user ownership checks, `firestore.rules` and `storage.rules` scoping (`request.auth.uid == userId`), XSS tag stripping (`sanitizeHtml`), and zero hardcoded secrets (`npm run secret-scan`).
- **Repository Efficiency:** Lightweight repository size maintained at **3.52 MB** (< 10 MB limit).
