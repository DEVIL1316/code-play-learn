import { GameHeader } from "@/components/GameHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { LANGUAGE_TRACKS, TOTAL_QUESTS, TOTAL_XP } from "@/lib/course";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Code2,
  Compass,
  Sparkles,
  Sprout,
  Trophy,
} from "lucide-react";
import { Link } from "react-router";

export default function Learn() {
  const { user } = useAuth();
  const progressRows = useQuery(api.progress.getAllProgress, {});
  const rows = progressRows ?? [];

  const rowFor = (trackId: string) =>
    rows.find((row) => row.language === trackId);
  const trackHref = (trackId: string) =>
    trackId === "ai" ? "/learn/ai" : `/learn/${trackId}`;
  const totalXp = rows.reduce((sum, row) => sum + row.xp, 0);
  const doneCount = rows.reduce(
    (sum, row) => sum + row.completedLevels.length,
    0,
  );
  const percent = Math.min(100, Math.round((doneCount / TOTAL_QUESTS) * 100));

  const nextTrack =
    LANGUAGE_TRACKS.find((track) => {
      const row = rowFor(track.id);
      return (row?.completedLevels.length ?? 0) < track.lessons.length;
    }) ?? null;
  const nextRow = nextTrack ? rowFor(nextTrack.id) : undefined;
  const nextLesson =
    nextTrack?.lessons.find(
      (lesson) => !nextRow?.completedLevels.includes(lesson.id),
    ) ?? null;

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 top-24 size-80 rounded-full bg-[var(--clay-mint)] opacity-50" />
        <div className="absolute -left-28 top-[30rem] size-72 rounded-full bg-[var(--clay-butter)] opacity-60" />
        <div className="absolute right-10 top-[62rem] size-56 rounded-full bg-[var(--clay-lilac)] opacity-40" />
      </div>

      <GameHeader xp={totalXp} />

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
            Four paths are open: Python from first line to classes, C and C++
            down to pointers, and an AI target range. Learn one tiny concept,
            then prove it.
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
              🧶
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Your learning
              </p>
              <p className="font-display text-xl font-semibold">
                {doneCount === 0
                  ? "Ready for your first quest"
                  : `${doneCount} of ${TOTAL_QUESTS} quests complete`}
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
              {totalXp} / {TOTAL_XP} XP
            </span>
          </div>
        </motion.div>

        {/* Language options */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LANGUAGE_TRACKS.map((track, index) => {
            const row = rowFor(track.id);
            const done = row?.completedLevels.length ?? 0;
            const trackPercent = Math.min(
              100,
              Math.round((done / track.lessons.length) * 100),
            );
            const complete = done >= track.lessons.length;
            return (
              <motion.article
                key={track.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 + index * 0.06 }}
                className={cn(
                  "clay-tile clay-lift flex flex-col gap-4 p-6",
                  track.tone,
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-white/60 text-3xl shadow-[inset_0_-4px_8px_rgba(60,50,90,0.12)]">
                    {track.emoji}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-white/55 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--tone-ink)]">
                    <Sprout className="size-3" />
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

                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[var(--tone-ink)] opacity-75">
                    <span>
                      {done}/{track.lessons.length}{" "}
                      {track.id === "ai" ? "targets" : "quests"}
                    </span>
                    <span>{track.totalXp} XP</span>
                  </div>
                  <div className="clay-inset h-2.5 overflow-hidden rounded-full p-0.5">
                    <div
                      className="h-full rounded-full bg-[var(--tone)] transition-all duration-500"
                      style={{ width: `${trackPercent}%` }}
                    />
                  </div>
                </div>

                <Button
                  asChild
                  className="clay-btn w-full rounded-xl bg-[var(--tone-ink)] font-extrabold text-white hover:bg-[var(--tone-ink)]"
                >
                  <Link to={trackHref(track.id)}>
                    {track.id === "ai"
                      ? complete
                        ? "Replay range"
                        : done > 0
                          ? "Back to range"
                          : "Play AI range"
                      : complete
                        ? "Replay path"
                        : done > 0
                          ? "Keep going"
                          : `Play ${track.name}`}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
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
            <span className="clay-tile tone-butter grid size-12 shrink-0 place-items-center text-xl">
              {nextTrack?.emoji ?? "🏆"}
            </span>
            <div>
              <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                <Trophy className="size-3.5" />
                {nextTrack ? `Next up · ${nextTrack.name}` : "All paths complete"}
              </p>
              <p className="font-display text-lg font-semibold">
                {nextTrack && nextLesson
                  ? `${nextLesson.icon} ${nextLesson.title} · ${nextLesson.summary}`
                  : "You finished every quest. Legendary squish."}
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="clay-btn shrink-0 rounded-xl border-0 bg-white font-extrabold"
          >
            <Link to={nextTrack ? trackHref(nextTrack.id) : "/learn/python"}>
              {nextLesson ? "Jump in" : "Replay Python"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Code Lab */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="clay-tile tone-sky mt-8 flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-7"
        >
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/60 text-[var(--clay-sky-ink)] shadow-[inset_0_-4px_8px_rgba(60,50,90,0.12)]">
              <Code2 className="size-5" strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--clay-sky-ink)] opacity-70">
                No multiple choice
              </p>
              <p className="font-display text-xl font-semibold text-[var(--clay-sky-ink)]">
                Code Lab — write and run a whole Python program
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--clay-sky-ink)] opacity-80">
                A real editor, a real console. Nothing installs and nothing
                leaves your browser.
              </p>
            </div>
          </div>
          <Button
            asChild
            className="clay-btn shrink-0 rounded-xl bg-[var(--clay-sky-ink)] font-extrabold text-white hover:bg-[var(--clay-sky-ink)]"
          >
            <Link to="/lab">
              Open Code Lab
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5" /> Explanations after every answer
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5" /> Progress saved per path
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5" /> Wrong answers are safe
          </span>
        </div>
      </main>
    </div>
  );
}
