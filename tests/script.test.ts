import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_SLOTS, BOT_TAUNTS, SFX_SLOTS, VOICE, VOICE_SLOTS } from "@/game/script";

const root = path.resolve(__dirname, "..");
const scriptMd = ["docs/wildcard-demo-host-script.md", "docs/wildcard-demo-script-addendum-v2.md"]
  .map((f) => readFileSync(path.join(root, f), "utf8"))
  .join("\n");

// Rows look like: | `slot_id` | Speaker | Line |   (SFX rows have two cells)
const rows = [...scriptMd.matchAll(/^\|\s*`([a-z0-9_]+)`\s*\|(.*)\|\s*$/gm)].map((m) => ({
  slot: m[1],
  cells: m[2].split("|").map((c) => c.trim()),
}));

describe("host script", () => {
  const voiceRows = rows.filter((r) => r.cells.length === 2);
  const sfxRows = rows.filter((r) => r.cells.length === 1);

  it("has the 52 voice lines (30 base + 22 addendum) and 10 music/SFX slots", () => {
    expect(voiceRows).toHaveLength(52);
    expect(sfxRows).toHaveLength(10);
  });

  it("matches the supplied script word for word", () => {
    for (const { slot, cells } of voiceRows) {
      const line = VOICE[slot as keyof typeof VOICE];
      expect(line, slot).toBeDefined();
      expect(line.speaker).toBe(cells[0]);
      expect(line.text).toBe(cells[1]);
    }
    expect(VOICE_SLOTS.sort()).toEqual(voiceRows.map((r) => r.slot).sort());
    expect([...SFX_SLOTS].sort()).toEqual(sfxRows.map((r) => r.slot).sort());
  });
});

describe("bot taunts", () => {
  it("are the addendum's text-only lines, verbatim", () => {
    for (const [bot, label] of [["max", "Max"], ["roxy", "Roxy"]] as const) {
      for (const kind of ["correct", "wrong"] as const) {
        const row = scriptMd.match(new RegExp(`\\*\\*${label} \\(${kind}\\):\\*\\* (.+)$`, "m"));
        expect(row, `${label} ${kind}`).not.toBeNull();
        const lines = [...row![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
        expect([...BOT_TAUNTS[bot][kind]]).toEqual(lines);
      }
    }
  });
});

describe("audio slots", () => {
  it("every slot has a non-empty public/audio/<slot>.mp3", () => {
    for (const slot of ALL_SLOTS) {
      const file = path.join(root, "public/audio", `${slot}.mp3`);
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, file).toBeGreaterThan(1000);
    }
  });

  it("ships the trailer", () => {
    expect(statSync(path.join(root, "public/video/official-trailer.mp4")).size).toBeGreaterThan(1_000_000);
  });

  it("ships nothing outside the slot list", () => {
    const files = readdirSync(path.join(root, "public/audio")).map((f) => f.replace(/\.mp3$/, ""));
    expect(files.sort()).toEqual([...ALL_SLOTS].sort());
  });
});
