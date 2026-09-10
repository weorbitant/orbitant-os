---
name: orbitant-x-thread
description: |
  X (Twitter) thread writer for Orbitant. Turns a published blog post OR native
  material — a Knowledge Sharing transcript, a Slack thread, a feature just
  shipped, a build-in-public moment — into a thread ready to post: an opening
  post that stands alone, 4 to 8 body posts of one idea each, and a closing
  post, every one annotated with its character count against X's 280 limit.

  Activate when the user asks for a thread, an X post or a Twitter post, or says
  "haz un hilo", "convierte esto en un hilo", "esto da para un hilo", "thread
  this", "algo para X", "para Twitter". Also trigger when the user shares a blog
  post, a transcript or a Slack conversation and asks for social copy while
  mentioning X, Twitter, threads or @WeOrbitant — even if they never say the
  word "thread". This skill writes for X only; it is the wrong skill for
  LinkedIn, YouTube or the newsletter.
version: "1.0.0"
license: MIT
metadata:
  author: orbitant
  tags: marketing, x, twitter, thread, social-media, content, engagement
---

# Orbitant X Thread Skill

A thread is one argument spread across several posts. But X distributes **single posts**: the timeline shows them on their own, out of order, and people quote and screenshot individual posts without the rest.

So a thread has two jobs at once. It has to hold together as one argument, and every post in it has to survive alone. Every rule below follows from that.

---

## What X imposes

Platform facts. They are not style preferences and you cannot write around them.

- **280 characters per post, hard.** A post at 281 does not post. Count every one.
- **No text formatting.** X renders no markdown. `**bold**` shows up as literal asterisks, `##` as literal hashes. The line break is the only formatting tool you have.
- **Posts are read out of order and out of context**, pulled into a timeline between two unrelated things.
- **Links cost reach.** A link in the opening post suppresses distribution. One link per thread, in the closing post.
- **Hashtags do nothing.** See the Hashtags section.
- **Code does not survive as text.** No monospace, and indentation is stripped. Code has to be an image.

---

## Input

### Source material

Read it in full before writing anything, and identify which kind you have — it decides the closing post.

| Source | What it is | Closing post |
|---|---|---|
| **Blog-derived** | A published post in Markdown, with a URL | Ends with the link |
| **Native** | KS transcript, Slack thread, a feature just shipped, a build-in-public moment, a decision you made | Ends with a statement, no link |

Your job is never to summarise the source. It is to find the one argument inside it that earns a thread.

If the material holds no real argument — only an announcement, or a single fact — say so. A thread is the wrong format for it, and one good post beats a padded thread.

### Account and voice

Ask which account posts if it is not stated and the answer would change the copy. Default to the company account.

| Account | Pronoun | Self-mention | Sign-off |
|---|---|---|---|
| **Company** (`@WeOrbitant`) | "we" | Never — the account *is* Orbitant | None |
| **Personal** (a team member) | "I" | One `@WeOrbitant` mention, in the closing post | The lived experience is the sign-off |

On a personal account the thread must read as something that person actually did, decided or measured — first person singular. Do not write a company announcement and paste a name on it.

### Language

**Follow the language of the source.** Spanish material, Spanish thread. English material, English thread. One version — never both, and never a translation alongside.

If the source mixes languages, use the language of the bulk of it. Keep technical English terms in English even in a Spanish thread: *framework*, *pipeline*, *deployment*, *token*.

---

## Step 1 — Fix the spine

Before writing any post, write the **spine** in one sentence: the single argument the whole thread makes.

**The spine is the concept, the principle or the pattern — never the tool, the client or the implementation.** If the source uses a real project, a framework or a specific stack to illustrate the point, those are evidence. They are never the subject.

> Spine: "Dependencies pointing inward is what makes business logic survive a framework change."
>
> Spine: "The cost of a slow pipeline is not the wait — it is the batching behaviour it forces on the team."

**Test:** if you cannot state the spine in one sentence, you do not have a thread yet. You have two threads, or a blog post.

---

## Step 2 — The opening post

X surfaces this post on its own. Assume most people read only this one. **It has to deliver value standing alone** — someone who never opens the thread should still walk away with something.

### Rules

- **A statement, never a rhetorical question.** A question invites "no" and a scroll.
- **No link.** It goes in the closing post, once.
- **No thread announcement.** No "🧵", no "A thread:", no "👇", no "Let me explain:". A post that has to announce it is a thread is not a hook.
- **Target ~200 of the 280 characters.** Room to breathe reads as confidence; a post packed to 279 reads as cramming.
- **Do not open with "We", "Our" or "Orbitant".** Open with the insight. Exception: featuring a teammate by name is encouraged, to give them credit.
- **Concrete beats clever.** A number, a measurement or a named consequence outperforms wordplay.

### Examples

Do:

- `We measured it: with hexagonal architecture the agent needed 3 to 5x more context to make the same change.`
- `Our CI took 22 minutes. One integration test was eating 60% of that, because it span up a real Postgres on every run.`
- `AI is writing malicious npm packages now, and they are harder to spot than the ones humans wrote.`

Don't:

- `Have you ever wondered why your CI is so slow? 🧵` — rhetorical question, plus thread emoji
- `Frontend architecture: a thread 👇` — announces itself, delivers nothing
- `Here is everything we learned about pipeline optimisation. Let me explain: 1/12` — growth-hacker voice, and a hardcoded total you will want to change

---

## Step 3 — The body posts (4 to 8)

