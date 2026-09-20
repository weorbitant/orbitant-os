---
name: orbitant-x-post
description: |
  Single standalone X (Twitter) post writer for Orbitant. Takes one piece of
  material — a Knowledge Sharing session, an interview, a blog post just
  published, a feature just shipped, a decision taken or reversed, a measurement
  that surprised us, a build-in-public moment — and returns two or three
  numbered variants of the same post: different angles on the same material,
  ordered strongest first, each annotated with its weighted character count
  against X's 280 limit.

  Activate when the user asks for a post, a tweet or a single piece for X, or
  says "un post para X", "un tuit", "algo suelto para X", "esto no da para un
  hilo", "tuitea esto", "algo corto para Twitter", "post this on X", "tweet
  this". Also trigger when the user shares material and asks for something to
  publish on X or from @WeOrbitant without asking for a thread. This skill
  writes one post, never a thread: material that holds an argument needing
  several posts goes to x-thread instead.
version: "1.0.0"
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
| Output | Two or three variants of one post, pick one | One thread, every post ships together |

**Hand the material to `x-thread` when it holds a real argument that needs unpacking.** The signals are concrete: you cannot state the point without a "because" that itself needs a "because"; you keep wanting a second post to justify the first; the honest version needs evidence that will not fit in 280 characters. That is a thread. Say so and stop. Do not compress an argument into one post, and never deliver a post and a thread in the same answer.

`x-thread` says the same thing from the other side: material that fits in a single post ships as a single post. This skill is where that lands.

---

## What X imposes

Platform facts. They are not style preferences and you cannot write around them.

- **280 characters per post, hard.** A post at 281 does not post.
- **The limit is weighted, not a plain character count.** Most Latin text weighs 1 per character, and that includes Spanish accents and ñ. **Emoji and CJK characters weigh 2**, so three emoji cost six.
- **A URL always counts as 23**, however short or long it is. X rewrites every link through its own shortener before counting it.
- **No text formatting.** X renders no markdown. `**bold**` shows up as literal asterisks, `##` as literal hashes. The line break is the only formatting tool you have.
- **The post is read with no context around it**, by people who have never heard of Orbitant.
- **Links cost reach.** A post carrying a link is distributed less than the same post without one.
- **Hashtags do nothing.** See the Hashtags section.
- **Code does not survive as text.** No monospace, and indentation is stripped. Code has to be an image.

---

## Input

### Source material

Read it in full before writing anything. Then identify which kind you have: it decides what you are looking for, and whether there is a link at all.

| Source | What makes it postable |
|---|---|
| **Knowledge Sharing session** | The one claim the room pushed back on. Not the agenda, not what was covered |
| **An interview with someone** | A sentence only that person could say, because of what they have lived |
| **A blog post just published** | The single finding the post is built on. This is the one source that arrives with a public URL |
| **A feature just shipped** | What is possible now that was not possible last week. A changelog line is not a post |
| **A decision taken or reversed** | The reason and what it cost. A reversal beats a decision: saying what you stopped doing is rarer than saying what you started |
| **A measurement that surprised us** | The number and the expectation it broke. The surprise is the post, not the metric |
| **A build-in-public moment** | The unfinished state, said plainly, while it is still unfinished |

No row outranks another. An interview is one source among seven, and a post built on one is not automatically better than a post built on a measurement or on a feature that shipped on Thursday.

If the material holds nothing from the right-hand column — only that something exists, or that a session took place — say so. There is no post in it yet, and inventing a reason to care is how an account loses the people it already has.

### Account and voice

Ask which account posts if it is not stated and the answer would change the copy. Default to the company account.

| Account | Pronoun | Self-mention | Signature |
|---|---|---|---|
| **Company** (`@WeOrbitant`) | "we" | Never — the account *is* Orbitant | None |
| **Personal** (a team member) | "I" | At most one `@WeOrbitant`, and only if the work was Orbitant's | The lived experience is the signature |

On a personal account the post must read as something that person actually did, decided or measured — first person singular. Do not write a company announcement and paste a name on it. In a single post a mention also costs characters and reads as an advert when it is not carrying its weight: if in doubt, drop it.

### Language

**Follow the language of the source.** Spanish material, Spanish post. English material, English post. One version — never both, and never a translation alongside.

If the source mixes languages, use the language of the bulk of it. Keep technical English terms in English even in a Spanish post: *framework*, *pipeline*, *deployment*, *token*.

---

## Step 1 — Find the anchor

Before writing anything, name the **anchor**: the one concrete, true, checkable thing the post stands on. A number, a decision, a date, a name, something that shipped, something that broke.

