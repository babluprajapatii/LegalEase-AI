# LegalEase-AI — Plain-Language GenAI Legal Assistant

> **PromptWars Submission — Legal Technology & Document Intelligence**

LegalEase-AI is a secure, backend-first GenAI web application built on Google Cloud Platform and Vertex AI. It transforms complex, dense legal documents into plain-language executive summaries, structured key clauses, risk flags, actionable obligation checklists, grounded Q&A, and side-by-side document comparisons.

---

## 🚀 Problem Statement

Legal documents (leases, NDAs, employment agreements, vendor contracts) are dense, technical, and full of hidden liabilities. Non-lawyers struggle to understand their legal obligations, deadlines, and operational risks before signing. 

Existing consumer tools either lack strict grounding (leading to dangerous AI hallucinations) or fail to provide actionable follow-up guidance.

---

## ✨ Key Features & Capability Matrix

1. **Grounded Legal Document Analysis**
   - Extracts plain-English executive summaries, risk levels (High, Medium, Low), key clauses, explicit obligations, and critical deadlines.
   - Grounded strictly in the uploaded document context using Google Cloud Vertex AI (Gemini 1.5 Pro).
   - Features an interactive **Grounding Citation Drawer** providing section numbers and exact page references.

2. **Grounded Document Q&A**
   - Natural language Q&A interface grounded strictly in document text.
   - Explicitly flags when requested information is absent rather than hallucinating details.
   - Implements robust prompt-injection defenses to withstand adversarial inputs.

3. **Side-by-Side Document Comparison**
   - Compares two versions of a contract or agreement.
   - Highlights added (`+`), removed (`-`), and modified (`▼`) clauses with quantitative diff counts.
   - Generates document category compatibility warnings when comparing dissimilar document types.

4. **Actionable Next Steps & Attorney Consultation Checklist**
   - Automatically compiles interactive action items and party obligations.
   - Provides 1-click copyable attorney consultation questions tailored to identified document risks.
   - Tracks required information and missing document details before signing.

5. **Document History & Secure Storage**
   - Filter and search uploaded documents by filename, processing status (`analyzed`, `processing`, `uploaded`), and upload date.
   - Interactive deletion modal with backend GCS file and Firestore record removal.
   - Strict multi-tenant row/user-level authorization scoping (`ownerId == req.user.uid`).

6. **Responsible AI & Educational Safeguards**
   - Prominently displays non-advisory educational disclaimers across all reports and guidance screens.
   - Transparently indicates AI model name, processing time, and confidence indicators.

---

## 🛠️ Architecture & Google Cloud Integration

```
[ Frontend: Next.js 15 + React 19 + TypeScript ]
                      │
           (Firebase Google Auth ID Token)
                      ▼
[ Backend: Express.js (Node.js 20, Security Hardened) ]
    ├── Authentication: Firebase Admin SDK
    ├── Storage: Google Cloud Storage (User-scoped GCS Buckets)
    ├── Database: Google Cloud Firestore (Document & Analysis Records)
    ├── AI Orchestration: Google Cloud Vertex AI (Gemini 1.5 Pro)
    ├── Secrets: Google Cloud Secret Manager
    └── Container Deployment: Google Cloud Run (Docker multi-stage build)
```

### Google Cloud Services Used

* **Google Cloud Vertex AI (Gemini 1.5 Pro):** Server-side grounded legal analysis, structured JSON extraction, and grounded document Q&A.
* **Google Cloud Storage (GCS):** Direct-to-bucket signed upload flow and secure encrypted storage of original document files.
* **Google Cloud Firestore:** User-scoped metadata, document records, structured analysis results, and comparison persistence.
* **Firebase Authentication:** Google OAuth sign-in and JWT ID token generation/verification.
* **Google Cloud Secret Manager:** Secure production credential management.
* **Google Cloud Run:** Multi-stage container runtime for production backend deployment.

---

## 🔒 Security & Safety Hardening

