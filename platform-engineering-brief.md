# Platform Engineering Brief: Privacy Checker

## Executive Summary

This document provides platform engineering requirements, infrastructure specifications, and deployment guidelines for scaling Privacy Checker from a static web app to a production SaaS platform.

**Current State:** Static website (Netlify/Surge hosting)
**Target State:** Multi-tier SaaS platform with API access, user accounts, and enterprise features
**Timeline:** 12-month roadmap

---

## Current Infrastructure (v0.1.0)

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│         CDN / Edge Network              │
│         (Netlify/Cloudflare)            │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         Static File Storage             │
│  - index.html                           │
│  - styles.css                           │
│  - app.js                               │
│  - lib/policy-analyzer.js               │
└─────────────────────────────────────────┘
```

### Current Hosting Configuration

**Primary:** Netlify
- Repository: GitHub (to be created)
- Build command: None (direct file deployment)
- Publish directory: `/` (root)
- Custom domain: TBD (currently using netlify.app subdomain)

**Configuration Files:**

`netlify.toml`:
```toml
[build]
  publish = "."
  command = "echo 'No build required'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### DNS Configuration (Future)
```
Type    Name                Value                   TTL
A       @                   <Netlify IP>            3600
CNAME   www                 <netlify-site>.netlify.app  3600
TXT     @                   "v=spf1 ~all"           3600
```

### Current Resource Usage
- **Bandwidth:** <1GB/month (estimated for initial traffic)
- **Storage:** <1MB (static files)
- **Build minutes:** 0 (no build process)
- **Cost:** $0 (Netlify free tier)

---

## Phase 1: Enhanced Static Deployment (Months 1-2)

### Objectives
- Set up proper CI/CD pipeline
- Add monitoring and analytics
- Implement CDN optimization
- Configure custom domain

### Infrastructure Changes

**Additions:**
1. **GitHub Actions** for CI/CD
2. **Sentry** for error tracking
3. **Plausible Analytics** for privacy-friendly stats
4. **Cloudflare** for DNS + additional CDN layer

### CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

      - name: Lint code
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: '.'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Monitoring Setup

**Sentry Configuration:**

```javascript
// Add to app.js
import * as Sentry from "@sentry/browser";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "https://your-dsn@sentry.io/project-id",
    environment: "production",
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Don't send policy text to Sentry (privacy)
      if (event.request?.data) {
        delete event.request.data.policyText;
      }
      return event;
    }
  });
}
```

**Plausible Analytics:**

```html
<!-- Add to index.html before </head> -->
<script defer data-domain="privacychecker.com" src="https://plausible.io/js/script.js"></script>
```

### Performance Optimization

**Lighthouse Score Targets:**
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 95+

**Optimizations:**
1. Minify JS/CSS (using Vite or esbuild)
2. Enable gzip/brotli compression
3. Add resource hints (preconnect, prefetch)
4. Optimize font loading (font-display: swap)
5. Add service worker for offline support

### Costs (Phase 1)
- Netlify: $0 (free tier sufficient)
- Sentry: $0 (free tier: 5k events/month)
- Plausible: $9/month or self-host ($0)
- **Total: $0-9/month**

---

## Phase 2: Backend Infrastructure (Months 3-6)

### Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    Cloudflare CDN                    │
└─────────┬────────────────────────────────────┬───────┘
          │                                    │
          ▼                                    ▼
┌─────────────────────┐            ┌──────────────────┐
│  Static Frontend    │            │   API Gateway    │
│  (Vercel/Netlify)   │            │   (Railway)      │
└─────────────────────┘            └────────┬─────────┘
                                            │
                    ┌───────────────────────┼───────────────┐
                    ▼                       ▼               ▼
          ┌──────────────────┐   ┌─────────────┐  ┌────────────┐
          │  Auth Service    │   │  API Server │  │  Workers   │
          │  (Supabase)      │   │  (Node.js)  │  │  (Async)   │
          └──────────────────┘   └──────┬──────┘  └────────────┘
                                        │
                    ┌───────────────────┼───────────────┐
                    ▼                   ▼               ▼
          ┌──────────────┐    ┌────────────┐  ┌────────────────┐
          │  PostgreSQL  │    │   Redis    │  │  Object Storage│
          │  (Supabase)  │    │  (Upstash) │  │  (S3/R2)       │
          └──────────────┘    └────────────┘  └────────────────┘
