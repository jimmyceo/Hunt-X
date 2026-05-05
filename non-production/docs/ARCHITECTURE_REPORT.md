# Hunt-X Architecture + Findings Report (G1 Gather)

## 1. Tech Stack Identification

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Frontend Framework** | Next.js (App Router) | 14.0.4 | Static export (`output: 'export'`) |
| **Frontend UI** | React + Tailwind CSS | React 18.2 | Dark theme-only, no shadcn/ui |
| **Backend Framework** | FastAPI | 0.104.1 | Python 3.11 |
| **ORM** | SQLAlchemy | 2.0.23 | SQLite in dev, PostgreSQL in prod |
| **Auth** | Custom JWT (python-jose) | 3.3.0 | bcrypt passwords, Bearer token |
| **Payments** | Stripe SDK | 7.10.0 | Placeholder keys currently |
| **AI Clients** | OpenAI + Anthropic | 1.3.0 / 0.8.0 | Fallback chain |
| **Job Scraping** | Apify + aiohttp | 1.6.0 / 3.9.0 | JSearch API |
| **Icons** | Lucide React | 0.294.0 | Used everywhere |
| **State Mgmt** | React Context | — | `subscription-context.tsx` |
| **Testing** | **NONE** | — | 0 frontend tests, 0 backend tests |

## 2. Frontend Page Inventory (13 pages)

| Page | Route | Backend API | Status |
|------|-------|-------------|--------|
| Landing | `/` | Static | Done |
| Auth | `/auth` | `/api/auth/login`, `/api/auth/register` | Done |
| Password Reset | `/auth/reset` | `/api/auth/forgot-password` | Done |
| Dashboard | `/dashboard` | `/api/auth/me`, `/api/cv/`, `/api/resume/` | Done |
| Upload | `/upload` | `/api/resume/upload` | Done |
| Generate | `/generate` | `/api/evaluate/`, `/api/cv/generate` | Done |
| Pricing | `/pricing` | Static | Done |
| Settings | `/settings` | `/api/auth/me` PUT | Done |
| Interview Prep | `/interview` | `/api/interview/prep` | Done |
| Cover Letters | `/cover-letters` | `/api/cover-letter/generate`, `/api/cover-letter/list` | Done |
| Job Search | `/jobs` | `/api/jobs/search`, `/api/jobs/scan` | Done |
| Application Tracker | `/applications` | **NONE** — localStorage only | Done |
| AI Career Coach | `/chat` | `/api/chat/start`, `/api/chat/{id}/ask` | Done |

**Missing pages:** My Documents, Resume Roaster, Profile Management

## 3. Backend Router Inventory (10 routers)

| Router | Prefix | Auth | Wired | Risk |
|--------|--------|------|-------|------|
| `auth.py` | `/api/auth` | Partial (public register/login) | Yes | Low |
| `resumes.py` | `/api/resume` | Yes (Bearer) | Yes | Low |
| `evaluation.py` | `/api/evaluate` | Yes (Bearer) | Yes | Low |
| `cv.py` | `/api/cv` | Yes (Bearer) | Yes | Low |
| `cover_letter.py` | `/api/cover-letter` | Yes (Bearer) | Yes | Low |
| `interview.py` | `/api/interview` | Yes (Bearer) | Yes | Low |
| `chat.py` | `/api/chat` | Yes (Bearer) | Yes | Low |
| `jobs.py` | `/api/jobs` | Yes (Bearer) | Yes | Low |
| `subscriptions.py` | `/api/subscriptions` | **NO AUTH** — raw user_id from body | Yes | **HIGH** |
| `payment_v2.py` | `/api/payment/v2` | Partial (webhooks public) | Yes | Medium |

## 4. Database Schema (15 tables)

| Entity | Model File | Relationships |
|--------|-----------|---------------|
| User | `user.py` | → resumes, evaluations, cvs, cover_letters, interview_preps, chat_sessions, saved_jobs, subscription |
| Resume | `resume.py` | ← user, → evaluations, cvs |
| Evaluation | `evaluation.py` | ← user, resume |
| CV | `cv.py` | ← user, evaluation |
| CoverLetter | `cover_letter.py` | ← user, evaluation |
| InterviewPrep | `interview_prep.py` | ← user, evaluation |
| ChatSession | `chat.py` | ← user |
| ChatMessage | `chat.py` | ← chat_session |
| ScrapedJob | `jobs.py` | — |
| SavedJob | `jobs.py` | ← user |
| SubscriptionPlan | `subscription.py` | → user_subscriptions |
| UserSubscription | `subscription.py` | ← user, plan |
| SubscriptionEvent | `subscription.py` | ← subscription |
| CreditBalance | `subscription.py` | — |
| UsageLog | `subscription.py` | — |

**Missing tables:** Profile, Application (for tracker backend), Feedback/Testimonial, Document (for My Documents), VoiceMockTest

## 5. Subscription / Pricing System

| Tier | Monthly | Yearly | Limits (from `models/enums.py`) |
|------|---------|--------|--------------------------------|
| **Free** | $0 | $0 | 1 CV, 2 uploads, 2 analyses, 0 cover letters, 0 interview prep |
| **Starter** | $9 | $90 | 10 CVs, 10 uploads, 10 analyses, 0 cover letters, 0 interview prep |
| **Pro** | $29 | $290 | Unlimited everything + API access |
| **Team** | $49 | $490 | Everything in Pro + team features |

