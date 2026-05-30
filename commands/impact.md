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

## Stack-specific additions (only if applicable)

Only answer these for your project's actual stack. Skip any that don't apply.

**Electron / native desktop:**
- IPC chain: does the channel name or payload shape change? Main handler + preload bridge + type declaration + renderer call site must ALL be updated together. Missing one = silent runtime break with no TypeScript error.
- Platform sync: does this affect a value mirrored in the OS (tray menu, dock badge)? Both native and renderer sides must be updated.

**tRPC / typed RPC (GraphQL, gRPC):**
- Does the procedure input schema or return type change? Every layer that wraps it — proxy, client hook, test mock — breaks simultaneously even though each compiles individually.

**React / frontend:**
- useEffect deps: is there state the effect should react to but doesn't? Stale closures are the silent failure.

**React Native / Expo / mobile:**
- Native module bridge: does the change touch a native module API? JS side + native iOS + native Android must all match.
- Device permissions: does the feature need a new permission? Update `Info.plist` (iOS) and `AndroidManifest.xml` (Android).

**Blockchain / smart contracts:**
- ABI change: every client that imports the ABI needs regeneration after a contract interface change.
- Gas impact: does the change add on-chain computation? Estimate gas before shipping.

To add project-specific rows, add an "Impact analysis additions" section to your CLAUDE.md.