```

### Component Specifications

#### 1. API Server

**Technology:** Node.js 20 LTS + Express.js

**Hosting:** Railway or Render
- Auto-scaling: 1-5 instances
- Memory: 512MB - 2GB per instance
- CPU: 0.5 - 2 vCPUs
- Region: US-West (primary), EU-West (future)

**Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# API
API_SECRET_KEY=...
JWT_SECRET=...
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# External Services
SENTRY_DSN=...
OPENAI_API_KEY=... (for AI features)

# Feature Flags
ENABLE_AI_ANALYSIS=false
ENABLE_WEBHOOKS=false
```

**API Structure:**

```javascript
// src/server.js
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
import analyzeRoutes from './routes/analyze.js';
import userRoutes from './routes/users.js';
import apiKeyRoutes from './routes/api-keys.js';

app.use('/api/v1/analyze', analyzeRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/api-keys', apiKeyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
```

#### 2. Database (PostgreSQL)

**Hosting:** Supabase (managed Postgres)
- Plan: Pro ($25/month)
- Storage: 8GB (expandable to 100GB)
- Connection pooling: PgBouncer (included)
- Backups: Daily automatic backups
- Region: us-west-1

**Schema:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- Supplementary user data
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    company_name VARCHAR(255),
    analysis_count INTEGER DEFAULT 0,
    api_quota INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_text TEXT NOT NULL,
    policy_hash VARCHAR(64), -- SHA256 for deduplication
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    checks JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_score ON analyses(score);
CREATE INDEX idx_analyses_hash ON analyses(policy_hash);

-- API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL, -- bcrypt hash
    key_prefix VARCHAR(20) NOT NULL, -- First 8 chars for identification
    usage_count INTEGER DEFAULT 0,
    rate_limit INTEGER DEFAULT 100,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- API Usage Tracking
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255),
    response_time_ms INTEGER,
    status_code INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for efficient querying
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan VARCHAR(20),
    status VARCHAR(50),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own analyses" ON analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses" ON analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analyses
    FOR DELETE USING (auth.uid() = user_id);
```

**Database Migrations:**

Use a migration tool: **Prisma** or **Supabase CLI**

```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy
```

#### 3. Caching Layer (Redis)

**Hosting:** Upstash (serverless Redis)
- Plan: Free tier → Pro ($10/month)
- Max commands: 10,000/day (free) → unlimited (pro)
- Max storage: 256MB → 1GB
- Regions: Global edge network

**Use Cases:**
1. **Session storage** (JWT refresh tokens)
2. **Rate limiting** (track API calls per key)
3. **Analysis caching** (cache results by policy hash)
4. **Leaderboard** (top users, popular policies)

**Configuration:**

```javascript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache analysis result
async function cacheAnalysis(policyHash, result) {
  await redis.setex(
    `analysis:${policyHash}`,
    3600, // 1 hour TTL
    JSON.stringify(result)
  );
}

