import { GameHeader } from "@/components/GameHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { AI_LESSONS } from "@/lib/tracks/ai";
import { playHit, playMiss, playShot } from "@/lib/sfx";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Crosshair,
  Heart,
  Loader2,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link } from "react-router";

type Phase = "briefing" | "range" | "result" | "complete";

const TARGET_POSITIONS = [
  { x: 27, y: 44 },
  { x: 73, y: 40 },
  { x: 31, y: 76 },
  { x: 72, y: 70 },
];

const TARGET_TONES = ["tone-butter", "tone-mint", "tone-sky", "tone-peach"];

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type Shot = {
  x: number;
  y: number;
  key: number;
  label?: string;
};

export default function AIShooter() {
  const progress = useQuery(api.progress.getProgress, { language: "ai" });
  const completeLevel = useMutation(api.progress.completeLevel);
  const resetProgress = useMutation(api.progress.resetProgress);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("briefing");
  const [lives, setLives] = useState(3);
  const [hit, setHit] = useState(false);
  const [spent, setSpent] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [replay, setReplay] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null);
  const [shot, setShot] = useState<Shot | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const shotKey = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const completedIds = progress?.completedLevels ?? [];
  const xp = progress?.xp ?? 0;

  const resumeIndex = useMemo(() => {
    if (!progress) return 0;
    const next = AI_LESSONS.findIndex(
      (lesson) => !progress.completedLevels.includes(lesson.id),
    );
    return next === -1 ? AI_LESSONS.length : next;
  }, [progress]);

  const currentIndex = activeIndex ?? resumeIndex;
  const finished = currentIndex >= AI_LESSONS.length;
  const lesson = finished ? null : AI_LESSONS[currentIndex];
  const arcade = lesson?.arcade;

  const targets = useMemo(() => {
    if (!arcade) return [];
    const pool = arcade.targets.map((text, index) => ({
      text,
      correct: index === arcade.answer,
    }));
    return shuffled(pool).map((target, index) => ({
      ...target,
      ...TARGET_POSITIONS[index % TARGET_POSITIONS.length],
      tone: TARGET_TONES[index % TARGET_TONES.length],
    }));
  }, [arcade]);

  const correctTarget = arcade ? arcade.targets[arcade.answer] : "";

  function saveLevel(target: (typeof AI_LESSONS)[number]) {
    completeLevel({
      language: "ai",
      levelId: target.id,
      xp: target.xp,
    }).catch((error) => console.error("Could not save progress:", error));
  }

  function resetRange() {
    setLives(3);
    setHit(false);
    setSpent([]);
    setLocked(false);
    setShot(null);
    setAim(null);
  }

  function enterRange() {
    if (!lesson) return;
    setActiveIndex(currentIndex);
    setReplay(completedIds.includes(lesson.id));
    resetRange();
    setPhase("range");
  }

  function goNext() {
    if (!lesson) return;
    if (!replay) saveLevel(lesson);
    if (timer.current) window.clearTimeout(timer.current);

    if (currentIndex + 1 >= AI_LESSONS.length) {
      setActiveIndex(AI_LESSONS.length);
      setPhase("complete");
    } else {
      setActiveIndex(currentIndex + 1);
      setPhase("briefing");
      resetRange();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fire(
    target: { text: string; correct: boolean },
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();
    if (phase !== "range" || locked || !lesson || !arcade) return;

    const rect = arenaRef.current?.getBoundingClientRect();
    if (rect) {
      setShot({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        key: ++shotKey.current,
        label: target.correct ? `+${replay ? 0 : lesson.xp} XP` : "MISS",
      });
    }
    if (soundOn) {
      playShot();
      if (target.correct) playHit();
      else playMiss();
    }

    if (target.correct) {
      if (!replay) saveLevel(lesson);
      setLocked(true);
      setHit(true);
      timer.current = window.setTimeout(() => setPhase("result"), 450);
      return;
    }

    setSpent((current) =>
      current.includes(target.text) ? current : [...current, target.text],
    );
    const nextLives = lives - 1;
    setLives(nextLives);
    if (nextLives <= 0) {
      setLocked(true);
      timer.current = window.setTimeout(() => setPhase("result"), 500);
    }
  }

  function fireIntoAir(event: ReactPointerEvent<HTMLDivElement>) {
    if (phase !== "range" || locked || !lesson) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setShot({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      key: ++shotKey.current,
    });
    if (soundOn) playShot();
  }

  function trackAim(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setAim({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  async function handleRestart() {
    const ok =
      completedIds.length === 0 ||
      window.confirm(
        "Reset the AI range? Your hits and XP for this path will be cleared.",
      );
    if (!ok) return;
    if (timer.current) window.clearTimeout(timer.current);
    try {
      await resetProgress({ language: "ai" });
      setActiveIndex(null);
      setPhase("briefing");
      resetRange();
    } catch (error) {
      console.error("Could not reset progress:", error);
    }
  }

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 top-16 size-80 rounded-full bg-[var(--clay-lilac)] opacity-45" />
        <div className="absolute -left-24 top-[36rem] size-72 rounded-full bg-[var(--clay-butter)] opacity-50" />
      </div>

      <GameHeader xp={xp} showPathsLink />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              to="/learn"
              className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              All paths
            </Link>
            <span className="clay-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--clay-lilac-ink)]">
              <Crosshair className="size-3" />
              AI target range
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-label="Range progress">
              {AI_LESSONS.map((item, index) => {
                const done = completedIds.includes(item.id);
                return (
                  <span
                    key={item.id}
                    className={cn(
                      "size-2.5 rounded-full transition",
                      done
                        ? "bg-[var(--clay-lilac-ink)]"
                        : index === currentIndex && !finished
                          ? "bg-[var(--clay-lilac)] ring-2 ring-[var(--clay-lilac-ink)]/30"
                          : "bg-muted-foreground/20",
                    )}
                  />
                );
              })}
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
              <p className="text-sm font-bold">Loading the range…</p>
            </div>
          </div>
        ) : finished || !lesson || !arcade ? (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay relative overflow-hidden p-8 text-center sm:p-12"
          >
            <div className="clay-tile tone-lilac mx-auto grid size-20 place-items-center text-5xl">
              🏆
            </div>
            <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">
              AI range cleared!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Every target hit and every idea explained. You earned {xp} XP
              across all {AI_LESSONS.length} rounds.
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
                Run the range again
              </Button>
            </div>
          </motion.section>
        ) : phase === "briefing" ? (
          <motion.article
            key={`brief-${lesson.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="clay-tile tone-lilac grid size-16 place-items-center text-3xl">
                  {lesson.icon}
                </span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                    Briefing · Round {currentIndex + 1} of {AI_LESSONS.length}
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                    {lesson.title}
                  </h1>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-[var(--clay-butter)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--clay-butter-ink)]">
                <Sparkles className="size-3.5" />
                {completedIds.includes(lesson.id) ? "Replay" : `+${lesson.xp} XP`}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {lesson.explanation.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="text-[15px] leading-7 text-foreground/85"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-6">
              <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                <BookOpen className="size-3.5" /> Worked example
              </p>
              <div className="code-well mt-2 overflow-hidden">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                  <span className="size-2.5 rounded-full bg-[oklch(0.78_0.13_25)]" />
                  <span className="size-2.5 rounded-full bg-[oklch(0.88_0.11_95)]" />
                  <span className="size-2.5 rounded-full bg-[oklch(0.8_0.1_165)]" />
                  <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
                    ai_lab.py
                  </span>
                </div>
                <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-7 text-[oklch(0.94_0.02_95)]">
                  {lesson.example.code}
                </pre>
              </div>
              <div className="clay-inset mt-3 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Output
                </span>
                <pre className="whitespace-pre-wrap font-mono text-sm font-bold text-[var(--clay-lilac-ink)]">
                  {lesson.example.output}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[var(--clay-butter)] px-4 py-3.5">
              <Crosshair className="mt-0.5 size-4 shrink-0 text-[var(--clay-butter-ink)]" />
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--clay-butter-ink)]">
                  In the range
                </p>
                <p className="text-sm font-bold text-[var(--clay-butter-ink)]">
                  {arcade.instruction}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                onClick={enterRange}
                size="lg"
                className="clay-btn h-12 rounded-2xl bg-[var(--clay-lilac-ink)] px-6 font-extrabold text-white hover:bg-[var(--clay-lilac-ink)]"
              >
                <Crosshair className="size-4" />
                Enter the range
              </Button>
              <span className="text-xs font-bold text-muted-foreground">
                You get 3 charges. Take your best shot.
              </span>
            </div>
          </motion.article>
        ) : phase === "range" ? (
          <motion.section
            key={`range-${lesson.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              ref={arenaRef}
              onPointerMove={trackAim}
              onPointerLeave={() => setAim(null)}
              onPointerDown={fireIntoAir}
              className="relative min-h-[30rem] cursor-none overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--clay-ink)] shadow-[inset_0_10px_40px_rgba(0,0,0,0.45),0_30px_50px_-30px_rgba(40,30,70,0.7)]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, oklch(0.36 0.07 300 / 0.55), transparent 55%), radial-gradient(circle at 82% 78%, oklch(0.34 0.06 220 / 0.5), transparent 55%), radial-gradient(oklch(1 0 0 / 0.06) 1px, transparent 1px)",
                backgroundSize: "auto, auto, 22px 22px",
              }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-[var(--clay-ink)] via-[var(--clay-ink)]/85 to-transparent p-5 pb-12">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/45">
                      Round {currentIndex + 1} of {AI_LESSONS.length} · {lesson.title}
                    </p>
                    <h2 className="mt-1 max-w-xl font-display text-lg font-semibold leading-snug text-white sm:text-2xl">
                      {arcade.instruction}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Heart
                        key={index}
                        className={cn(
                          "size-3.5",
                          index < lives
                            ? "fill-[var(--clay-peach)] text-[var(--clay-peach)]"
                            : "text-white/25",
                        )}
                      />
                    ))}
                    <span className="ml-1 text-[10px] font-extrabold uppercase tracking-wider text-white/60">
                      {lives} left
                    </span>
                  </div>
                </div>
              </div>

              {targets.map((target, index) => {
                const used = spent.includes(target.text);
                return (
                  <AnimatePresence key={target.text}>
                    {!used && (
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${target.x}%`, top: `${target.y}%` }}
                      >
                        <motion.button
                          type="button"
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: locked ? 0.5 : 1,
                            y: [0, -8, 0],
                          }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={{
                            y: {
                              duration: 4.5 + index * 0.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                            opacity: { duration: 0.25 },
                            scale: { duration: 0.25 },
                          }}
                          whileHover={{ scale: 1.05 }}
                          disabled={locked}
                          onPointerDown={(event) => fire(target, event)}
                          className={cn(
                            "clay-btn flex w-32 cursor-none flex-col items-center gap-2 rounded-[1.5rem] border border-white/40 bg-[var(--tone)] px-3 py-4 text-center sm:w-40 sm:px-4",
                            target.tone,
                          )}
                        >
                          <span className="grid size-9 place-items-center rounded-full border-4 border-white/70 bg-[var(--tone-ink)] sm:size-10">
                            <span className="size-2 rounded-full bg-white" />
                          </span>
                          <span className="text-xs font-extrabold leading-snug text-[var(--tone-ink)] sm:text-sm">
                            {target.text}
                          </span>
                        </motion.button>
                      </div>
                    )}
                  </AnimatePresence>
                );
              })}

              {aim && !locked && (
                <div
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: aim.x, top: aim.y }}
                >
                  <div className="relative grid size-9 place-items-center rounded-full border-2 border-white/80 shadow-[0_0_18px_rgba(255,255,255,0.3)]">
                    <span className="size-1.5 rounded-full bg-[var(--clay-peach)]" />
                    <span className="absolute -left-2 h-px w-2 bg-white/80" />
                    <span className="absolute -right-2 h-px w-2 bg-white/80" />
                    <span className="absolute -top-2 h-2 w-px bg-white/80" />
                    <span className="absolute -bottom-2 h-2 w-px bg-white/80" />
                  </div>
                </div>
              )}

              {shot && (
                <span
                  key={`flash-${shot.key}`}
                  className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: shot.x, top: shot.y }}
                >
                  <motion.span
                    initial={{ scale: 0.2, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="block size-16 rounded-full bg-[var(--clay-butter)]/40 blur-[1px]"
                  />
                  {shot.label && (
                    <motion.span
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: -34, opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className={cn(
                        "absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap font-display text-sm font-bold",
                        shot.label === "MISS"
                          ? "text-[var(--clay-peach)]"
                          : "text-[var(--clay-mint)]",
                      )}
                    >
                      {shot.label}
                    </motion.span>
                  )}
                </span>
              )}

              <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/45">
                Tap or click a target to fire
              </div>
            </div>
          </motion.section>
        ) : phase === "result" ? (
          <motion.section
            key={`result-${lesson.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay p-7 text-center sm:p-10"
          >
            <div
              className={cn(
                "clay-tile mx-auto grid size-20 place-items-center text-5xl",
                hit ? "tone-mint" : "tone-peach",
              )}
            >
              {hit ? "🎯" : "💥"}
            </div>
            <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
              {hit ? "Direct hit!" : "Out of charges"}
            </h1>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              {hit
                ? replay
                  ? "Replay complete — no extra XP, but the idea is yours."
                  : `+${lesson.xp} XP · ${lives} charge${lives === 1 ? "" : "s"} to spare`
                : `The right target was “${correctTarget}”.`}
            </p>

            <div className="clay-inset mx-auto mt-6 max-w-2xl rounded-2xl p-5 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Why it matters
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/85">
                {lesson.challenge.explanation}
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {hit ? (
                <Button
                  onClick={goNext}
                  size="lg"
                  className="clay-btn h-12 rounded-2xl px-6 font-extrabold"
                >
                  {currentIndex + 1 >= AI_LESSONS.length
                    ? "Finish the range"
                    : "Next round"}
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={enterRange}
                    size="lg"
                    className="clay-btn h-12 rounded-2xl px-6 font-extrabold"
                  >
                    <Crosshair className="size-4" />
                    Reload and retry
                  </Button>
                  <Button
                    onClick={goNext}
                    variant="outline"
                    className="h-12 rounded-2xl border-0 bg-white px-6 font-extrabold"
                  >
                    Continue anyway
                    <ArrowRight className="size-4" />
                  </Button>
                </>
              )}
            </div>
            {!hit && (
              <p className="mt-3 text-[11px] font-bold text-muted-foreground">
                Continuing still earns {lesson.xp} XP — every round is safe.
              </p>
            )}
          </motion.section>
        ) : (
          <div className="clay grid min-h-64 place-items-center p-8">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Check className="size-6" />
              <p className="text-sm font-bold">Range complete.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
