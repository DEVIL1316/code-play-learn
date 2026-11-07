import { GameHeader } from "@/components/GameHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import {
  LANGUAGE_TRACKS,
  PYTHON_LESSONS,
  PYTHON_TOTAL_XP,
} from "@/lib/course";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Compass,
  Lock,
  Sparkles,
  Sprout,
  Trophy,
} from "lucide-react";
import { Link } from "react-router";

export default function Learn() {
  const { user } = useAuth();
  const progress = useQuery(api.progress.getProgress, { language: "python" });

  const completed = progress?.completedLevels.length ?? 0;
  const xp = progress?.xp ?? 0;
  const percent = Math.round((completed / PYTHON_LESSONS.length) * 100);
  const nextLesson =
    PYTHON_LESSONS.find(
      (lesson) => !progress?.completedLevels.includes(lesson.id),
    ) ?? null;

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 top-24 size-80 rounded-full bg-[var(--clay-mint)] opacity-50" />
        <div className="absolute -left-28 top-[30rem] size-72 rounded-full bg-[var(--clay-butter)] opacity-60" />
      </div>

      <GameHeader xp={xp} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl pt-4 sm:pt-8"
        >
          <span className="clay-soft inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--clay-mint-ink)]">
            <Compass className="size-3.5" />
            Your learning paths
          </span>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            {user?.name ? `Hey ${user.name.split(" ")[0]} — pick a path.` : "Pick a path."}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Python is open for play right now. One path at a time, one tiny
            concept at a time.
          </p>
        </motion.div>

        {/* Progress summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="clay mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="clay-tile tone-mint grid size-14 shrink-0 place-items-center text-2xl">
              🐍
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Python path
              </p>
              <p className="font-display text-xl font-semibold">
                {completed === 0
                  ? "Ready for your first quest"
                  : `${completed} of ${PYTHON_LESSONS.length} quests complete`}
              </p>
              <div className="clay-inset mt-2 h-3 w-full min-w-48 overflow-hidden rounded-full p-0.5">
                <div
                  className="h-full rounded-full bg-[var(--clay-mint)] shadow-[inset_0_-2px_0_rgba(60,50,90,0.15)] transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-2 rounded-full bg-[var(--clay-butter)] px-4 py-2 text-sm font-extrabold text-[var(--clay-butter-ink)]">
              <Sparkles className="size-4" />
              {xp} / {PYTHON_TOTAL_XP} XP
            </span>
            <Button
              asChild
              className="clay-btn rounded-xl font-extrabold"
            >
              <Link to="/learn/python">
                {completed === 0 ? "Start learning" : "Continue"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Language options */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LANGUAGE_TRACKS.map((track, index) => {
            const open = track.status === "open";
            return (
              <motion.article
                key={track.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 + index * 0.06 }}
                className={cn(
                  "clay-tile flex flex-col gap-4 p-6",
                  track.tone,
                  open ? "clay-lift" : "",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-white/60 text-3xl shadow-[inset_0_-4px_8px_rgba(60,50,90,0.12)]">
                    {track.emoji}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-white/55 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--tone-ink)]">
                    {open ? <Sprout className="size-3" /> : <Lock className="size-3" />}
                    {track.tagline}
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-semibold text-[var(--tone-ink)]">
                    {track.name}
                  </h2>
                  <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[var(--tone-ink)] opacity-80">
                    {track.blurb}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {track.concepts.map((concept) => (
                    <span
                      key={concept}
                      className="rounded-full bg-white/50 px-2.5 py-1 text-[11px] font-extrabold text-[var(--tone-ink)]"
                    >
                      {concept}
                    </span>
                  ))}
                </div>

                {open ? (
                  <>
                    <div className="mt-auto flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--tone-ink)] opacity-70">
                      <Check className="size-3.5" />
                      {completed > 0
                        ? `${completed}/${track.quests} done`
                        : `${track.quests} quests waiting`}
                    </div>
                    <Button
                      asChild
                      className="clay-btn w-full rounded-xl bg-[var(--tone-ink)] font-extrabold text-white hover:bg-[var(--tone-ink)]"
                    >
                      <Link to="/learn/python">
                        {completed > 0 ? "Keep going" : "Play Python"}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="mt-auto flex h-9 items-center justify-center gap-2 rounded-xl bg-white/45 text-xs font-extrabold uppercase tracking-wider text-[var(--tone-ink)] opacity-80">
                    <Lock className="size-3.5" />
                    Coming soon
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>

        {/* Next up helper */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="clay-soft mt-8 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-4">
            <span className="clay-tile tone-butter grid size-12 shrink-0 place-items-center">
              <Trophy className="size-5 text-[var(--clay-butter-ink)]" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {nextLesson ? "Next up" : "Path complete"}
              </p>
              <p className="font-display text-lg font-semibold">
                {nextLesson
                  ? `${nextLesson.icon} ${nextLesson.title} · ${nextLesson.summary}`
                  : "You finished every Python quest. Legendary squish."}
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="clay-btn shrink-0 rounded-xl border-0 bg-white font-extrabold"
          >
            <Link to="/learn/python">
              {nextLesson ? "Jump in" : "Replay"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
