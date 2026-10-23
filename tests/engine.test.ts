import { describe, expect, it } from "vitest";
import {
  QUESTIONS,
  ROUND_LENGTH,
  nextStreak,
  pickVariant,
  planBotAnswer,
  planGame,
  rollBots,
  scoreAnswer,
  standing,
} from "@/game/engine";

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe("question bank", () => {
  it("has at least 45 well-formed questions", () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(45);
    const ids = new Set<string>();
    for (const q of QUESTIONS) {
      expect(q.category).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect([0, 1, 2, 3]).toContain(q.correct);
      expect([1, 2]).toContain(q.difficulty);
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
    }
  });
});

describe("planGame", () => {
  it("deals 10 + Aiden + 10 + final with no repeats, and keeps answers correct after shuffling", () => {
    for (let seed = 1; seed < 200; seed++) {
      const p = planGame(seeded(seed));
      expect(p.round1).toHaveLength(ROUND_LENGTH);
      expect(p.round2).toHaveLength(ROUND_LENGTH);
      const all = [...p.round1, p.aiden, ...p.round2, p.final];
      expect(new Set(all.map((q) => q.id)).size).toBe(22);
      expect(p.round1.every((q) => q.difficulty === 1)).toBe(true);
      expect(p.round2.every((q) => q.difficulty === 2)).toBe(true);
      expect(p.final.difficulty).toBe(2);
      expect(p.aiden.aiden).toBe(true);
      for (const q of all) {
        const orig = QUESTIONS.find((o) => o.id === q.id)!;
        expect(q.choices[q.correct]).toBe(orig.choices[orig.correct]);
      }
    }
  });

  it("reshuffles between games", () => {
    const a = planGame(seeded(1)).round1.map((q) => q.id);
    const b = planGame(seeded(2)).round1.map((q) => q.id);
    expect(a).not.toEqual(b);
  });
});

describe("scoring", () => {
  it("is base x speed factor, zero when wrong", () => {
    expect(scoreAnswer(100, true, 0, 15000)).toBe(100);
    expect(scoreAnswer(100, true, 15000, 15000)).toBe(50);
    expect(scoreAnswer(200, true, 7500, 15000)).toBe(150);
    expect(scoreAnswer(500, false, 1000, 30000)).toBe(0);
  });
});

describe("bots", () => {
  it("answer inside the clock; Max is faster and more accurate than Roxy over many games", () => {
    const rng = seeded(42);
    const stats = { max: { right: 0, t: 0, n: 0 }, roxy: { right: 0, t: 0, n: 0 } };
    for (let g = 0; g < 300; g++) {
      const bots = rollBots(rng);
      for (const q of QUESTIONS) {
        for (const id of ["max", "roxy"] as const) {
          const a = planBotAnswer(bots[id], q, 15000, rng);
          expect(a.atMs).toBeLessThanOrEqual(15000);
          if (a.choice === null) continue;
          stats[id].n++;
          stats[id].t += a.atMs;
          if (a.choice === q.correct) stats[id].right++;
        }
      }
    }
    expect(stats.max.right / stats.max.n).toBeGreaterThan(stats.roxy.right / stats.roxy.n + 0.15);
    expect(stats.max.t / stats.max.n).toBeLessThan(stats.roxy.t / stats.roxy.n);
  });
});

describe("pickVariant", () => {
  it("never repeats the previous reaction", () => {
    const rng = seeded(7);
    let last: string | undefined;
    for (let i = 0; i < 500; i++) {
      const next = pickVariant(["a", "b", "c"], last, rng);
      expect(next).not.toBe(last);
      last = next;
    }
  });
});

describe("standing", () => {
  it("is exactly one of ahead / behind / tied against the top bot", () => {
    expect(standing(500, [400, 100])).toBe("ahead");
    expect(standing(300, [400, 100])).toBe("behind");
    expect(standing(400, [400, 100])).toBe("tied");
    expect(standing(0, [0, 0])).toBe("tied");
  });
});

describe("nextStreak", () => {
  it("hits on the third consecutive correct answer only", () => {
    const seq = [true, true, true, true, false, true, true, true];
    let run = 0;
    const hits = seq.map((c) => {
      const s = nextStreak(run, c);
      run = s.run;
      return s.hit;
    });
    expect(hits).toEqual([false, false, true, false, false, false, false, true]);
  });
});
