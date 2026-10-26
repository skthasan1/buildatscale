# /security — Security Review

Two modes triggered by the same skill:

1. **Targeted** (`/security <chunk-id>`) — called automatically from the pipeline (Step 3.5) when `/impact` flagged the change as security-relevant. Reviews the changed surface only. Findings block the pipeline like an audit FAIL.
2. **Full** (`/security`) — periodic full-surface sweep of the integration branch. Run weekly for active repos (see Cadence) and before any major release. Produces `docs/security-audit.md` and `docs/security-audit.json`.

**Standing rule — secrets:** never print a found secret value in any report, issue or chat. Give file, line and type only, and tell the owner to rotate it. Never open `.env*` files.

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

## Full mode: required steps

Do these first; targeted mode skips them.

1. **Right branch.** Audit the integration branch (`origin/develop`, `origin/dev` or the project's equivalent), not a feature branch. Name the commit audited.
2. **History scan.** Scan the full git history for secrets (`gitleaks detect`). A secret removed from HEAD is still leaked. Report file, line and type only.
3. **Complete checklist.** Report every row of the checklist (A01–A10 below, plus secrets and CI, AI/LLM risks, client or mobile, logging). A row you did not examine is marked `N/A` with a reason; a row left out is a gap in the audit.
4. **Dependencies as data.** Run the package audit and record counts by severity in the audit.

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

**Stack adaptation:** the terminology below uses tRPC/Next.js/Prisma names only as examples. Put your stack's words (guards, roles, ORM, auth provider) in a **Security surface map** section in `CLAUDE.md` once, and read every check below in those terms:

```
## Security surface map
Auth guards: publicProcedure / protectedProcedure / creatorProcedure / adminProcedure
Roles: SUBSCRIBER | CREATOR | ADMIN | SUSPENDED
Trust boundary: Privy session JWT — verified in isAuthed middleware
Tenant model: single-tenant (no organizationId isolation needed)
Dependency audit: pnpm audit --audit-level=high
```

For each item mark **PASS**, **FAIL**, or **N/A** with one-sentence evidence referencing a specific file:line or endpoint name. Do not mark PASS without evidence.

#### A01 — Broken Access Control *(most common failure class)*

- Every new/changed procedure / route / handler: is the correct auth guard applied — `publicProcedure` / `protectedProcedure` / role-specific guard?
- Any procedure that fetches a record by ID: does it verify the record belongs to the authenticated user, or that the caller has admin privilege? Fetching another user's record by ID enumeration is IDOR.
- Any signed URL or presigned link generated: does the endpoint verify the resource belongs to a user who is permitted to receive it?
- Can a lower-privileged role reach a higher-privileged procedure by calling it directly (role check in middleware vs. route guard)?
- **Tenant isolation** — for any multi-tenant feature (organization, workspace, team): is the tenant ID (e.g. `organizationId`) in every WHERE clause that returns or mutates tenant-scoped data? The most common IDOR failure for B2B products is a check that verifies user ownership but not tenant membership — valid user, wrong tenant.

#### A02 — Cryptographic Failures

- Any new shared-secret or token comparison using `===` instead of `timingSafeEqual`?
- Any new long-lived credential (OAuth refresh token, API key, wallet private key) stored in DB without encryption?
- Any new signed URL without expiry, or any signed URL persisted to DB?

#### A03 — Injection

- Any new Prisma raw query (`$queryRaw`, `$executeRaw`)? Template-literal parameterization only — never string concatenation.
- Any user-provided content passed to an LLM without `<untrusted-data>` wrapping and system prompt hardening? (See §18.5 in `shared/FRAMEWORK.md` — the delimiter must also be one the untrusted content cannot contain; a user who can emit `</untrusted-data>` can escape the data zone.)
- Any new file path or URL constructed from user input (path traversal / open redirect)?

#### A05 — Security Misconfiguration

- Any `process.env.X` accessed inside a handler without a startup-time `requireEnv()` guard? *(Targeted mode: check new accesses. Full mode: audit all existing accesses — a 3-month-old unguarded access is just as exploitable as one added today.)*
- Any `process.env.X ?? '<committed-literal>'` pattern? A hardcoded fallback is visible in source history — the app runs and appears healthy, but with a known-weak secret. No committed defaults on security-sensitive env vars.
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
- Auth bypass in test mode: (a) **what makes the bypass unreachable in the deployed production environment** — and is this verified against the deployed config, not just the source code? (b) Is the bypass credential itself unforgeable (a high-entropy secret only accessible via your secrets manager), or is the environment toggle the only control? A toggle-only bypass (`NODE_ENV !== 'production'`) can be replicated by anyone who reads the source — the credential should be an additional, unforgeable factor.

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
<!-- multi mode (project-mode block in CLAUDE.md): heading is <handle>-SEC-NNN; next number = highest in your own findings + 1 -->

**Severity:** Critical | High | Medium | Low | Info
**OWASP:** A01 — Broken Access Control
**Surface:** `photos.getFullUrl` — tRPC procedure
**Finding:** Creator A can request a signed URL for Creator B's FULL photo by passing the photo ID directly.
**Evidence:** `apps/api/src/trpc/routers/photos.ts:142` — no `photo.creatorId === ctx.userId` check
**Reachability:** Verified | Verified in code | Unverified, treated as present — [what you looked for]
**Key:** `access-photos-getfullurl-idor` (stable slug: problem class + place; the same key in every later audit, so a trend can be kept)
**First seen:** 2026-10-26 (audit date, or the commit)
**Owner:** code owner of the file (handle)
**Fix:** Add ownership check before generating the signed URL; ADMIN bypass allowed.
**Status:** new | open | fixed | accepted-risk
**Plan row:** SEC-NNN (link to project-log.md row when assigned)
```

**Reachability and severity.** Rate severity as if any control that cannot be verified from the code, configuration or documents does not exist. Do not lower a severity because an attack seems unlikely or because "it is probably handled elsewhere". Record how the finding is known in `Reachability`: `Verified` (a live call or test showed it), `Verified in code` (the missing check is visible and no other check on the path exists), or `Unverified, treated as present` (a control we cannot see might exist; say what you looked for). A project that tests its own live system may set a stricter evidence bar in its CLAUDE.md ("Security posture: evidence-capped"); then unverified Critical and High candidates are filed as Medium with a note to verify before escalating.

**Machine-readable copy.** Write the same audit as `docs/security-audit.json` next to the markdown: audit date, commit, one entry per finding (`id`, `key`, `severity`, `owasp`, `reachability`, `status`, `owner`, `file`, `line`), the checklist rows with their `na` reasons, and dependency counts by severity. The markdown is the human view; the JSON lets a project keep a trend and validate the audit in CI.

**Findings become work.** File one issue per finding at Medium or above, assigned to the code owner. An issue is closed only after the next audit confirms the fix in the code.

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
| Full | Weekly for active repos; monthly for stable ones; quarterly for dormant ones; and before any public launch or major release |
| Ad hoc | Any time a user reports unexpected access to data that shouldn't be accessible |

## Compliance readiness

For a product with customers, `/security` is not the whole story. Follow it with a readiness review for the regimes that apply (SOC 2, privacy law such as GDPR, e-signature rules). This is engineering readiness, not legal advice; keep its output beside the security audit.
