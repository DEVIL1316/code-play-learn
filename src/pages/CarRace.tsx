import { GameHeader } from "@/components/GameHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  RALLY_MISSIONS,
  RALLY_TOTAL_XP,
  type RallyMission,
} from "@/lib/car-race";
import { playBoost, playCrash, playMiss } from "@/lib/sfx";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Crosshair,
  Flag,
  Gauge,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

type Phase = "intro" | "driving" | "complete";

const LANE_X = [22, 50, 78];
const CAR_TOP = 77;
const CAR_BOTTOM = 98;
const START_LIVES = 3;

type EntityKind = "token" | "bug";

type Entity = {
  id: number;
  lane: number;
  y: number;
  kind: EntityKind;
  text: string;
  step: number;
};

type RallyEvent = {
  key: number;
  text: string;
  tone: "good" | "wrong" | "bug";
};

type GameState = {
  lane: number;
  entities: Entity[];
  step: number;
  lives: number;
  score: number;
  speed: number;
  distance: number;
  spawnIn: number;
  entitySeq: number;
  eventSeq: number;
  event: RallyEvent | null;
};

function initialGame(): GameState {
  return {
    lane: 1,
    entities: [],
    step: 0,
    lives: START_LIVES,
    score: 0,
    speed: 42,
    distance: 0,
    spawnIn: 0.3,
    entitySeq: 0,
    eventSeq: 0,
    event: null,
  };
}

/** Move the road, spawn pieces, and resolve collisions for one animation frame. */
function advanceGame(
  game: GameState,
  dt: number,
  mission: RallyMission,
): GameState {
  if (game.step >= mission.tokens.length || game.lives <= 0) return game;

  const fallSpeed = 25 + game.speed * 0.14;
  let entitySeq = game.entitySeq;
  let eventSeq = game.eventSeq;
  let entities = game.entities.map((entity) => ({
    ...entity,
    y: entity.y + fallSpeed * dt,
  }));
  let spawnIn = game.spawnIn - dt;
  let event = game.event;

  if (spawnIn <= 0 && game.step < mission.tokens.length) {
    const lane = Math.floor(Math.random() * 3);
    const roll = Math.random();
    let kind: EntityKind = "bug";
    let step = 0;
    let text = "BUG";

    if (roll < 0.5) {
      kind = "token";
      step = game.step;
      text = mission.tokens[step];
    } else if (roll < 0.8) {
      const otherSteps = mission.tokens
        .map((_, index) => index)
        .filter((index) => index !== game.step);
      if (otherSteps.length > 0) {
        kind = "token";
        step = otherSteps[Math.floor(Math.random() * otherSteps.length)];
        text = mission.tokens[step];
      } else {
        kind = "token";
        step = game.step;
        text = mission.tokens[step];
      }
    }

    entities = [
      ...entities,
      { id: ++entitySeq, lane, y: -8, kind, step, text },
    ];
    spawnIn = 0.82;
  }

  let step = game.step;
  let lives = game.lives;
  let score = game.score;
  let speed = game.speed;
  const survivors: Entity[] = [];

  for (const entity of entities) {
    if (
      entity.lane === game.lane &&
      entity.y > CAR_TOP &&
      entity.y < CAR_BOTTOM
    ) {
      if (entity.kind === "bug") {
        lives = Math.max(0, lives - 1);
        speed = Math.max(16, speed - 10);
        event = { key: ++eventSeq, tone: "bug", text: "Bug! −1 repair" };
      } else if (entity.step === step) {
        step += 1;
        score += 10;
        speed = Math.min(99, speed + 5);
        event =
          step >= mission.tokens.length
            ? { key: ++eventSeq, tone: "good", text: "Line complete!" }
            : { key: ++eventSeq, tone: "good", text: `+ ${entity.text}` };
      } else {
        score = Math.max(0, score - 2);
        speed = Math.max(16, speed - 3);
        event = {
          key: ++eventSeq,
          tone: "wrong",
          text: "Not yet — follow the coach",
        };
      }
      continue;
    }

    if (entity.y < 108) survivors.push(entity);
  }

  return {
    ...game,
    entities: survivors,
    step,
    lives,
    score,
    speed: Math.min(99, speed + dt * 0.7),
    distance: game.distance + speed * dt * 0.06,
    spawnIn,
    entitySeq,
    eventSeq,
    event,
  };
}

