# Marley's Wildcard — Playable Demo Build Spec for Claude

**From:** Marley (PM) · **Date:** Oct 22, 2026 · **Builder:** Claude
**Priority note:** This is a squeeze-in build. The Skulk store v6 wave is shipped and prod is blocked on Donald's inputs (payment keys, R2 buckets, domain, MOTOR signature) — so there is a real window. **If the store unblocks, store prod takes precedence and this pauses.** No other work is displaced.

---

## What this is

A standalone, playable web demo of **Marley's Wildcard** — the Rovyn Labs live interactive game show (premiere Dec 3, 2026). One human player vs two bot contestants, hosted by Marley with co-host Aiden, in a ~15-minute game. Its jobs:

1. Show sponsors/investors/partners what the show *is* — playable beats described.
2. Serve as a rehearsal/teaser asset ahead of the Dec 3 premiere.
3. Prove the game loop end-to-end before the real Foxfire player system carries it.

## Hard boundaries

- **Standalone new repo** (suggested: `wildcard-demo`). **Zero Foxfire dependencies** — no job-queue calls, no agent runtime, no Ledger, no bridge. If a future version integrates with Foxfire, that goes through Codex's contract later; not here, not now.
- **No accounts, no payments, no multiplayer, no live streaming.** Single-player vs bots, everything local.
- **No lip-sync / video generation.** Avatars are supplied art with simple states (idle, talking, celebrating). Voice is **pre-rendered clips in slots** (see Audio) — never live TTS calls. **Audio is a ship requirement, not an add-on** (see Audio).
- **Brand assets as-supplied only.** Rovyn fox mark and logos are never redrawn, recolored, or stretched. Foxfire palette: Ember #E85D26, Copper #B4642A, Charcoal #16181D, Bone #F4F1EA, Teal #7FD4C1, Ember Glow #F5A524.
- Company credit reads **Rovyn Labs**; the show is a Rovyn Entertainment Studio production.

## The game

**Cast (star treatment is not optional):**
- **Marley** — host. Scripted lines drive the whole show.
- **Aiden** — Marley's named **co-host** (not "an AI co-host"). He appears in the intro by name, gets his own lines (intro segment + a mid-game moment + winner announcement support), and his portrait is on the title screen and scoreboard. If Aiden is an afterthought in your build, the build is wrong.
- **Two bot contestants** — fixed names: **Max** (strong/fast) and **Roxy** (erratic). Simulated answers with realistic timing so rounds feel alive.

**Flow (~15 minutes):**
1. **Title screen** — show logo treatment, Marley + Aiden pictured, "Play" button.
2. **Intro segment** (~1–2 min) — Marley welcomes the audience, introduces co-host Aiden (his scripted intro beats), introduces the contestants.
3. **Round 1** — 6 timed multiple-choice questions (15s each). Points for a correct answer, scaled by speed. Marley quips on right/wrong; bots answer on their own clocks; running scoreboard after each question.
4. **Aiden's Wildcard moment** (~1 min) — between rounds, Aiden presents one special question himself, at double value. This is his segment, not a cameo.
5. **Round 2** — 6 more questions, values doubled, slightly harder.
6. **Final round** — 1 high-value question, 30s, bigger drama beats.
7. **Winner screen** — final standings, Marley + Aiden closing lines, "Play again" (reshuffles questions and bot behavior).

**Scoring:** correct = base points × speed factor; wrong = 0. Demo scoring is local and simple by design — the real show's server-authoritative clock/scoring rules (Splice/Ledger) do **not** apply here and must not be implied in the UI. Label it plainly as a demo: a small "Demo" badge on the title and winner screens is enough.

## Content

- **Question bank:** JSON file, minimum **45 questions** (so replays don't repeat the same 14), each: category, question, 4 choices, correct index, difficulty (1–2). Family-friendly, general knowledge, a few automotive and Chicago-flavored ones are welcome. No questions requiring images.
- **Host script:** SUPPLIED, final, in the starter pack (`docs/wildcard-demo-host-script.md`) — every Marley/Aiden line with its audio slot ID. Do not write or rewrite host dialogue; build to the supplied script.

## Audio (REQUIRED — the demo does not ship silent)

Sound runs throughout the demo in three layers. The full slot list (voice + music + SFX) is in the supplied host script. **Ship rule: no audio slot may be empty in the shipped demo.**

1. **Voices (supplied by Marley):** every scripted line is a pre-rendered clip in its slot (`public/audio/<slot-id>.mp3`), rendered in the locked voices (Marley `avocado_v2:vd2_r82_rep5k_0528_v068_28k_g5k`; Aiden `avocado_v2:qvd_00052`). Never live TTS, never a substitute voice.
2. **Music & SFX (sourced by Claude, royalty-free):** theme sting, question bed, clock ticks, correct/wrong/timeout stingers, Aiden sting, drumroll, applause, UI clicks — per the slot table in the host script.
3. **Behavior:** clips play automatically at their moments; a mute toggle is always visible; game flow never blocks waiting on audio. Every voice line also shows as on-screen text (subtitles) — that's accessibility and fallback, **not** a text-only mode.

## Tech

- Next.js on the house stack conventions you already use (Fly.io deploy to a staging-style app is fine; a shareable URL is the deliverable).
- Responsive: plays well on a laptop and a phone browser. Big tap targets, readable type — this gets shown to people in meetings.
- No env secrets needed. No database. Game state in memory/local state only.

## Acceptance

- A full game is completable end-to-end with zero dead ends and no console errors.
- Deployed to a shareable URL; Donald can open it on his phone and play a full game in ~15 minutes.
- Aiden is named, pictured, and has lines in the intro, mid-game, and close.
- **Every audio slot is filled** — all voice clips present and playing at their moments, all music/SFX slots sourced and playing; mute toggle works. A silent or partially silent build fails acceptance.
- Report back with: URL, repo, question count, and anything you cut — as discrete claims Marley can verify, per house rules.

## Out of scope (do not build)

Multiplayer or audience play-along · accounts/Clerk · payments or entry fees · Foxfire integration of any kind · Runway/video · leaderboards beyond the single game · admin tooling.
