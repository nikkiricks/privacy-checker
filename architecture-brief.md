# Software Architecture Brief: Privacy Checker

## Executive Summary

Privacy Checker is currently a **client-side only web application** built with vanilla JavaScript, HTML, and CSS. This document outlines the current architecture and provides recommendations for scaling to support user accounts, API access, and enterprise features.

**Current Architecture:** Static web app (no backend)
**Target Architecture:** Hybrid static frontend + lightweight backend for premium features
**Timeline:** 6-12 months for full migration

---

## Current Architecture (v0.1.0)

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                   │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────────────────┐ │
│  │  index.html  │  │   Policy Analyzer Logic    │ │
│  │  styles.css  │  │  (lib/policy-analyzer.js)  │ │
│  │   app.js     │  │                             │ │
│  └──────────────┘  └─────────────────────────────┘ │
│                                                     │
│  Local Storage (optional for future enhancement)  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Static File Hosting  │
            │  (Netlify/Surge/GH)   │
            └───────────────────────┘
```

### Technology Stack

**Frontend:**
- HTML5 - Semantic markup, file upload API
- CSS3 - Grid/Flexbox layouts, responsive design
- Vanilla JavaScript (ES6+) - No framework dependencies

**Hosting:**
- Netlify (preferred) or Surge.sh
- GitHub Pages (alternative)
- Any static file host

**Build Process:**
- None required - direct deployment of source files
- Optional: Future addition of bundler (Vite, Parcel) for optimization

### Key Components

#### 1. PolicyAnalyzer Class (`lib/policy-analyzer.js`)
**Purpose:** Core GDPR compliance analysis engine

**Methods:**
- `analyze(policyText)` - Performs 15+ GDPR checks on input text
- `calculateScore(checks)` - Weighted scoring algorithm

**Algorithm:**
- Keyword-based pattern matching for GDPR requirements
- Priority weighting: High (3x), Medium (2x), Low (1x)
- Returns structured check objects with status, description, fixes

**Extensibility:**
- Modular check system - easy to add new compliance frameworks
- Keyword arrays can be externalized to JSON for easier updates

#### 2. Application Logic (`app.js`)
**Purpose:** UI orchestration and user interactions

**Key Functions:**
- Tab management (Website Scan vs Policy Analysis)
- File upload handling (FileReader API)
- Results rendering and visualization
- HTML report generation and export

**Event Flow:**
```
User pastes/uploads policy
       ↓
handlePolicyAnalysis()
       ↓
PolicyAnalyzer.analyze(text)
       ↓
calculateScore(checks)
       ↓
displayResults(results)
       ↓
User exports HTML report
```

#### 3. UI Layer (`index.html`, `styles.css`)
**Purpose:** User interface and styling

**Features:**
- Tabbed interface
- File upload + textarea input
- Results visualization (score circle, categorized checks)
- Export functionality

### Data Flow

```
┌──────────────┐
│ User Input   │
│ (Policy Text)│
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  PolicyAnalyzer      │
│  - Keyword matching  │
│  - GDPR checks      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Check Results       │
│  {id, status, desc}  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Score Calculation   │
│  Weighted algorithm  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  UI Rendering        │
│  Category grouping   │
└──────────────────────┘
```

### Current Limitations

1. **No persistence** - Each analysis is ephemeral
2. **No user accounts** - Cannot track history or save results
3. **No API** - Cannot integrate with other platforms
4. **Limited analytics** - No usage tracking (by design for privacy)
5. **Website scanning disabled** - CORS prevents external site analysis
6. **Manual updates** - GDPR requirements hardcoded in JavaScript

---

## Proposed Future Architecture

### Phase 1: User Accounts & History (Months 1-3)

**Goal:** Enable users to save analysis history and track changes over time

**New Components:**

```
┌─────────────────────────────────────────────────────┐
│                 Frontend (React/Vue)                 │
│  - Static site + client-side routing                │
│  - Enhanced UI for history, comparisons             │
└─────────────┬───────────────────────────────────────┘
              │ HTTPS/REST API
              ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (Node.js/Python)           │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Auth Service │  │ Analysis API │                │
