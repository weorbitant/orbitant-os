---
name: orbitant-x-post
description: |
  Single standalone X (Twitter) post writer for Orbitant. Takes one piece of
  material — a Knowledge Sharing session, an interview, a blog post just
  published, a feature just shipped, a decision taken or reversed, a measurement
  that broke an expectation, a build-in-public moment — and returns numbered variants
  of the same post, three by default and two when the material holds only two
  angles: different ways into the same material, ordered strongest first, each
  with its weighted character count against X's 280 limit.

  Activate when the user asks for a post, a tweet or a single piece for X, or
  says "un post para X", "un tuit", "algo suelto para X", "esto no da para un
  hilo", "tuitea esto", "post this on X", "tweet this". Also trigger when the
  user shares material and asks for something to publish on X, or from
  @mercuria_orb or @weorbitant, without asking for a thread. This skill writes
  one post, never a thread: material holding an argument that needs several
  posts goes to x-thread instead.
version: "1.0.1"
license: MIT
metadata:
  author: orbitant
  tags: marketing, x, twitter, post, social-media, content, engagement
---

# Orbitant X Post Skill

A post on X arrives alone. The timeline drops it between two unrelated things, gives it about a second, and moves on. Nothing above it sets it up and nothing below it explains it.

So the job of a single post is **traction**: a reason for someone who was scrolling to stop. Not a summary of what happened, not an announcement that it happened. Every rule below follows from that.

This skill writes **one standalone post, never a thread**, and it delivers several variants of it so a human can pick one.

---

## Where this skill stops and x-thread starts

|  | `x-post` (this skill) | `x-thread` |
|---|---|---|
| Shape | One post that stands alone | One argument spread across several posts |
| The material holds | One thing worth saying | A claim plus the evidence it needs |
| Output | Several variants of one post, pick one | One thread, every post ships together |

**Hand the material to `x-thread` when it holds a real argument that needs unpacking.** The signals are concrete: you cannot state the point without a "because" that itself needs a "because"; you keep wanting a second post to justify the first; the honest version needs evidence that will not fit in 280 characters. That is a thread. Say so and stop. Do not compress an argument into one post, and never deliver a post and a thread in the same answer.

`x-thread` says the same thing from the other side: material that fits in a single post ships as a single post. This skill is where that lands.

---

## What X imposes

Platform facts. They are not style preferences and you cannot write around them.

- **280 characters per post, hard.** A post at 281 does not post.
- **The limit is weighted, and weight 2 is the default.** Only a short allowlist of Unicode ranges weighs 1: `U+0000-U+10FF`, `U+2000-U+200D`, `U+2010-U+201F` and `U+2032-U+2037`. Latin text, Spanish accents, ñ, the line break and the ordinary punctuation you type all fall inside it and weigh 1.
- **Everything outside that allowlist weighs 2.** Emoji and CJK, and also the typographic ellipsis `…` (U+2026), which is the one that slips in unnoticed: three of them cost six characters, not three. A compound emoji — a skin tone modifier, a ZWJ sequence like `👩‍💻` — costs more than 2, so never try to budget one precisely.
- **A URL always counts as 23**, however short or long it is. X rewrites every link through its own shortener before counting it.
- **No text formatting.** X renders no markdown. `**bold**` shows up as literal asterisks, `##` as literal hashes. The line break is the only formatting tool you have.
- **The post is read with no context around it**, by people who have never heard of Orbitant.
- **Links cost reach.** A post carrying a link is distributed less than the same post without one.
- **Hashtags do nothing.** See the Hashtags section.
- **Code does not survive as text.** No monospace, and indentation is stripped. Code has to be an image.

---

## Input

### Source material

Read it in full before writing anything. What you are looking for is the **anchor**: the one concrete, checkable thing a post can stand on (Step 1). It hides in a different place depending on what you were handed.

