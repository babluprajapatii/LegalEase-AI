# LegalEase-AI — Hackathon Presentation & Live Demo Script (4-Minute Flow)

## Video Overview

- **Target Duration:** 3 minutes 45 seconds (Strictly under 4 minutes)
- **Target Audience:** Hackathon Judges & General Legal Tech Enthusiasts
- **Resolution / Aspect:** 1080p Desktop Screencast with Clear Cursor & Visible Audio Controls

---

## Timed Presentation Script

### 0:00 – 0:45 | Problem & Elevator Pitch

> _"Every year, millions of individuals, small business owners, and renters sign legally binding contracts — leases, employment agreements, and vendor contracts — without fully understanding what they are signing. Traditional legal counsel is expensive and slow, while raw consumer AI often hallucinates or gives misleading legal advice._
>
> _Introducing **LegalEase-AI** — an intelligent, grounded AI legal assistant powered by Google Cloud & Vertex AI (Gemini 1.5 Pro). LegalEase-AI turns dense legalese into plain language, highlights hidden risk clauses, answers document-grounded questions with precise citations, and compares contract versions — all while enforcing strict legal disclaimers and security guardrails."_

---

### 0:45 – 1:15 | Google Cloud Architecture Stack

> _"LegalEase-AI is built natively on Google Cloud Services:_
>
> - **Google Gemini 1.5 Pro (Vertex AI):** Core AI engine for structured document understanding and grounded Q&A.
> - **Firebase Authentication:** Secure user identity and token verification.
> - **Google Cloud Storage:** User-scoped encrypted document vault with 10 MB limit enforcement.
> - **Firestore:** NoSQL database for metadata, session histories, and comparison diffs.
> - **Google Cloud Run & Cloud Logging:** Serverless container orchestration and structured observability."*

---

### 1:15 – 2:30 | Live Upload & GenAI Legal Analysis

> _(Screen shows `/upload` page)_
> _"Let's upload a standard commercial lease agreement (`Commercial_Lease_v1.pdf`). Notice the client-side validation instantly verifying file size and type._
>
> _(Click 'Analyze Document' → Screen transitions to `/documents/[id]`)_
> _"In seconds, Gemini processes the document and generates a structured analysis:_
>
> - **Executive Summary:** Plain-English breakdown of the lease.
> - **Key Clauses & Risk Badges:** Notice the High-Risk flag on Section 4 (Automatic Renewal & Penalty Fees).
> - **Obligations & Dates:** Automated checklist of tenant responsibilities and rent due dates.
> - **Source Grounding Drawer:** Clicking any clause highlights the exact text chunk extracted from the source PDF."*

---

### 2:30 – 3:30 | Grounded Document Q&A & Dynamic Comparison

> _(Screen switches to 'Q&A Assistant' tab)_
> _"Let's ask a question: **'What happens if I terminate early?'**_
> _Notice the response is 100% grounded with source citations and a textual confidence rating of **'highly confident'**._
>
> _Now let's test a misleading question: **'What is the pet fee?'**_
> _Since pet fees are not mentioned in this lease, LegalEase-AI correctly responds with an **'Information Not Present'** banner and **'limited information'** rating, preventing hallucinations._
>
> _(Screen transitions to `/compare` page)_
> _"Now let's compare Version 1 with Version 2. LegalEase-AI performs a structural diff, highlighting Added clauses in green, Removed clauses in red, and Modified financial terms."_

---

### 3:30 – 4:00 | Responsible AI Guardrails & Conclusion

> _"Crucially, LegalEase-AI prioritizes Responsible AI:_
>
> - **Non-Advisory Guardrails:** Every AI output includes a mandatory educational legal disclaimer.
> - **Prompt Fencing:** Enforces `<document_content>` boundaries to block prompt injection attacks.
> - **Accessibility:** Built to WCAG 2.1 AA standards with full keyboard navigation and screen-reader support.
>
> _LegalEase-AI empowers everyone to read contracts with confidence. Thank you!"_

---

## Demo Backup & Contingency Plan

In the event of network disruption during live recording, all AI services include pre-configured rule-based grounded fallbacks ensuring 100% uptime and dynamic output display under all network conditions.
