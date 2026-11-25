---
description: Score an artifact (a brief, Epic, or PRD) with the independent brief-scorecard judge and persist the result. Standalone; runtime with sub-agents (Claude Code / Cowork).
argument-hint: <path to a file | pasted artifact text | a free-text reference to an artifact>
---

# /score — quantitative quality gate for a problem definition

You are the **controller** for a one-shot scoring. You do **not** judge the artifact and you hold
**no knowledge of the rubric** — not its scale, its pass mark, its dimensions, nor its
philosophy. Your only job is to resolve *what* to score, dispatch the **`brief-scorecard`**
sub-agent (which carries the rubric and runs in its own clean context), and **persist its
result**. Your single dependency on the agent is its **output contract** (the machine tail),
which you transcribe verbatim — you never re-derive or validate what it reports. The agent is
read-only and returns text; **you** write the file. Stateless: no ledger, no hooks.

**Language:** conduct the run in the user's language.

## 1. Resolve the input (`$ARGUMENTS`)

The argument can arrive in three shapes. Classify it, then obtain **one artifact to score**:

1. **A file path** — an existing, readable file (`.md`, `.txt`, …). Use it directly as the
   artifact.
2. **Pasted artifact text** — substantial, multi-line content that *is* the artifact. Pick a
   `<slug>` and save it verbatim to `discovery/<slug>/SOURCE.md`; that saved file is the artifact
   (so the scoring is reproducible and the source is co-located).
3. **A free-text reference** — a short phrase naming an artifact ("the assignments refinement",
   "el brief de servicios"). Resolve it against the working folder:
   - **Search the subdirectories of the current working directory** for a file that plausibly
     matches the reference (by path/filename and, if needed, by content).
   - **Exactly one plausible match** → **confirm before scoring** ("Voy a puntuar `<path>` —
     ¿correcto?"), then use it. Never score a guessed file silently.
   - **Several matches** → list them and ask which one.
   - **No match** → **ask the user once** to give the file path or paste the artifact text. Do not
     invent an artifact.

Disambiguation between (2) and (3): long, structured, multi-line content is the artifact itself
(case 2); a short phrase is a reference to resolve (case 3). When genuinely unsure, ask.

Pick a short kebab-case `<slug>` (from the filename, the artifact's topic, or ask if unclear).

## 2. Score (dispatch the sub-agent)

Dispatch the **`brief-scorecard` sub-agent** via the Task tool — it runs in its own clean,
isolated context, which is what makes the score an independent audit rather than a
self-assessment. Hand it **only the one absolute path of the artifact**; everything it scores
against is embedded in the agent. Never pass it the conversation that produced the artifact.

The agent returns a full scorecard. Its **last lines are a machine tail of `KEY: value` pairs** —
this is the only part you parse, and you **treat the values as opaque** (transcribe them; do not
validate, round, or re-derive them):

```
SCORE: <value>
VERDICT: <value>
THRESHOLD: <value>
```

## 3. Persist the scorecard

Write to **`discovery/<slug>/SCORECARD.md`** in the working folder: a **YAML frontmatter block**,
then the agent's **full output verbatim** below it.

The frontmatter is the values you **transcribe from the tail**, plus the two fields that only
**you** know:

```yaml
---
artifact: <the source path or name that was scored>
generated_at: <YYYY-MM-DD>
score: <copied from the SCORE line of the tail>
verdict: <copied from the VERDICT line of the tail>
threshold: <copied from the THRESHOLD line of the tail>
---
```

- **`artifact`** and **`generated_at`** are **yours** — the agent does not know them: the source
  you resolved in step 1, and today's date from your session context (date only; the agent has no
  reliable clock, you do).
- **`score`**, **`verdict`**, **`threshold`** are the **agent's** — copy each verbatim from the
  tail. Do **not** hardcode, compute, or second-guess any of them; the command carries no rubric
  knowledge, it only records what the judge reported.

## 4. Report

Show the PM the artifact's headline (the score + verdict as the agent stated them) and the path
you wrote. Nothing more — the detail lives in the file.

## Notes

- The agent is **read-only** (`tools: Read`); the controller persists. This is the canonical
  evaluator pattern — an independent judge returns a verdict, the caller does the side effects —
  the same shape as `brief-stress-test` in `/discover`.
- **Stateless** — no ledger, no hooks. A scorecard is a single measurement; tracking over time
  lives in each `SCORECARD.md`'s frontmatter, not in shared state.
- `/score` **records; it never blocks.** Acting on a result is a separate decision, not this
  command's job.
- Needs sub-agents → **Claude Code / Cowork**. In claude.ai web (no sub-agents), score by hand:
  open the artifact in a fresh conversation, act as `brief-scorecard` reading its rubric, and save
  the output as `SCORECARD.md` yourself (see the plugin README).
