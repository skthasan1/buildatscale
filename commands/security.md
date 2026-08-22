# /security — Security Review

Two modes triggered by the same skill:

1. **Targeted** (`/security <chunk-id>`) — called automatically from the pipeline (Step 3.5) when `/impact` flagged the change as security-relevant. Reviews the changed surface only. Findings block the pipeline like an audit FAIL.
2. **Full** (`/security`) — periodic full-surface sweep. Run quarterly or before any major release. Produces `docs/security-audit.md`.

## When the pipeline triggers targeted mode

Run between Step 3 (build) and Step 4 (audit) whenever `/impact` reported the security flag as **yes** — i.e. the change touches any of:

- New or modified auth surface (new procedure type, new role check, new middleware)
- New public endpoint (no auth guard)
- Payment or payout flow
- Schema change to user / session / permission / invite tables
- New field storing PII, credentials, or tokens
- New external HTTP call (potential SSRF)
- New file upload or download path
- New admin capability

If the impact flag was **no**: skip Step 3.5 entirely. Do not run `/security` on every chunk — it is a targeted tool, not a per-feature checklist.

---

## What to do

### 1. Threat model

Answer for the scope (changed surface in targeted mode; full product in full mode):

- **Who** can attack this? (unauthenticated user, subscriber, creator, compromised admin, automated bot, insider)
- **What** do they want? (free premium content, another user's private data, privilege escalation, DoS, financial gain, credential theft)
- **How** could they try? (direct API call with wrong role, parameter manipulation, race condition, replay attack, IDOR by ID enumeration)
- **Impact** if they succeed? (financial loss, data breach, content theft, user trust, platform reputation)

If the threat model surfaces no plausible attack paths: state that explicitly and continue. Skipping this step is not acceptable — the explicit "no plausible path" conclusion is itself a reviewable artifact.

### 2. OWASP Top 10 sweep

For each item mark **PASS**, **FAIL**, or **N/A** with one-sentence evidence referencing a specific file:line or endpoint name. Do not mark PASS without evidence.

#### A01 — Broken Access Control *(most common failure class)*

- Every new/changed tRPC procedure: is the correct guard applied — `publicProcedure` / `protectedProcedure` / `creatorProcedure` / `adminProcedure`?
- Any procedure that fetches a record by ID: does it verify the record belongs to `ctx.userId`, or that `ctx.role === ADMIN`? A creator fetching another creator's record is IDOR.
- Any signed URL or presigned link generated: does the endpoint verify the photo/resource belongs to a user who is allowed to receive it?
- Can a lower-privileged role reach a higher-privileged procedure by calling it directly (role check in middleware vs. route guard)?

#### A02 — Cryptographic Failures

- Any new shared-secret or token comparison using `===` instead of `timingSafeEqual`?
- Any new long-lived credential (OAuth refresh token, API key, wallet private key) stored in DB without encryption?
- Any new signed URL without expiry, or any signed URL persisted to DB?

#### A03 — Injection

- Any new Prisma raw query (`$queryRaw`, `$executeRaw`)? Template-literal parameterization only — never string concatenation.
- Any user-provided content passed to an LLM without `<untrusted-data>` wrapping and system prompt hardening?
- Any new file path or URL constructed from user input (path traversal / open redirect)?

#### A05 — Security Misconfiguration

- Any new `process.env.X` accessed inside a handler without a startup-time `requireEnv()` guard?
- CORS: any change to origin allowlist? Is it the minimum necessary set?
- Storage: any new bucket or path? Is it private by default? Verify no public-read ACL.

#### A06 — Vulnerable Components

Run and paste output:

```
pnpm audit --audit-level=high
```

Flag any new high or critical CVE introduced by packages added in this chunk.

#### A07 — Auth and Session Failures

- Any new token type (e.g. `dsk_` desktop token)? Is expiry enforced? Can it be forged without the signing secret?
- Any new endpoint without a rate limit? Could an attacker enumerate IDs or brute-force values?
- Auth bypass in test mode (`APP_TEST_TOKEN`, `PLAYWRIGHT_TEST_SECRET`): guarded behind `!app.isPackaged` / `NODE_ENV !== "production"`?

#### A08 — Software and Data Integrity

- Any new webhook endpoint? Signature verified timing-safely, using the provider's own SDK for Stripe/GitHub/Slack?
- Any blockchain event ingestion? On-chain state re-verified before writing to DB?

#### A09 — Security Logging and Monitoring Failures

- Any new admin action that should write to `AdminAuditLog` but doesn't?
- Any new security-relevant event (failed auth, rate limit hit, permission denied) going unlogged?
- Any new log statement that could emit PII, tokens, or full request bodies?

#### A10 — SSRF

- Any new endpoint that fetches a URL provided by or influenced by the user? Validated against an allowlist of permitted hosts?

### 3. Privilege escalation matrix *(full mode; targeted mode: for new roles or new procedure types only)*

For each role (UNAUTHENTICATED, SUBSCRIBER, CREATOR, ADMIN, SUSPENDED):

| Can they reach… | Intended? | Evidence |
|---|---|---|
| `publicProcedure` endpoints | Yes | — |
| `protectedProcedure` endpoints | Yes (auth required) | — |
| `creatorProcedure` endpoints | Creators + Admins only | — |
| `adminProcedure` endpoints | Admins only | — |
| Another user's photos/data by ID | No | verify IDOR guard |

### 4. Data exposure check *(full mode; targeted mode: for new/changed endpoints only)*

For each new or changed endpoint that returns data: does the response include fields the caller doesn't need? Could the shape leak data about other users (e.g. follower IDs, email addresses, internal IDs)?

Prisma `select` is the correct fix — never return the whole model when a subset is needed.

---

## Output format

### Targeted mode

Report findings inline. Any finding at **Medium or above** is an audit FAIL — fix before Step 4.

```
Security review — [date] — [chunk-id]
──────────────────────────────────────
Threat model:    [brief summary of who/what/how/impact]
A01 Access:      PASS / FAIL — [evidence]
A02 Crypto:      PASS / FAIL / N/A — [evidence]
A03 Injection:   PASS / FAIL / N/A — [evidence]
A05 Misconfig:   PASS / FAIL / N/A — [evidence]
A06 Components:  PASS (no new high CVEs) / FAIL — [package@version]
A07 Auth:        PASS / FAIL / N/A — [evidence]
A08 Integrity:   PASS / FAIL / N/A — [evidence]
A09 Logging:     PASS / FAIL / N/A — [evidence]
A10 SSRF:        PASS / N/A — [evidence]

Findings to fix before Step 4:
- [SEC-NNN] [severity] — [description] — [file:line]
```

### Full mode

Write findings to `docs/security-audit.md`. Each finding:

```markdown
## SEC-NNN

**Severity:** Critical | High | Medium | Low | Info
**OWASP:** A01 — Broken Access Control
**Surface:** `photos.getFullUrl` — tRPC procedure
**Finding:** Creator A can request a signed URL for Creator B's FULL photo by passing the photo ID directly.
**Evidence:** `apps/api/src/trpc/routers/photos.ts:142` — no `photo.creatorId === ctx.userId` check
**Fix:** Add ownership check before generating the signed URL; ADMIN bypass allowed.
**Status:** open | fixed | accepted-risk
**Plan row:** SEC-NNN (link to project-log.md row when assigned)
```

Severity guide:
- **Critical** — unauthenticated access to private data, RCE, payment bypass
- **High** — authenticated access to another user's private data, privilege escalation
- **Medium** — information disclosure, rate limit bypass, missing audit log
- **Low** — defence-in-depth improvement, best-practice gap with no direct exploitability
- **Info** — observation; no plausible attack path in the current architecture

---

## Cadence

| Mode | When |
|---|---|
| Targeted | Every pipeline run where `/impact` reports security flag = yes |
| Full | Quarterly, or before any public launch / major feature release |
| Ad hoc | Any time a user reports unexpected access to data that shouldn't be accessible |