* **No Browser Credentials:** Vertex AI and Firebase Admin SDK credentials operate strictly on the backend.
* **Prompt Injection Defense:** Strict prompt isolation using `<document_content>` tags and system instruction boundaries.
* **Secret Scanner:** Integrated Node.js secret scanner (`scripts/secret-scan.js`) prevents hardcoded secrets or API keys from entering source control.
* **File Validation:** Client & server-side verification of magic-byte file headers, MIME types, and 10 MB size limits (PDF, DOCX, TXT).
* **OWASP Protections:** Helmet CSP headers, CORS restriction, rate limiting (100 req / 15 min), and HTML input sanitization.

---

## 📁 Repository Structure

```
LegalEase-AI/
├── backend/                  # Express.js backend API & Vertex AI orchestration
│   ├── src/
│   │   ├── config/           # Zod environment schemas & Secret Manager
│   │   ├── handlers/         # Express route handlers
│   │   ├── middleware/       # Auth, RateLimit, Helmet, Error handling
│   │   ├── services/         # AI Service, Document Service, Q&A, Comparison
│   │   └── shared/types/     # TypeScript domain types & Zod schemas
│   ├── Dockerfile            # Cloud Run multi-stage Docker build
│   └── package.json
├── frontend/                 # Next.js 15 App Router frontend
│   ├── src/
│   │   ├── app/              # Routes (/dashboard, /documents, /compare, /history, /settings)
│   │   ├── components/       # Design System UI components & Sidebar
│   │   └── lib/              # Firebase auth & API client
│   ├── Dockerfile            # Cloud Run frontend container build
│   └── package.json
├── shared/                   # Shared cross-package TypeScript types
├── tests/                    # Unit & Integration test suite
│   ├── unit/                 # 19 unit test modules (AI safety, extraction, Q&A, etc.)
│   └── integration/          # 2 end-to-end integration pipeline tests
├── scripts/
│   └── secret-scan.js        # Automated secret scanner
├── firestore.rules           # Production Firestore security rules
├── storage.rules             # Production Cloud Storage security rules
├── .env.example              # Placeholder-only environment variable template
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites

* Node.js 20+
* npm 10+

### Installation

```bash
# Install root and workspace dependencies
npm install
```

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

*In local development mode without GCP credentials, LegalEase-AI automatically uses rule-based grounded text extraction fallbacks so you can test all UI flows without API keys.*

### Running locally

#### Backend (Port 3001)

```bash
cd backend
npm run dev
```

#### Frontend (Port 3000)

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification Commands

Run from the repository root:

```bash
# 1. TypeScript compilation check across backend & frontend
npm run typecheck

# 2. ESLint flat config validation
npm run lint

# 3. Comprehensive unit & integration test runner (84 tests)
npm test

# 4. Secret leak security scan
npm run secret-scan

# 5. Frontend Next.js production build verification
npm run build --workspace=frontend
```

---

## 📊 Final Verification Status

* **Authentication & Authorization:** PASS (Firebase Auth, protected routes, token verification, logout, user isolation)
* **Document Upload & Parsing:** PASS (Client & server validation for PDF, DOCX, TXT; magic bytes; 10 MB limit)
* **Vertex AI / Gemini Integration:** PASS (Structured grounded analysis, summary, clauses, dates, obligations, risks)
* **Grounded Document Q&A:** PASS (Context-grounded answers, absence flags, prompt injection defense)
* **Side-by-Side Comparison:** PASS (Structural clause diffs `+`/`-`/`▼`, counts, document type warnings)
* **History & Deletion:** PASS (Search, status filters, interactive deletion modal, Firestore/GCS cleanup)
* **Security Scan:** PASS (`scripts/secret-scan.js` clean, 0 hardcoded secrets)
* **Repository Size:** PASS (Tracked source files: **1.05 MB**; `.git`: **2.67 MB**; Total: **3.7 MB** < 10 MB limit)
* **Typecheck:** PASS (0 TypeScript errors)
* **Linter:** PASS (0 ESLint errors)
* **Test Suite:** PASS (84 / 84 unit and integration tests passing)
* **Production Build:** PASS (Next.js production build successful)

---

## ⚖️ Legal Disclaimer

LegalEase-AI is an educational, plain-language document assistance tool powered by Artificial Intelligence. **It does not provide legal advice and is not a substitute for professional legal counsel.** Users should always consult a qualified attorney before entering into legally binding contracts.
