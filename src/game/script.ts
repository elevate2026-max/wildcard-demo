// Host lines, verbatim from docs/wildcard-demo-host-script.md (final — do not edit the text here
// without a new script from Marley). tests/script.test.ts checks every line against that file.

export type Speaker = "Marley" | "Aiden";

export const VOICE = {
  intro_welcome: { speaker: "Marley", text: "Welcome to Marley's Wildcard! I'm Marley — and tonight the questions are hot, the clock is hotter, and the points are very, very real." },
  intro_aiden_setup: { speaker: "Marley", text: "But before we meet the players — one more thing. The Wildcard family's getting bigger. I want y'all to meet—" },
  aiden_enter: { speaker: "Aiden", text: "I'm here! Did I miss anything?!" },
  intro_aiden_dry: { speaker: "Marley", text: "That was supposed to be a big dramatic moment." },
  aiden_ran: { speaker: "Aiden", text: "It WAS dramatic! I ran!" },
  intro_aiden_intro: { speaker: "Marley", text: "Fair. Everybody — this is Aiden. My new co-host." },
  aiden_hello: { speaker: "Aiden", text: "Hello everybody!" },
  intro_rules: { speaker: "Marley", text: "Here's how we play. I ask the questions, you race the clock. Right answers earn points — the faster you answer, the more you earn. And rule number one on this show: we roast the answer, never the player." },
  intro_players: { speaker: "Marley", text: "Tonight's players: Max, who has never lost an argument with a trivia book — and Roxy, who guesses like she means it. And you. Good luck. You'll need it." },
  aiden_lockitin: { speaker: "Aiden", text: "Lock it in!" },

  round1_open: { speaker: "Marley", text: "Round one! Six questions, fifteen seconds each. Speed earns — dawdling costs. Here we go." },
  round2_open: { speaker: "Marley", text: "Round two! Points are doubled, the questions are meaner. My favorite combination." },

  correct_1: { speaker: "Marley", text: "Correct! Somebody did their homework." },
  correct_2: { speaker: "Marley", text: "That's right! Fast AND right — the full package." },
  correct_3: { speaker: "Marley", text: "Boom. Correct. The clock never stood a chance." },
  wrong_1: { speaker: "Marley", text: "Ooh — not quite. We roast the answer, never the player. That answer, though? Roasted." },
  wrong_2: { speaker: "Marley", text: "Incorrect! But confidently incorrect, and I respect the style." },
  wrong_3: { speaker: "Marley", text: "Nope! The right answer was right there, waving at you." },
  timeout_1: { speaker: "Marley", text: "Time! The clock shows no mercy. Not even a little." },
  timeout_2: { speaker: "Marley", text: "And... time. Fifteen seconds goes fast when you're panicking." },

  aiden_moment_open: { speaker: "Aiden", text: "My turn! My turn! This one's MY question — and it's worth double!" },
  aiden_moment_close: { speaker: "Aiden", text: "I told you it was a good one!" },

  final_open: { speaker: "Marley", text: "Final round. One question. Big points. Everything tonight comes down to this. No pressure." },
  final_reveal: { speaker: "Marley", text: "Let's see what that does to the board..." },

  win_player: { speaker: "Marley", text: "That's the game! You took on Max, you took on Roxy, and you took the Wildcard! Champion!" },
  aiden_win: { speaker: "Aiden", text: "You did it! I knew it! I totally knew it!" },
  lose_player: { speaker: "Marley", text: "And that's the game! Max and Roxy send their regards. But hey — the Wildcard always deals another hand. Run it back!" },
  aiden_lose: { speaker: "Aiden", text: "Aw man! Play again! I wanna see you win!" },
  outro: { speaker: "Marley", text: "That's Marley's Wildcard, baby! Thanks for playing — we'll see you next time." },
  aiden_bye: { speaker: "Aiden", text: "Bye everybody!" },
} as const satisfies Record<string, { speaker: Speaker; text: string }>;

export type VoiceSlot = keyof typeof VOICE;

export const SFX_SLOTS = [
  "sfx_theme_sting",
  "sfx_bed_question",
  "sfx_tick",
  "sfx_correct",
  "sfx_wrong",
  "sfx_timeout",
  "sfx_aiden_sting",
  "sfx_drumroll",
  "sfx_applause",
  "sfx_button",
] as const;

export type SfxSlot = (typeof SFX_SLOTS)[number];
export type AudioSlot = VoiceSlot | SfxSlot;

export const VOICE_SLOTS = Object.keys(VOICE) as VoiceSlot[];
export const ALL_SLOTS: AudioSlot[] = [...VOICE_SLOTS, ...SFX_SLOTS];

export const INTRO_SEQUENCE: VoiceSlot[] = [
  "intro_welcome",
  "intro_aiden_setup",
  "aiden_enter",
  "intro_aiden_dry",
  "aiden_ran",
  "intro_aiden_intro",
  "aiden_hello",
  "intro_rules",
  "intro_players",
  "aiden_lockitin",
];

export const REACTIONS = {
  correct: ["correct_1", "correct_2", "correct_3"],
  wrong: ["wrong_1", "wrong_2", "wrong_3"],
  // timeout_2 says "Fifteen seconds", so it only plays on 15-second clocks.
  timeout: ["timeout_1", "timeout_2"],
  timeoutLongClock: ["timeout_1"],
} as const satisfies Record<string, readonly VoiceSlot[]>;