> Anchor: "The pipeline went from 22 minutes to 8 after we replaced one integration test."
>
> Anchor: "We reversed the multi-repo split three weeks after doing it."
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
- **Do not open with "We", "Our" or "Orbitant".** Open with the anchor. Exception: naming a teammate is encouraged, to give them credit.
- **Concrete beats clever.** A number, a measurement or a named consequence outperforms wordplay.
- **Report the weighted character count** for every variant.
- **Short lines and blank lines** are the whole formatting toolkit. Three lines of text at most.
- **Lists inside a post:** one item per line, three items maximum, no bullet characters. More than three means it is a thread.
- **No engagement bait.** Not "Agree?", not "What do you think?", not "Follow for more", not "Bookmark this". Traction is the post being worth stopping for, not the reader being asked to react.

### Examples

Do:

- `Our pipeline took 22 minutes. One integration test was eating 13 of them, because it started a real Postgres on every run.`
- `We split the repo in three. Three weeks later we put it back together, and we wrote down what the round trip cost us.`

Don't:

- `Have you ever wondered why your CI is so slow?` — rhetorical question, invites a scroll
- `Excited to share our latest engineering insights!` — announces enthusiasm, delivers nothing
- `10 lessons we learned optimising our pipeline 🧵` — growth-hacker voice, and it is not even a thread

---

## Step 4 — Order them

**Number the variants and order them by your own preference, strongest first.** Not by length, and not in the order the angles occurred to you.

The order is load-bearing, for two reasons:

- A human picks one with a reaction in Slack. The order is your recommendation, and it saves them re-reading three posts to work out which one you believe in.
- **An automated run takes the first one** and posts it. Variant 1 is what ships when nobody chooses.

So variant 1 is the one you would publish if the decision were yours. Do not lead with the safe one out of caution: if the sharp variant is the best post, it goes first. Close with one line saying why the order is what it is, so a reviewer can argue with the reasoning and not only with the copy.

---

## Naming a person

The sharpest single post available is one that names a real person and says what they did *not* say or do. It is also the easiest to get wrong, and the failure is not subtle: the post reads as a reproach, and the account pays for it long after the post is gone.

The line is where the sentence puts its subject. **The subject is the idea. The person is how you got to it.**

> Do: `Le preguntamos a [Nombre] cómo mide el impacto de los agentes. Contestó con latencia y con coste, y ni una sola vez con "productividad". Esa ausencia es la respuesta más honesta que hemos escuchado este año.`
>
> Don't: `[Nombre] no supo qué contestar cuando le preguntamos por productividad.`

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

On X the brand appears as **`@WeOrbitant`**, which is a mention, and mentions do work.

---

## One image, or none

An image costs no characters and does earn attention, but only when it carries something:

- a system, a flow or a relationship between components (a diagram)
- a before and after comparison
- a code snippet (the only way to put code on X)
- a real result — the output, the dashboard, the timing

Propose **at most one**, in one line, and say which variant it belongs to or that it works for all of them. If nothing on that list applies, say no image is needed. A decorative image costs attention and returns nothing.

---

## Output format

Plain text, ready to paste into X, Typefully or n8n. No markdown in the post bodies.

**The `VARIANT n — [angle] — c/280` line is the delimiter, and that is a contract.** One header line per variant, one blank line between variants, nothing else at that level: a reviewer reacts to one of them in Slack, and an automated step takes the body under `VARIANT 1`. Do not repeat the posts in prose alongside the block — two copies drift the moment someone corrects one.

```text
X POST — [the anchor in one sentence]

Account:  @WeOrbitant (company) | personal — [name]
Language: [es | en]
Source:   [KS session | interview with (name) | blog post | shipped feature | decision | measurement | build-in-public]
Link:     none | [url], in VARIANT [n] only

VARIANT 1 — [angle, 3 to 6 words] — [n]/280
[post]

VARIANT 2 — [angle] — [n]/280
[post]

VARIANT 3 — [angle] — [n]/280
[post]

ORDER — [one sentence: why VARIANT 1 is first]

IMAGE — [what it shows, one line, and which variant] | none
```

### Self-check before delivering

Verify each of these. Do not deliver an answer that fails one.

- [ ] Two or three variants, each a different angle, none of them another one reworded
- [ ] Ordered by preference, strongest first, and `ORDER` says why
- [ ] A weighted count on every variant, none over 280, emoji counted as 2, any URL counted as 23
- [ ] Every variant stands alone, with no context and nothing to open
- [ ] Every variant is anchored in something concrete and checkable
- [ ] No rhetorical question, no engagement bait, no thread announcement
- [ ] Zero hashtags, or one real event tag
- [ ] No markdown syntax in any post body
- [ ] No link, or exactly one link in exactly one variant
- [ ] The pronoun matches the account
- [ ] The post language matches the source language
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
- **In Spanish, the em dash only marks a two-sided aside.** A single-sided dash used as a continuation is an anglicism.

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
