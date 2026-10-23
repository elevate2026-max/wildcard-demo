// Host lines, verbatim from docs/wildcard-demo-host-script.md and docs/wildcard-demo-script-addendum-v2.md
// (final — do not edit the text here without a new script from Marley). tests/script.test.ts checks
// every line against those files.

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
  intro_max: { speaker: "Marley", text: "First up — Max. Quiz-night champion, human search engine, and the only man alive who reads the terms and conditions for fun." },
  aiden_max: { speaker: "Aiden", text: "He looks serious. I like it." },
  intro_roxy: { speaker: "Marley", text: "And Roxy. Strategy? Vibes. Preparation? Also vibes. And somehow — it works." },
  aiden_roxy: { speaker: "Aiden", text: "She's my favorite. Don't tell Max." },

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
  correct_4: { speaker: "Marley", text: "Right again! The board is sweating." },
  correct_5: { speaker: "Marley", text: "Correct! Somewhere, a textbook just nodded." },
  correct_6: { speaker: "Marley", text: "That's right! You're making this look rehearsed." },
  wrong_4: { speaker: "Marley", text: "Wrong! But the confidence? Immaculate." },
  wrong_5: { speaker: "Marley", text: "Not it! The answer sends its regards." },
  wrong_6: { speaker: "Marley", text: "Incorrect! We move on, we grow, we forget this happened." },
  timeout_3: { speaker: "Marley", text: "Time's up! Even the clock got nervous on that one." },

  aiden_moment_open: { speaker: "Aiden", text: "My turn! My turn! This one's MY question — and it's worth double!" },
  aiden_moment_close: { speaker: "Aiden", text: "I told you it was a good one!" },

  halftime_open: { speaker: "Marley", text: "Halftime, Wildcard style. Aiden — thoughts on our players so far?" },
  aiden_halftime: { speaker: "Aiden", text: "Max is fast, Roxy is funny, and the new player is my favorite. Don't tell Max. Or Roxy." },
  halftime_close: { speaker: "Marley", text: "Diplomatic as ever. Round two is worth double — everything can change. Aiden, you know what to do." },
  aiden_lockitin2: { speaker: "Aiden", text: "Lock it in — again!" },

  ahead_line: { speaker: "Marley", text: "You're leading the board. Max is recalculating. Roxy is... vibing harder." },
  behind_line: { speaker: "Marley", text: "You're trailing — but this is Wildcard. One hot streak flips everything." },
  tied_line: { speaker: "Marley", text: "Tied up! I love it when the board gets spicy." },
  streak_line: { speaker: "Marley", text: "Three in a row! Somebody check if this player is part computer." },

  final_open: { speaker: "Marley", text: "Final round. One question. Big points. Everything tonight comes down to this. No pressure." },
  final_reveal: { speaker: "Marley", text: "Let's see what that does to the board..." },
  final_spotlight: { speaker: "Marley", text: "One question between you and the crown. Max wants it. Roxy wants it. The board wants chaos." },

  win_player: { speaker: "Marley", text: "That's the game! You took on Max, you took on Roxy, and you took the Wildcard! Champion!" },
  aiden_win: { speaker: "Aiden", text: "You did it! I knew it! I totally knew it!" },
  lose_player: { speaker: "Marley", text: "And that's the game! Max and Roxy send their regards. But hey — the Wildcard always deals another hand. Run it back!" },
  aiden_lose: { speaker: "Aiden", text: "Aw man! Play again! I wanna see you win!" },
  outro: { speaker: "Marley", text: "That's Marley's Wildcard, baby! Thanks for playing — we'll see you next time." },
  aiden_bye: { speaker: "Aiden", text: "Bye everybody!" },
  rematch_line: { speaker: "Marley", text: "Back for more? The Wildcard always deals another hand." },
  aiden_again: { speaker: "Aiden", text: "Yay! Again! Again!" },
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
  "intro_max",
  "aiden_max",
  "intro_roxy",
  "aiden_roxy",
  "aiden_lockitin",
];

export const HALFTIME_SEQUENCE: VoiceSlot[] = ["halftime_open", "aiden_halftime"];
export const HALFTIME_CLOSE: VoiceSlot[] = ["halftime_close", "aiden_lockitin2"];

export const REACTIONS = {
  correct: ["correct_1", "correct_2", "correct_3", "correct_4", "correct_5", "correct_6"],
  wrong: ["wrong_1", "wrong_2", "wrong_3", "wrong_4", "wrong_5", "wrong_6"],
  // One shared pool for every clock, the final included (addendum v2).
  timeout: ["timeout_1", "timeout_2", "timeout_3"],
} as const satisfies Record<string, readonly VoiceSlot[]>;

export type Standing = "ahead" | "behind" | "tied";
export const STANDING_LINE: Record<Standing, VoiceSlot> = {
  ahead: "ahead_line",
  behind: "behind_line",
  tied: "tied_line",
};

// Text-only bubbles (no approved voices for the bots), verbatim from the addendum.
export const BOT_TAUNTS = {
  max: {
    correct: ["Calculated.", "As predicted.", "Trivial."],
    wrong: ["A rounding error. Nothing more.", "Recalibrating."],
  },
  roxy: {
    correct: ["Felt it in my bones!", "Pure instinct, baby.", "Told ya!"],
    wrong: ["The vibes lied to me.", "Whatever, I look great."],
  },
} as const;