export default function CarRace() {
  const progress = useQuery(api.progress.getProgress, { language: "rally" });
  const completeLevel = useMutation(api.progress.completeLevel);
  const resetProgress = useMutation(api.progress.resetProgress);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [game, setGame] = useState<GameState>(() => initialGame());
  const [replay, setReplay] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const lastSoundKey = useRef(0);

  const completedIds = progress?.completedLevels ?? [];
  const xp = progress?.xp ?? 0;

  const resumeIndex = useMemo(() => {
    if (!progress) return 0;
    const next = RALLY_MISSIONS.findIndex(
      (mission) => !progress.completedLevels.includes(mission.id),
    );
    return next === -1 ? RALLY_MISSIONS.length : next;
  }, [progress]);

  const currentIndex = activeIndex ?? resumeIndex;
  const finished = currentIndex >= RALLY_MISSIONS.length;
  const mission = finished ? null : RALLY_MISSIONS[currentIndex];
  const step = mission ? Math.min(game.step, mission.tokens.length) : 0;
  const missionComplete = !!mission && game.step >= mission.tokens.length;
  const missionFailed = !!mission && game.lives <= 0;
  const isDriving = phase === "driving" && !missionComplete && !missionFailed;
  const savedMission = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      lastSoundKey.current = 0;
    };
  }, []);

  /* One requestAnimationFrame loop drives the whole road. */
  useEffect(() => {
    if (!isDriving || !mission) return;
    let raf = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      setGame((current) => advanceGame(current, dt, mission));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isDriving, mission]);

  /* Award XP once when the line is built; the result screen is derived. */
  useEffect(() => {
    if (!mission || !missionComplete || replay) return;
    if (savedMission.current === mission.id) return;
    savedMission.current = mission.id;
    completeLevel({
      language: "rally",
      levelId: mission.id,
      xp: mission.xp,
    }).catch((error) =>
      console.error("Could not save rally progress:", error),
    );
  }, [mission, missionComplete, replay, completeLevel]);

  /* Sound is a side effect of game events so collisions never repeat audio. */
  useEffect(() => {
    const event = game.event;
    if (!event || event.key === lastSoundKey.current) return;
    lastSoundKey.current = event.key;
    if (!soundOn) return;
    if (event.tone === "good") playBoost();
    else if (event.tone === "bug") playCrash();
    else playMiss();
  }, [game.event, soundOn]);

  /* Keyboard steering. Touch players get the same controls on screen. */
  useEffect(() => {
    if (!isDriving) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        setGame((current) => ({
          ...current,
          lane: Math.max(0, current.lane - 1),
        }));
      } else if (key === "arrowright" || key === "d") {
        event.preventDefault();
        setGame((current) => ({
          ...current,
          lane: Math.min(2, current.lane + 1),
        }));
      } else if (key === "1" || key === "2" || key === "3") {
        event.preventDefault();
        setGame((current) => ({ ...current, lane: Number(key) - 1 }));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDriving]);

  function moveLane(direction: number) {
    if (phase !== "driving") return;
    setGame((current) => ({
      ...current,
      lane: Math.max(0, Math.min(2, current.lane + direction)),
    }));
  }

  function beginMission(index: number) {
    const nextMission = RALLY_MISSIONS[index];
    if (!nextMission) {
      setActiveIndex(RALLY_MISSIONS.length);
      setPhase("complete");
      return;
    }
    setActiveIndex(index);
    setReplay(completedIds.includes(nextMission.id));
    savedMission.current = null;
    lastSoundKey.current = 0;
    setGame(initialGame());
    setPhase("driving");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startRun() {
    beginMission(resumeIndex);
  }

  function retryMission() {
    savedMission.current = null;
    lastSoundKey.current = 0;
    setGame(initialGame());
    setPhase("driving");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextMission() {
    if (!mission) return;
    const next = currentIndex + 1;
    if (next >= RALLY_MISSIONS.length) {
      setActiveIndex(RALLY_MISSIONS.length);
      setPhase("complete");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    beginMission(next);
  }

  async function handleRestart() {
    const ok =
      completedIds.length === 0 ||
      window.confirm(
        "Reset Code Rally? Your built lines and rally XP will be wiped.",
      );
    if (!ok) return;
    try {
      await resetProgress({ language: "rally" });
      setActiveIndex(null);
      setPhase("intro");
      savedMission.current = null;
      setGame(initialGame());
    } catch (error) {
      console.error("Could not reset rally progress:", error);
    }
  }

  const progressDots = RALLY_MISSIONS.map((item, index) => {
    const done = completedIds.includes(item.id);
    return (
      <span
        key={item.id}
        className={cn(
          "size-2.5 rounded-full transition",
          done
            ? "bg-[var(--clay-peach-ink)]"
            : index === currentIndex && !finished
              ? "bg-[var(--clay-peach)] ring-2 ring-[var(--clay-peach-ink)]/30"
              : "bg-muted-foreground/20",
        )}
      />
    );
  });

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 top-20 size-80 rounded-full bg-[var(--clay-peach)] opacity-45" />
        <div className="absolute -left-24 top-[36rem] size-72 rounded-full bg-[var(--clay-butter)] opacity-50" />
      </div>

      <GameHeader xp={xp} showPathsLink />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/learn"
              className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              All paths
            </Link>
            <span className="clay-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--clay-peach-ink)]">
              <Flag className="size-3" />
              Code Rally
            </span>
            <Link
              to="/learn/ai"
              className="clay-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--clay-lilac-ink)] hover:bg-white/70"
            >
              <Crosshair className="size-3" />
              Try the AI range
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-label="Rally progress">
              {progressDots}
            </div>
            <button
              type="button"
              onClick={() => setSoundOn((current) => !current)}
              className="grid size-9 place-items-center rounded-full bg-white/70 text-muted-foreground shadow-[inset_0_-2px_0_rgba(60,50,90,0.08)] transition hover:text-foreground"
              aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            >
              {soundOn ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/70 hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>
        </div>

        {progress === undefined ? (
          <div className="clay grid min-h-64 place-items-center p-8">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              <p className="text-sm font-bold">Fueling the rally car…</p>
            </div>
          </div>
        ) : finished ? (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay relative overflow-hidden p-8 text-center sm:p-12"
          >
            <div className="clay-tile tone-peach mx-auto grid size-20 place-items-center text-5xl">
              🏁
            </div>
            <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">
              Rally complete!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              You built all {RALLY_MISSIONS.length} lines and earned {xp} rally
              XP. The car is still running — that is how you know it compiled.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="clay-btn h-12 rounded-2xl px-6 font-extrabold">
                <Link to="/learn">
                  Choose another path
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleRestart}
                className="h-12 rounded-2xl border-0 bg-white px-6 font-extrabold"
              >
                <RotateCcw className="size-4" />
                Race again
              </Button>
            </div>
          </motion.section>
        ) : phase === "intro" ? (
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay overflow-hidden p-6 sm:p-8"
          >
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--clay-butter)] px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[var(--clay-butter-ink)]">
                  <Sparkles className="size-3.5" />
                  Real driving game · {RALLY_MISSIONS.length} lines
                </span>
                <h1 className="mt-5 font-display text-4xl font-semibold sm:text-5xl">
                  Code Rally
                </h1>
                <p className="mt-4 max-w-xl text-base font-semibold leading-relaxed text-muted-foreground">
                  Drive the clay car down the code highway. Collect the highlighted
                  pieces in order to build each line, dodge bugs, and keep your
                  repairs for the rough patches.
                </p>

                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {[
                    { icon: "← →", text: "Steer with arrows, A / D or the buttons" },
                    { icon: "🧩", text: "Collect the next piece in the coach" },
                    { icon: "🐞", text: "Bugs cost one repair — dodge them" },
                    { icon: "⚡", text: "Correct pieces boost speed" },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-start gap-2.5 rounded-xl bg-white/65 px-3.5 py-2.5"
                    >
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white/80 font-mono text-[10px] font-extrabold text-[var(--clay-peach-ink)]">
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold text-foreground/80">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={startRun}
                    size="lg"
                    className="clay-btn h-12 rounded-2xl bg-[var(--clay-peach-ink)] px-6 font-extrabold text-white hover:bg-[var(--clay-peach-ink)]"
                  >
                    <Play className="size-4 fill-current" />
                    {completedIds.length > 0 ? "Resume the rally" : "Start the engine"}
                  </Button>
                  <span className="text-xs font-bold text-muted-foreground">
                    {completedIds.length}/{RALLY_MISSIONS.length} lines built ·{" "}
                    {xp}/{RALLY_TOTAL_XP} XP
                  </span>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="relative h-64 overflow-hidden rounded-[2rem] border border-white/20 bg-[var(--clay-ink)] shadow-[inset_0_10px_40px_rgba(0,0,0,0.45),0_30px_50px_-30px_rgba(40,30,70,0.7)]">
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[var(--clay-lilac)]/35 to-transparent" />
                  <div
                    className="absolute inset-y-0 left-1/2 w-[70%] -translate-x-1/2 bg-[oklch(0.3_0.025_290)]"
                    style={{ clipPath: "polygon(12% 0, 88% 0, 100% 100%, 0 100%)" }}
                  />
                  {[36, 64].map((x) => (
                    <div
                      key={x}
                      className="rally-road absolute inset-y-0 w-1 -translate-x-1/2"
                      style={{ left: `${x}%` }}
                    />
                  ))}
                  <div className="absolute left-4 top-4 max-w-[84%] truncate rounded-full bg-black/25 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">
                    Build: {RALLY_MISSIONS[resumeIndex]?.code ?? "all lines done"}
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <Car />
                  </div>
                </div>
                <div className="clay-soft absolute -bottom-4 left-4 flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold text-[var(--clay-peach-ink)]">
                  <Gauge className="size-4" /> 42 km/h
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {RALLY_MISSIONS.map((item, index) => {
                const done = completedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold",
                      done
                        ? "bg-[var(--clay-mint)] text-[var(--clay-mint-ink)]"
                        : "bg-white/55 text-muted-foreground",
                    )}
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/70 text-[10px] font-extrabold">
                      {done ? <Check className="size-3" strokeWidth={3.5} /> : index + 1}
                    </span>
                    <span className="truncate">
                      {item.language} · {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.article>
        ) : isDriving && mission ? (
          <motion.section
            key={`drive-${mission.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="clay p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
                        "bg-[var(--tone)] text-[var(--tone-ink)]",
                        mission.tone,
                      )}
                    >
                      {mission.language}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Line {currentIndex + 1} of {RALLY_MISSIONS.length}
                    </span>
                  </div>
                  <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                    {mission.title}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {mission.goal}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5">
                    {Array.from({ length: START_LIVES }).map((_, index) => (
                      <Wrench
                        key={index}
                        className={cn(
                          "size-3.5",
                          index < game.lives
                            ? "text-[var(--clay-mint-ink)]"
                            : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                    <span className="ml-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      {game.lives} repairs
                    </span>
                  </div>
                  <span className="rounded-full bg-[var(--clay-butter)] px-3 py-1.5 text-xs font-extrabold text-[var(--clay-butter-ink)]">
                    +{mission.xp} XP
                  </span>
                </div>
              </div>

              {/* The coach is always visible: it tells the player exactly what to collect next. */}
              <div className="mt-4 rounded-2xl bg-[var(--clay-ink)] p-3.5 text-white shadow-[inset_0_8px_18px_-12px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/55">
                    <BookOpen className="size-3.5" /> Coach · build the line
                  </p>
                  <span className="font-mono text-[10px] font-bold text-white/45">
                    {step}/{mission.tokens.length} pieces
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {mission.tokens.map((token, index) => {
                    const collected = index < step;
                    const next = index === step;
                    return (
                      <span
                        key={`${token}-${index}`}
                        className={cn(
                          "rounded-lg px-2 py-1 font-mono text-[11px] font-bold transition",
                          collected
                            ? "bg-[var(--clay-mint)] text-[var(--clay-mint-ink)]"
                            : next
                              ? "bg-[var(--clay-butter)] text-[var(--clay-butter-ink)] ring-2 ring-white/70"
                              : "bg-white/10 text-white/45",
                        )}
                      >
                        {token}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs font-bold text-white/65">
                  {step < mission.tokens.length
                    ? `Next piece: ${mission.tokens[step]} — steer into it on the road.`
                    : "Line complete. Nice driving!"}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveLane(-1)}
                    disabled={game.lane === 0}
                    aria-label="Steer left"
                    className="clay-btn grid size-10 place-items-center rounded-xl bg-white text-foreground disabled:opacity-35"
                  >
                    <ArrowLeft className="size-4" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLane(1)}
                    disabled={game.lane === 2}
                    aria-label="Steer right"
                    className="clay-btn grid size-10 place-items-center rounded-xl bg-white text-foreground disabled:opacity-35"
                  >
                    <ArrowRight className="size-4" strokeWidth={2.5} />
                  </button>
                  <span className="hidden text-[11px] font-bold text-muted-foreground sm:inline">
                    or use ← → / A D
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="size-3.5" /> {Math.round(game.speed)} km/h
                  </span>
                  <span>{game.distance.toFixed(1)} km</span>
                  <span>{game.score} pts</span>
                </div>
              </div>
            </div>

            <div className="relative mt-4 h-[28rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--clay-ink)] shadow-[inset_0_10px_40px_rgba(0,0,0,0.45),0_30px_50px_-30px_rgba(40,30,70,0.7)] sm:h-[32rem]">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--clay-lilac)]/30 to-transparent" />
              <div
                className="absolute inset-y-0 left-1/2 w-[74%] -translate-x-1/2 bg-[oklch(0.3_0.025_290)] shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]"
                style={{ clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)" }}
              />
              <div className="absolute inset-y-0 left-[13%] w-1 bg-[var(--clay-butter)]/65" />
              <div className="absolute inset-y-0 right-[13%] w-1 bg-[var(--clay-butter)]/65" />
              {[36, 64].map((x) => (
                <div
                  key={x}
                  className="rally-road absolute inset-y-0 w-1.5 -translate-x-1/2"
                  style={{ left: `${x}%` }}
                />
              ))}

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-[var(--clay-ink)] via-[var(--clay-ink)]/80 to-transparent p-4 pb-10">
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white/70">
                  <Gauge className="size-3.5" />
                  {Math.round(game.speed)} km/h
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white/70">
                  🐞 Dodge bugs
                </div>
              </div>

              <div className="absolute left-[15%] top-24 text-2xl opacity-70">🌳</div>
              <div className="absolute right-[14%] top-40 text-2xl opacity-70">🌳</div>
              <div className="absolute left-[16%] bottom-28 text-2xl opacity-70">🪨</div>
              <div className="absolute right-[16%] bottom-20 text-2xl opacity-70">🌵</div>

              {game.entities.map((entity) => (
                <div
                  key={entity.id}
                  className="absolute z-10 -translate-x-1/2"
                  style={{ left: `${LANE_X[entity.lane]}%`, top: `${entity.y}%` }}
                >
                  {entity.kind === "bug" ? (
                    <div className="grid size-16 place-items-center rounded-full border-2 border-[var(--clay-peach)] bg-[var(--clay-peach)] text-2xl shadow-[0_8px_16px_-10px_rgba(0,0,0,0.8)]">
                      🐞
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "w-[26vw] max-w-32 rounded-xl border px-2 py-2 text-center font-mono text-[10px] font-bold leading-4 shadow-[0_8px_16px_-10px_rgba(0,0,0,0.8)] sm:w-32 sm:text-[11px]",
                        entity.step === step
                          ? "border-[var(--clay-butter)] bg-[var(--clay-butter)] text-[var(--clay-butter-ink)] ring-2 ring-white/70"
                          : "border-white/25 bg-white/90 text-foreground",
                      )}
                    >
                      {entity.text}
                    </div>
                  )}
                </div>
              ))}

              {game.event && (
                <motion.div
                  key={game.event.key}
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "absolute left-1/2 top-[38%] z-30 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider shadow-lg",
                    game.event.tone === "good"
                      ? "bg-[var(--clay-mint)] text-[var(--clay-mint-ink)]"
                      : game.event.tone === "bug"
                        ? "bg-[var(--clay-peach)] text-[var(--clay-peach-ink)]"
                        : "bg-[var(--clay-butter)] text-[var(--clay-butter-ink)]",
                  )}
                >
                  {game.event.text}
                </motion.div>
              )}

              <div
                className="absolute bottom-8 z-20 -translate-x-1/2 transition-[left] duration-150"
                style={{ left: `${LANE_X[game.lane]}%` }}
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Car />
                </motion.div>
              </div>

              <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/45">
                Collect the highlighted piece · avoid bugs
              </div>
            </div>
          </motion.section>
        ) : missionComplete && mission ? (
          <motion.section
            key={`result-${mission.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay p-7 text-center sm:p-10"
          >
            <div className="clay-tile tone-mint mx-auto grid size-20 place-items-center text-5xl">
              🏁
            </div>
            <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
              Line compiled!
            </h1>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              {replay
                ? "Replay complete — no extra XP, but the line is yours."
                : `+${mission.xp} XP · ${Math.round(game.speed)} km/h`}
            </p>

            <div className="mx-auto mt-6 max-w-2xl text-left">
              <div className="code-well overflow-hidden">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                  <span className="size-2.5 rounded-full bg-[oklch(0.78_0.13_25)]" />
                  <span className="size-2.5 rounded-full bg-[oklch(0.88_0.11_95)]" />
                  <span className="size-2.5 rounded-full bg-[oklch(0.8_0.1_165)]" />
                  <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {mission.language.toLowerCase()} · built on the road
                  </span>
                </div>
                <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-7 text-[oklch(0.94_0.02_95)]">
                  {mission.code}
                </pre>
              </div>
              <div className="clay-inset mt-3 rounded-2xl p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  Why it works
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/85">
                  {mission.explanation}
                </p>
              </div>
            </div>

            <Button
              onClick={nextMission}
              size="lg"
              className="clay-btn mt-6 h-12 rounded-2xl px-6 font-extrabold"
            >
              {currentIndex + 1 >= RALLY_MISSIONS.length
                ? "Finish the rally"
                : "Keep driving"}
              <ArrowRight className="size-4" />
            </Button>
          </motion.section>
        ) : missionFailed && mission ? (
          <motion.section
            key={`gameover-${mission.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay p-7 text-center sm:p-10"
          >
            <div className="clay-tile tone-peach mx-auto grid size-20 place-items-center text-5xl">
              🛠️
            </div>
            <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
              Engine stalled
            </h1>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              Too many bugs hit the car. The line is still waiting to be built.
            </p>
            <div className="clay-inset mx-auto mt-6 max-w-2xl rounded-2xl p-5 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Target line
              </p>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-sm font-bold text-[var(--clay-peach-ink)]">
                {mission.code}
              </pre>
            </div>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={retryMission}
                size="lg"
                className="clay-btn h-12 rounded-2xl bg-[var(--clay-peach-ink)] px-6 font-extrabold text-white hover:bg-[var(--clay-peach-ink)]"
              >
                <Wrench className="size-4" />
                Pit stop and retry
              </Button>
              <Button
                onClick={() => setPhase("intro")}
                variant="outline"
                className="h-12 rounded-2xl border-0 bg-white px-6 font-extrabold"
              >
                <ArrowLeft className="size-4" />
                Back to garage
              </Button>
            </div>
          </motion.section>
        ) : null}
      </main>
    </div>
  );
}

/** A small clay car, built from rounded blocks so it fits the rest of the app. */
function Car() {
  return (
    <div className="relative h-20 w-28">
      <motion.div
        aria-hidden
        className="absolute bottom-1 left-1 h-2 w-24 rounded-full bg-black/30 blur-sm"
        animate={{ scaleX: [1, 1.04, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute bottom-3 left-0 h-10 w-28 rounded-[1.15rem] border border-white/30 bg-[var(--clay-peach)] shadow-[inset_0_-8px_12px_-6px_rgba(60,50,90,0.35),inset_0_6px_10px_-4px_rgba(255,255,255,0.7)]">
        <span className="absolute -bottom-1 left-4 size-5 rounded-full border-2 border-[var(--clay-ink)] bg-[var(--clay-ink)]">
          <span className="absolute inset-1 rounded-full bg-white/60" />
        </span>
        <span className="absolute -bottom-1 right-4 size-5 rounded-full border-2 border-[var(--clay-ink)] bg-[var(--clay-ink)]">
          <span className="absolute inset-1 rounded-full bg-white/60" />
        </span>
      </div>
      <div className="absolute bottom-8 left-5 h-9 w-16 rounded-t-[1.2rem] border border-white/25 bg-[var(--clay-peach)] shadow-[inset_0_5px_9px_-4px_rgba(255,255,255,0.6)]">
        <div className="absolute left-2 top-2 h-5 w-5 rounded-t-lg bg-[var(--clay-sky)]/80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.5)]" />
        <div className="absolute right-2 top-2 h-5 w-5 rounded-t-lg bg-[var(--clay-sky)]/80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.5)]" />
      </div>
      <span className="absolute bottom-5 left-2 h-2 w-3 rounded-full bg-[var(--clay-butter)] shadow-[0_0_8px_rgba(255,220,120,0.7)]" />
      <span className="absolute bottom-5 right-2 h-2 w-3 rounded-full bg-[var(--clay-butter)] shadow-[0_0_8px_rgba(255,220,120,0.7)]" />
      <span className="absolute -top-2 left-1/2 grid size-7 -translate-x-1/2 place-items-center rounded-full border border-white/50 bg-[var(--clay-ink)] font-mono text-[10px] font-bold text-white">
        01
      </span>
    </div>
  );
}
