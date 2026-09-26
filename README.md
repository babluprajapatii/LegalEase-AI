# LegalEase-AI — Plain-Language GenAI Legal Assistant

> **Legal Technology & Document Intelligence Platform**

LegalEase-AI is a secure, backend-first GenAI web application built on Google Cloud Platform, Vertex AI, Firebase Admin SDK, and Express.js. It transforms complex, dense legal documents into plain-language executive summaries, structured key clauses, risk flags, actionable obligation checklists, grounded Q&A, and side-by-side document comparisons.

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

## 🛠️ Architecture & Technology Stack

```
[ Frontend: Next.js 15 + React 19 + TypeScript on Cloudflare Workers ]
                      │
           (Firebase Google Auth ID Token)
                      ▼
[ Backend: Express.js (Node.js 20+, Security Hardened) on Render ]
    ├── Authentication: Firebase Admin SDK (ID Token Verification)
    ├── Storage: Google Cloud Storage (User-scoped GCS Buckets)
    ├── Database: Google Cloud Firestore (Document & Analysis Records)
    ├── AI Orchestration: Google Cloud Vertex AI (Gemini 1.5 Pro)
    └── Deployment: Render (Web Service)
```

---

## 🔒 Security & Safety Hardening

- **No Browser Credentials:** Vertex AI and Firebase Admin SDK credentials operate strictly on the backend.
- **Firebase Auth Scoping:** User authorization is verified server-side using Firebase ID tokens (`verifyIdToken`).
- **Prompt Injection Defense:** Strict prompt isolation using `<document_content>` tags and system instruction boundaries.
- **Secret Scanner:** Integrated Node.js secret scanner (`scripts/secret-scan.js`) prevents hardcoded secrets or API keys from entering source control.
- **File Validation:** Client & server-side verification of magic-byte file headers, MIME types, and 10 MB size limits (PDF, DOCX, TXT).
- **OWASP Protections:** Helmet CSP headers, CORS restriction, rate limiting (100 req / 15 min), and HTML input sanitization.

---

## 📁 Repository Structure

```
LegalEase-AI/
├── backend/                  # Express.js backend API & Vertex AI orchestration
│   ├── src/
│   │   ├── config/           # Zod environment schemas & Firebase Admin init
│   │   ├── handlers/         # Express route handlers
│   │   ├── middleware/       # Auth, RateLimit, Helmet, Error handling
│   │   ├── services/         # AI Service, Document Service, Q&A, Comparison
│   │   └── shared/types/     # TypeScript domain types & Zod schemas
│   ├── tsconfig.json
│   └── package.json
├── frontend/                 # Next.js 15 App Router frontend
│   ├── src/
│   │   ├── app/              # Routes (/dashboard, /documents, /compare, /history, /settings)
│   │   ├── components/       # Design System UI components & Sidebar
│   │   └── lib/              # Firebase auth & API client
│   └── package.json
├── tests/                    # Unit & Integration test suite
│   ├── unit/                 # 21 unit test modules
│   └── integration/          # 2 end-to-end integration pipeline tests
├── scripts/
│   └── secret-scan.js        # Automated secret scanner
├── firestore.rules           # Production Firestore security rules
├── storage.rules             # Production Cloud Storage security rules
├── package.json              # Root workspace package.json
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites

- Node.js 20+
- npm 10+

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

### Running Locally

#### Full Stack (Backend + Frontend)

```bash
# Run backend development server (Port 3001)
npm --prefix backend run dev

# Run frontend development server (Port 3000)
npm --prefix frontend run dev
```

---

## 🧪 Build & Test Commands

Run from the repository root:

```bash
# 1. TypeScript typecheck across backend and frontend
npm run typecheck

# 2. Comprehensive unit & integration test runner
npm test

# 3. Backend workspace tests
npm test --workspace=backend

# 4. Automated secret leak scan
npm run secret-scan

# 5. Production build
npm run build
```

---

## 🌐 Render Deployment Instructions

LegalEase-AI backend is designed for automated deployment on **Render** (Web Service).

### Render Service Settings

- **Environment:** `Node`
- **Build Command:**
  ```bash
  npm install --include=dev && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```
  *(or `node backend/dist/index.js` if deploying with Root Directory set to `backend`)*

---

## 🔑 Environment Variables Breakdown

Configure the following environment variables in your Render Dashboard under **Environment**:

### Required Production Variables

| Variable Name | Description | Example / Notes |
|---|---|---|
| `FIREBASE_PROJECT_ID` | GCP / Firebase Project ID | `legalease-ai-78a55` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin Service Account Email | `firebase-adminsdk-xxxxx@legalease-ai-78a55.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin Service Account Private Key | `-----BEGIN PRIVATE KEY-----\nMIIEvgI...\n-----END PRIVATE KEY-----` |
| `GCS_BUCKET_NAME` | Google Cloud Storage Bucket Name | `legalease-ai-78a55.firebasestorage.app` |
| `GCP_PROJECT_ID` | GCP Project ID for Vertex AI | `legalease-ai-78a55` |
| `GCP_LOCATION` | Vertex AI Region | `us-central1` |
| `VERTEX_AI_MODEL` | Gemini Model Identifier | `gemini-1.5-pro` |

### Optional / Configurable Variables

| Variable Name | Default Value | Description |
|---|---|---|
| `PORT` | `3001` *(Assigned dynamically by Render)* | Express server port |
| `NODE_ENV` | `production` | Environment mode (`development`, `production`, `test`) |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin(s). Supports comma-separated strings for multiple domains (e.g. `https://legalease-ai.pages.dev,https://app.legalease.ai`) |
| `JWT_SECRET` | *(Optional)* | Legacy secret; authentication uses Firebase ID tokens |

---

## 🩺 Health Check Endpoint

The backend includes an unauthenticated health check endpoint for uptime monitoring and Render zero-downtime health probes:

- **Endpoint:** `GET /api/health`
- **Expected Status:** `HTTP 200 OK`
- **Sample Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-26T11:51:49.898Z",
  "uptimeSeconds": 120,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "firebaseAuth": "connected",
    "firestore": "connected",
    "cloudStorage": "connected",
    "vertexAI": "connected"
  }
}
```

---

## 🛠️ Common Deployment Errors & Solutions

1. **`JWT_SECRET must be explicitly configured in production environment`**
   - *Cause:* Legacy validation error in Phase 1 before Firebase Auth was adopted.
   - *Fix:* Resolved. `JWT_SECRET` is now optional; authentication relies strictly on Firebase Admin SDK ID tokens (`verifyIdToken`).

2. **Firebase Private Key Formatting Issues**
   - *Cause:* Escaped newline strings (`\n`) or surrounding double quotes in Render environment variables causing RSA key parse failures.
   - *Fix:* `parsePrivateKey()` automatically strips quotes and converts `\n` literals into real newlines.

3. **CORS Policy Rejection for Deployed Frontend**
   - *Cause:* `FRONTEND_URL` not configured with Cloudflare Workers / Pages URL.
   - *Fix:* Set `FRONTEND_URL` in Render to match your exact Cloudflare frontend origin (e.g. `https://legalease-ai.pages.dev`).

4. **Port Binding Failures**
   - *Cause:* Binding strictly to `127.0.0.1` / `localhost` instead of container host interfaces.
   - *Fix:* Express server explicitly binds to `0.0.0.0` and reads `process.env.PORT`.

---

## ⚖️ Legal Disclaimer

LegalEase-AI is an educational, plain-language document assistance tool powered by Artificial Intelligence. **It does not provide legal advice and is not a substitute for professional legal counsel.** Users should always consult a qualified attorney before entering into legally binding contracts.