// Rate limiting
async function checkRateLimit(apiKey, limit = 100, window = 60) {
  const key = `ratelimit:${apiKey}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  return current <= limit;
}
```

#### 4. Object Storage (Optional for Future)

**Hosting:** Cloudflare R2 (S3-compatible, zero egress fees)

**Use Cases:**
- Store exported HTML reports
- Archive old analyses (>90 days)
- User-uploaded policy documents

**Cost:** $0.015/GB storage + $4.50/million Class A operations

#### 5. Background Jobs

**Technology:** BullMQ (Redis-based job queue)

**Jobs:**
1. **Email notifications** (analysis complete, low score alerts)
2. **Webhook delivery** (for enterprise customers)
3. **Usage reporting** (daily/monthly summaries)
4. **Data cleanup** (delete old analyses per retention policy)

**Worker Configuration:**

```javascript
// worker.js
import { Worker } from 'bullmq';
import { sendEmail } from './services/email.js';

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

// Email worker
const emailWorker = new Worker('email', async job => {
  const { to, subject, body } = job.data;
  await sendEmail(to, subject, body);
}, { connection });

// Webhook worker
const webhookWorker = new Worker('webhook', async job => {
  const { url, payload } = job.data;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}, { connection });
```

### Load Balancing & Auto-scaling

**Railway Configuration:**

```yaml
# railway.toml
[build]
  builder = "nixpacks"

[deploy]
  replicas = 1 # Start with 1, scale to 5
  healthcheckPath = "/health"
  healthcheckTimeout = 30
  restartPolicyType = "on-failure"

[scaling]
  minReplicas = 1
  maxReplicas = 5
  cpuThreshold = 70
  memoryThreshold = 80
```

**Auto-scaling Triggers:**
- CPU usage > 70% for 5 minutes → scale up
- Memory usage > 80% for 5 minutes → scale up
- Request queue depth > 100 → scale up
- CPU usage < 30% for 10 minutes → scale down

### Costs (Phase 2)

| Service           | Plan          | Cost/Month |
|-------------------|---------------|------------|
| Railway (API)     | Pro           | $20-100    |
| Supabase          | Pro           | $25        |
| Upstash (Redis)   | Pro           | $10        |
| Cloudflare R2     | Pay-as-you-go | $5-20      |
| **Total**         |               | **$60-155**|

---

## Phase 3: Production Readiness (Months 7-9)

### High Availability Setup

**Multi-Region Deployment:**

```
Primary Region: US-West (Oregon)
Secondary Region: EU-West (Ireland)

┌────────────────────┐         ┌────────────────────┐
│   US-West          │         │   EU-West          │
│   - API (primary)  │  <--->  │   - API (replica)  │
│   - DB (primary)   │   Sync  │   - DB (replica)   │
└────────────────────┘         └────────────────────┘
         │                              │
         └──────────────┬───────────────┘
                        ▼
              ┌──────────────────┐
              │  Global CDN      │
              │  (Cloudflare)    │
              └──────────────────┘
```

**Database Replication:**
- Supabase Read Replicas (add $25/month per replica)
- Async replication from primary to secondary
- Read queries routed to nearest replica

**Failover Strategy:**
1. Health checks every 30 seconds
2. If primary fails, Cloudflare routes to secondary
3. Database fails over to read replica (promoted to primary)
4. Alerts sent via PagerDuty

### Disaster Recovery

**Backup Strategy:**
1. **Database:** Automated daily backups (Supabase), retained 30 days
2. **Redis:** Daily snapshots to S3
3. **Code:** GitHub (git history)
4. **Configuration:** Encrypted backups in 1Password or Vault

**Recovery Time Objectives:**
- **RTO (Recovery Time Objective):** 1 hour
- **RPO (Recovery Point Objective):** 1 hour (max data loss)

**Disaster Recovery Plan:**

```bash
# 1. Restore database from backup
supabase db restore --backup-id <backup-id>

# 2. Deploy API from last known good commit
git checkout <commit-hash>
railway up

# 3. Verify health
curl https://api.privacychecker.com/health

# 4. Update DNS if needed (manual failover)
cloudflare dns update A api.privacychecker.com <new-ip>
```

### Monitoring & Alerting

**Observability Stack:**

1. **Metrics:** Prometheus + Grafana
2. **Logs:** Loki or Better Stack
3. **Traces:** Sentry Performance
4. **Uptime:** Better Uptime ($20/month)
5. **Alerts:** PagerDuty ($21/user/month)

**Key Metrics to Track:**

```javascript
// Prometheus metrics
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Request counter
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Response time
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Analysis score distribution
const analysisScores = new Histogram({
  name: 'analysis_score',
  help: 'Distribution of analysis scores',
  buckets: [0, 20, 40, 60, 80, 100],
});

// Active users
const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

**Alert Rules:**

| Alert               | Condition                    | Severity | Action        |
|---------------------|------------------------------|----------|---------------|
| API Down            | Health check fails 3x        | Critical | Page on-call  |
| High Error Rate     | Error rate > 5% for 5 min    | High     | Slack alert   |
| Slow Response       | p95 latency > 2s for 10 min  | Medium   | Slack alert   |
| Database CPU        | CPU > 80% for 5 min          | High     | Auto-scale    |
| Disk Space Low      | <10% free space              | High     | Slack alert   |
| Daily Active Users  | Drop > 50% vs 7-day avg      | Medium   | Email team    |

**Grafana Dashboards:**
1. **API Performance** (requests/sec, latency, errors)
2. **Database Health** (connections, queries/sec, slow queries)
3. **User Analytics** (signups, analyses, conversions)
4. **Business Metrics** (MRR, churn, API usage)

### Security Hardening

**API Security:**
1. **Rate Limiting:** 100 req/15min per IP (free), custom for paid
2. **DDoS Protection:** Cloudflare (included in pro plan)
3. **WAF Rules:** Block SQL injection, XSS attempts
4. **API Key Rotation:** Force rotation every 90 days (enterprise)
5. **IP Whitelisting:** Optional for enterprise customers

**Database Security:**
1. **Row Level Security (RLS):** Enabled on all tables
2. **Connection Pooling:** PgBouncer (max 100 connections)
3. **SSL/TLS:** Required for all connections
4. **Audit Logging:** Track all schema changes
5. **Secrets Management:** Vault or AWS Secrets Manager

**Compliance:**
1. **SOC 2 Type II:** Engage auditor (Vanta, Drata)
2. **GDPR:** Data Processing Agreement (DPA) template
3. **Penetration Testing:** Annual pentest (required for enterprise)
4. **Vulnerability Scanning:** Snyk for dependencies, Trivy for containers

### Costs (Phase 3)

| Service              | Cost/Month |
|----------------------|------------|
| Better Uptime        | $20        |
| PagerDuty (2 users)  | $42        |
| Grafana Cloud        | $49        |
| Vanta (SOC 2)        | $300       |
| **Additional Total** | **$411**   |

---

## Phase 4: Enterprise & Scale (Months 10-12)

### Multi-Tenancy Architecture

**Organization Structure:**

```sql
-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL,
    max_users INTEGER DEFAULT 5,
    max_analyses_per_month INTEGER DEFAULT 1000,
    custom_domain VARCHAR(255),
    sso_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE organization_members (
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    PRIMARY KEY (org_id, user_id)
);

-- Update analyses to support orgs
ALTER TABLE analyses ADD COLUMN org_id UUID REFERENCES organizations(id);
CREATE INDEX idx_analyses_org_id ON analyses(org_id);
```

**SSO Integration (SAML 2.0):**

Use **WorkOS** or **Auth0** for enterprise SSO:

```javascript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

// SSO login
app.get('/auth/sso', async (req, res) => {
  const { organization } = req.query;

  const authorizationUrl = workos.sso.getAuthorizationURL({
    organization,
    redirectURI: 'https://app.privacychecker.com/auth/callback',
    clientID: process.env.WORKOS_CLIENT_ID,
  });

  res.redirect(authorizationUrl);
});
```

**Cost:** WorkOS starts at $125/month for SSO

### Global Edge Deployment

**Cloudflare Workers:**
Deploy lightweight API endpoints to the edge (150+ locations):

```javascript
// cloudflare-worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cache analysis results at the edge
    if (url.pathname.startsWith('/api/v1/analyze')) {
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        return cachedResponse;
      }

      // Forward to origin
      const response = await fetch(request);

      // Cache for 1 hour if successful
      if (response.ok) {
        const cacheResponse = response.clone();
        cacheResponse.headers.set('Cache-Control', 'max-age=3600');
        await cache.put(cacheKey, cacheResponse);
      }

      return response;
    }

    // Pass through to origin
    return fetch(request);
  }
};
```

**Cost:** Cloudflare Workers free tier: 100k requests/day

### Kubernetes (Optional for Large Scale)

**When to migrate to Kubernetes:**
- Sustained traffic > 10,000 requests/second
- Need complex orchestration (multiple services)
- Multi-region active-active deployment

**Managed Kubernetes Options:**
1. **GKE (Google):** $0.10/hour per cluster + nodes
2. **EKS (AWS):** $0.10/hour per cluster + nodes
3. **DigitalOcean K8s:** Free control plane + $12/month per node

**Sample Deployment:**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: privacy-checker-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: privacy-checker-api
  template:
    metadata:
      labels:
        app: privacy-checker-api
    spec:
      containers:
      - name: api
        image: privacy-checker/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: privacy-checker-api
spec:
  selector:
    app: privacy-checker-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Cost Projections by Scale

| Users/Month | API Requests | Infrastructure Cost | Total Cost/Month |
|-------------|--------------|---------------------|------------------|
| 1,000       | 10k          | $60                 | $60              |
| 10,000      | 100k         | $150                | $150             |
| 100,000     | 1M           | $500                | $500             |
| 1,000,000   | 10M          | $2,500              | $2,500           |

---

## Deployment Checklist

### Pre-Launch

- [ ] Set up GitHub repository (public or private)
- [ ] Configure GitHub Actions CI/CD
- [ ] Set up Netlify/Vercel for frontend
- [ ] Configure custom domain + SSL
- [ ] Set up Sentry error tracking
- [ ] Add Plausible analytics
- [ ] Write deployment documentation
- [ ] Create runbook for common issues

### Phase 1 Launch (Static Site)

- [ ] Deploy to Netlify production
- [ ] Configure DNS records
- [ ] Enable HTTPS
- [ ] Test in multiple browsers
- [ ] Run Lighthouse audit (score > 90)
- [ ] Set up uptime monitoring
- [ ] Verify analytics tracking
- [ ] Create status page (status.privacychecker.com)

### Phase 2 Launch (Backend)

- [ ] Deploy database (Supabase)
- [ ] Deploy API server (Railway)
- [ ] Set up Redis (Upstash)
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Test API endpoints (Postman/Insomnia)
- [ ] Set up rate limiting
- [ ] Configure CORS
- [ ] Enable API authentication
- [ ] Deploy background workers
- [ ] Set up monitoring dashboards
- [ ] Configure alerts
- [ ] Run load tests (k6, Artillery)
- [ ] Create API documentation (Swagger)

### Phase 3 Launch (Production)

- [ ] Enable database replication
- [ ] Set up multi-region deployment
- [ ] Configure failover
- [ ] Test disaster recovery
- [ ] Enable backup verification
- [ ] Set up PagerDuty
- [ ] Create on-call rotation
- [ ] Run security audit
- [ ] Penetration test
- [ ] SOC 2 audit (if enterprise)
- [ ] Update privacy policy
- [ ] Create incident response plan

---

## Runbook: Common Issues

### Issue: API High Latency

**Symptoms:**
- Response times > 2s
- Timeouts increasing

**Diagnosis:**
```bash
# Check API health
curl https://api.privacychecker.com/health