│  │  (JWT/OAuth) │  │              │                │
│  └──────────────┘  └──────────────┘                │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│              Database (PostgreSQL)                   │
│  - Users, Analyses, Reports                         │
└─────────────────────────────────────────────────────┘
```

**Technology Recommendations:**

Backend:
- **Node.js + Express** or **Python + FastAPI**
  - Rationale: Lightweight, fast development, good for APIs
- **PostgreSQL** for relational data
  - Schema: users, analyses, policy_versions, reports
- **Redis** for session management and caching

Authentication:
- **Auth0** or **Supabase Auth** (managed service)
- JWT tokens for API access

Hosting:
- Frontend: Netlify/Vercel (static)
- Backend: Railway, Render, or AWS ECS
- Database: Supabase or Neon (managed Postgres)

**Database Schema (Initial):**

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analyses
CREATE TABLE analyses (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    policy_text TEXT,
    score INTEGER,
    checks JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys (for developers)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    key_hash VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 2: API & Integrations (Months 4-6)

**Goal:** Provide API access for third-party integrations

**API Design:**

```
POST /api/v1/analyze
Headers: Authorization: Bearer {token}
Body: {
  "policyText": "...",
  "options": {
    "frameworks": ["gdpr", "ccpa"],
    "format": "json|html"
  }
}

Response: {
  "score": 85,
  "checks": [...],
  "timestamp": "2024-10-17T...",
  "analysisId": "uuid"
}

