# Marley's Wildcard — Demo Script Addendum v2 (the 15-minute build)

**For:** the wildcard-demo build · **From:** Marley · **Date:** Oct 22, 2026
**Purpose:** Claude's measured playthrough of the v1 script ran ~6–7 minutes. Donald's call: go for 15. This addendum supplies the extra content — **new lines are FINAL, same rules as the base script: Claude does not rewrite host dialogue.**
**Flow changes (spec updated to match):** Round 1 = **10 questions**, Round 2 = **10 questions**. Order: Intro → Round 1 → Aiden's Wildcard moment → **Halftime banter (new)** → Round 2 → Final round → Winner screen. Per-game draw = 22 questions from the 59-question bank.
**Bot taunts:** Max and Roxy stay voiceless (no approved voices exist for them). Their lines below are TEXT-ONLY bubbles shown when they answer.

---

## New voice lines (render targets: `public/audio/<slot-id>.mp3`)

### Contestant intros (play during the intro segment, after `intro_players`)

| Slot | Speaker | Line |
|---|---|---|
| `intro_max` | Marley | First up — Max. Quiz-night champion, human search engine, and the only man alive who reads the terms and conditions for fun. |
| `aiden_max` | Aiden | He looks serious. I like it. |
| `intro_roxy` | Marley | And Roxy. Strategy? Vibes. Preparation? Also vibes. And somehow — it works. |
| `aiden_roxy` | Aiden | She's my favorite. Don't tell Max. |

### Halftime banter (after Aiden's Wildcard moment, before Round 2)

| Slot | Speaker | Line |
|---|---|---|
| `halftime_open` | Marley | Halftime, Wildcard style. Aiden — thoughts on our players so far? |
| `aiden_halftime` | Aiden | Max is fast, Roxy is funny, and the new player is my favorite. Don't tell Max. Or Roxy. |
| `halftime_close` | Marley | Diplomatic as ever. Round two is worth double — everything can change. Aiden, you know what to do. |
| `aiden_lockitin2` | Aiden | Lock it in — again! |

### More answer reactions (add to the rotation pools)

| Slot | Speaker | Line |
|---|---|---|
| `correct_4` | Marley | Right again! The board is sweating. |
| `correct_5` | Marley | Correct! Somewhere, a textbook just nodded. |
| `correct_6` | Marley | That's right! You're making this look rehearsed. |
| `wrong_4` | Marley | Wrong! But the confidence? Immaculate. |
| `wrong_5` | Marley | Not it! The answer sends its regards. |
| `wrong_6` | Marley | Incorrect! We move on, we grow, we forget this happened. |
| `timeout_3` | Marley | Time's up! Even the clock got nervous on that one. |

### Scoreboard & streak lines (contextual — fire at halftime and before the final)

| Slot | Speaker | Line |
|---|---|---|
| `ahead_line` | Marley | You're leading the board. Max is recalculating. Roxy is... vibing harder. |
| `behind_line` | Marley | You're trailing — but this is Wildcard. One hot streak flips everything. |
| `tied_line` | Marley | Tied up! I love it when the board gets spicy. |
| `streak_line` | Marley | Three in a row! Somebody check if this player is part computer. |

### Final round & rematch

| Slot | Speaker | Line |
|---|---|---|
| `final_spotlight` | Marley | One question between you and the crown. Max wants it. Roxy wants it. The board wants chaos. |
| `rematch_line` | Marley | Back for more? The Wildcard always deals another hand. |
| `aiden_again` | Aiden | Yay! Again! Again! |

---

## Bot text taunts (TEXT-ONLY — no audio; show as speech bubbles when Max/Roxy answer)

**Max (correct):** "Calculated." · "As predicted." · "Trivial."
**Max (wrong):** "A rounding error. Nothing more." · "Recalibrating."
**Roxy (correct):** "Felt it in my bones!" · "Pure instinct, baby." · "Told ya!"
**Roxy (wrong):** "The vibes lied to me." · "Whatever, I look great."

---

## Acceptance for v2

- Full playthrough measures **~13–16 minutes** to the winner screen (report the measured number).
- All 22 new slots filled and playing at their moments; rotation pools include the new variants; `timeout_3` is in the timeout pool (and the final round uses the shared timeout pool, fixing the v1 note).
- Scoreboard lines fire contextually (exactly one of ahead/behind/tied at halftime and pre-final, based on the player's standing).
- Streak line fires on the player's third consecutive correct answer.
