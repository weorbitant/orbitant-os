---
name: orbitant-voice-drafting
description: |
  Writes drafts in the user's voice using voice.md for tone and style. Activates during
  /triage, /crm, or any "draft an email/message" request. Never sends without confirmation.
version: "1.0.0"
license: MIT
user-invocable: false
metadata:
  author: orbitant
  tags: chief-of-staff, voice, drafting, writing, email, slack, communication
---

## Overview

This skill writes emails, Slack messages, meeting follow-ups, and other communications in the user's personal voice. It reads `voice.md` to extract tone, formality levels, length preferences, signature, and phrase patterns, then applies them to every draft. No message is ever sent without explicit user confirmation — every output is a draft that the user reviews first.

## When This Skill Activates

This skill is called as a subroutine whenever a chief-of-staff command needs to produce written communication:

- **`/triage`** — drafting response emails for triaged inbox items
- **`/crm`** — composing outreach messages, follow-ups, and relationship touches
- **`/prep`** — writing pre-meeting notes or post-meeting follow-ups
- **Ad-hoc requests** — "draft an email to...", "write a Slack message for...", "reply to this saying..."

It does NOT run standalone. Other commands invoke it when they need to generate a draft.

## Loading Voice Profile

### Lookup Order

1. `./voice.md` (project root)
2. `~/.claude/voice.md` (global)

Use the first file found. Parse these sections:

- **General Tone** — the baseline personality of the writing (e.g., warm, direct, understated)
- **Formality Levels** — separate style rules for Clients, Team, and Board audiences
- **Length Preferences** — max length targets per channel (email, Slack, etc.)
- **Phrases I Use** — expressions the user naturally reaches for
- **Phrases I Avoid** — words and patterns the user dislikes
- **Email Signature** — the block appended to email drafts

### If voice.md Is Not Found

Do NOT block the calling command. Instead:

1. Warn the user once: "Voice profile not found — drafts will use default voice (professional, concise, friendly). Create `~/.claude/voice.md` from the template to personalize."
2. Apply sensible defaults: professional tone, concise sentences, friendly but not casual
3. Default to Client-level formality when audience is unclear
4. Omit email signature (none available)
5. Continue with the draft — never refuse to write because the profile is missing

## Formality Detection

Determine the correct formality level for each draft using this cascade:

### Step 1: Check Contact Profile

If the recipient has a file in `contacts/*.md`, read their `tier` and `communication_style` fields. These take priority — the user has explicitly defined how to communicate with this person.

### Step 2: Infer from Channel and Audience

If no contact profile exists, infer from context:

| Signal | Formality Level |
|--------|----------------|
| Email to external person | Client |
| Email to investor or board member | Board |
| Slack message in internal channel | Team |
| Slack DM to a colleague | Team |
| Formal report or update to stakeholders | Board |
| Reply to a casual internal thread | Team |

### Step 3: Default

If the audience is ambiguous, default to **Client** — more formal is always safer than too casual. The user can ask to dial it down.

### Applying the Level

Once the level is determined, pull the matching section from voice.md's Formality Levels (Clients, Team, or Board) and apply those specific style rules to the draft. Each level may differ in greeting style, sentence structure, sign-off, and overall register.

## Draft Generation Rules

### Length

Respect the limits defined in voice.md's Length Preferences table. If the table says "Email: 3-5 sentences", keep to that range. If a draft requires more content, break it into clearly structured sections rather than writing a wall of text.

### Phrases

- Weave "Phrases I Use" naturally where they fit the context. Do not force them — if a phrase doesn't fit, skip it. Aim for 1-2 per draft, not every single one.
- Never use any expression from "Phrases I Avoid". Scan every draft before presenting it.

### Signature

- Append the email signature from voice.md to all email drafts.
- Do NOT append signatures to Slack messages, meeting notes, or other non-email channels.

### Greetings and Sign-offs

Match the greeting and closing to the formality level. Client and Board levels use the patterns defined in voice.md. Team level is more relaxed — first names, shorter greetings, lighter closings.

### Replies

When drafting a reply (not a fresh message):

1. Acknowledge the sender's key point or question in the opening line
2. Do not repeat their entire message back to them
3. Address each point they raised, in order
4. Match their energy — if they wrote two sentences, don't reply with five paragraphs

## Output Format

Present every draft using this structure:

```
## Draft — [Channel] to [Recipient]
**Formality:** [Client/Team/Board]
**Context:** [one-line summary of why this draft exists]

---
[Draft content here, including signature if email]
---

> This is a draft. Reply with "send" to confirm, or edit and reply with the changes.
```

For batch drafts (e.g., multiple triage responses), present each draft sequentially with the same format. Number them for easy reference: "Draft 1 of 3", "Draft 2 of 3", etc.

## Cowork Adaptation

When running inside a Cowork session without filesystem access:

- If `voice.md` content has been pasted into the conversation or shared in context, extract and use it. Apply the exact same drafting rules.
- If no voice data is available in context, use the default voice (professional, concise, friendly) and note it in the draft output.
- All other drafting logic — formality detection, phrase handling, output format — works identically.

## Key Rules

1. **NEVER send without explicit user confirmation** — always present the draft first and wait for "send" or edits
2. **Respect all length limits** from voice.md — if the profile says 3-5 sentences, stay in that range
3. **If voice.md is missing, warn once per session** and use defaults — do not warn repeatedly or refuse to draft
4. **Don't force phrases** — weave them naturally or skip them entirely; forced phrases sound worse than none
5. **Adapt formality per recipient, not per command** — the same /triage run may produce a Client-level reply and a Team-level reply
6. **For multi-recipient drafts, use the highest formality level** among all recipients — never address a board member with Team-level casualness
7. **Scan every draft for "Phrases I Avoid"** before presenting — this is a hard constraint, not a suggestion
