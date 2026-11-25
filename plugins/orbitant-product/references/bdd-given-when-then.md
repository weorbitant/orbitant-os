# BDD and Given-When-Then

**Origin.** Dan North (2006) formulated *Behaviour-Driven Development*; the
*Given-When-Then* notation (Gherkin) emerged with him and with Cucumber.

## Core idea

Describe the expected behavior in concrete examples with a fixed structure:

- **Given**: the starting context/precondition.
- **When**: the action or event that occurs.
- **Then**: the expected observable result.

The virtue is that an acceptance criterion stops being a vague statement ("it should work
well") and becomes something **verifiable and unambiguous**, in business language everyone
understands.

## How it's applied in the guide

- **Block 9 (success / acceptance criteria)**: the sentence "this is considered correct
  when…" is an implicit *Then*; each scenario from block 7 can be expressed as a
  Given-When-Then.
- Helps close the ambiguity the final self-review aims to eliminate.

## Example

> **Given** a deregistered client, **when** a user tries to start the flow, **then** the
> system prevents it and explains why.

## Source

- Dan North, [*Introducing BDD*](https://dannorth.net/introducing-bdd/).
