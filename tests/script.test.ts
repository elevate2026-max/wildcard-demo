import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_SLOTS, SFX_SLOTS, VOICE, VOICE_SLOTS } from "@/game/script";

const root = path.resolve(__dirname, "..");
const scriptMd = readFileSync(path.join(root, "docs/wildcard-demo-host-script.md"), "utf8");

// Rows look like: | `slot_id` | Speaker | Line |   (SFX rows have two cells)
const rows = [...scriptMd.matchAll(/^\|\s*`([a-z0-9_]+)`\s*\|(.*)\|\s*$/gm)].map((m) => ({
  slot: m[1],
  cells: m[2].split("|").map((c) => c.trim()),
}));

describe("host script", () => {
  const voiceRows = rows.filter((r) => r.cells.length === 2);
  const sfxRows = rows.filter((r) => r.cells.length === 1);

  it("has the 30 voice lines and 10 music/SFX slots", () => {
    expect(voiceRows).toHaveLength(30);
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

describe("audio slots", () => {
  it("every slot has a non-empty public/audio/<slot>.mp3", () => {
    for (const slot of ALL_SLOTS) {
      const file = path.join(root, "public/audio", `${slot}.mp3`);
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, file).toBeGreaterThan(1000);
    }
  });

  it("ships nothing outside the slot list", () => {
    const files = readdirSync(path.join(root, "public/audio")).map((f) => f.replace(/\.mp3$/, ""));
    expect(files.sort()).toEqual([...ALL_SLOTS].sort());
  });
});