**Critical Issue:** `subscriptions.py` accepts raw `user_id` from request body — no auth validation. Any authenticated user can query/modify any other user's subscription.

## 6. Auth Flow

```
1. POST /api/auth/register → creates user, returns JWT
2. POST /api/auth/login → validates password, returns JWT
3. Bearer token stored in localStorage ('token')
4. get_current_user() decodes JWT, fetches user from DB
5. No refresh token, no session expiry check on frontend
6. No "Remember me" — token always 24h expiry
7. No email verification
8. No Google OAuth
9. Password reset exists (token-based)
```

## 7. AI Pipeline

```
1. Resume Upload → OCR/parse text → store in DB
2. Job Description + Resume → EvaluationService → match score (1-5)
3. Evaluation + Resume → CVService → tailored CV (HTML + PDF)
4. Evaluation + Resume → CoverLetterService → cover letter (HTML + PDF)
5. Evaluation + Resume → InterviewService → STAR stories, red flags, case study, Q&A
6. Resume + Job Description → ChatAssistService → contextual Q&A
```

**AI Client:** `ai_client.py` with `AIClient` class. Methods: `query()`, `query_json()`. Recently added aliases: `generate()`, `generate_json()`.

## 8. Key Configuration Files

| File | Purpose | Issue |
|------|---------|-------|
| `railway.json` | Railway deploy config | OK |
| `Dockerfile` | Docker build | OK |
| `next.config.js` | Next.js static export | OK |
| `frontend/src/lib/api.ts` | API client | OK, comprehensive |
| `frontend/src/lib/subscription-context.tsx` | Subscription state | OK, but fetches user twice per check |
| `backend/dependencies.py` | FastAPI deps | OK |
| `backend/models/enums.py` | Plan configs | **Does not match user's requested plans** |

## 9. Current Error While Signing In

From previous conversation: CORS errors on new deployment. Fixed by adding Vercel URL to Railway CORS origins.

Potential remaining auth issues:
- No email verification → users can register with fake emails
- No rate limiting on login → brute force possible
- `SECRET_KEY` is placeholder in production
- No "Remember me" option

## 10. Testing Infrastructure

| Type | Count | Framework | Status |
|------|-------|-----------|--------|
| Frontend unit tests | 0 | None | **MISSING** |
| Frontend e2e tests | 0 | None | **MISSING** |
| Backend unit tests | 0 | None | **MISSING** |
| Backend integration tests | 0 | None | **MISSING** |

## 11. SEO / AI-Friendliness

| Item | Status |
|------|--------|
| Meta title/description | Present in layout.tsx |
| OpenGraph tags | Partial (layout.tsx) |
| Twitter cards | Partial (layout.tsx) |
| Canonical URLs | **MISSING** |
| Sitemap | **MISSING** |
| robots.txt | **MISSING** |
| Schema.org structured data | **MISSING** |
| Per-page metadata | **MISSING** (only root layout has meta) |
| LLM-readable headings | Good on landing page |
| FAQ section | Present on landing + pricing |

## 12. Deployment Status

| Component | URL | Status |
|------------|-----|--------|
| Frontend (Vercel) | `https://frontend-jd5kadfoz-tunexa.vercel.app` | Live |
| Backend (Railway) | `https://hunt-x-production-2954.up.railway.app` | Live |

## 13. Missing Infrastructure for Requested Features

| Feature | What's Missing |
|---------|---------------|
| **My Documents** | No page, no consolidated document API |
| **Profile System** | No Profile model, no profile router |
| **Google OAuth** | No OAuth config, no Google client ID |
| **Email Verification** | No email service, no verification token flow |
| **Remember Me** | No token expiry variant, no checkbox |
| **Application Tracker Backend** | No Application model, no router |
| **Feedback/Testimonials** | No Feedback model, no admin review flow |
| **Resume Roaster** | No service, no prompt, no router |
| **Voice Mock Tests** | No voice infra, no recording/upload |
| **Settings (full SaaS)** | Missing billing, sessions, preferences tabs |
| **Priority Support $69** | No support ticket model, no checkout for this tier |
| **Tests** | No test framework configured |

## 14. Risk Register (Pre-Implementation)

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **0 tests** — any change can break unknown paths | CRITICAL | Add test framework + smoke tests before any feature work |
| 2 | **subscriptions.py has no auth** — any user can modify any subscription | CRITICAL | Fix auth BEFORE implementing billing features |
| 3 | **Stripe keys are placeholders** — payments won't work | HIGH | Replace with real keys in Railway env vars |
| 4 | **Application Tracker localStorage only** — data loss on clear | MEDIUM | Add backend model + sync |
| 5 | **No DB migrations** — schema changes risky | MEDIUM | Use Alembic or manual migration scripts |
| 6 | **Next.js static export** — no server-side features | MEDIUM | Limits dynamic rendering, API routes |
| 7 | **User.tier is legacy string** — conflicts with SubscriptionTier enum | MEDIUM | Reconcile old tier field with new subscription system |
| 8 | **Chat context stored in memory** — lost on redeploy | LOW | Acceptable for MVP; add Redis later |
| 9 | **No rate limiting** — API abuse possible | MEDIUM | Add rate limiter middleware |
| 10 | **No input validation on frontend** — XSS/CSRF vectors | MEDIUM | Add sanitization |

---

**G1 Complete.** Ready for G2 Ground (Risk Register + Safety Net).
