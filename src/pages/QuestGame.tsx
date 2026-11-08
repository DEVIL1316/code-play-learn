import { GameHeader } from "@/components/GameHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  getTrack,
  type Challenge,
  type LanguageTrack,
  type Lesson,
} from "@/lib/course";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";

type Phase = "lesson" | "challenge";
type Status = "idle" | "correct" | "wrong";

const UNIT_TONES = [
  "tone-mint",
  "tone-sky",
  "tone-butter",
  "tone-peach",
  "tone-lilac",
];

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

function unitTone(units: LanguageTrack["units"], unit: string) {
  const index = units.findIndex((entry) => entry.name === unit);
  return UNIT_TONES[index % UNIT_TONES.length];
}

function answerText(challenge: Challenge) {
  if (challenge.kind === "order") return challenge.lines.join("  →  ");
  return challenge.options[challenge.answer];
}

function CodeBlock({
  code,
  label,
  className,
}: {
  code: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("code-well relative overflow-hidden", className)}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[oklch(0.78_0.13_25)]" />
        <span className="size-2.5 rounded-full bg-[oklch(0.88_0.11_95)]" />
        <span className="size-2.5 rounded-full bg-[oklch(0.8_0.1_165)]" />
        <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
          {label}
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-7 text-[oklch(0.94_0.02_95)]">
        {code}
      </pre>
    </div>
  );
}

export default function QuestGame() {
  const { trackId } = useParams();
  const track = getTrack(trackId);
  if (!track) return <Navigate to="/learn" replace />;
  return <TrackGame key={track.id} track={track} />;
}

