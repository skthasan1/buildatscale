# /impact — Step 0: Impact Assessment

Run the blast-radius analysis for a proposed change BEFORE any design or code is written.
See `shared/FRAMEWORK.md` Section 7 for the full checklist rationale.

## Input

The change to analyze comes from:
1. Args passed to this skill (`/impact <description>`)
2. The most recent user message describing what they want to change
3. If unclear — ask: "What change are you planning? Describe it in 1–2 sentences."

## What to do

**1. Search the codebase.** Use Grep and Glob to find:
- Every file that defines the changed type, function, schema, or API endpoint
- Every file that consumes or imports the changed surface
- Every test that covers the changed code path

Spawn a search agent if the codebase is large:
> Explore agent: "Find all files that reference [changed symbol/schema/endpoint]. Report file paths and line numbers. Be thorough — check imports, type usages, test mocks, and API clients."

**2. Answer all 7 questions.** For each question, be specific — name files and line numbers.

| # | Question |
|---|---|
| 1 | **Data layer** — Schema migration needed? Which tables/rows change? Rollback plan? |
| 2 | **Shared contracts** — Which interfaces/types/API shapes change? List every consumer. |
| 3 | **State flow** — What state (local, server, cache, queue) is read or written? Optimistic updates at risk? |
| 4 | **Cross-layer sync** — Which other components, services, or workers read the same data? |
| 5 | **Test surface** — Which tests cover the changed path? Run `grep` for the function/type name now. |
| 6 | **Adjacent code risk** — What else lives in the same file or execution path? List it. |
| 7 | **Deployment/infra** — Deploy sequence constraints? New env vars? Infrastructure changes? |

**3. Output the standardized block:**

```
Impact analysis for: <change description>
──────────────────────────────────────────
Data layer:        affected / not affected — <reason>
Shared contracts:  affected / not affected — <what changes + list of consumers>
State flow:        affected / not affected — <what state, what could de-sync>
Cross-layer sync:  affected / not affected — <which layers>
Test surface:      <list tests to update, or "none">
Adjacent risk:     <list adjacent code in same path, or "none">
Deployment/infra:  affected / not affected — <migrations, env vars, infra>
```

**4. List design gaps** — questions you couldn't answer from the codebase (missing docs,
ambiguous ownership, unclear contracts). These must be resolved before Step 1 design.

**5. End with:**
`✅ Impact assessment complete. Proceed to /design when ready.`

## Stack-specific additions

Add rows to this output for your stack in CLAUDE.md:
- **Electron/IPC-heavy**: IPC chain — does the channel name or payload shape change?
- **tRPC**: Does the procedure input/output shape change? Desktop IPC proxy + web client + test mocks all break simultaneously.
- **React**: useEffect deps — any state that effects should react to, but don't?
