# Marley's Wildcard — playable demo

A standalone web demo of **Marley's Wildcard**: one player vs. two bots (**Max** and **Roxy**), hosted by **Marley** with co-host **Aiden**. Rovyn Labs · A Rovyn Entertainment Studio production.

The build spec is `docs/claude-wildcard-demo-spec.md`. The host script, `docs/wildcard-demo-host-script.md`, is final and supplied by Marley.

**Zero Foxfire dependencies:** no accounts, payments, database, secrets or network calls beyond loading the page's own files. Game state lives in the browser tab.

## Show flow

| Segment | What happens | Audio |
|---|---|---|
| Title | Logo, Marley + Aiden portraits, Play | `sfx_button` |
| Intro | Marley welcomes the audience, Aiden makes his entrance, rules, player lineup | `sfx_theme_sting`, `intro_*`, `aiden_enter` / `aiden_ran` / `aiden_hello` / `aiden_lockitin` |
| Round 1 | 6 questions, 15 s, 100 pts base | `round1_open`, `sfx_bed_question`, `sfx_tick` (last 5 s), `sfx_correct` / `sfx_wrong` / `sfx_timeout`, `correct_*` / `wrong_*` / `timeout_*` |
| Aiden's Wildcard | Aiden presents one question himself at double value (200) | `sfx_aiden_sting`, `aiden_moment_open`, `aiden_moment_close` |
| Round 2 | 6 harder questions, 15 s, 200 pts base (doubled) | `round2_open` + question audio |
| Final | 1 question, 30 s, 500 pts base | `final_open`, `sfx_drumroll` + `final_reveal` |
| Winner | Standings, closing lines, Play again (new questions, new bot personalities) | `sfx_applause`, `win_player` + `aiden_win` or `lose_player` + `aiden_lose`, `outro`, `aiden_bye` |

**Scoring:** a correct answer earns base × speed factor. The factor is 100% for an instant answer and falls to 50% at the buzzer. A wrong answer or no answer earns 0. When all three contestants have locked in, the clock runs out 1.5 s later.

**Reactions:** Marley's correct, wrong and timeout lines rotate and never repeat back to back. `timeout_2` says "Fifteen seconds", so it is never used on the 30-second final.

## Audio

- `public/audio/<slot>.mp3`: one file per slot. Tests fail if a file is missing or empty, or if a file isn't in the slot list.
- **Voices (30):** Marley's rendered clips, copied unchanged from the starter pack. The game never uses TTS.
- **Music & SFX (10):** original audio synthesized by `scripts/generate-sfx.py`, so it is royalty-free with no third-party license. Run `npm run sfx` to regenerate (needs Python 3 + numpy, ffmpeg).
- Playback uses Web Audio, unlocked by the Play tap. On iOS 17+ it plays even with the phone on silent.
- The mute toggle is always visible. Every voice line is also shown as a subtitle, with a Skip button.
- The game never waits on a sound file: if a clip fails to load, it moves on after a reading-time delay.

## Art

The supplied art in `public/art/` is served byte-for-byte as delivered: no optimizer, no recoloring or filters. Images are scaled proportionally and are never stretched. Logos use `object-fit: contain`. Portraits may be cropped into frames with `object-fit: cover`.

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
