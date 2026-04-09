---
name: orbitant-newsletter
description: |
  Drafts the monthly Orbitant newsletter from Slack links, Knowledge Sharing
  recaps, blog posts, and meetup updates. Activate when the user mentions
  "newsletter", "monthly email", "prepare the newsletter", "newsletter de [mes]",
  "borrador de newsletter", or provides materials for the monthly send (KS recap,
  Slack links, blog posts). Also triggers when asked to "draft the email for this
  month" or "prepare the MailerLite send". Curates Slack channel links autonomously,
  writes all copy in English, and outputs a complete Markdown draft ready for
  MailerLite layout.
version: "1.0.0"
license: MIT
metadata:
  author: orbitant
  tags: marketing, newsletter, email, mailerlite, slack, knowledge-sharing, meetup
---

# Orbitant Newsletter — Monthly Preparation Skill

## What this skill does

Generates the complete draft of Orbitant's monthly newsletter from that month's materials. The output is a Markdown document structured by sections, ready for layout in MailerLite, with all copy already written in English.

---

## Audience and tone

- **Language**: English exclusively. Never Spanish in the newsletter body.
- **Audience**: Senior developers, CTOs, engineers, and tech professionals in the Orbitant ecosystem (clients, community, KS and meetup attendees).
- **Tone**: Direct, technical but accessible, no hype. The same as the blog and LinkedIn: practical, honest, approachable. Never salesy. Orbitant appears contextually, never as explicit promotion.
- **Style**: Short sentences. Bold for emphasizing key concepts within section copy. No em dashes. No bullet points in narrative section copy (bullet points are used in resource lists and "What you'll get" sections).

---

## Prerequisites

