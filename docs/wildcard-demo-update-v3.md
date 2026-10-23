# Marley's Wildcard — Demo Update v3 (art fix, cutaways, gameboard)

**For:** the wildcard-demo build · **From:** Marley · **Date:** Oct 22, 2026
**Why:** Donald played the live build. Verdict: the Marley *scene* art is the wrong character (realistic-style fox from an early concept set) — it doesn't match Marley's locked animated avatar. Also: more cutaways, more commentary, and questions presented like the show's gameboard with the hosts beside it.

## 1. Art replacement (the big one)

- **Marley's only approved likeness is `assets/marley/marley-avatar.webp`** — the faceted low-poly avatar (dreads, rasta beanie, black rovyn. tee). It was already correct in the pack; the *scene* files were not.
- **New scenes in `assets/scenes/`**, all generated from the locked avatar references — use these:
  - `scene-gameboard-duo.webp` — the giant gameboard with Marley gesturing on one side and Aiden waving on the other.
  - `scene-marley-host.webp` — Marley full-body on stage (title/intro use).
  - `scene-marley-desk.webp` — Marley at the commentary desk, mid-commentary.
  - `scene-winner-duo.webp` — Marley + Aiden celebrating under confetti (winner screen).
- **Removed from the pack — do not use:** the old realistic-style Marley scenes (`marley-cold-open`, `marley-desk`, `marley-question-reveal`, `marley-show-hero`, `marley-stage`, `marley-winner-ceremony`, `marley-kit-headshot`, `marley-kit-presenting`). Anywhere the game used them, swap to the new scenes or the avatar. No image of the old-style fox may appear anywhere in the game.

## 2. Gameboard presentation

- Question screens present as **the show's gameboard**: the question sits in a big glowing board panel (board styling like `scene-gameboard-duo.webp` — teal/gold circuit board), with **Marley and Aiden flanking the board** — use the gameboard-duo scene as the stage visual for question screens (full-bleed behind/below the question panel is fine; the hosts must be visible beside the board, not cropped out).
- The board reveal beat (§3) introduces this look right after the intro.

## 3. Cutaways + new commentary lines (FINAL — same no-rewrite rule)

New slots (audio supplied in the pack):

| Slot | Speaker | Moment | Visual |
|---|---|---|---|
| `board_reveal` | Marley | After the intro, before Round 1 opens | `scene-gameboard-duo.webp` full-screen |
| `aiden_board` | Aiden | Right after `board_reveal` | same scene |
| `desk_mid1` | Marley | After Round 1, question 5 | `scene-marley-desk.webp` cutaway |
| `desk_mid2` | Marley | After Round 2, question 5 | `scene-marley-desk.webp` cutaway |
| `desk_final` | Marley | Before the final question (with `final_spotlight`) | `scene-marley-desk.webp` cutaway |

Lines:

- `board_reveal` (Marley): "Behold — the Wildcard board. Twenty questions between you and glory. Aiden, tell them about the board."
- `aiden_board` (Aiden): "I helped decorate it. The sparkles were my idea."
- `desk_mid1` (Marley): "Quick check-in from the desk: five down in round one. The board is warm, Max is calculating, and Roxy is still vibing."
- `desk_mid2` (Marley): "Desk check: five left in round two. This is where the Wildcard earns its name."
- `desk_final` (Marley): "From the desk: one question left, and everything rides on it. No pressure."

## 4. Correction — `round1_open`

The v1 line said "Six questions" (Marley's error, from the 6-question draft). **The pack's `audio/round1_open.mp3` is REPLACED** with the corrected line: "Round one! Ten questions, fifteen seconds each. Speed earns — dawdling costs. Here we go." Same slot, new file — swap it in; the script test's expected text is updated in the base script doc.

## Acceptance for v3

- No old-style Marley image anywhere in the game (screenshot the title, intro, a question screen, halftime, final, and winner screen to prove it).
- Question screens show the gameboard presentation with both hosts visible beside the board.
- All 5 new commentary lines play at their moments with their cutaway visuals; corrected `round1_open` plays.
- Report the measured runtime again after the changes.
