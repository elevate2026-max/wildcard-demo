// Pure game logic: question selection, bot behaviour, scoring. No React, no audio — unit-tested.
import bank from "@/data/questions.json";

export type Question = {
  id: string;
  category: string;
  question: string;
  choices: string[];
  correct: number;
  difficulty: 1 | 2;
  aiden?: boolean;
};

export const QUESTIONS = bank as Question[];

export type Rng = () => number;

export type SegmentKind = "round1" | "aiden" | "round2" | "final";

export const SEGMENTS: Record<SegmentKind, { base: number; seconds: number }> = {
  round1: { base: 100, seconds: 15 },
  aiden: { base: 200, seconds: 15 }, // Aiden's Wildcard question: double value
  round2: { base: 200, seconds: 15 }, // values doubled
  final: { base: 500, seconds: 30 },
};

export const ROUND_LENGTH = 6;

export type GameQuestion = Question & { segment: SegmentKind };

export type Plan = {
  round1: GameQuestion[];
  aiden: GameQuestion;
  round2: GameQuestion[];
  final: GameQuestion;
};

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffles the choice order, keeping `correct` pointing at the right answer. */
export function shuffleChoices(q: Question, rng: Rng): Question {
  const order = shuffle([0, 1, 2, 3], rng);
  return { ...q, choices: order.map((i) => q.choices[i]), correct: order.indexOf(q.correct) };
}

/** Picks the 14 questions for one game: Round 1 easy, Aiden's pick, Round 2 + final harder. */
export function planGame(rng: Rng, bank: Question[] = QUESTIONS): Plan {
  const easy = shuffle(bank.filter((q) => q.difficulty === 1), rng);
  const hard = shuffle(bank.filter((q) => q.difficulty === 2), rng);
  const aidenIdx = easy.findIndex((q) => q.aiden);
  const [aidenQ] = easy.splice(aidenIdx, 1);
  const tag = (q: Question, segment: SegmentKind): GameQuestion => ({ ...shuffleChoices(q, rng), segment });
  return {
    round1: easy.slice(0, ROUND_LENGTH).map((q) => tag(q, "round1")),
    aiden: tag(aidenQ, "aiden"),
    round2: hard.slice(0, ROUND_LENGTH).map((q) => tag(q, "round2")),
    final: tag(hard[ROUND_LENGTH], "final"),
  };
}

/** correct = base × speed factor (100% for an instant answer, falling to 50% at the buzzer); wrong = 0. */
export function scoreAnswer(base: number, correct: boolean, elapsedMs: number, limitMs: number): number {
  if (!correct) return 0;
  const left = Math.min(1, Math.max(0, 1 - elapsedMs / limitMs));
  return Math.round((base * (0.5 + 0.5 * left)) / 10) * 10;
}

export type BotId = "max" | "roxy";

/** Per-game personality, re-rolled on every "Play again". */
export type BotProfile = { id: BotId; accuracy: [number, number]; speed: number; noAnswer: number };

export function rollBots(rng: Rng): Record<BotId, BotProfile> {
  const jitter = (spread: number) => (rng() * 2 - 1) * spread;
  return {
    // Max: strong and fast.
    max: { id: "max", accuracy: [0.86 + jitter(0.06), 0.74 + jitter(0.07)], speed: 0.85 + rng() * 0.3, noAnswer: 0 },
    // Roxy: erratic — lightning guesses or last-second lunges, coin-flip accuracy, the odd blank.
    roxy: { id: "roxy", accuracy: [0.56 + jitter(0.1), 0.44 + jitter(0.1)], speed: 0.8 + rng() * 0.5, noAnswer: 0.06 },
  };
}

export type BotAnswer = { choice: number | null; atMs: number };

export function planBotAnswer(profile: BotProfile, q: Question, limitMs: number, rng: Rng): BotAnswer {
  const limitS = limitMs / 1000;
  if (rng() < profile.noAnswer) return { choice: null, atMs: limitMs };
  let seconds: number;
  if (profile.id === "max") {
    seconds = (1.8 + rng() * 3.6) * profile.speed * (q.difficulty === 2 ? 1.25 : 1);
    if (limitS > 20) seconds += 2 + rng() * 4; // even Max thinks on the final
  } else {
    seconds = rng() < 0.4 ? 0.9 + rng() * 2.2 : (6 + rng() * 8) * profile.speed;
    if (limitS > 20) seconds *= 1.6;
  }
  seconds = Math.min(seconds, limitS - 0.4);
  const correct = rng() < profile.accuracy[q.difficulty - 1];
  const wrongs = [0, 1, 2, 3].filter((i) => i !== q.correct);
  const choice = correct ? q.correct : wrongs[Math.floor(rng() * wrongs.length)];
  return { choice, atMs: Math.round(seconds * 1000) };
}

/** Random pick from `options`, never repeating `last` (the script's "never the same one twice in a row"). */
export function pickVariant<T>(options: readonly T[], last: T | undefined, rng: Rng): T {
  const pool = options.length > 1 ? options.filter((o) => o !== last) : options;
  return pool[Math.floor(rng() * pool.length)];
}