- **Slack MCP server** — Required for autonomous link curation. The skill uses `slack_search_public_and_private` and `slack_read_thread` tools. Without it, the user must provide Slack links manually.
- **Access to orbitant.com/en/insights/** — For fetching latest blog posts (section 6).

---

## Workflow on activation

When Alma says something like "prepare the newsletter for [month]", the skill follows this order:

### Step 1 — Fetch Slack links autonomously

Claude searches Slack directly, without Alma needing to prepare anything in Notion. Channels to monitor:

- `#knowledge-sharing`
- `#ai-coding`
- `#ai-stuff`
- `#open-source`
- `#cybersecurity-for-hackers`

**Cutoff date**: Claude searches for messages posted from the day after the previous newsletter was sent until the current date. Alma provides the send date of the previous edition if Claude doesn't know it.

**Search process:**
1. Use `slack_search_public_and_private` with `after:[date]` and `has:link` filters in each channel.
2. For each message that generated a thread, read the full thread with `slack_read_thread` to understand the actual discussion before deciding whether to include it.
3. Filter: keep messages with threads containing real discussion, those with editorial commentary from the person sharing, and the most technically relevant ones.
4. Exclude: duplicates from the previous month, entertainment links without technical substance, local events without general interest, messages without an external linkable URL. Internal discussions without an external URL are not included as list items.
5. Group by topic into 3-5 categories. Don't force more than 5.
6. Write each item in English on a single line, incorporating the team's nuance or opinion if available, without directly attributing to the person's name.

**Known limitation**: Slack's API search doesn't guarantee capturing 100% of messages in high-volume channels. Alma can manually add any link she wants to include that Claude didn't pick up.

### Step 2 — Ask Alma for inputs that can't be obtained autonomously

Claude requests everything at once, at the start, only what it can't obtain on its own:

1. **Past KS — YouTube video URL**
2. **Past KS — video description** (copy-paste from YouTube, ES or EN version). YouTube is blocked. The full transcript is also valid.
3. **Past KS — resources mentioned** (slides, repos, articles), if not in the video description.
4. **Next KS — full details**: title, speaker (name + role + LinkedIn URL), date, language (Spanish/English).
5. **Featured post of the month**: URL of the featured post.
6. **Meetup**: Are photos available for the carousel? (yes/no/pending) + next meetup details if confirmed (date, speaker).

### Step 3 — Generate the complete draft

With Alma's inputs and the already curated Slack links, Claude writes the complete draft following the section structure described below.

---

## Fixed newsletter structure

### 1. SUBJECT LINE AND PREHEADER

Two separate fields in MailerLite. Always indicate them separately and labeled.

- **Subject**: Short. Can be the past KS headline, a question, or a tension point from the month.
- **Preheader**: Complements the subject without repeating it. No initial verb. Focus on the content or on the hook of another section (can reference the next KS). One short sentence maximum.

Real examples:
- Subject: *"Who reviews the AI's code?"* / Preheader: *"Scale or go extinct. Up next in our KS."*
- Subject: *"AI speed without structure is a liability"* / Preheader: *"Juan Macías on spec-driven development with Claude Code."*

### 2. PAST KS — Knowledge Sharing recap of the month

- **H1 headline**: Evocative, not descriptive. Captures the tension or the problem the session solves. Can be a direct speaker quote in quotation marks with attribution. Real examples: *"npm publishing isn't what it used to be"*, *"What happens when no one knows if it is working"*, *"AI speed without structure is a liability" —Juan Macías*.
- **Intro paragraph**: 2-3 sentences. Speaker with name + role linked to LinkedIn. Concrete focus of the talk. Ends with: *"If you couldn't attend, we've published the full session on [our YouTube channel](URL). You can watch it here 👇"*
- **Thumbnail**: Placeholder `[VIDEO THUMBNAIL — speaker name, role]`
- **"💡 In this session you'll discover:"**: List of 4-7 points. Concept in bold + brief description.
- **"⚒️ Resources from the session:"**: List of links with descriptive anchor text.
- **Blockquote**: *"Next launch: our new public Knowledge Sharing will be on **[day, date]**"*

### 3. NEXT KS — Upcoming Knowledge Sharing announcement

- **H2 headline**: Official session title.
- **Intro paragraph**: 2-3 sentences. Speaker with linked name + role. What the session will cover, generating curiosity without spoiling.
- **Details**:
  ```
  📅 [date]
  🕔 17:00 CET/CEST (depending on time of year)
  🇪🇸 Session held in Spanish / 🇬🇧 Session held in English
  💻 Online and free
  ```
- **CTA**: `[Register now]` (link added by Alma in MailerLite)

### 4. FEATURED BLOG POST

- **H2 headline**: Actual post title.
- **Image**: Placeholder `[FEATURED IMAGE]`
- **Byline**: *"By [name linked to LinkedIn], role"* — only for individual authors. Omit for corporate posts.
- **Excerpt**: The first 2-3 sentences of the post as they appear on the blog + `[Read more](URL)`. Use the actual text, don't paraphrase.

### 5. WHAT WE'RE TALKING ABOUT IN SLACK

- Maximum 12-15 items total, grouped in 3-5 thematic categories.
- Each item: `[Descriptive anchor text](URL)` — **single-line** description. Never paragraphs.
- Every item must have a public external URL. No link, no inclusion.
- Don't repeat links that appeared in the previous edition.
- Common categories: *AI-Powered Development*, *Security & Open Source*, *Architecture & Engineering*, *Worth the Read*, *Tools & Resources*. Adapted to the month.

### 6. LATEST FROM OUR BLOG

Posts from the month other than the featured one. Obtained from the blog feed: Alma doesn't need to list them.

Per post: title in bold + placeholder `[POST IMAGE]` + opening excerpt + `[Read more](URL)`.

### 7. COMMUNITY — Node.js Madrid Meetup

Always include when there was a meetup that month or there's an upcoming one confirmed.

- **H2 headline**: Evocative of the session content. Changes every month. Never reuse the same title from previous editions or use generic formulas. Real example: *"Node.js Madrid: Growth doesn't stop at Senior"*.
- **Photos**: Placeholder `[MEETUP PHOTOS CAROUSEL]` if photos are available.
- **Paragraph**: Recap of the past event (speaker, topic, atmosphere). If there's a confirmed upcoming meetup: details and CTA `[Join the meetup]`.

### 8. CLOSING

Fixed and invariable format:

> That's our **[Month]** snapshot. See you next month with fresh ideas and sharper insights.

---

## Writing rules

- No em dashes (—). Use comma, semicolon, or period.
- Bold for key concepts, not for decoration.
- No exclamation marks except for celebrating a concrete milestone.
- No filler phrases: "It's no secret that...", "In today's world...", "We're excited to...", etc.
- Orbitant appears contextually. Never explicit self-promotion.
- Speakers: name linked to LinkedIn + role. Never open the second paragraph with the speaker's name.
- CTA buttons: short and direct text. "Register now", "Read more", "Join the meetup".

---

## Expected output

Markdown document with all sections in order. Include:
- Subject and preheader at the top, clearly separated and labeled.
- All copy fully written.
- Clearly marked placeholders for images, thumbnails, and carousels.
- URLs for all links.
- `[NOTE: ...]` annotations where Alma needs to complete something.

---

## Previous editions reference

Published editions: December 2025, January 2026, February 2026, March 2026.

Key patterns:
- The past KS headline reformulates the problem or is a speaker quote. Never the literal session title.
- The "Next launch" block is a visual blockquote with italic and bold typography.
- The Slack section has 10-15 items, grouped in 4-5 categories. Each item: one line.
- The "[Month] snapshot" closing is invariable.
- Meetup photos go in a carousel.
- The meetup section headline changes every month and reflects the session content.
- Next KS details always include: date, time, language, and "💻 Online and free".
- The newsletter is sent the Wednesday after the KS at 8:45 CET. Scheduling is done by Alma in MailerLite.
