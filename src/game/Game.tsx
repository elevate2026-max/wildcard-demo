"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine } from "./audio";
import {
  SEGMENTS,
  pickVariant,
  planBotAnswer,
  planGame,
  rollBots,
  scoreAnswer,
  type BotId,
  type GameQuestion,
  type SegmentKind,
} from "./engine";
import { INTRO_SEQUENCE, REACTIONS, VOICE, type Speaker, type VoiceSlot } from "./script";

const ART = {
  marley: "/art/marley/marley-avatar.webp",
  aiden: "/art/aiden/aiden-cohost-avatar.webp",
  aidenSet: "/art/aiden/aiden-wildcard-set.webp",
  coldOpen: "/art/marley/marley-cold-open.webp",
  stage: "/art/marley/marley-stage.webp",
  desk: "/art/marley/marley-desk.webp",
  hero: "/art/marley/marley-show-hero.webp",
  reveal: "/art/marley/marley-question-reveal.webp",
  ceremony: "/art/marley/marley-winner-ceremony.webp",
  logo: "/art/brand/wildcard-logo-gold.png",
};

type Who = "you" | BotId;
const CONTESTANTS: { id: Who; name: string; tag: string }[] = [
  { id: "you", name: "You", tag: "Challenger" },
  { id: "max", name: "Max", tag: "Strong · fast · smug" },
  { id: "roxy", name: "Roxy", tag: "Chaos energy" },
];
type Scores = Record<Who, number>;
const ZERO: Scores = { you: 0, max: 0, roxy: 0 };

type Scene = { image?: string; lineup?: boolean; title?: string; kicker?: string };
type Subtitle = { slot: VoiceSlot; speaker: Speaker; text: string };
type Live = {
  q: GameQuestion;
  label: string;
  limitMs: number;
  remainingMs: number;
  locked: Record<Who, boolean>;
  yourChoice: number | null;
};
type Reveal = { picks: Record<Who, number | null>; gains: Scores };

const SEGMENT_TITLE: Record<SegmentKind, string> = {
  round1: "Round 1",
  aiden: "Aiden's Wildcard",
  round2: "Round 2 · Double points",
  final: "Final round",
};

class Aborted extends Error {}