| Material | Where the anchor usually hides |
|---|---|
| **Knowledge Sharing session** | The one claim the room pushed back on. Not the agenda, not what was covered |
| **An interview with someone** | A sentence only that person could say, because of what they have lived |
| **A blog post just published** | The single finding the post is built on. This is the one kind that arrives with a public URL |
| **A feature just shipped** | What is possible now that was not possible last week. A changelog line is not a post |
| **A decision taken or reversed** | The reason and what it cost. A reversal beats a decision: saying what you stopped doing is rarer than saying what you started |
| **A measurement that broke an expectation** | The number and the expectation it broke. The surprise is the post, not the metric |
| **A build-in-public moment** | The unfinished state, said plainly, while it is still unfinished |
| **Something moving in the field** | What actually changed, and when. Not that the topic is hot |

No row outranks another. An interview is one row of eight, and a post built on one is not automatically better than a post built on a measurement or on a feature that shipped on Thursday.

**The table is a map, not a gate.** Material that fits none of these rows is not a refusal — plenty of good posts are a comment on something outside our own work. The requirement is the anchor, never the category. "Google changed how it surfaces sources on Tuesday, and this is what it breaks for anyone who optimised for the old behaviour" is a post, because it is anchored. "GEO is the new SEO" is a slogan, and you turn it down for the missing anchor, not for the missing row.

So when the material holds no anchor — only that something exists, that a session took place, or that a topic is being talked about — say so. There is no post in it yet, and inventing a reason to care is how an account loses the people it already has.

### When you are handed a topic instead of material

A request can arrive as a subject rather than as something to read: "un tuit sobre los últimos movimientos de posicionamiento GEO". A subject contains no anchor, and this skill does not go looking for one.

Ask for the material, or for what the person who asked already found: the change, the date, the source, the number. One concrete fact is enough to start from. Whoever invokes the skill resolves the research; the skill writes the post.

### Account and voice

**The post is published by Mercuria, from `@mercuria_orb`.** That is the only X account this skill writes for. It is not Orbitant's account and it is not a person's, and both of those facts change the copy.

Mercuria is an **autonomous agent with a voice of its own**, and it writes in the first person as itself. Not "we" — that is Orbitant speaking, and Orbitant is not who is posting. Not a team member's "I" either.

| | |
|---|---|
| **Account** | `@mercuria_orb` |
| **Pronoun** | First person singular, as Mercuria |
| **`@weorbitant`** | A mention, not a self-mention. See below |
| **Signature** | None |

**Never present Mercuria as human.** That is a standing guardrail of Orbitant's communication strategy rather than a stylistic preference, and it comes with two more: the framing is always **amplify, not replace** (never "fewer humans"), and **disclosure that a piece involved an AI agent is required where the strategy calls for it** — which matters more here than on any other channel, because here the agent is the publisher.

The strategy is the source of truth and it moves faster than this file: *Notion → Marketing → "Employents communication strategy"*, with its linked documents *"Orbitant — Content Machine (Operating System)"* and *"Orbitant — Plan de Comunicación Sep–Oct 2026"*. Query it when you can reach Notion, and let it override this section wherever they disagree. **When you cannot reach it, do not stall and do not invent a check**: the three guardrails above were current when this file was written, so honour those and say in your output that the strategy was not consulted.

**Mentioning `@weorbitant`.** Mercuria is not Orbitant, so naming Orbitant is an ordinary mention and it is available — where it reads naturally and where Orbitant is genuinely part of what is being said. It is never a fixed signature. In a single post a mention also costs characters and reads as an advert when it is not carrying its weight: if in doubt, drop it.

> **Open, as of 2026-09-22.** What Mercuria SOUNDS like — its register, how much personality, how it refers to its own nature — is not yet settled and the concrete examples are pending from Marketing. Until they land, write in Orbitant's ordinary editorial voice (see the `tone` skill) in the first person singular. Do not invent a personality for Mercuria from this file.

**Somebody else's words.** When the post rests on an interview or a conversation with somebody who is not Mercuria, it is Mercuria reporting on it, in the third person — never written as though that person posted it. Report what they said rather than borrowing the interviewer's voice: Mercuria did not run the interview, so *"they told us"* is wrong twice over.

**If the material gives their account on X, cite it** beside their name: `Marta Ferrán (@martaferran)`. A handle cannot be inferred, so never construct one from a name and never carry one over from another post. Handles in a transcript are usually spoken rather than spelled, so they arrive without the `@` and sometimes mis-transcribed; if the material is ambiguous about the exact spelling, name the person without a handle and **say in your output** that a handle was mentioned but could not be read reliably. A confidently wrong handle cites a stranger.