### Rules

- **One idea per post.** If a post carries two ideas, it is two posts.
- **Every post must parse alone.** No post may depend on having read the previous one. Openers that dangle — "And that is when we realised", "This is why it matters" — are meaningless in a timeline.
- **Every post should be quotable.** Assume any one of them gets quoted with no context attached.
- **Report the character count** for each, and keep every one under 280.
- **Use short lines and blank lines** as the structure. That is the whole formatting toolkit.
- **Lists inside a post:** one item per line, three items maximum, no bullet characters. More than three means it should be several posts.
- **Numbering:** only if the thread is genuinely enumerable. Numbering a narrative turns it into a listicle. Never hardcode a total (`1/7`) — you will add or cut a post.
- **Code:** one short snippet at most, as an image.
- **No links.** One link per thread, in the closing post.

Give one post to the honest limitation — where the idea stops working. A thread that says so is trusted more than one that does not.

### Example

> Don't: `And that was when we found the real problem.`
>
> Do: `The real problem was the test, not the pipeline. It span up a real Postgres for every run — 13 of the 22 minutes.`

---

## Step 4 — The closing post

**Blog-derived** — the link, phrased naturally. No "click here", no exclamation marks.

- `Full breakdown, with the numbers: [url]`
- `We wrote up the whole migration here: [url]`

**Native** — a statement that encapsulates the spine. Memorable, not a generic call to action. `Building with intention, not chaos` — not `Read more on our blog`.

On a personal account, this is where the single `@WeOrbitant` mention goes, if the work was Orbitant's.

**No engagement bait.** Not "Follow for more", not "Bookmark this", not "What do you think?", not "Agree?", not "RT if you have lived this".

---

## Step 5 — Suggest one visual

Propose **one** image, for the single post that most needs it — one line saying what it shows and which post it attaches to. Not a brief per post.

An image earns its slot when it carries:

- a system, a flow or a relationship between components (a diagram)
- a before/after comparison
- a code snippet (the only way to put code on X)
- a real result — the output, the dashboard, the timing

A thread with one well-placed image outperforms both a thread with none and a thread with an image on every post. If nothing in that list applies, say no image is needed. A decorative image costs attention and returns nothing.

---

## Hashtags

**Do not use hashtags on X.** Not one. The single exception is a live event tag when there is a real convening hashtag people are actively clicking — a conference Orbitant is at or sponsoring.

They have lost their discovery function. The timeline surfaces content by semantic relevance and engagement graph, not by hashtag index. Two or more now read as bot behaviour and correlate with *less* reach.

Hashtag conventions from Orbitant's other channels do not carry over to X. This is deliberate — do not add them back for consistency.

On X the brand appears as **`@WeOrbitant`**, which is a mention, and mentions do work.

---

## Output format

Plain text, ready to paste into X, Typefully or n8n. No markdown in the post bodies.

```text
THREAD — [spine in one sentence]

Account:  @WeOrbitant (company) | personal — [name]
Language: [es | en]
Source:   [blog post URL | native: what it came from]

POST 1 — [n]/280
[opening post]

POST 2 — [n]/280
[body post]

POST 3 — [n]/280
[body post]

POST 4 — [n]/280
[body post]

POST 5 — [n]/280
[closing post]

IMAGE — attach to POST [n]
[what it shows, one line]
```

Total: 6 to 10 posts — one opening, 4 to 8 body, one closing. More than 10 means the spine is carrying too much.

### Self-check before delivering

Verify each of these. Do not deliver a thread that fails one.

- [ ] A character count reported for every post, none over 280
- [ ] The opening post has no link
- [ ] The opening post delivers value standing alone
- [ ] Every body post parses with no prior context
- [ ] Zero hashtags, or one real event tag
- [ ] No markdown syntax anywhere in the post bodies
- [ ] Exactly one link, in the closing post — or none, if native
- [ ] The spine is a concept or principle, not a tool or a client
- [ ] The pronoun matches the account
- [ ] The thread language matches the source language
- [ ] 6 to 10 posts total

---

## Tone

Refer to the `tone` skill for Orbitant's voice. On X specifically:

- **Compress hard.** 280 characters is not a trimmed paragraph, it is a different sentence length. One clause where you would write two.
- **Concrete over abstract.** Numbers, measurements, named consequences. X punishes vagueness faster than any other channel.
- **Dry humour is welcome** when it fits naturally. Human, not polished — not forced, not performative.
- **No buzzwords:** "game-changing", "innovative", "cutting-edge", "empower", "leverage".
- **No growth-hacker voice.** The fastest way to lose a technical audience: "Here is everything you need to know", "10 lessons I learned", "Most developers get this wrong", "This changed how I think about X forever", "Steal this".
- **In Spanish, the em dash only marks a two-sided aside.** A single-sided dash used as a continuation is an anglicism.

---

## What to avoid

- Recycling copy written for another channel. Start from the source material, never from an existing post.
- Summarising the source instead of extracting one argument from it.
- An opening post that only makes sense once you have read the thread.
- Posts that only make sense once you have read the blog post.
- Hashtags. Any.
- A link in the opening post, or links scattered through the body.
- Markdown syntax — X renders none of it.
- Code as text.
- `🧵`, `👇`, "A thread:", and every other way of announcing a thread instead of starting one.
- Engagement bait of any kind, including the closing question.
- Padding a thin idea to reach a post count. A thread that runs out of argument at post 4 should be four posts, or one.
