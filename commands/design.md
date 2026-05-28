# /design — Step 1: Design Review

Present design options and get explicit approval before any code is written.

## Input

The change to design comes from:
1. Args (`/design <description>`)
2. The most recent impact assessment (run `/impact` first if not done)
3. If unclear — ask what feature/fix to design

## What to do

**1. Present 2–3 design options.** For each option cover:
- What it does (1–2 sentences)
- Data model changes (if any)
- API surface changes (if any)
- Key trade-off vs the other options
- Estimated complexity (S / M / L)

Format each as a numbered block:

```
Option 1 — [name]
  What: [description]
  Data: [schema changes or "none"]
  API: [new/changed endpoints or "none"]
  Trade-off: [the main reason NOT to pick this]
  Complexity: S / M / L
```

**2. Add a recommendation.** One sentence: "I recommend Option N because [reason]."
This is your opinion — the user makes the final call.

**3. Wait for approval.** Do not write any code or update any docs until the user
explicitly selects an option (or gives a different direction). 

If the user asks for a different option not listed, add it and re-present.

**4. On approval, confirm:**
```
✅ Design approved: Option N — [name]
   Proceeding to /docsup to update plan-row + API ref + MFT scripts.
```

## Notes

- Never present a single option. The point of this step is to surface alternatives
  so the user can make an informed choice, not rubber-stamp the first idea.
- If there is genuinely only one viable option (e.g. a small bug fix), say so explicitly
  and explain why the alternatives aren't viable — don't fabricate fake options.
- Edge cases and rollback plan belong in the design, not the implementation.