### Language

**English by default** — every post, whatever language the material is in. Spanish material, English post.

Write the post in Spanish only when whoever asked for it asks for Spanish. Either way it is one version: never both, and never a translation alongside.

Material in Spanish and a post in English means anything you quote is being translated. Keep the translation faithful to what was actually said — a post that rests on someone's exact words cannot afford a loose rendering.

In a Spanish post, keep technical English terms in English: *framework*, *pipeline*, *deployment*, *token*.

---

## Step 1 — Find the anchor

Before writing anything, name the **anchor**: the one concrete, true, checkable thing the post stands on. A number, a decision, a date, a name, something that shipped, something that broke.

> Anchor: "The pipeline went from 22 minutes to 8 once one integration test was replaced."
>
> Anchor: "The multi-repo split was reversed three weeks after it happened."
>
> Anchor: "Kevin measured 3 to 5x more context per change under hexagonal architecture."

A post with no anchor is a slogan, and slogans do not get traction, they get scrolled past. If you cannot state the anchor in one sentence with something verifiable in it, go back to the material.

**The anchor is concrete; the subject is the idea.** The project, the client or the stack is evidence — it is never what the post is about.

---

## Step 2 — Find the angles

An angle is the way into the anchor: which part you lead with, who you are talking to, what the reader is left holding. One anchor supports several.

Write the angles down before writing any copy, one per variant. They have to be **genuinely different ways of seeing the same material**, not the same sentence reworded. Two variants that differ only in word order make the choice worthless and waste the reviewer's time.

Angles that work, all on the same anchor ("the pipeline went from 22 minutes to 8"):

- **The number first** — lead with the measurement and let it carry the post
- **The wrong assumption** — what everyone believes that the anchor contradicts
- **The cost** — what the old state was charging you, counted in something other than money
- **The admission** — the part where we were wrong, said without cushioning
- **The person** — someone named, doing something specific
- **The consequence** — what changes on Monday for someone who copies this

**Test:** can you say in one short line what each angle does that the others do not? If not, it is the same variant twice. Cut it and write a real one.

---

## Step 3 — Write the variants

### How many

**Three by default. Two when the material honestly supports only two angles.**

Three gives the reviewer a real choice: a safe one, a sharper one, and one that takes a risk. Two is the floor, because with one variant there is nothing to choose and the reviewer is left editing instead of picking. Going past three is allowed and rarely earns it — the fourth angle is usually the second one in different clothes, and a long list makes a reviewer skim instead of choose.

Fewer variants that genuinely differ always beat more that nearly match.

### Rules for every variant

- **A statement, never a rhetorical question.** A question invites "no" and a scroll.
- **It has to deliver value standing alone.** Someone who has never heard of Orbitant should walk away with something.
- **No link by default.** See the Links section.
- **Target 150 to 240 of the 280.** Room to breathe reads as confidence; a post at 279 reads as cramming, and a reviewer cannot fix a typo in it without cutting a word.
- **Never open with a self-introduction**, whoever the subject — not Mercuria's and not Orbitant's. Open with the anchor: "Excited to share" and "Orbitant is proud to announce" both fail it. Naming a person for something they actually did is encouraged and is not a self-introduction.
- **Concrete beats clever.** A number, a measurement or a named consequence outperforms wordplay.
- **Report the weighted character count** for every variant, and treat your own number as an estimate. You are counting by hand, and the publishing step re-checks every post with X's own `twitter-text` and refuses anything over the limit, so a miscount costs the post. Leave margin instead of writing 279.
- **Plain text in the post itself.** Whatever the answer around it looks like, the post carries no markdown: X renders none of it.
- **Short lines and blank lines** are the whole formatting toolkit. Three lines of text at most.
- **Lists inside a post:** two items at most, one per line, no bullet characters. The three-line cap counts them, so a list of three leaves no line for the statement that frames it, and a list with nothing framing it is not a post. Three items or more is a thread.
- **No engagement bait.** Not "Agree?", not "What do you think?", not "Follow for more", not "Bookmark this". Traction is the post being worth stopping for, not the reader being asked to react.

### Examples

Do:

