---
name: triage
description: |
  Inbox management for the chief-of-staff plugin. Scans Gmail and Slack for
  unread messages, prioritizes them into three tiers based on sender importance
  and goal alignment, and drafts responses in the user's voice. Dispatches the
  triage-agent for per-channel scanning. Supports channel flags: --email,
  --slack. All draft responses require explicit user confirmation before sending.
---

## Overview

This command scans your inbox across Gmail and Slack, prioritizes unread messages into three action tiers, and drafts responses in your voice for high-priority items. Run it after `/orbitant-chief-of-staff:today` to complete the morning workflow. No message is ever sent without your explicit confirmation.

## Execution Flow

1. **Invoke `orbitant-graceful-degradation`** to check which MCP servers and config files are available. This MUST run first -- do not skip it, even if you believe everything is connected.
2. **Check for channel flags** (`--email`, `--slack`). If a flag is present, only scan that channel. If no flags are present, scan all available channels.
3. **Load config files** for dispatch to the triage-agent:
   - `contacts/*.md` -- sender tier matching (check `./contacts/` then `~/.claude/contacts/`)
   - `rocks.yaml` -- goal-alignment scoring (check `./rocks.yaml` then `~/.claude/rocks.yaml`)
   - `voice.md` -- draft response style (check `./voice.md` then `~/.claude/voice.md`)
   - `constraints.yaml` -- quiet hours enforcement (check `./constraints.yaml` then `~/.claude/constraints.yaml`)
   - If a config file is missing, note it and continue -- the triage-agent handles missing configs gracefully.
4. **Dispatch `triage-agent`** once per available channel. Pass the loaded config data and a 24-hour time window. Each dispatch is independent -- one channel failing does not block the other.
5. **Merge results** from all triage-agent responses into a single consolidated list.
6. **Sort the merged list**: Tier 1 first, then Tier 2, then Tier 3. Within each tier, sort by alignment score descending (highest first).
7. **Present the triage list** using the output format below, with action options for each item.

## Channel Flags

- `--email` -- scan Gmail only
- `--slack` -- scan Slack only
- No flags -- scan all available channels

If a flagged channel is unavailable (per graceful-degradation report), print a warning and exit:
"Gmail is not available -- run /orbitant-chief-of-staff:preflight to diagnose." (or the equivalent for Slack).

If no flags and both channels are unavailable, print: "No inbox channels available -- connect Gmail or Slack via /orbitant-chief-of-staff:preflight."

## Tier System

The triage-agent implements tier assignment. This is the reference for what each tier means:

| Tier | Label | Criteria | Action |
|------|-------|----------|--------|
| Tier 1 | Respond NOW | Board members, key clients, investors, or Tier 1 contacts | Draft shown, respond immediately |
| Tier 2 | Handle today | Escalations, partner requests, HIGH-alignment items, Tier 2 contacts | Draft shown, handle within the day |
| Tier 3 | FYI / Archive | Newsletters, notifications, low-priority threads | One-line summary, suggest archive |

## Merged Results

After the triage-agent returns per-channel results:

1. Combine Gmail results and Slack results into a single list.
2. Sort globally: all Tier 1 items first, then all Tier 2, then all Tier 3.
3. Within each tier: sort by alignment score descending. If scores are equal, sort by recency (newest first).
4. Tag each item with its source channel (Gmail or Slack) so the user knows where it came from.
5. Deduplicate: if the same thread appears in both Gmail and Slack (e.g., a notification email about a Slack thread), keep the primary channel version and note the duplicate.

## Actions

After presenting the triage list, offer these actions for each item. The user refers to items by number, sender name, or subject:

- **Send** -- confirm the draft as-is and send it via the appropriate channel
- **Edit** -- modify the draft text, then send after confirmation
- **Defer** -- set aside for later; if currently Tier 1, demote to Tier 2
- **Delegate** -- specify a recipient to forward the message to
- **Archive** -- dismiss the item with no response

Present these as a compact action bar below each Tier 1 and Tier 2 item. For Tier 3, show only archive and defer options.

## Sending Protocol