# Check database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check Redis latency
redis-cli --latency
```

**Fix:**
1. Scale API replicas: `railway scale --replicas 5`
2. Check slow queries: Review `/metrics` endpoint
3. Clear Redis cache if stale
4. Enable query caching

### Issue: Database Connection Pool Exhausted

**Symptoms:**
- "Too many connections" errors
- API returns 500 errors

**Diagnosis:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check idle connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';
```

**Fix:**
```bash
# Increase connection pool size (Supabase dashboard)
# Or kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '5 minutes';
```

### Issue: Rate Limit False Positives

**Symptoms:**
- Legitimate users getting 429 errors

**Diagnosis:**
```javascript
// Check rate limit counts
await redis.get(`ratelimit:${apiKey}`);
```

**Fix:**
1. Increase rate limits for affected users
2. Implement user-based (not IP-based) limits
3. Add bypass for whitelisted IPs

---

## Appendix: Infrastructure as Code

### Terraform Example (Future)

```hcl
# terraform/main.tf
terraform {
  required_providers {
    railway = {
      source = "terraform-providers/railway"
      version = "~> 0.1"
    }
  }
}

provider "railway" {
  api_key = var.railway_api_key
}

resource "railway_project" "privacy_checker" {
  name = "privacy-checker"
}

resource "railway_service" "api" {
  project_id = railway_project.privacy_checker.id
  name       = "api"

  environment = {
    NODE_ENV     = "production"
    DATABASE_URL = var.database_url
  }

  health_check {
    path    = "/health"
    timeout = 30
  }

  replicas = 2
}
```

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Author:** Platform Engineering Team
**Status:** Draft for Review