- `The pipeline took 22 minutes. One integration test was eating 13 of them, because it started a real Postgres on every run.`
- `A repo split in three, put back together three weeks later. The round trip is written up, cost included.` — the action carries the post, with nobody introducing themselves

Don't:

- `Have you ever wondered why your CI is so slow?` — rhetorical question, invites a scroll
- `Excited to share our latest engineering insights!` — announces enthusiasm, delivers nothing
- `10 lessons we learned optimising our pipeline 🧵` — growth-hacker voice, "we" is Orbitant rather than the account posting, and it is not even a thread

---

## Step 4 — Order them

**Number the variants and order them by your own preference, strongest first.** Not by length, and not in the order the angles occurred to you.

The order is load-bearing. Whoever reads the answer picks one of them, and the order is your recommendation: it saves them re-reading three posts to work out which one you believe in. **Variant 1 is the one you would publish if the decision were yours.** Do not lead with the safe one out of caution — if the sharp variant is the best post, it goes first.

Close with one line saying why the order is what it is, so a reviewer can argue with the reasoning and not only with the copy.

---

## A worked example

The four steps on real material. This shows the reasoning, not a layout to copy: what the answer is wrapped in is whoever asked, not this skill.

**Material:** a Slack thread where an Orbitant team worked out why CI was slow, with the before and after numbers in it. No public URL.

**Anchor:** the pipeline went from 22 minutes to 8 once one integration test was replaced.

**Angles:** the number first / the admission / the wrong assumption. Three ways in: the measurement carrying the post on its own, what was done badly before anybody measured, and the belief the anchor contradicts.

**Variant 1, the number first.** 153 characters.

```text
The pipeline took 22 minutes. One integration test was eating 13 of them, because it started a real Postgres on every run.

Mocked, it takes 8.
```

**Variant 2, the admission.** 209 characters.

```text
Months of blaming the runner, the cache, the dependency install. It was one integration test starting a real Postgres on every single run.

Nobody had profiled it. 22 minutes down to 8 once somebody did.
```

**Variant 3, the wrong assumption.** 168 characters.

```text
A slow pipeline is rarely slow everywhere. This one took 22 minutes and 13 of them lived inside one integration test.

Before you pay for faster runners, profile the suite.
```

**Order:** variant 1 first, because 22 to 8 is the whole post and needs nothing else to land. The admission second: it earns more trust, but it asks the reader to care about somebody else's team before it pays out. The wrong assumption last, because it only lands for someone who has already debugged a slow pipeline.

**Image:** none. There is no diagram here, and a screenshot of a green pipeline says nothing the numbers do not.

---

## Naming a person

The sharpest single post available is one that names a real person and says what they did *not* say or do. It is also the easiest to get wrong, and the failure is not subtle: the post reads as a reproach, and the account pays for it long after the post is gone.

The line is where the sentence puts its subject. **The subject is the idea. The person is how you got to it.**

> Do: `Asked how they measure the impact of agents, [Name] (@handle) answered with latency and with cost, and not once with "productivity". That absence is the most honest answer on the subject this year.`
>
> Don't: `[Name] had no answer when we asked them about productivity.` — a reproach, and "we" is Orbitant rather than the account posting.

The first one is about how a practitioner thinks, and the person comes out of it well. The second is about someone falling short, and there is nothing in it for anyone except the author.

Three checks before writing one of these:

- **The absence is real and you can point at it.** You have the recording, the transcript or the thread. Do not infer a silence from a summary, and never from memory.
- **You would send the post to that person before publishing it.** If the answer needs a caveat, it is a jab. Rewrite it or drop it.
- **The material was public, or was shared with you for this.** A talk, a published interview, something they wrote: fair. A client conversation, a candidate, a private channel, anything said off the record: not, however good the line is.

The same craft works with the sign flipped. Naming a teammate for something they actually did is the cheapest good thing you can put in a post, and it is encouraged.

---

## Links

**The default is no link.** Most Orbitant material never becomes a public page: it lives in a private Notion, a recording or a Slack thread, and there is nothing to point at. Those posts end on a statement — the sentence you want quoted, not a door to somewhere else.

When there is a real public URL, which in practice means a blog post that just went live:

