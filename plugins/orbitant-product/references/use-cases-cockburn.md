# Use cases (Alistair Cockburn)

**Origin.** Ivar Jacobson (introduced use cases) and Alistair Cockburn (*Writing Effective
Use Cases*, 2000), who gave the most widely used practical structure.

## Core idea

A use case describes how an **actor** achieves a **goal** by interacting with the system.
Its value for discovery isn't in the diagram but in the discipline of writing the **main
path** and, above all, **exhaustively enumerating the extensions** (what can happen
differently at each step).

## Relevant structure

- **Primary actor** and **goal**: who wants what.
- **Secondary / supporting actors**: systems or people the system calls upon.
- **Preconditions**: what must be true for the flow to start.
- **Main success scenario (MSS)**: the case where nothing goes wrong, 3–9 steps (more than
  ~20 is a sign to decompose).
- **Extensions**: for each step, the alternative conditions the system must detect and
  handle; each ends back in the MSS, at a different success exit, or in failure.

## How it's applied in the guide

It's the backbone of **block 7 (scenarios and expected behavior)**:
- "map the main flow by steps" = the MSS.
- "discover uncovered scenarios" via preconditions, states, eligibility, etc. = the
  extensions.
- Translated to the PM/PO's language: instead of "the system validates X", ask "is it
  allowed? what should happen?".

## Source

- Alistair Cockburn, *Writing Effective Use Cases*.
- [Cockburn's use case template](https://www.cs.otago.ac.nz/coursework/cosc461/uctempla.htm)