**NEVER auto-send. Every send requires explicit user confirmation.**

1. When the user says "send" for an item, display the full draft one more time with the recipient and channel clearly labeled.
2. Wait for the user to confirm with "yes", "send", "confirm", or equivalent.
3. For Gmail: use `mcp__gmail__send_email` with the drafted content, correct recipient, and subject line.
4. For Slack: use `mcp__claude_ai_Slack__slack_send_message` with the drafted content and correct channel/thread.
5. After sending: confirm with "Sent to [recipient] via [channel]."
6. If the send fails: report the error and offer to retry or copy the draft to clipboard.

## Output Format

```
# Inbox Triage -- N unread items

## Tier 1 -- Respond NOW (N items)

1. jane.smith@acmecorp.io -- "Re: Contract terms" (Gmail, 2h ago)
   Alignment: HIGH (0.85) -- Revenue Acceleration
   [DRAFT]
   Hi Jane, thanks for the updated terms. I've reviewed the platform license
   option and it looks good. Let me loop in our legal team for final sign-off
   -- expect a response by end of day.
   Best, Alex

   -> [send] [edit] [defer] [delegate] [archive]

2. @board.member -- "Q1 board deck feedback" (Slack, 30m ago)
   Alignment: HIGH (0.78) -- Revenue Acceleration
   [DRAFT]
   Thanks for the feedback. I'll incorporate the updated projections and
   reshare by Thursday.

   -> [send] [edit] [defer] [delegate] [archive]

## Tier 2 -- Handle Today (N items)

3. carlos@partner.io -- "Integration timeline" (Gmail, 5h ago)
   Alignment: MED (0.52) -- Strategic Partnerships
   [DRAFT]
   Carlos, let me check on the timeline with the engineering team and
   get back to you by end of day.

   -> [send] [edit] [defer] [delegate] [archive]

## Tier 3 -- FYI / Archive (N items)

4. newsletter@techdigest.com -- "Weekly roundup" -> archive
5. notifications@github.com -- "PR #142 merged" -> archive
(N more...)

---
Processed: N Gmail + N Slack | Time window: 24h
Run /orbitant-chief-of-staff:today for your full briefing
```

Number each item sequentially across tiers so the user can reference them easily ("send 1", "defer 3"). Collapse Tier 3 items by default -- show the first two and a count of the rest. Expand the full list if the user asks.

## Quiet Hours

Read `constraints.yaml` for quiet-hours configuration:

- **Tier 1 during quiet hours**: Show the item with a quiet-hours flag but do NOT suppress it. The user decides whether to respond.
- **Tier 2 and Tier 3 during quiet hours**: Flag as "received during quiet hours" and suggest deferring to the next work window.
- If constraints.yaml is unavailable, skip quiet-hours enforcement silently.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- **MCP tools**: Work identically -- the same MCP calls are available in Cowork.
- **Config files**: Check whether rocks, voice, constraints, or contact data has been provided in the conversation context. Use it if present; skip with a note otherwise.
- **Dispatch**: The triage-agent receives config data from conversation context instead of disk. No behavioral changes otherwise.

## Key Rules

1. **NEVER auto-send.** Always show the full draft and wait for explicit confirmation before sending any message.
2. **Each channel is independent.** Gmail failure does not block Slack. Slack failure does not block Gmail.
3. **Graceful-degradation first.** Always invoke the skill before scanning. Do not probe MCP servers yourself.
4. **Always show alignment score and rationale** for Tier 1 and Tier 2 items -- the score, category, and linked rock.
5. **Respect quiet hours** from constraints.yaml. Flag but never suppress Tier 1 items.
6. **Tier 3 collapsed by default.** Show count and first two items. Expand on request.
7. **Confirm delivery.** After every send, print "Sent to [recipient] via [channel]."
8. **Number items sequentially.** Users reference items by number for actions.
9. **No hallucinated data.** If a message cannot be read, skip it and note the failure. Never fabricate senders, subjects, or content.
10. **End with /today.** Close with a pointer to `/orbitant-chief-of-staff:today` if the user hasn't run it yet.