GET /api/v1/analyses
GET /api/v1/analyses/{id}
DELETE /api/v1/analyses/{id}
GET /api/v1/usage (for API tier limits)
```

**Rate Limiting:**
- Free: 10 requests/day
- Pro: 100 requests/day
- Enterprise: Custom limits

**Webhooks (optional):**
- Notify when policy score drops below threshold
- Alert on new GDPR requirement additions

### Phase 3: AI/ML Enhancement (Months 7-12)

**Goal:** Improve analysis accuracy beyond keyword matching

**AI Components:**

1. **NLP for Context Understanding**
   - Use embeddings to understand semantic meaning
   - Detect GDPR requirements even with varied phrasing
   - Technologies: OpenAI API, Hugging Face transformers

2. **Policy Comparison Engine**
   - Identify changes between policy versions
   - Highlight newly added/removed clauses
   - Track compliance drift over time

3. **Recommendation Engine**
   - Suggest specific policy text improvements
   - Provide templates for missing sections
   - Learn from high-scoring policies

**Architecture Addition:**

```
┌─────────────────────────────────────────┐
│        AI/ML Service Layer              │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ NLP Analysis │  │ Text Generation │ │
│  │ (OpenAI API) │  │ (GPT/Claude)    │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
```

### Phase 4: Enterprise Features (Months 12+)

**Features:**
- Multi-user organizations
- Role-based access control (RBAC)
- Custom compliance frameworks
- SSO integration (SAML/OAuth)
- Audit logs
- White-label deployment

**Architecture:**

```
┌──────────────────────────────────────────────────────┐
│              Multi-tenant Architecture                │
│                                                       │
│  Organization 1    Organization 2    Organization N  │
│       ↓                  ↓                  ↓         │
│   [Users/Roles]      [Users/Roles]     [Users/Roles] │
└──────────────────────────────────────────────────────┘
```

---

## Technical Decisions & Rationale

### Decision 1: Keep Core Analysis Client-Side
**Rationale:**
- Privacy preservation (no data sent to servers for free tier)
- Zero infrastructure costs for free users
- Instant results (no network latency)
- Can still work offline
- Marketing advantage ("Your data never leaves your browser")

**Implementation:**
- Continue using vanilla JS for core analyzer
- Optionally bundle with Rollup/Vite for optimization
- Consider WebAssembly port for performance if needed

### Decision 2: Hybrid Architecture for Paid Tiers
**Rationale:**
- Free users: Client-side only (current behavior)
- Paid users: Optional backend for history, API access
- Best of both worlds: privacy + features

### Decision 3: Framework Choice (Frontend)
**Recommendation:** Start with **Svelte** or stick with **Vanilla JS + Web Components**

**Svelte Pros:**
- Compiles to vanilla JS (small bundle size)
- Easy migration from vanilla JS
- Great performance
- Simple state management

**Vanilla JS + Web Components Pros:**
- No framework lock-in
- Already using vanilla JS
- Future-proof standards
- Easier for contributors

**Recommendation:** Stick with vanilla JS for now, consider Svelte only if complexity increases significantly

### Decision 4: Database Choice
**Recommendation:** PostgreSQL via **Supabase**

**Rationale:**
- Supabase includes: Database + Auth + Storage + Realtime
- One platform for multiple needs
- Generous free tier
- Easy migration to self-hosted if needed
- Good TypeScript support

**Alternative:** **PlanetScale** (MySQL) if scaling concerns arise

### Decision 5: Deployment Strategy
**Recommendation:**
- Frontend: **Vercel** or **Netlify**
- Backend: **Railway** or **Render**

**Rationale:**
- Railway: Simple, good free tier, easy Postgres integration
- Render: Similar to Railway, good for both frontend + backend
- Vercel: Serverless functions for lightweight API endpoints

---

## Performance Considerations

### Current Performance
- **Load Time:** <1s (small HTML/CSS/JS bundle)
- **Analysis Time:** <100ms for typical policy (5000 words)
- **Bottleneck:** DOM rendering for large result sets

### Optimization Opportunities

1. **Code Splitting**
   - Lazy load PolicyAnalyzer only when needed
   - Separate export functionality

2. **Web Workers**
   - Move analysis to background thread
   - Prevents UI blocking on large policies

3. **Caching**
   - Cache analysis results in localStorage
   - Debounce analysis on textarea input

4. **Virtualization**
   - Use virtual scrolling for large check lists
   - Render only visible checks

### Scalability Targets

**Frontend:**
- Support policies up to 100,000 words
- Results rendering in <500ms
- Smooth 60fps interactions

**Backend (Future):**
- 1000 requests/second API capacity
- <200ms p95 latency
- 99.9% uptime SLA

---

## Security Architecture

### Current Security Posture
✅ **Strengths:**
- No backend = no database to breach
- No user data collection
- No cookies or tracking
- Client-side only = no CORS issues

⚠️ **Considerations:**
- No input sanitization (currently not needed, but consider for future)
- Exported HTML reports have inline styles (safe but could use CSP)

### Future Security Requirements

**Authentication:**
- OAuth 2.0 / OIDC for user login
- JWT tokens with short expiration (15 min)
- Refresh token rotation
- MFA support for enterprise

**API Security:**
- Rate limiting (per IP + per API key)
- API key rotation
- Request signing for webhooks
- CORS configuration

**Data Protection:**
- Encryption at rest (database)
- Encryption in transit (TLS 1.3)
- Policy text retention limits (30-90 days)
- GDPR-compliant data deletion

**Compliance:**
- SOC 2 Type II (for enterprise tier)
- GDPR compliance for own data handling
- Regular security audits
- Penetration testing

---

## Infrastructure & DevOps

### Current Setup
- **Repository:** Git (local)
- **CI/CD:** None (manual deployment)
- **Monitoring:** None

### Recommended Setup

**Version Control:**
- GitHub/GitLab for code hosting
- Branch protection for main
- Pull request reviews required
- Semantic versioning

**CI/CD Pipeline:**
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Git Push    │ --> │ Run Tests    │ --> │ Deploy Prod │
│ to main     │     │ Lint, Build  │     │ (Vercel)    │
└─────────────┘     └──────────────┘     └─────────────┘
```

**Tools:**
- **GitHub Actions** for CI/CD
- **Vitest** or **Jest** for testing
- **ESLint + Prettier** for code quality
- **Sentry** for error tracking
- **Plausible** or **PostHog** for privacy-friendly analytics

