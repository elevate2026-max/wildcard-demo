# Marley's Wildcard — playable demo

A standalone web demo of **Marley's Wildcard**: one player vs. two bots (**Max** and **Roxy**), hosted by **Marley** with co-host **Aiden**. Rovyn Labs · A Rovyn Entertainment Studio production.

The build spec is `docs/claude-wildcard-demo-spec.md`. The host script is final and supplied by Marley: `docs/wildcard-demo-host-script.md` (30 lines) plus `docs/wildcard-demo-script-addendum-v2.md` (22 lines and the bots' text-only taunts) and `docs/wildcard-demo-update-v3.md` (5 commentary lines, the art change and the gameboard layout).

**Zero Foxfire dependencies:** no accounts, payments, database, secrets or network calls beyond loading the page's own files. Game state lives in the browser tab.

## Show flow

| Segment | What happens | Audio |
|---|---|---|
| Title | Marley host scene, logo, Marley + Aiden portraits, **Play**, **Watch trailer** | `sfx_button` |
| Trailer | `public/video/official-trailer.mp4` plays full-screen (its own audio). Skip is visible the whole time; when the trailer ends or is skipped, the intro starts. | trailer audio |
| Intro | Marley welcomes the audience, Aiden makes his entrance, rules, player lineup, Max and Roxy intros | `sfx_theme_sting`, `intro_*`, `aiden_enter` / `aiden_ran` / `aiden_hello` / `aiden_max` / `aiden_roxy` / `aiden_lockitin` |
| Board reveal | Gameboard duo scene, full width | `board_reveal`, `aiden_board` |
| Round 1 | 10 questions, 15 s, 100 pts base; desk cutaway after Q5 (`desk_mid1`) | `round1_open`, `sfx_bed_question`, `sfx_tick` (last 5 s), `sfx_correct` / `sfx_wrong` / `sfx_timeout`, `correct_1–6` / `wrong_1–6` / `timeout_1–3`, `streak_line` |
| Aiden's Wildcard | Aiden presents one question himself at double value (200) | `sfx_aiden_sting`, `aiden_moment_open`, `aiden_moment_close` |
| Halftime | Marley + Aiden banter, then the standings | `halftime_open`, `aiden_halftime`, one of `ahead_line` / `behind_line` / `tied_line`, `halftime_close`, `aiden_lockitin2` |
| Round 2 | 10 harder questions, 15 s, 200 pts base (doubled); desk cutaway after Q5 (`desk_mid2`) | `round2_open` + question audio |
| Final | Standings, desk cutaway, spotlight, 1 question, 30 s, 500 pts base | `final_open`, one of `ahead_line` / `behind_line` / `tied_line`, `desk_final`, `final_spotlight`, `sfx_drumroll` + `final_reveal` |
| Winner | Standings, closing lines, Play again | `sfx_applause`, `win_player` + `aiden_win` or `lose_player` + `aiden_lose`, `outro`, `aiden_bye` |
| Play again | Rematch skips the trailer and intro; new questions, new bot personalities | `rematch_line`, `aiden_again`, then Round 1 |

**Questions:** each game draws 22 of the 59 in the bank: 11 easier (10 for Round 1 plus Aiden's) and 11 harder (10 for Round 2 plus the final). Each question appears for 5 s before the answers open. The clock then always runs out, as on the show.

**Scoring:** a correct answer earns base × speed factor. The factor is 100% for an instant answer and falls to 50% at the buzzer. A wrong answer or no answer earns 0. The player wins ties for first place, but a scoreless game is never a win.

**Reactions:** Marley's correct (6), wrong (6) and timeout (3) lines rotate and never repeat back to back; the final uses the same pools. On the player's third correct answer in a row, `streak_line` plays in place of the correct quip. On Aiden's question it follows his closing line.

**Standing lines:** exactly one of `ahead_line` / `behind_line` / `tied_line` plays at halftime and again before the final. It compares the player's score with the higher of Max's and Roxy's.

**Bot taunts:** text-only bubbles on the scoreboard at each reveal, matching whether the bot was right or wrong. Max and Roxy have no voices.

## Audio

- `public/audio/<slot>.mp3`: one file per slot. Tests fail if a file is missing or empty, or if a file isn't in the slot list.
- **Voices (57):** Marley's rendered clips, copied unchanged from the starter pack. The game never uses TTS.
- **Music & SFX (10):** original audio synthesized by `scripts/generate-sfx.py`, so it is royalty-free with no third-party license. Run `npm run sfx` to regenerate (needs Python 3 + numpy, ffmpeg).
- Playback uses Web Audio, unlocked by the Play tap. On iOS 17+ it plays even with the phone on silent.
- The mute toggle is always visible and also mutes the trailer. Every voice line is also shown as a subtitle, with a Skip button.
- The game never waits on a sound file: if a clip fails to load, it moves on after a reading-time delay.

## Art

Approved art only (v3): Marley appears only as the faceted avatar (`art/marley/marley-avatar.webp`) and in the four `art/scenes/` scenes. Aiden appears only as the human boy (`art/aiden/`). The old realistic-style Marley scenes are deleted, and `tests/art.test.ts` fails if one comes back or is referenced.

| Screen | Art |
|---|---|
| Title, intro, Round 1 open, rematch | `scene-marley-host.webp`, plus avatar cards |
| Board reveal, Round 2 open, final open, every question | `scene-gameboard-duo.webp` |
| Desk cutaways (`desk_mid1`, `desk_mid2`, `desk_final` + `final_spotlight`) | `scene-marley-desk.webp` |
| Aiden's entrance and his Wildcard moment | `aiden-wildcard-set.webp`, `aiden-cohost-avatar.webp` |
| Winner | `scene-winner-duo.webp` |

**Gameboard question screen:** the gameboard scene is shown whole, so Marley and Aiden are visible on either side of the board. On wider screens the question panel (glowing, teal and gold) sits over the top of the board, above the hosts' gestures. On phones it sits directly under the scene. The answer tiles below use the same board styling.

The supplied art in `public/art/` is served byte-for-byte as delivered: no optimizer, no recoloring or filters. Images are scaled proportionally and are never stretched. Logos use `object-fit: contain`. Portraits may be cropped into frames with `object-fit: cover`.

The trailer (`public/video/official-trailer.mp4`) is byte-identical to the pack's file. It is the demo's only video and is letterboxed full-screen (`object-fit: contain`). If a browser can't play it, the game goes straight to the intro.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # script-verbatim check, audio slots, question bank, scoring, bots
npm run typecheck
```

## Deploy (Fly.io)

```bash
fly deploy           # app "wildcard-demo"; no secrets needed
```

Question bank: `src/data/questions.json` holds 59 questions: 29 at difficulty 1 and 30 at difficulty 2. The `aiden: true` flag marks questions Aiden can pick for his Wildcard moment.
