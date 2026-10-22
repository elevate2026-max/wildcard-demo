# Marley's Wildcard — Demo Host Script (ALL lines, with audio slot IDs)

**For:** the wildcard-demo build · **From:** Marley · **Date:** Oct 22, 2026
**Rules:** These lines are FINAL. Claude does not rewrite host dialogue — build to this script. Every line renders to `public/audio/<slot-id>.mp3`. Marley supplies the rendered voice clips (locked voices: Marley `avocado_v2:vd2_r82_rep5k_0528_v068_28k_g5k`, Aiden `avocado_v2:qvd_00052`).
**Bot contestants are fixed:** **Max** (strong, fast, smug) and **Roxy** (erratic, confident, chaos energy).
**House rule:** roast the answer, never the player — it is in the lines; keep it in the UI copy too.

---

## Intro segment

| Slot | Speaker | Line |
|---|---|---|
| `intro_welcome` | Marley | Welcome to Marley's Wildcard! I'm Marley — and tonight the questions are hot, the clock is hotter, and the points are very, very real. |
| `intro_aiden_setup` | Marley | But before we meet the players — one more thing. The Wildcard family's getting bigger. I want y'all to meet— |
| `aiden_enter` | Aiden | I'm here! Did I miss anything?! |
| `intro_aiden_dry` | Marley | That was supposed to be a big dramatic moment. |
| `aiden_ran` | Aiden | It WAS dramatic! I ran! |
| `intro_aiden_intro` | Marley | Fair. Everybody — this is Aiden. My new co-host. |
| `aiden_hello` | Aiden | Hello everybody! |
| `intro_rules` | Marley | Here's how we play. I ask the questions, you race the clock. Right answers earn points — the faster you answer, the more you earn. And rule number one on this show: we roast the answer, never the player. |
| `intro_players` | Marley | Tonight's players: Max, who has never lost an argument with a trivia book — and Roxy, who guesses like she means it. And you. Good luck. You'll need it. |
| `aiden_lockitin` | Aiden | Lock it in! |

## Round opens

| Slot | Speaker | Line |
|---|---|---|
| `round1_open` | Marley | Round one! Six questions, fifteen seconds each. Speed earns — dawdling costs. Here we go. |
| `round2_open` | Marley | Round two! Points are doubled, the questions are meaner. My favorite combination. |

## Answer reactions (rotate the variants; never the same one twice in a row)

| Slot | Speaker | Line |
|---|---|---|
| `correct_1` | Marley | Correct! Somebody did their homework. |
| `correct_2` | Marley | That's right! Fast AND right — the full package. |
| `correct_3` | Marley | Boom. Correct. The clock never stood a chance. |
| `wrong_1` | Marley | Ooh — not quite. We roast the answer, never the player. That answer, though? Roasted. |
| `wrong_2` | Marley | Incorrect! But confidently incorrect, and I respect the style. |
| `wrong_3` | Marley | Nope! The right answer was right there, waving at you. |
| `timeout_1` | Marley | Time! The clock shows no mercy. Not even a little. |
| `timeout_2` | Marley | And... time. Fifteen seconds goes fast when you're panicking. |

## Aiden's Wildcard moment (between rounds — his segment)

| Slot | Speaker | Line |
|---|---|---|
| `aiden_moment_open` | Aiden | My turn! My turn! This one's MY question — and it's worth double! |
| `aiden_moment_close` | Aiden | I told you it was a good one! |

## Final round

| Slot | Speaker | Line |
|---|---|---|
| `final_open` | Marley | Final round. One question. Big points. Everything tonight comes down to this. No pressure. |
| `final_reveal` | Marley | Let's see what that does to the board... |

## Winner screen (two endings — pick by result)

| Slot | Speaker | Line |
|---|---|---|
| `win_player` | Marley | That's the game! You took on Max, you took on Roxy, and you took the Wildcard! Champion! |
| `aiden_win` | Aiden | You did it! I knew it! I totally knew it! |
| `lose_player` | Marley | And that's the game! Max and Roxy send their regards. But hey — the Wildcard always deals another hand. Run it back! |
| `aiden_lose` | Aiden | Aw man! Play again! I wanna see you win! |
| `outro` | Marley | That's Marley's Wildcard, baby! Thanks for playing — we'll see you next time. |
| `aiden_bye` | Aiden | Bye everybody! |

---

## Music & SFX slots (Claude sources royalty-free; these MUST be filled at ship)

| Slot | Moment |
|---|---|
| `sfx_theme_sting` | Title screen / game start — short show theme sting (5–8s) |
| `sfx_bed_question` | Looping low music bed under every question clock |
| `sfx_tick` | Final 5 seconds of any question clock — tick loop |
| `sfx_correct` | Correct-answer stinger |
| `sfx_wrong` | Wrong-answer buzzer |
| `sfx_timeout` | Time-expired sting |
| `sfx_aiden_sting` | Aiden's Wildcard moment — playful sting |
| `sfx_drumroll` | Final round reveal |
| `sfx_applause` | Winner screen — crowd applause/cheer |
| `sfx_button` | UI clicks / Lock It In button |

**Ship rule: no audio slot — voice, music, or SFX — may be empty in the shipped demo.** Text subtitles accompany every voice line (accessibility + fallback if a file fails to load), but text is not a substitute for the audio.