**Monitoring:**
- **Uptime Robot** or **Better Uptime** for availability
- **Sentry** for error tracking
- **LogRocket** (optional) for session replay
- **Prometheus + Grafana** (if self-hosting backend)

**Testing Strategy:**
- Unit tests for PolicyAnalyzer (aim for 80%+ coverage)
- Integration tests for API endpoints
- E2E tests with Playwright for critical user flows
- Visual regression testing (Percy, Chromatic)

---

## Migration Path (Current → Future)

### Step 1: Improve Current Codebase (2-4 weeks)
- Add unit tests for PolicyAnalyzer
- Set up CI/CD with GitHub Actions
- Add error tracking (Sentry)
- Optimize bundle size (Vite)
- Add basic analytics (Plausible)

### Step 2: Add User Accounts (4-6 weeks)
- Integrate Supabase Auth
- Create user dashboard (saved analyses)
- Implement history tracking
- Build subscription/payment system (Stripe)

### Step 3: Build API Layer (6-8 weeks)
- Design REST API
- Implement rate limiting
- Create API key management
- Write API documentation (Swagger/OpenAPI)
- Build client SDKs (JS, Python)

### Step 4: Enhance Analysis (8-12 weeks)
- Integrate AI/NLP for better accuracy
- Add more compliance frameworks (CCPA, LGPD)
- Build policy comparison features
- Implement recommendation engine

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk 1: Analysis Accuracy**
- Impact: HIGH - Incorrect results harm trust
- Mitigation: Legal expert validation, comprehensive test suite, user feedback loops

**Risk 2: Scaling Costs**
- Impact: MEDIUM - Unexpected backend costs
- Mitigation: Keep free tier client-side only, monitor usage closely, set hard limits

**Risk 3: API Abuse**
- Impact: MEDIUM - Malicious actors could spam API
- Mitigation: Rate limiting, CAPTCHA, API key revocation, monitoring

**Risk 4: Data Privacy Breach**
- Impact: HIGH - Ironic for a privacy tool
- Mitigation: Minimize data collection, encryption, regular audits, compliance certifications

### Technical Debt Concerns

**Current Debt:**
- No test coverage
- No CI/CD
- Hardcoded GDPR checks (not externalized)
- No error handling for edge cases

**Repayment Plan:**
- Month 1: Add tests + CI/CD
- Month 2: Externalize checks to JSON
- Month 3: Comprehensive error handling

---

## Appendix: Code Quality Standards

### JavaScript Style Guide
- ES6+ features preferred
- Async/await over promises
- Destructuring for cleaner code
- Descriptive variable names
- JSDoc comments for public methods

### File Structure (Proposed)
```
privacy-checker/
├── public/              # Static assets
├── src/
│   ├── components/      # UI components
│   ├── lib/
│   │   ├── analyzer.js  # Core analysis
│   │   ├── checks/      # Individual GDPR checks
│   │   └── utils.js     # Helper functions
│   ├── styles/          # CSS modules
│   └── main.js          # Entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                # Documentation
└── .github/workflows/   # CI/CD
```

### Recommended Design Patterns
- **Module Pattern** for encapsulation
- **Factory Pattern** for creating check objects
- **Observer Pattern** for event handling
- **Strategy Pattern** for different compliance frameworks

---

## Questions for Software Architect

1. **Framework Decision**: Should we stick with vanilla JS or migrate to a framework (Svelte/React)?
2. **Backend Language**: Node.js or Python for API layer?
3. **Database Sharding**: How to handle multi-tenancy at scale?
4. **AI Integration**: Should AI analysis happen client-side (WASM) or server-side?
5. **Caching Strategy**: Redis, CloudFlare, or both?
6. **Real-time Features**: Do we need WebSockets for live collaboration?
7. **Mobile Strategy**: PWA or native apps?
8. **Internationalization**: How to handle multi-language support?

---

**Document Version:** 1.0
**Last Updated:** October 17, 2024
**Author:** Technical Team
**Status:** Draft for Review