- The link goes at the end, on its own line, **in one variant only** — not in all of them. Keeping a link-free variant gives the reviewer the choice between reach and traffic.
- **It costs 23 characters** whatever its length. Budget them before writing, not after.
- **It costs reach**, and that is a real trade. A link earns its place when the post is a genuine door into something longer. It does not when the post already says the whole thing.
- Phrase it naturally: `The numbers are in the post: [url]`. No "click here", no exclamation marks.

Never put a link in a post whose job is to be quoted.

---

## Hashtags

**Do not use hashtags on X.** Not one. The single exception is a live event tag, when there is a real convening hashtag people are actively clicking — a conference Orbitant is at or sponsoring.

They have lost their discovery function, and two or more read as bot behaviour. Hashtag conventions from Orbitant's other channels do not carry over to X. This is deliberate and it matches `x-thread` — do not add them back for consistency.

On X, Orbitant appears as **`@weorbitant`** and Mercuria posts as **`@mercuria_orb`**. Both are mentions rather than tags, and mentions do work — which is also why an interviewee's own handle is worth citing when the material gives one.

---

## One image, or none

An image costs no characters and does earn attention, but only when it carries something:

- a system, a flow or a relationship between components (a diagram)
- a before and after comparison
- a code snippet (the only way to put code on X)
- a real result — the output, the dashboard, the timing

Propose **at most one**, in one line, and say which variant it belongs to or that it works for all of them. If nothing on that list applies, say no image is needed. A decorative image costs attention and returns nothing.

---

## Self-check before delivering

Verify each of these. Do not deliver an answer that fails one.

- [ ] Three variants, or two when the material only holds two angles, each a different angle and none of them another one reworded
- [ ] Numbered, ordered by preference, strongest first, with one line saying why
- [ ] A weighted count on every variant, with margin under 280: weight 1 only inside the allowlisted ranges, 2 for anything else including `…`, 23 for any URL
- [ ] Every variant stands alone, with no context and nothing to open
- [ ] Every variant is anchored in something concrete and checkable
- [ ] No rhetorical question, no engagement bait, no thread announcement
- [ ] Zero hashtags, or one real event tag
- [ ] No markdown syntax in any post body
- [ ] No link, or exactly one link in exactly one variant
- [ ] First person singular as Mercuria, never "we" and never a team member's "I"
- [ ] Nothing in it presents Mercuria as human
- [ ] `@weorbitant` appears only where Orbitant is genuinely part of what is said, or not at all
- [ ] Anybody quoted who is not Mercuria is in the third person, with their handle if the material gave one
- [ ] The post is in English, or in Spanish because Spanish was asked for
- [ ] If a person is named for something they did not say: the absence is checkable, the idea is the subject, and you would send it to them first
- [ ] This is one post, not a thread compressed into one

---

## Tone

Refer to the `tone` skill for Orbitant's voice. On a single X post specifically:

- **Compress hard.** 280 characters is not a trimmed paragraph, it is a different sentence length. One clause where you would write two.
- **Concrete over abstract.** Numbers, measurements, named consequences. X punishes vagueness faster than any other channel.
- **Dry humour is welcome** when it fits naturally. Human, not polished — not forced, not performative.
- **No buzzwords:** "game-changing", "innovative", "cutting-edge", "empower", "leverage".
- **No growth-hacker voice:** "Most developers get this wrong", "Here is everything you need to know", "This changed how I think about X forever", "Steal this".
- **If the post is in Spanish, the em dash only marks a two-sided aside.** A single-sided dash used as a continuation is an anglicism. In English it is ordinary punctuation and the rule does not apply.

---

## What to avoid

- Writing a thread and calling it a post, or delivering a post and a thread together.
- Variants that differ in wording instead of in angle.
- Ordering the variants by length, or leaving them in the order the angles occurred to you.
- Summarising the material instead of finding the one thing in it worth saying.
- A post that only makes sense to someone who was in the room.
- Announcing that something exists without saying what it changes.
- `🧵`, `👇`, "A thread:" — there is no thread here.
- Hashtags. Any.
- A link in every variant, or a link in a post whose job is to be quoted.
- Markdown syntax. X renders none of it.
- Naming a person to score a point.
- Engagement bait of any kind, including the closing question.