export default function Game() {
  const audio = useRef<AudioEngine | null>(null);
  const run = useRef(0); // bumps on every new game; stale directors abort
  const answer = useRef<((choice: number) => void) | null>(null);

  const [phase, setPhase] = useState<"title" | "show" | "winner">("title");
  const [loaded, setLoaded] = useState({ done: 0, total: 1, ready: false });
  const [muted, setMuted] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [subtitle, setSubtitle] = useState<Subtitle | null>(null);
  const [live, setLive] = useState<Live | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [scores, setScores] = useState<Scores>(ZERO);
  const [segment, setSegment] = useState<string>("");
  const [celebrate, setCelebrate] = useState<Speaker | null>(null);
  const [result, setResult] = useState<{ won: boolean } | null>(null);

  useEffect(() => {
    if (audio.current) return;
    const engine = new AudioEngine();
    audio.current = engine;
    try {
      if (localStorage.getItem("wildcard-muted") === "1") {
        engine.setMuted(true);
        setMuted(true);
      }
    } catch {
      /* storage blocked */
    }
    const giveUp = setTimeout(() => setLoaded((l) => ({ ...l, ready: true })), 10000);
    engine
      .load((done, total) => setLoaded((l) => ({ ...l, done, total })))
      .then(() => setLoaded((l) => ({ ...l, ready: true })))
      .finally(() => clearTimeout(giveUp));
    return () => {
      run.current++;
      engine.stopAll();
    };
  }, []);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    audio.current?.setMuted(next);
    try {
      localStorage.setItem("wildcard-muted", next ? "1" : "0");
    } catch {
      /* storage blocked */
    }
  }, [muted]);

  const onAnswer = useCallback((choice: number) => {
    answer.current?.(choice);
  }, []);

  const skipLine = useCallback(() => {
    audio.current?.stopVoice();
  }, []);

  const startGame = useCallback(async () => {
    const engine = audio.current!;
    const myRun = ++run.current;
    const check = () => {
      if (run.current !== myRun) throw new Aborted();
    };
    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms)).then(check);
    const say = async (slot: VoiceSlot) => {
      check();
      const line = VOICE[slot];
      setSubtitle({ slot, speaker: line.speaker, text: line.text });
      await engine.playVoice(slot);
      check();
      setSubtitle((s) => (s?.slot === slot ? null : s));
      await wait(250);
    };

    const rng = Math.random;
    const plan = planGame(rng);
    const bots = rollBots(rng);
    let lastReaction: VoiceSlot | undefined;
    const total: Scores = { ...ZERO };

    const playQuestion = async (q: GameQuestion, label: string) => {
      check();
      const { base, seconds } = SEGMENTS[q.segment];
      const limitMs = seconds * 1000;
      const botPlans = {
        max: planBotAnswer(bots.max, q, limitMs, rng),
        roxy: planBotAnswer(bots.roxy, q, limitMs, rng),
      };
      const locked: Record<Who, boolean> = { you: false, max: false, roxy: false };
      let yours: { choice: number; atMs: number } | null = null;
      let allLockedAt: number | null = null;

      setReveal(null);
      setLive({ q, label, limitMs, remainingMs: limitMs, locked: { ...locked }, yourChoice: null });
      await wait(400);
      engine.loop("sfx_bed_question");
      const start = performance.now();

      answer.current = (choice) => {
        if (yours) return;
        yours = { choice, atMs: performance.now() - start };
        locked.you = true;
        engine.sfx("sfx_button");
        setLive((l) => (l ? { ...l, yourChoice: choice, locked: { ...locked } } : l));
      };

      await new Promise<void>((resolve) => {
        let ticking = false;
        const iv = setInterval(() => {
          if (run.current !== myRun) {
            clearInterval(iv);
            resolve();
            return;
          }
          const elapsed = performance.now() - start;
          for (const id of ["max", "roxy"] as const) {
            const p = botPlans[id];
            if (!locked[id] && p.choice !== null && elapsed >= p.atMs) locked[id] = true;
          }
          if (allLockedAt === null && locked.you && locked.max && locked.roxy) allLockedAt = elapsed;
          // Everyone's locked in: run the clock out briefly instead of waiting the full timer.
          const deadline = allLockedAt === null ? limitMs : Math.min(limitMs, allLockedAt + 1500);
          const remainingMs = Math.max(0, limitMs - elapsed);
          if (!ticking && remainingMs <= 5000 && allLockedAt === null) {
            ticking = true;
            engine.loop("sfx_tick");
          }
          setLive((l) => (l ? { ...l, remainingMs, locked: { ...locked } } : l));
          if (elapsed >= deadline) {
            clearInterval(iv);
            resolve();
          }
        }, 100);
      });
      answer.current = null;
      check();
      engine.stopLoop("sfx_tick", 0.05);
      engine.stopLoop("sfx_bed_question", 0.4);

      if (q.segment === "final") {
        engine.sfx("sfx_drumroll");
        await Promise.all([say("final_reveal"), wait(3400)]);
      }

      const picks: Record<Who, number | null> = {
        you: yours ? (yours as { choice: number }).choice : null,
        max: locked.max ? botPlans.max.choice : null,
        roxy: locked.roxy ? botPlans.roxy.choice : null,
      };
      const atMs: Record<Who, number> = {
        you: yours ? (yours as { atMs: number }).atMs : limitMs,
        max: botPlans.max.atMs,
        roxy: botPlans.roxy.atMs,
      };
      const gains: Scores = { ...ZERO };
      for (const c of CONTESTANTS) {
        gains[c.id] = scoreAnswer(base, picks[c.id] === q.correct, atMs[c.id], limitMs);
        total[c.id] += gains[c.id];
      }
      setReveal({ picks, gains });
      setScores({ ...total });

      const outcome = picks.you === null ? "timeout" : picks.you === q.correct ? "correct" : "wrong";
      engine.sfx(outcome === "correct" ? "sfx_correct" : outcome === "wrong" ? "sfx_wrong" : "sfx_timeout");
      await wait(900);

      if (q.segment === "aiden") {
        await say("aiden_moment_close");
      } else {
        const options =
          outcome === "timeout" && limitMs > 15000 ? REACTIONS.timeoutLongClock : REACTIONS[outcome];
        lastReaction = pickVariant<VoiceSlot>(options, lastReaction, rng);
        await say(lastReaction);
      }
      await wait(1400);
      setLive(null);
      setReveal(null);
    };

    try {
      await engine.unlock();
      setScores({ ...ZERO });
      setResult(null);
      setCelebrate(null);
      setLive(null);
      setReveal(null);
      setPhase("show");

      // Intro segment.
      setSegment("Tonight on the Wildcard");
      setScene({ image: ART.coldOpen });
      engine.sfx("sfx_theme_sting");
      await wait(2200);
      const introScenes: Partial<Record<VoiceSlot, Scene>> = {
        intro_welcome: { image: ART.coldOpen },
        intro_aiden_setup: { image: ART.stage },
        aiden_enter: { image: ART.aidenSet, title: "Aiden", kicker: "Co-host" },
        intro_aiden_intro: { image: ART.aidenSet, title: "Aiden", kicker: "Marley's new co-host" },
        aiden_hello: { image: ART.aiden, title: "Aiden", kicker: "Co-host" },
        intro_rules: { image: ART.desk, title: "How we play", kicker: "Fast + right = more points" },
        intro_players: { lineup: true },
      };
      for (const slot of INTRO_SEQUENCE) {
        const s = introScenes[slot];
        if (s) setScene(s);
        if (slot === "aiden_enter" || slot === "aiden_hello") setCelebrate("Aiden");
        await say(slot);
        setCelebrate(null);
      }

      // Round 1.
      setSegment(SEGMENT_TITLE.round1);
      setScene({ image: ART.stage, title: "Round 1", kicker: "Six questions · 15 seconds each" });
      await say("round1_open");
      setScene(null);
      for (let i = 0; i < plan.round1.length; i++) {
        await playQuestion(plan.round1[i], `Round 1 · Question ${i + 1} of ${plan.round1.length}`);
      }

      // Aiden's Wildcard moment — his segment.
      setSegment(SEGMENT_TITLE.aiden);
      setScene({ image: ART.aidenSet, title: "Aiden's Wildcard", kicker: "His question · double points" });
      setCelebrate("Aiden");
      await engine.sfx("sfx_aiden_sting");
      check();
      await say("aiden_moment_open");
      setCelebrate(null);
      setScene(null);
      await playQuestion(plan.aiden, "Aiden's Wildcard question · Double value");

      // Round 2.
      setSegment(SEGMENT_TITLE.round2);
      setScene({ image: ART.hero, title: "Round 2", kicker: "Double points · meaner questions" });
      await say("round2_open");
      setScene(null);
      for (let i = 0; i < plan.round2.length; i++) {
        await playQuestion(plan.round2[i], `Round 2 · Question ${i + 1} of ${plan.round2.length} · Double points`);
      }

      // Final round.
      setSegment(SEGMENT_TITLE.final);
      setScene({ image: ART.reveal, title: "Final round", kicker: `One question · ${SEGMENTS.final.base} points · 30 seconds` });
      await say("final_open");
      setScene(null);
      await playQuestion(plan.final, `Final round · ${SEGMENTS.final.base} points`);

      // Winner.
      const won = total.you >= Math.max(total.max, total.roxy);
      setResult({ won });
      setPhase("winner");
      setSegment("");
      engine.sfx("sfx_applause");
      await wait(1200);
      await say(won ? "win_player" : "lose_player");
      setCelebrate("Aiden");
      await say(won ? "aiden_win" : "aiden_lose");
      setCelebrate(null);
      await say("outro");
      setCelebrate("Aiden");
      await say("aiden_bye");
      setCelebrate(null);
    } catch (err) {
      if (!(err instanceof Aborted)) throw err;
    }
  }, []);

  const playAgain = useCallback(() => {
    run.current++;
    audio.current?.stopAll();
    engine_click(audio.current);
    setSubtitle(null);
    void startGame();
  }, [startGame]);

  const talking = subtitle?.speaker ?? null;

  return (
    <div className="app">
      <header className="topbar">
        <img className="topbar-logo" src={ART.logo} alt="Marley's Wildcard" />
        <div className="topbar-segment">{segment}</div>
        {phase !== "show" && <span className="badge-demo">Demo</span>}
        <button className="mute" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? "Unmute sound" : "Mute sound"}>
          {muted ? "🔇" : "🔊"}
          <span className="mute-label">{muted ? "Sound off" : "Sound on"}</span>
        </button>
      </header>

      {phase === "title" && (
        <TitleScreen
          loaded={loaded}
          onPlay={() => {
            engine_click(audio.current);
            void startGame();
          }}
        />
      )}

      {phase === "show" && (
        <main className="show">
          <section className="stage">
            {live ? (
              <QuestionCard live={live} reveal={reveal} onAnswer={onAnswer} />
            ) : scene ? (
              <SceneCard scene={scene} talking={talking} />
            ) : null}
          </section>
          <Scoreboard scores={scores} live={live} reveal={reveal} talking={talking} celebrate={celebrate} />
        </main>
      )}

      {phase === "winner" && result && (
        <WinnerScreen
          scores={scores}
          won={result.won}
          talking={talking}
          celebrate={celebrate}
          onPlayAgain={playAgain}
        />
      )}

      <div className="subtitle-slot" aria-live="polite">
        {subtitle && (
          <div className={`subtitle subtitle-${subtitle.speaker.toLowerCase()}`}>
            <img
              className="subtitle-face"
              src={subtitle.speaker === "Marley" ? ART.marley : ART.aiden}
              alt=""
            />
            <div className="subtitle-text">
              <span className="subtitle-name">{subtitle.speaker}</span>
              <span>{subtitle.text}</span>
            </div>
            <button className="skip" onClick={skipLine} aria-label="Skip line">
              Skip ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function engine_click(engine: AudioEngine | null) {
  void engine?.sfx("sfx_button");
}

function TitleScreen({
  loaded,
  onPlay,
}: {
  loaded: { done: number; total: number; ready: boolean };
  onPlay: () => void;
}) {
  return (
    <main className="title">
      <img className="title-logo" src={ART.logo} alt="Marley's Wildcard" />
      <div className="title-hosts">
        <figure className="host-card">
          <img src={ART.marley} alt="Marley, host" />
          <figcaption>
            <strong>Marley</strong>
            <span>Host</span>
          </figcaption>
        </figure>
        <figure className="host-card host-card-aiden">
          <img src={ART.aiden} alt="Aiden, co-host" />
          <figcaption>
            <strong>Aiden</strong>
            <span>Co-host</span>
          </figcaption>
        </figure>
      </div>
      <p className="title-lede">
        You vs. <b>Max</b> and <b>Roxy</b>. Three rounds, one Wildcard, about 7 minutes. Sound on.
      </p>
      <button className="btn-primary" onClick={onPlay} disabled={!loaded.ready}>
        {loaded.ready ? "Play" : `Loading sound… ${loaded.done}/${loaded.total}`}
      </button>
      <p className="credits">
        Premieres <span className="glow">Dec 3, 2026</span> · Rovyn Labs · A Rovyn Entertainment Studio production
      </p>
    </main>
  );
}

function SceneCard({ scene, talking }: { scene: Scene; talking: Speaker | null }) {
  if (scene.lineup) {
    return (
      <div className="scene lineup">
        <div className="eyebrow">Tonight&apos;s players</div>
        <div className="lineup-row">
          {CONTESTANTS.map((c) => (
            <div key={c.id} className={`lineup-card token-${c.id}`}>
              <div className="token token-lg">{c.name[0]}</div>
              <strong>{c.name}</strong>
              <span>{c.tag}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={`scene ${talking ? `talking-${talking.toLowerCase()}` : ""}`}>
      {scene.image && (
        <div className="scene-frame">
          <img src={scene.image} alt="" />
        </div>
      )}
      {scene.title && (
        <div className="scene-caption">
          {scene.kicker && <div className="eyebrow">{scene.kicker}</div>}
          <h2>{scene.title}</h2>
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  live,
  reveal,
  onAnswer,
}: {
  live: Live;
  reveal: Reveal | null;
  onAnswer: (i: number) => void;
}) {
  const { q } = live;
  const frac = live.remainingMs / live.limitMs;
  const secs = Math.ceil(live.remainingMs / 1000);
  const host = q.segment === "aiden" ? ART.aiden : ART.marley;
  return (
    <div className={`qcard qcard-${q.segment}`}>
      <div className="qcard-head">
        <img className="qcard-host" src={host} alt={q.segment === "aiden" ? "Aiden asks" : "Marley asks"} />
        <div>
          <div className="eyebrow">{live.label}</div>
          <div className="qcard-cat">{q.category}</div>
        </div>
        <div className={`clock ${secs <= 5 && !reveal ? "clock-hot" : ""}`}>{reveal ? "—" : secs}</div>
      </div>
      <div className="timer">
        <div className="timer-fill" style={{ transform: `scaleX(${reveal ? 0 : frac})` }} />
      </div>
      <h2 className="qcard-question">{q.question}</h2>
      <div className="choices">
        {q.choices.map((choice, i) => {
          const isCorrect = reveal && i === q.correct;
          const isYours = live.yourChoice === i;
          const cls = [
            "choice",
            isYours ? "choice-yours" : "",
            isCorrect ? "choice-correct" : "",
            reveal && isYours && !isCorrect ? "choice-wrong" : "",
          ].join(" ");
          return (
            <button
              key={i}
              className={cls}
              disabled={live.yourChoice !== null || !!reveal}
              onClick={() => onAnswer(i)}
            >
              <span className="choice-letter">{"ABCD"[i]}</span>
              <span className="choice-text">{choice}</span>
              {reveal && (
                <span className="choice-picks">
                  {CONTESTANTS.filter((c) => reveal.picks[c.id] === i).map((c) => (
                    <span key={c.id} className={`token token-sm token-${c.id}`} title={c.name}>
                      {c.name[0]}
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="qcard-foot">
        {reveal
          ? reveal.picks.you === null
            ? "No answer locked — the clock wins this one."
            : reveal.picks.you === q.correct
              ? `Locked in and right: +${reveal.gains.you}`
              : "Locked in. The answer got roasted — you didn't."
          : live.yourChoice !== null
            ? "Locked in! Waiting on the clock…"
            : "Tap an answer to lock it in. Faster = more points."}
      </div>
    </div>
  );
}

function HostStrip({ talking, celebrate }: { talking: Speaker | null; celebrate: Speaker | null }) {
  return (
    <div className="host-strip">
      {(["Marley", "Aiden"] as const).map((name) => (
        <div
          key={name}
          className={[
            "host-chip",
            talking === name ? "is-talking" : "",
            celebrate === name ? "is-celebrating" : "",
          ].join(" ")}
        >
          <img src={name === "Marley" ? ART.marley : ART.aiden} alt={name} />
          <div>
            <strong>{name}</strong>
            <span>{name === "Marley" ? "Host" : "Co-host"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Scoreboard({
  scores,
  live,
  reveal,
  talking,
  celebrate,
}: {
  scores: Scores;
  live: Live | null;
  reveal: Reveal | null;
  talking: Speaker | null;
  celebrate: Speaker | null;
}) {
  const leader = Math.max(scores.you, scores.max, scores.roxy);
  return (
    <aside className="scoreboard">
      <HostStrip talking={talking} celebrate={celebrate} />
      <div className="score-rows">
        {CONTESTANTS.map((c) => (
          <div key={c.id} className={`score-row ${leader > 0 && scores[c.id] === leader ? "is-leader" : ""}`}>
            <span className={`token token-${c.id}`}>{c.name[0]}</span>
            <span className="score-name">{c.name}</span>
            <span className="score-status">
              {reveal ? (
                reveal.gains[c.id] > 0 ? (
                  <span className="gain">+{reveal.gains[c.id]}</span>
                ) : (
                  <span className="nogain">+0</span>
                )
              ) : live ? (
                live.locked[c.id] ? (
                  <span className="locked">Locked</span>
                ) : (
                  <span className="thinking">…</span>
                )
              ) : null}
            </span>
            <span className="score-pts">{scores[c.id]}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function WinnerScreen({
  scores,
  won,
  talking,
  celebrate,
  onPlayAgain,
}: {
  scores: Scores;
  won: boolean;
  talking: Speaker | null;
  celebrate: Speaker | null;
  onPlayAgain: () => void;
}) {
  const standings = [...CONTESTANTS].sort((a, b) => scores[b.id] - scores[a.id]);
  const champ = won ? "You" : standings[0].name;
  return (
    <main className="winner">
      <div className="winner-hero">
        <img src={ART.ceremony} alt="Marley at the winner ceremony" />
      </div>
      <div className="winner-body">
        <div className="eyebrow">Final standings</div>
        <h2>{won ? "You took the Wildcard!" : `${champ} takes the Wildcard`}</h2>
        <ol className="standings">
          {standings.map((c, i) => (
            <li key={c.id} className={i === 0 ? "is-champ" : ""}>
              <span className="rank">{i + 1}</span>
              <span className={`token token-${c.id}`}>{c.name[0]}</span>
              <span className="score-name">{c.name}</span>
              <span className="score-pts">{scores[c.id]}</span>
            </li>
          ))}
        </ol>
        <HostStrip talking={talking} celebrate={celebrate} />
        <button className="btn-primary" onClick={onPlayAgain}>
          Play again
        </button>
        <p className="credits">Demo scoring is local to this device. Rovyn Labs · A Rovyn Entertainment Studio production</p>
      </div>
    </main>
  );
}
