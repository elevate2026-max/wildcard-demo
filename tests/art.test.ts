import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );

// v3: the realistic-style Marley scenes were withdrawn; only the avatar + the new scenes are approved.
const REMOVED = [
  "marley-cold-open",
  "marley-desk",
  "marley-question-reveal",
  "marley-show-hero",
  "marley-stage",
  "marley-winner-ceremony",
  "marley-kit-headshot",
  "marley-kit-presenting",
];

describe("art", () => {
  const shipped = walk(path.join(root, "public/art")).map((f) => path.relative(path.join(root, "public"), f));

  it("ships only the approved files", () => {
    expect(shipped.sort()).toEqual(
      [
        "art/aiden/aiden-cohost-avatar.webp",
        "art/aiden/aiden-wildcard-set.webp",
        "art/brand/wildcard-logo-gold.png",
        "art/marley/marley-avatar.webp",
        "art/scenes/scene-gameboard-duo.webp",
        "art/scenes/scene-marley-desk.webp",
        "art/scenes/scene-marley-host.webp",
        "art/scenes/scene-winner-duo.webp",
      ].sort(),
    );
  });

  it("never references a withdrawn Marley scene", () => {
    const code = walk(path.join(root, "src"))
      .concat(walk(path.join(root, "app")))
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    for (const name of REMOVED) expect(code, name).not.toContain(`/${name}.`);
  });

  it("references every shipped art file", () => {
    const game = readFileSync(path.join(root, "src/game/Game.tsx"), "utf8");
    for (const f of shipped) expect(game, f).toContain(`/${f}`);
  });
});
