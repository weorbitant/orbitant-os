# Methodological references

Shared methodology rationale for the whole suite. The skills don't follow a single "by the
book" framework: they synthesize established techniques from product discovery, requirements
analysis, and facilitation. This folder documents each one so whoever maintains or adapts
the skills understands **the reason behind each block and check**.

Consumed by both `skills/problem-interrogator/` (all of them, mapped below) and the
`agents/brief-stress-test.md` sub-agent (chiefly use cases, example mapping, BDD, assumption
mapping, and definition of ready — the methodologies behind its gap checks). This is
background for maintainers; the skill and the agent are operationally self-contained without it.

## Map: interrogation block → methodology

| Guide element | Methodology | File |
|---|---|---|
| Current situation → problem → proposal; "state the problem without the solution" | Problem space vs. solution space | [problem-vs-solution-space.md](problem-vs-solution-space.md) |
| "How do they solve it today? What progress are they after?" | Jobs To Be Done | [jobs-to-be-done.md](jobs-to-be-done.md) |
| 5 Whys / symptom vs. root cause | Root cause analysis | [five-whys-root-cause.md](five-whys-root-cause.md) |
| Six Thinking Hats | Six Thinking Hats | [six-thinking-hats.md](six-thinking-hats.md) |
| Block 7: main flow + scenarios + preconditions + actors | Use cases (Cockburn) | [use-cases-cockburn.md](use-cases-cockburn.md) |
| Discover scenarios and "what should happen in each?" | Example Mapping | [example-mapping.md](example-mapping.md) |
| Acceptance criteria ("correct when…") | BDD / Given-When-Then | [bdd-given-when-then.md](bdd-given-when-then.md) |
| Assumption stress-test | Assumption Mapping | [assumption-mapping.md](assumption-mapping.md) |
| MVP scope challenge / YAGNI | Lean Startup / MVP / YAGNI | [lean-mvp-yagni.md](lean-mvp-yagni.md) |
| Don't lead the answer; don't accept vagueness | The Mom Test | [the-mom-test.md](the-mom-test.md) |
| "Nothing enters without a complete brief" | Definition of Ready | [definition-of-ready.md](definition-of-ready.md) |
| `[TO CLARIFY]` | GitHub Spec Kit convention (`[NEEDS CLARIFICATION]`) — see note below |

> **`[TO CLARIFY]`** adapts the `[NEEDS CLARIFICATION]` marker from the spec template of
> [GitHub Spec Kit](https://github.com/github/spec-kit): instead of filling a gap with a
> silent assumption, what's left to decide is flagged explicitly, along with who should
> resolve it.