function TrackGame({ track }: { track: LanguageTrack }) {
  const progress = useQuery(api.progress.getProgress, { language: track.id });
  const completeLevel = useMutation(api.progress.completeLevel);
  const resetProgress = useMutation(api.progress.resetProgress);

  /* null means "follow the first unfinished quest" until the player picks one. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("lesson");
  const [status, setStatus] = useState<Status>("idle");
  const [selected, setSelected] = useState<number | null>(null);
  const [ordered, setOrdered] = useState<number[]>([]);
  const [replay, setReplay] = useState(false);

  const completedIds = progress?.completedLevels ?? [];
  const xp = progress?.xp ?? 0;
  const completedCount = completedIds.length;

  /* Resume at the first quest that is not finished yet. */
  const resumeIndex = useMemo(() => {
    if (!progress) return 0;
    const next = track.lessons.findIndex(
      (item) => !progress.completedLevels.includes(item.id),
    );
    return next === -1 ? track.lessons.length : next;
  }, [progress, track.lessons]);

  const currentIndex = activeIndex ?? resumeIndex;
  const finished = currentIndex >= track.lessons.length;
  const lesson: Lesson | null = finished ? null : track.lessons[currentIndex];
  const challenge = lesson?.challenge ?? null;

  /* Shuffled presentation order for "arrange the lines" challenges. */
  const orderPool = useMemo(() => {
    if (!lesson || lesson.challenge.kind !== "order") return [];
    const lines = lesson.challenge.lines;
    const offset = (lesson.id.length % Math.max(lines.length - 1, 1)) + 1;
    return lines.map((_, i) => (i + offset) % lines.length);
  }, [lesson]);

  const canCheck =
    !!challenge &&
    (challenge.kind === "order"
      ? ordered.length === challenge.lines.length
      : selected !== null);

  function resetPlay(nextIndex: number, nextPhase: Phase = "lesson") {
    setActiveIndex(nextIndex);
    setPhase(nextPhase);
    setStatus("idle");
    setSelected(null);
    setOrdered([]);
    setReplay(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveLevel(target: Lesson) {
    completeLevel({
      language: track.id,
      levelId: target.id,
      xp: target.xp,
    }).catch((error) => console.error("Could not save progress:", error));
  }

  function isCorrect() {
    if (!challenge) return false;
    if (challenge.kind === "order") {
      return (
        ordered.length === challenge.lines.length &&
        ordered.every((line, index) => line === index)
      );
    }
    return selected === challenge.answer;
  }

  function handleCheck() {
    if (!challenge || !lesson || !canCheck) return;
    const correct = isCorrect();
    setStatus(correct ? "correct" : "wrong");
    if (correct) saveLevel(lesson);
  }

  function goNext() {
    if (!lesson) return;
    if (status === "wrong") saveLevel(lesson);
    resetPlay(currentIndex + 1);
  }

  function startChallenge() {
    if (activeIndex === null) setActiveIndex(currentIndex);
    setReplay(lesson ? completedIds.includes(lesson.id) : false);
    setPhase("challenge");
    setStatus("idle");
    setSelected(null);
    setOrdered([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleRestart() {
    const ok =
      completedCount === 0 ||
      window.confirm(
        `Restart the ${track.name} path? You keep your account, but your quests and XP will be cleared.`,
      );
    if (!ok) return;
    try {
      await resetProgress({ language: track.id });
      resetPlay(0);
    } catch (error) {
      console.error("Could not reset progress:", error);
    }
  }

  return (
    <div className={cn("relative min-h-screen", track.tone)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 top-16 size-80 rounded-full bg-[var(--tone)] opacity-45" />
        <div className="absolute -left-24 top-[36rem] size-72 rounded-full bg-[var(--clay-lilac)] opacity-40" />
      </div>

      <GameHeader xp={xp} showPathsLink />

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[17rem_1fr]">
        {/* Quest map */}
        <aside className="clay order-2 h-fit p-5 lg:sticky lg:top-24 lg:order-1">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              <span className="text-base">{track.emoji}</span> {track.name} path
            </p>
            <span className="rounded-full bg-[var(--tone)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--tone-ink)]">
              {completedCount}/{track.lessons.length}
            </span>
          </div>
          <div className="clay-inset mt-3 h-3 overflow-hidden rounded-full p-0.5">
            <div
              className="h-full rounded-full bg-[var(--tone)] shadow-[inset_0_-2px_0_rgba(60,50,90,0.15)] transition-all duration-500"
              style={{
                width: `${Math.round(
                  (completedCount / track.lessons.length) * 100,
                )}%`,
              }}
            />
          </div>

          <div className="no-scrollbar mt-5 max-h-[58vh] space-y-5 overflow-y-auto pr-1">
            {track.units.map((unit) => (
              <div key={unit.name}>
                <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground/80">
                  {unit.name}
                </p>
                <div className="space-y-1">
                  {unit.lessons.map((item) => {
                    const index = track.lessons.findIndex(
                      (entry) => entry.id === item.id,
                    );
                    const done = completedIds.includes(item.id);
                    const active = index === currentIndex && !finished;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => resetPlay(index)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition",
                          active
                            ? "bg-[var(--tone)] text-[var(--tone-ink)] shadow-[inset_0_-2px_0_rgba(60,50,90,0.1)]"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-extrabold",
                            done
                              ? "bg-[var(--tone-ink)] text-white"
                              : active
                                ? "bg-white text-[var(--tone-ink)]"
                                : "bg-muted-foreground/10 text-muted-foreground",
                          )}
                        >
                          {done ? <Check className="size-3" strokeWidth={3.5} /> : index + 1}
                        </span>
                        <span className="truncate text-[13px] font-bold">
                          {item.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
            <Link
              to="/learn"
              className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              All paths
            </Link>
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/70 hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Restart
            </button>
          </div>
        </aside>

        {/* Quest stage */}
        <section className="order-1 min-w-0 lg:order-2">
          {progress === undefined ? (
            <div className="clay grid min-h-64 place-items-center p-8">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
                <p className="text-sm font-bold">Loading your quests…</p>
              </div>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            {finished || !lesson || !challenge ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="clay relative overflow-hidden p-8 text-center sm:p-12"
              >
                <div className="clay-tile tone-butter mx-auto grid size-20 place-items-center text-5xl">
                  🏆
                </div>
                <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">
                  {track.name} path complete!
                </h1>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                  You cleared all {track.lessons.length} quests with {xp} XP.{" "}
                  {track.concepts.slice(0, 4).join(", ")} are now part of your
                  toolkit.
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
                    Replay from quest 1
                  </Button>
                </div>
              </motion.div>
            ) : phase === "lesson" ? (
              <motion.article
                key={`${lesson.id}-lesson`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="clay p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "clay-tile grid size-16 place-items-center text-3xl",
                        unitTone(track.units, lesson.unit),
                      )}
                    >
                      {lesson.icon}
                    </span>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                        {lesson.unit} · Quest {currentIndex + 1} of{" "}
                        {track.lessons.length}
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

                <div className="mt-6 flex items-center gap-2">
                  {[
                    { key: "lesson", label: "1 · Learn", icon: BookOpen },
                    { key: "challenge", label: "2 · Play", icon: Play },
                  ].map((step) => (
                    <span
                      key={step.key}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider",
                        step.key === "lesson"
                          ? "bg-[var(--tone)] text-[var(--tone-ink)]"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <step.icon className="size-3.5" />
                      {step.label}
                    </span>
                  ))}
                  {completedIds.includes(lesson.id) && (
                    <span className="ml-auto flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--tone-ink)]">
                      <Check className="size-3.5" strokeWidth={3} />
                      Already complete
                    </span>
                  )}
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

                <div className="mt-7">
                  <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                    <Lightbulb className="size-3.5" />
                    Worked example
                  </p>
                  <div className="mt-2">
                    <CodeBlock code={lesson.example.code} label={track.codeLabel} />
                  </div>
                  <div className="clay-inset mt-3 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Output
                    </span>
                    <pre className="whitespace-pre-wrap font-mono text-sm font-bold text-[var(--clay-mint-ink)]">
                      {lesson.example.output}
                    </pre>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={startChallenge}
                    size="lg"
                    className="clay-btn h-12 rounded-2xl px-6 font-extrabold"
                  >
                    I&apos;m ready — play it
                    <ArrowRight className="size-4" />
                  </Button>
                  <span className="text-xs font-bold text-muted-foreground">
                    {lesson.minutes} min · explanation unlocked after you answer
                  </span>
                </div>
              </motion.article>
            ) : (
              <motion.article
                key={`${lesson.id}-challenge`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="clay p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "clay-tile grid size-16 place-items-center text-3xl",
                        unitTone(track.units, lesson.unit),
                      )}
                    >
                      {lesson.icon}
                    </span>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                        Play · Quest {currentIndex + 1}
                      </p>
                      <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                        {lesson.title}
                      </h1>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setPhase("lesson")}
                    className="rounded-full text-xs font-extrabold text-muted-foreground hover:bg-muted"
                  >
                    <BookOpen className="size-3.5" />
                    Re-read lesson
                  </Button>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  {[
                    { key: "lesson", label: "1 · Learn", icon: BookOpen },
                    { key: "challenge", label: "2 · Play", icon: Play },
                  ].map((step) => (
                    <span
                      key={step.key}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider",
                        step.key === "challenge"
                          ? "bg-[var(--clay-sky)] text-[var(--clay-sky-ink)]"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <step.icon className="size-3.5" />
                      {step.label}
                    </span>
                  ))}
                  <span className="ml-auto rounded-full bg-[var(--clay-butter)] px-3 py-1 text-[11px] font-extrabold text-[var(--clay-butter-ink)]">
                    {replay ? "Replay" : `+${lesson.xp} XP`}
                  </span>
                </div>

                <h2 className="mt-6 font-display text-xl font-semibold sm:text-2xl">
                  {challenge.prompt}
                </h2>

                {/* choice challenge */}
                {(challenge.kind === "choice" || challenge.kind === "blank") &&
                  challenge.code && (
                    <div className="mt-4">
                      {challenge.kind === "blank" ? (
                        <div className="code-well overflow-hidden">
                          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                            <span className="size-2.5 rounded-full bg-[oklch(0.78_0.13_25)]" />
                            <span className="size-2.5 rounded-full bg-[oklch(0.88_0.11_95)]" />
                            <span className="size-2.5 rounded-full bg-[oklch(0.8_0.1_165)]" />
                            <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
                              fill the blank
                            </span>
                          </div>
                          <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-7 text-[oklch(0.94_0.02_95)]">
                            {challenge.code.split("___")[0]}
                            <span
                              className={cn(
                                "mx-0.5 rounded-md px-2 py-0.5 font-bold",
                                selected !== null
                                  ? "bg-[var(--clay-butter)] text-[var(--clay-ink)]"
                                  : "bg-white/10 text-white/50",
                              )}
                            >
                              {selected !== null
                                ? challenge.options[selected]
                                : "＿＿＿"}
                            </span>
                            {challenge.code.split("___").slice(1).join("___")}
                          </pre>
                        </div>
                      ) : (
                        <CodeBlock code={challenge.code} label={track.codeLabel} />
                      )}
                    </div>
                  )}

                {/* order challenge */}
                {challenge.kind === "order" && (
                  <div className="mt-5 space-y-4">
                    <div className="clay-inset min-h-24 rounded-2xl p-3">
                      {ordered.length === 0 ? (
                        <p className="px-2 py-4 text-center text-xs font-bold text-muted-foreground">
                          Tap the lines below in the order they should run.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {ordered.map((lineIndex, position) => (
                            <button
                              key={`${lineIndex}-${position}`}
                              type="button"
                              disabled={status === "correct"}
                              onClick={() =>
                                setOrdered((current) =>
                                  current.filter((_, i) => i !== position),
                                )
                              }
                              className="clay-btn flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2 text-left"
                            >
                              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--clay-mint)] font-display text-[11px] font-bold text-[var(--clay-mint-ink)]">
                                {position + 1}
                              </span>
                              <span className="whitespace-pre font-mono text-[13px] font-medium">
                                {challenge.lines[lineIndex]}
                              </span>
                              <X className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {status !== "correct" && (
                      <div className="space-y-2">
                        {orderPool
                          .filter((lineIndex) => !ordered.includes(lineIndex))
                          .map((lineIndex) => (
                            <button
                              key={lineIndex}
                              type="button"
                              onClick={() =>
                                setOrdered((current) => [...current, lineIndex])
                              }
                              className="clay-btn flex w-full items-center gap-3 rounded-xl bg-[var(--muted)] px-3 py-2.5 text-left hover:bg-white"
                            >
                              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/80 text-[11px] font-extrabold text-muted-foreground">
                                +
                              </span>
                              <span className="whitespace-pre font-mono text-[13px] font-medium">
                                {challenge.lines[lineIndex]}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}

                    {ordered.length > 0 && status !== "correct" && (
                      <button
                        type="button"
                        onClick={() => setOrdered([])}
                        className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                      >
                        Clear and start over
                      </button>
                    )}
                  </div>
                )}

                {/* answer options */}
                {challenge.kind !== "order" && (
                  <div
                    className={cn(
                      "mt-5 grid gap-2.5",
                      challenge.options.length > 2 && "sm:grid-cols-2",
                    )}
                  >
                    {challenge.options.map((option, index) => {
                      const isAnswer = status !== "idle" && index === challenge.answer;
                      const isSelected = selected === index;
                      return (
                        <button
                          key={`${option}-${index}`}
                          type="button"
                          disabled={status === "correct"}
                          onClick={() => {
                            if (status === "wrong") {
                              setStatus("idle");
                              setSelected(index);
                              return;
                            }
                            setSelected(index);
                          }}
                          className={cn(
                            "clay-btn flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold",
                            isAnswer
                              ? "bg-[var(--clay-mint)] text-[var(--clay-mint-ink)]"
                              : isSelected
                                ? "bg-[var(--clay-sky)] text-[var(--clay-sky-ink)]"
                                : "bg-[var(--muted)] text-foreground hover:bg-white",
                            status !== "idle" && !isAnswer && !isSelected && "opacity-60",
                          )}
                        >
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/70 font-display text-xs font-semibold">
                            {OPTION_LETTERS[index]}
                          </span>
                          <span className="whitespace-pre-wrap">{option}</span>
                          {isAnswer && (
                            <Check className="ml-auto size-4 shrink-0" strokeWidth={3} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* actions */}
                {status === "idle" && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button
                      onClick={handleCheck}
                      disabled={!canCheck}
                      size="lg"
                      className="clay-btn h-12 rounded-2xl px-6 font-extrabold"
                    >
                      Check answer
                      <Check className="size-4" strokeWidth={3} />
                    </Button>
                    <span className="text-xs font-bold text-muted-foreground">
                      Wrong answers are safe — you can try again.
                    </span>
                  </div>
                )}

                {/* feedback */}
                <AnimatePresence>
                  {status !== "idle" && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className={cn(
                        "mt-6 rounded-2xl p-5",
                        status === "correct"
                          ? "bg-[var(--clay-mint)]"
                          : "bg-[var(--clay-peach)]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid size-10 shrink-0 place-items-center rounded-2xl bg-white/70 text-xl",
                            status === "correct"
                              ? "text-[var(--clay-mint-ink)]"
                              : "text-[var(--clay-peach-ink)]",
                          )}
                        >
                          {status === "correct" ? "🎉" : "💡"}
                        </span>
                        <div>
                          <p
                            className={cn(
                              "font-display text-lg font-semibold",
                              status === "correct"
                                ? "text-[var(--clay-mint-ink)]"
                                : "text-[var(--clay-peach-ink)]",
                            )}
                          >
                            {status === "correct"
                              ? replay
                                ? "Nailed it! Replay complete."
                                : `Nailed it! +${lesson.xp} XP`
                              : "Not quite — here's the why."}
                          </p>
                          {status === "wrong" && (
                            <p className="text-xs font-bold text-[var(--clay-peach-ink)] opacity-80">
                              Correct answer:{" "}
                              <span className="font-mono">
                                {answerText(challenge)}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <p
                        className={cn(
                          "mt-3 text-sm font-semibold leading-relaxed",
                          status === "correct"
                            ? "text-[var(--clay-mint-ink)]"
                            : "text-[var(--clay-peach-ink)]",
                        )}
                      >
                        {challenge.explanation}
                      </p>

                      {status === "correct" ? (
                        <Button
                          onClick={goNext}
                          className="clay-btn mt-4 h-11 rounded-xl bg-[var(--clay-mint-ink)] px-5 font-extrabold text-white hover:bg-[var(--clay-mint-ink)]"
                        >
                          {currentIndex + 1 >= track.lessons.length
                            ? "Finish the path"
                            : "Next quest"}
                          <ArrowRight className="size-4" />
                        </Button>
                      ) : (
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          <Button
                            onClick={() => {
                              setStatus("idle");
                              setSelected(null);
                              setOrdered([]);
                            }}
                            className="clay-btn h-11 rounded-xl bg-[var(--clay-peach-ink)] px-5 font-extrabold text-white hover:bg-[var(--clay-peach-ink)]"
                          >
                            Try again
                          </Button>
                          <Button
                            onClick={goNext}
                            variant="outline"
                            className="h-11 rounded-xl border-0 bg-white/80 px-5 font-extrabold"
                          >
                            Continue
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Trophy className="size-3.5" />
                  Understanding beats speed — take your time.
                </div>
              </motion.article>
            )}
          </AnimatePresence>
          )}
        </section>
      </main>
    </div>
  );
}
