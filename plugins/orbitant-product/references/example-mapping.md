# Example Mapping

**Origin.** Matt Wynne (Cucumber/BDD), 2015. A technique for collaborative refinement of
user stories.

## Core idea

Before implementing a story, a short conversation (time-boxed ~25 min) makes the **rules**
explicit and illustrates them with concrete **examples**, capturing along the way the
**questions** nobody can answer. It brings the three voices together: business,
development, and testing.

## The four coloured cards

| Colour | Content |
|---|---|
| 🟡 **Yellow** | The story under discussion (at the top) |
| 🔵 **Blue** | Each **rule** / known acceptance criterion |
| 🟢 **Green** | One or more concrete **examples** illustrating each rule |
| 🔴 **Red** | **Questions** nobody in the room can answer (noted, then move on) |

The key distinction is **rule vs. example**: the rule is the general statement; the example
is a concrete case that makes it tangible and often surfaces missing rules. Many red or
blue cards signal the story isn't ready.

## How it's applied in the guide

- **Block 7**: discovering scenarios ("what if…?") and asking what should happen in each is,
  in essence, generating green examples that reveal missing blue rules.
- The **red cards** are the equivalent of `[TO CLARIFY]`.
- **Block 9 (acceptance criteria)** are the formalized blue rules.

## Source

- Matt Wynne, [*Introducing Example Mapping*](https://cucumber.io/blog/bdd/example-mapping-introduction/).
