import { GameHeader } from "@/components/GameHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { CAR_ROUNDS, buildGates, type CarRound } from "@/lib/car-race";
import { playBoost, playCrash } from "@/lib/sfx";
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
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

type Phase = "intro" | "race" | "result" | "complete";

const START_TRIES = 2;
const LANE_X = [22, 50, 78];
const LANE_LABELS = ["A", "B", "C"];
const LANE_TONES = ["tone-mint", "tone-sky", "tone-butter"];

type Flash = { key: number; text: string; positive: boolean };

export default function CarRace() {
  const progress = useQuery(api.progress.getProgress, { language: "car" });
  const completeLevel = useMutation(api.progress.completeLevel);
  const resetProgress = useMutation(api.progress.resetProgress);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [tries, setTries] = useState(START_TRIES);
  const [spent, setSpent] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [lastPick, setLastPick] = useState<string | null>(null);
  const [lane, setLane] = useState(1);
  const [wrongShake, setWrongShake] = useState(false);
  const [replay, setReplay] = useState(false);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [speed, setSpeed] = useState(42);
  const [soundOn, setSoundOn] = useState(true);
  const [flash, setFlash] = useState<Flash | null>(null);

  const timer = useRef<number | null>(null);
  const shakeTimer = useRef<number | null>(null);
  const flashKey = useRef(0);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    };
  }, []);

  const completedIds = progress?.completedLevels ?? [];
  const xp = progress?.xp ?? 0;

  const resumeIndex = useMemo(() => {
    if (!progress) return 0;
    const next = CAR_ROUNDS.findIndex(
      (round) => !progress.completedLevels.includes(round.id),
    );
    return next === -1 ? CAR_ROUNDS.length : next;
  }, [progress]);

  const currentIndex = activeIndex ?? resumeIndex;
  const finished = currentIndex >= CAR_ROUNDS.length;
  const round = finished ? null : CAR_ROUNDS[currentIndex];
  const gates = useMemo(() => (round ? buildGates(round) : []), [round]);
  const correctText = round ? round.options[round.answer] : "";

  function clearTimers() {
    if (timer.current) window.clearTimeout(timer.current);
    if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    timer.current = null;
    shakeTimer.current = null;
  }

  function saveLevel(target: CarRound) {
    completeLevel({
      language: "car",
      levelId: target.id,
      xp: target.xp,
    }).catch((error) => console.error("Could not save rally progress:", error));
  }

  function resetRoundState() {
    setTries(START_TRIES);
    setSpent([]);
    setLocked(false);
    setCorrect(null);
    setLastPick(null);
    setLane(1);
    setWrongShake(false);
    setFlash(null);
  }

  function beginRun(index: number) {
    clearTimers();
    const target = CAR_ROUNDS[index];
    setActiveIndex(index >= CAR_ROUNDS.length ? CAR_ROUNDS.length : index);
    setReplay(!!target && completedIds.includes(target.id));
    setPhase(index >= CAR_ROUNDS.length ? "complete" : "race");
    setTries(START_TRIES);
    setSpent([]);
    setLocked(false);
    setCorrect(null);
    setLastPick(null);
    setLane(1);
    setWrongShake(false);
    setFlash(null);
    setStreak(0);
    setSolved(0);
    setSpeed(42);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retryGate() {
    clearTimers();
    setTries(START_TRIES);
    setSpent([]);
    setLocked(false);
    setCorrect(null);
    setLastPick(null);
    setLane(1);
    setWrongShake(false);
    setFlash(null);
    setPhase("race");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    if (!round) return;
    clearTimers();
    const next = currentIndex + 1;
    if (next >= CAR_ROUNDS.length) {
      setActiveIndex(CAR_ROUNDS.length);
      setPhase("complete");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setActiveIndex(next);
    setReplay(completedIds.includes(CAR_ROUNDS[next].id));
    resetRoundState();
    setPhase("race");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choose(index: number) {
    if (phase !== "race" || locked || !round) return;
    const gate = gates[index];
    if (!gate || spent.includes(gate.text)) return;

    setLane(index);
    setLastPick(gate.text);

    if (gate.correct) {
      setLocked(true);
      setCorrect(true);
      setStreak((current) => current + 1);
      setSolved((current) => current + 1);
      setSpeed((current) => Math.min(99, current + 14));
      if (!replay) saveLevel(round);
      if (soundOn) playBoost();
      setFlash({
        key: ++flashKey.current,
        text: replay ? "Gate cleared" : `+${round.xp} XP`,
        positive: true,
      });
      timer.current = window.setTimeout(() => setPhase("result"), 950);
      return;
    }

    const nextTries = tries - 1;
    setTries(nextTries);
    setStreak(0);
    setSpeed((current) => Math.max(18, current - 8));
    setSpent((current) =>
      current.includes(gate.text) ? current : [...current, gate.text],
    );
    setCorrect(false);
    setWrongShake(true);
    if (soundOn) playCrash();
    setFlash({
      key: ++flashKey.current,
      text:
        nextTries > 0
          ? `Cone! ${nextTries} ${nextTries === 1 ? "repair" : "repairs"} left`
          : "Breakdown!",
      positive: false,
    });

    if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    shakeTimer.current = window.setTimeout(() => setWrongShake(false), 500);

    if (nextTries <= 0) {
      setLocked(true);
      timer.current = window.setTimeout(() => setPhase("result"), 950);
    } else {
      setLocked(true);
      timer.current = window.setTimeout(() => {
        setLocked(false);
        setLane(1);
        setLastPick(null);
        setCorrect(null);
      }, 620);
    }
  }

  async function handleRestart() {
    const ok =
      completedIds.length === 0 ||
      window.confirm(
        "Reset Code Rally? Your cleared gates and rally XP will be wiped.",
      );
    if (!ok) return;
    clearTimers();
    try {
      await resetProgress({ language: "car" });
      setActiveIndex(null);
      setPhase("intro");
      resetRoundState();
      setStreak(0);
      setSolved(0);
      setSpeed(42);
    } catch (error) {
      console.error("Could not reset rally progress:", error);
    }
  }

  const progressDots = CAR_ROUNDS.map((item, index) => {
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
              <p className="text-sm font-bold">Warming up the engine…</p>
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
              You cleared all {CAR_ROUNDS.length} gates and earned {xp} rally XP.
              The code paths just got faster.
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
                  Arcade game · {CAR_ROUNDS.length} gates
                </span>
                <h1 className="mt-5 font-display text-4xl font-semibold sm:text-5xl">
                  Code Rally
                </h1>
                <p className="mt-4 max-w-xl text-base font-semibold leading-relaxed text-muted-foreground">
                  Drive the clay car through the right answer. Three answer
                  gates, two repairs, and a whole lot of road. Every gate is a
                  tiny code idea with an explanation at the finish line.
                </p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {[
                    "Pick the correct code gate",
                    "Correct answers boost your speed",
                    "Wrong gates cost a repair",
                    "Explanations after every gate",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5 rounded-xl bg-white/65 px-3.5 py-2.5"
                    >
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-[var(--clay-mint-ink)]"
                        strokeWidth={3.5}
                      />
                      <span className="text-xs font-bold text-foreground/80">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => beginRun(resumeIndex)}
                    size="lg"
                    className="clay-btn h-12 rounded-2xl bg-[var(--clay-peach-ink)] px-6 font-extrabold text-white hover:bg-[var(--clay-peach-ink)]"
                  >
                    <Flag className="size-4" />
                    {completedIds.length > 0 ? "Resume the rally" : "Start the rally"}
                  </Button>
                  <span className="text-xs font-bold text-muted-foreground">
                    {completedIds.length}/{CAR_ROUNDS.length} gates cleared ·{" "}
                    {xp} XP
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
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <Car />
                  </div>
                  <div className="absolute left-4 top-4 rounded-full bg-black/25 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">
                    Gate {currentIndex + 1} of {CAR_ROUNDS.length}
                  </div>
                  <div className="clay-soft absolute -right-2 top-6 rotate-6 rounded-2xl bg-[var(--clay-butter)] px-3.5 py-2 text-xs font-extrabold text-[var(--clay-butter-ink)]">
                    Ready?
                  </div>
                </div>
                <div className="clay-soft absolute -bottom-4 left-4 flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold text-[var(--clay-peach-ink)]">
                  <Gauge className="size-4" /> 42 km/h
                </div>
              </div>
            </div>
          </motion.article>
        ) : phase === "race" && round ? (
          <motion.section
            key={`race-${round.id}`}
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
                        round.tone,
                        "bg-[var(--tone)] text-[var(--tone-ink)]",
                      )}
                    >
                      {round.languageName}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Gate {currentIndex + 1} of {CAR_ROUNDS.length}
                    </span>
                    {streak > 1 && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--clay-butter)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--clay-butter-ink)]">
                        🔥 {streak} in a row
                      </span>
                    )}
                  </div>
                  <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                    {round.title}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5">
                    {Array.from({ length: START_TRIES }).map((_, index) => (
                      <Wrench
                        key={index}
                        className={cn(
                          "size-3.5",
                          index < tries
                            ? "text-[var(--clay-mint-ink)]"
                            : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                    <span className="ml-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      {tries} left
                    </span>
                  </div>
                  <span className="hidden items-center gap-1.5 rounded-full bg-[var(--clay-butter)] px-3 py-1.5 text-xs font-extrabold text-[var(--clay-butter-ink)] sm:flex">
                    <Sparkles className="size-3.5" /> +{round.xp} XP
                  </span>
                </div>
              </div>

              <h2 className="mt-4 text-lg font-bold leading-relaxed">
                {round.prompt}
              </h2>

              {round.code && (
                <pre className="code-well mt-3 overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-7">
                  {round.code}
                </pre>
              )}

              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {gates.map((gate, index) => {
                  const used = spent.includes(gate.text);
                  return (
                    <button
                      key={`${gate.text}-${index}`}
                      type="button"
                      onClick={() => choose(index)}
                      disabled={used || locked}
                      className={cn(
                        "clay-btn flex min-h-24 flex-col items-start gap-2 rounded-2xl border border-white/60 px-3.5 py-3 text-left transition",
                        LANE_TONES[index],
                        used
                          ? "bg-muted text-muted-foreground opacity-55"
                          : lane === index
                            ? "bg-[var(--tone)] text-[var(--tone-ink)]"
                            : "bg-white/75 text-foreground hover:bg-white",
                      )}
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-65">
                          Lane {LANE_LABELS[index]}
                        </span>
                        {used ? (
                          <X className="size-3.5" />
                        ) : (
                          <span className="grid size-5 place-items-center rounded-full bg-white/60 text-[10px] font-extrabold">
                            {LANE_LABELS[index]}
                          </span>
                        )}
                      </span>
                      <span className="whitespace-pre-wrap font-mono text-[12px] font-bold leading-5">
                        {gate.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Tap a lane to steer · wrong gates cost a repair
              </p>
            </div>

            <div className="relative mt-4 h-[24rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--clay-ink)] shadow-[inset_0_10px_40px_rgba(0,0,0,0.45),0_30px_50px_-30px_rgba(40,30,70,0.7)] sm:h-[28rem]">
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
                  {speed} km/h
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white/70">
                  <Flag className="size-3.5" />
                  {solved * 0.4} km
                </div>
              </div>

              <div className="absolute left-[15%] top-24 text-2xl opacity-70">🌳</div>
              <div className="absolute right-[14%] top-40 text-2xl opacity-70">🌳</div>
              <div className="absolute left-[16%] bottom-28 text-2xl opacity-70">🪨</div>
              <div className="absolute right-[16%] bottom-20 text-2xl opacity-70">🌵</div>

              {flash && (
                <motion.div
                  key={flash.key}
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "absolute left-1/2 top-[42%] z-30 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider shadow-lg",
                    flash.positive
                      ? "bg-[var(--clay-mint)] text-[var(--clay-mint-ink)]"
                      : "bg-[var(--clay-peach)] text-[var(--clay-peach-ink)]",
                  )}
                >
                  {flash.text}
                </motion.div>
              )}

              <motion.div
                className="absolute bottom-8 z-20 -translate-x-1/2"
                animate={{ left: `${LANE_X[lane]}%` }}
                transition={{ type: "spring", stiffness: 130, damping: 15 }}
              >
                <motion.div
                  animate={
                    wrongShake
                      ? { x: [0, -7, 7, -4, 0], rotate: [0, -3, 3, 0] }
                      : { y: [0, -2, 0] }
                  }
                  transition={
                    wrongShake
                      ? { duration: 0.45 }
                      : {
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                >
                  <Car />
                </motion.div>
              </motion.div>

              <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/45">
                {lastPick ? "Car is in the selected lane" : "Choose a lane above to steer"}
              </div>
            </div>
          </motion.section>
        ) : round ? (
          <motion.section
            key={`result-${round.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay p-7 text-center sm:p-10"
          >
            <div
              className={cn(
                "clay-tile mx-auto grid size-20 place-items-center text-5xl",
                correct ? "tone-mint" : "tone-peach",
              )}
            >
              {correct ? "🏁" : "🛠️"}
            </div>
            <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
              {correct ? "Gate cleared!" : "Breakdown at the gate"}
            </h1>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              {correct
                ? replay
                  ? "Replay gate complete — no extra XP, but the idea is yours."
                  : `+${round.xp} XP · ${speed} km/h and climbing`
                : `The right gate was “${correctText}”.`}
            </p>

            <div className="clay-inset mx-auto mt-6 max-w-2xl rounded-2xl p-5 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Why it matters
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/85">
                {round.explanation}
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {correct ? (
                <Button
                  onClick={goNext}
                  size="lg"
                  className="clay-btn h-12 rounded-2xl px-6 font-extrabold"
                >
                  {currentIndex + 1 >= CAR_ROUNDS.length
                    ? "Finish the rally"
                    : "Next gate"}
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={retryGate}
                    size="lg"
                    className="clay-btn h-12 rounded-2xl bg-[var(--clay-peach-ink)] px-6 font-extrabold text-white hover:bg-[var(--clay-peach-ink)]"
                  >
                    <Wrench className="size-4" />
                    Pit stop and retry
                  </Button>
                  <Button
                    onClick={goNext}
                    variant="outline"
                    className="h-12 rounded-2xl border-0 bg-white px-6 font-extrabold"
                  >
                    Tow to next gate
                    <ArrowRight className="size-4" />
                  </Button>
                </>
              )}
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="size-3.5" /> Understanding beats speed — keep rolling.
            </p>
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
