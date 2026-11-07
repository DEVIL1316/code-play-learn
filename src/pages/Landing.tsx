import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LANGUAGE_TRACKS, PYTHON_TOTAL_XP } from "@/lib/course";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Gamepad2,
  Lightbulb,
  Lock,
  Sparkles,
  Sprout,
} from "lucide-react";
import { Link } from "react-router";

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const startHref = isAuthenticated
    ? "/learn"
    : `/auth?returnTo=${encodeURIComponent("/learn")}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* soft clay blobs behind everything */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-24 size-80 rounded-full bg-[var(--clay-mint)] opacity-70 shadow-[inset_0_-30px_60px_-30px_rgba(60,50,90,0.35)]" />
        <div className="absolute -right-24 top-8 size-64 rounded-full bg-[var(--clay-butter)] opacity-80 shadow-[inset_0_-24px_50px_-24px_rgba(60,50,90,0.3)]" />
        <div className="absolute right-10 top-[46rem] size-40 rounded-full bg-[var(--clay-lilac)] opacity-60" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/50 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Brand />
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: "#paths", label: "Paths" },
              { href: "#how", label: "How it works" },
              { href: "#sample", label: "Sample quest" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition hover:bg-white/60 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Button asChild variant="ghost" className="hidden rounded-full font-bold sm:inline-flex">
                <Link to={`/auth?returnTo=${encodeURIComponent("/learn")}`}>Sign in</Link>
              </Button>
            )}
            <Button asChild className="clay-btn rounded-full font-extrabold">
              <Link to={startHref}>
                Play free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="clay-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--clay-mint-ink)]">
              <Sprout className="size-4" />
              Beginner-first · Python
            </span>
            <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-[4.2rem]">
              Learn to code.
              <span className="mt-1 block text-[var(--clay-mint-ink)]">
                Squish by squish.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              ClayCode turns Python basics into {LANGUAGE_TRACKS[0].quests} bite-size
              quests. Read a tiny explanation, play the challenge, and finally
              understand what every line actually does.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="clay-btn h-14 rounded-2xl px-7 text-base font-extrabold"
              >
                <Link to={startHref}>
                  Start the Python path
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-14 rounded-2xl px-6 text-base font-extrabold text-muted-foreground hover:bg-white/60"
              >
                <a href="#sample">
                  <BookOpen className="size-5" />
                  See a lesson
                </a>
              </Button>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {[
                { value: "14", label: "playable quests" },
                { value: "0", label: "setup required" },
                { value: `${PYTHON_TOTAL_XP}`, label: "XP to earn" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-semibold">
                    {stat.value}
                  </dt>
                  <dd className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Floating quest preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="clay relative -rotate-1 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="clay-tile tone-mint grid size-11 place-items-center text-xl">
                    🐍
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                      Quest 4 · Numbers
                    </p>
                    <p className="font-display text-sm font-semibold">
                      Clay calculator
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[var(--clay-butter)] px-3 py-1 text-xs font-extrabold text-[var(--clay-butter-ink)]">
                  +20 XP
                </span>
              </div>

              <h3 className="mt-5 font-display text-xl font-semibold">
                What does this print?
              </h3>
              <div className="code-well mt-3 px-4 py-4 text-sm leading-7">
                <span className="text-[oklch(0.8_0.09_168)]">print</span>
                <span className="text-[oklch(0.93_0.02_95)]">(</span>
                <span className="text-[oklch(0.92_0.09_95)]">(3 + 4)</span>
                <span className="text-[oklch(0.8_0.12_330)]"> * </span>
                <span className="text-[oklch(0.92_0.09_95)]">2</span>
                <span className="text-[oklch(0.93_0.02_95)]">)</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {["11", "14", "34", "An error"].map((option, index) => {
                  const correct = index === 1;
                  return (
                    <div
                      key={option}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-bold",
                        correct
                          ? "bg-[var(--clay-mint)] text-[var(--clay-mint-ink)] shadow-[inset_0_-3px_0_rgba(60,50,90,0.12)]"
                          : "clay-inset text-muted-foreground",
                      )}
                    >
                      {option}
                      {correct && <Check className="size-4" strokeWidth={3} />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[var(--clay-butter)] px-3.5 py-3">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-[var(--clay-butter-ink)]" />
                <p className="text-xs font-semibold leading-relaxed text-[var(--clay-butter-ink)]">
                  Brackets first: 3 + 4 = 7, then 7 × 2 = 14. Every answer comes
                  with a why.
                </p>
              </div>
            </div>

            <div className="clay-soft absolute -right-2 -top-5 rotate-6 rounded-2xl bg-[var(--clay-butter)] px-4 py-2 text-xs font-extrabold text-[var(--clay-butter-ink)] sm:-right-6">
              ✨ Squish!
            </div>
            <div className="clay-soft absolute -bottom-5 -left-2 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-[var(--clay-mint-ink)] sm:-left-6">
              <Sprout className="size-4" />
              No experience needed
            </div>
          </motion.div>
        </section>

        {/* Concept ticker */}
        <section className="border-y border-white/60 bg-white/35 py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2.5 px-4">
            {[
              "print()",
              "variables",
              "numbers",
              "f-strings",
              "if / else",
              "loops",
              "functions",
              "lists",
            ].map((concept) => (
              <span
                key={concept}
                className="rounded-full bg-white/70 px-4 py-1.5 font-mono text-xs font-bold text-muted-foreground shadow-[inset_0_-2px_0_rgba(60,50,90,0.08)]"
              >
                {concept}
              </span>
            ))}
          </div>
        </section>

        {/* Language paths */}
        <section id="paths" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
          <motion.div {...fadeUp} className="max-w-2xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--clay-mint-ink)]">
              Choose your path
            </span>
            <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
              Four languages. One friendly start.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Version one opens the Python path. C, C++ and AI are still being
              kneaded — your progress in Python will be waiting.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LANGUAGE_TRACKS.map((track, index) => {
              const open = track.status === "open";
              return (
                <motion.article
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  className={cn(
                    "clay-tile flex flex-col gap-4 p-6",
                    track.tone,
                    open ? "clay-lift" : "opacity-95",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-14 place-items-center rounded-2xl bg-white/60 text-3xl shadow-[inset_0_-4px_8px_rgba(60,50,90,0.12)]">
                      {track.emoji}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-white/55 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--tone-ink)]">
                      {open ? <Sparkles className="size-3" /> : <Lock className="size-3" />}
                      {track.tagline}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-[var(--tone-ink)]">
                      {track.name}
                    </h3>
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
                  <div className="mt-auto pt-2">
                    {open ? (
                      <Button
                        asChild
                        className="clay-btn w-full rounded-xl bg-[var(--tone-ink)] font-extrabold text-white hover:bg-[var(--tone-ink)]"
                      >
                        <Link to={startHref}>
                          {track.quests} quests
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <div className="flex h-9 items-center justify-center rounded-xl bg-white/45 text-xs font-extrabold uppercase tracking-wider text-[var(--tone-ink)] opacity-80">
                        Coming soon
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 pb-20 sm:px-6">
          <motion.div {...fadeUp} className="max-w-2xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--clay-mint-ink)]">
              The loop
            </span>
            <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
              A lesson small enough to finish.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No walls of theory. Each quest takes about three minutes and gives
              you one idea you can actually use.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                step: "01",
                tone: "tone-butter",
                title: "Read the tiny lesson",
                body: "One concept, a plain-English explanation, and a short example you can read in under a minute.",
              },
              {
                icon: Gamepad2,
                step: "02",
                tone: "tone-mint",
                title: "Play the challenge",
                body: "Predict output, fill the blank, or rebuild a loop. Wrong answers are safe — you can try again.",
              },
              {
                icon: Lightbulb,
                step: "03",
                tone: "tone-peach",
                title: "Get the why",
                body: "Every answer unlocks an explanation of what happened, so the idea sticks instead of just the score.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="clay flex flex-col gap-4 p-7"
              >
                <div className="flex items-center justify-between">
                  <span className={cn("clay-tile grid size-12 place-items-center text-[var(--tone-ink)]", item.tone)}>
                    <item.icon className="size-5" strokeWidth={2.4} />
                  </span>
                  <span className="font-display text-3xl font-semibold text-border">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Sample explanation */}
        <section id="sample" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 pb-20 sm:px-6">
          <motion.div
            {...fadeUp}
            className="clay-tile tone-lilac grid gap-8 p-7 sm:p-10 lg:grid-cols-2 lg:items-center"
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[var(--clay-lilac-ink)]">
                <Lightbulb className="size-3.5" />
                Explanations included
              </span>
              <h2 className="mt-4 text-4xl font-semibold text-[var(--clay-lilac-ink)] sm:text-5xl">
                Not just the answer. The reason.
              </h2>
              <p className="mt-4 text-base font-semibold leading-relaxed text-[var(--clay-lilac-ink)] opacity-80">
                Most coding games tell you “correct” and move on. ClayCode pauses
                to explain the mechanics in everyday words, so you can solve the
                next one yourself.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "A plain-language explanation before every challenge",
                  "A worked example with its exact output",
                  "A “why” note after every answer, right or wrong",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white/65 text-[var(--clay-lilac-ink)]">
                      <Check className="size-3.5" strokeWidth={3.5} />
                    </span>
                    <span className="text-sm font-bold text-[var(--clay-lilac-ink)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="clay p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="clay-tile tone-mint grid size-9 place-items-center text-sm">
                  🐍
                </span>
                <p className="font-display text-sm font-semibold">
                  Quest 8 · Making choices
                </p>
              </div>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                The code
              </p>
              <div className="code-well mt-2 space-y-1 px-4 py-4 text-[13px] leading-6">
                <p><span className="text-[oklch(0.8_0.09_168)]">age</span> = <span className="text-[oklch(0.92_0.09_95)]">14</span></p>
                <p><span className="text-[oklch(0.8_0.12_330)]">if</span> age &gt;= <span className="text-[oklch(0.92_0.09_95)]">13</span>:</p>
                <p className="pl-4"><span className="text-[oklch(0.8_0.09_168)]">print</span>(<span className="text-[oklch(0.92_0.09_95)]">"Teen"</span>)</p>
                <p><span className="text-[oklch(0.8_0.12_330)]">else</span>:</p>
                <p className="pl-4"><span className="text-[oklch(0.8_0.09_168)]">print</span>(<span className="text-[oklch(0.92_0.09_95)]">"Kid"</span>)</p>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[var(--clay-mint)] px-3.5 py-2.5">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--clay-mint-ink)] opacity-70">
                  Output
                </span>
                <span className="font-mono text-sm font-bold text-[var(--clay-mint-ink)]">
                  Teen
                </span>
              </div>
              <div className="mt-3 rounded-2xl bg-[var(--clay-butter)] px-3.5 py-3">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--clay-butter-ink)]">
                  Why?
                </p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-[var(--clay-butter-ink)]">
                  14 is at least 13, so the if branch wins. The else branch only
                  runs when the condition is False — so only one message prints.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <motion.div
            {...fadeUp}
            className="clay-tile tone-mint relative overflow-hidden px-7 py-12 text-center sm:px-12"
          >
            <div
              aria-hidden
              className="absolute -left-10 -top-10 size-40 rounded-full bg-white/30"
            />
            <div
              aria-hidden
              className="absolute -bottom-16 -right-8 size-56 rounded-full bg-white/25"
            />
            <div className="relative mx-auto max-w-2xl">
              <span className="clay-soft mx-auto grid size-16 place-items-center rounded-3xl bg-white/70 text-4xl">
                🐍
              </span>
              <h2 className="mt-6 text-4xl font-semibold text-[var(--clay-mint-ink)] sm:text-5xl">
                Your first line of Python is one squish away.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base font-bold text-[var(--clay-mint-ink)] opacity-80">
                Free to play, built for complete beginners, and you can start
                right now. No installs, no jargon, no judgment.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="clay-btn h-14 rounded-2xl bg-[var(--clay-mint-ink)] px-8 text-base font-extrabold text-white hover:bg-[var(--clay-mint-ink)]"
                >
                  <Link to={startHref}>
                    Start learning Python
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--clay-mint-ink)] opacity-70">
                  Save progress with any email
                </span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/60 bg-white/35">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Brand />
          <p className="text-center text-xs font-bold text-muted-foreground">
            Made for absolute beginners · Python first · C, C++ and AI coming next
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
            <a href="#paths" className="hover:text-foreground">Paths</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <Link to={startHref} className="hover:text-foreground">Play</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
