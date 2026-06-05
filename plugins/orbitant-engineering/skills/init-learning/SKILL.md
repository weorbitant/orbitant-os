---
name: orbitant-init-learning
description: |
  Use when the user wants to set up or update their learning profile, configure learning
  preferences, update their role or gaps, add feedback from reviews or 1:1s, or when
  any other learning skill detects no profile exists. Triggers on: "set up learning",
  "update my learning profile", "init learning", or pasting performance feedback.
license: MIT
version: "0.1.0"
metadata:
  author: david
  tags: learning, profile, setup, onboarding, feedback, gaps, strengths
---

## Overview

Create or update the learner profile at `~/.claude/learning/profile.md`. This profile
drives all other learning skills — it defines who the learner is, where they want to
grow, and how they prefer to learn.

## When to Use

- First-time setup of the learning system
- Updating role, gaps, strengths, or goals after a change
- Processing new feedback (performance review, 1:1 notes, peer feedback)
- When another learning skill says "run /init-learning first"

## Process

### New Profile (profile.md does not exist)

Ask one question at a time. Wait for the answer before asking the next.
Use a warm, conversational tone. Every question should feel easy to answer — offer
concrete options the user can pick from, edit, or use as inspiration.

1. **Name**: "What should I call you?"

2. **Role**: "What best describes your current role?"
   - A. Junior Engineer
   - B. Mid-level Engineer
   - C. Senior Engineer
   - D. Staff / Principal Engineer
   - E. Tech Lead / Engineering Manager
   - F. Data Scientist / ML Engineer
   - G. Designer
   - H. Product Manager
   - I. Something else — tell me!

3. **Strengths**: "Which of these are you already confident in? Pick all that apply, or add your own."
   Present a categorized menu based on their role. For engineers, show:
   - **Languages**: Python, JavaScript/TypeScript, Go, Rust, Java, C#, etc.
   - **Frontend**: React, Vue, CSS/styling, accessibility, responsive design
   - **Backend**: APIs, databases, system design, microservices, caching
   - **Infrastructure**: Docker, Kubernetes, CI/CD, cloud (AWS/GCP/Azure), IaC
   - **Data**: SQL, data modeling, ETL/pipelines, analytics, ML/AI
   - **Practices**: Testing, code review, architecture, documentation
   - **Soft skills**: Mentoring, technical writing, cross-team communication, presenting

   For non-engineering roles, adapt categories accordingly (e.g., for PMs: discovery, roadmapping, analytics, stakeholder management).

   Tell the user: "Just list the letters or names — no need to be exhaustive, we can always update later."

4. **Gaps**: "Now the fun part — where do you want to grow? Here are common areas people want to improve. Pick any that resonate, or add your own."
   Present the SAME categories as strengths, but highlight the ones the user did NOT pick.
   Example: "You didn't mention frontend or infrastructure — are any of these gaps you'd like to close?"
   - Show the unpicked categories as suggestions
   - Add: "Or is there something completely different you've been wanting to learn?"

5. **Goals**: "What's driving your learning? Pick one or tell me in your own words."
   - A. Get promoted to the next level
   - B. Switch specialties (e.g., backend → full-stack, IC → management)
   - C. Be more independent / stop relying on others for [area]
   - D. Keep up with the industry (new tools, frameworks, practices)
   - E. Prepare for a specific project or responsibility coming up
   - F. Pure curiosity — I just want to learn new things
   - G. Something else

6. **Learning style**: "How do you learn best? Pick one."
   - A. **Guided** — walk me through step by step, explain as we go
   - B. **Challenge-based** — give me a problem and success criteria, I'll figure it out
   - C. **Reading** — curate articles, docs, and books for me to study (great for mobile)
   - D. **Adaptive** — ask me each session based on my mood and context

   "You can always override this per session — this just sets your default."

7. **Session length**: "How much time do you usually have for a learning session?"
   - A. **30 min** — quick focused bursts
   - B. **60 min** — a solid lunch-break session
   - C. **90 min** — deep work block
   - D. **120 min** — extended deep dive

   "This helps me size each lesson milestone so it fits in one sitting."

8. **Feedback** (optional): "Last one! Do you have any feedback you'd like me to factor in? This could be:"
   - A performance review or self-assessment
   - Notes from a 1:1 with your manager
   - Peer feedback or 360 review
   - A personal reflection on what you want to improve

   "Just paste it here and I'll extract the key themes. Or type 'skip' to finish."

   If provided: extract themes, present them as a bullet list, and confirm with the user before saving. Example: "From your feedback, I'm picking up these themes: [list]. Look right?"

Create `~/.claude/learning/` directory if it doesn't exist. Write `profile.md`.

### Existing Profile (profile.md exists)

1. Read and display the current profile in a clean summary
2. Ask: "What would you like to update?"
   - A. Role
   - B. Strengths
   - C. Gaps
   - D. Goals
   - E. Learning style
   - F. Session length
   - G. Add new feedback
   - H. Everything looks good — nothing to change
3. For the chosen section, show the current value and re-run that question's guided flow
4. Update only the requested sections — preserve everything else
5. Update the `last_updated` field in frontmatter

## File Format

See `${CLAUDE_PLUGIN_ROOT}/skills/learning-data-spec.md` for the profile.md schema.

## Important

- One question at a time — do not overwhelm with a form
- Conversational tone — this is onboarding, make it welcoming
- When extracting feedback themes, always confirm with the user before writing
- Do NOT ask for information already in the profile when updating — show what you have
