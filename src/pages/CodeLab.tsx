import { GameHeader } from "@/components/GameHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { preloadPython, runPython } from "@/lib/python";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Code2,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const STARTERS = [
  {
    id: "hello",
    name: "Hello, player",
    blurb: "Variables, f-strings and a loop",
    code: 'name = "player"\nprint(f"Hello, {name}!")\n\nfor n in range(1, 4):\n    print("squish", n)',
  },
  {
    id: "fizzbuzz",
    name: "FizzBuzz",
    blurb: "The classic loop challenge",
    code: 'for n in range(1, 16):\n    if n % 15 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)',
  },
  {
    id: "scores",
    name: "Score report",
    blurb: "Lists, totals and formatting",
    code: 'scores = [10, 20, 30]\ntotal = 0\n\nfor score in scores:\n    total += score\n\naverage = total / len(scores)\nprint(f"Total: {total}")\nprint(f"Average: {average:.1f}")',
  },
  {
    id: "pet",
    name: "Clay pet",
    blurb: "A class with methods",
    code: 'class Pet:\n    def __init__(self, name, energy=3):\n        self.name = name\n        self.energy = energy\n\n    def play(self):\n        self.energy -= 1\n        return f"{self.name} has {self.energy} energy left"\n\npet = Pet("Mochi")\nprint(pet.play())\nprint(pet.play())',
  },
] as const;

type RunState = {
  output: string;
  error: string | null;
} | null;

export default function CodeLab() {
  const progressRows = useQuery(api.progress.getAllProgress, {});
  const totalXp = (progressRows ?? []).reduce((sum, row) => sum + row.xp, 0);

  const [code, setCode] = useState<string>(STARTERS[0].code);
  const [activeStarter, setActiveStarter] = useState<string>(STARTERS[0].id);
  const [result, setResult] = useState<RunState>(null);
  const [running, setRunning] = useState(false);

  /* Warm up the Python runtime while the player reads the page. */
  useEffect(() => {
    preloadPython();
  }, []);

  function loadStarter(starter: (typeof STARTERS)[number]) {
    setActiveStarter(starter.id);
    setCode(starter.code);
    setResult(null);
  }

  async function handleRun() {
    if (running) return;
    setRunning(true);
    try {
      const next = await runPython(code);
      setResult(next);
    } catch {
      setResult({
        output: "",
        error: "Python could not run that program. Try again.",
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 top-20 size-80 rounded-full bg-[var(--clay-lilac)] opacity-40" />
        <div className="absolute -left-28 top-[34rem] size-72 rounded-full bg-[var(--clay-mint)] opacity-40" />
      </div>

      <GameHeader xp={totalXp} showPathsLink />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <span className="clay-soft inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--clay-lilac-ink)]">
            <Sparkles className="size-3.5" />
            Full programs, not multiple choice
          </span>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">Code Lab</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Write a whole Python program, run it, and see the real output. It
            runs in your browser — nothing is installed and nothing leaves your
            device.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[16rem_1fr]">
          <aside className="clay h-fit p-5">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              <Code2 className="size-3.5" /> Starter programs
            </p>
            <div className="mt-3 space-y-2">
              {STARTERS.map((starter) => {
                const active = starter.id === activeStarter;
                return (
                  <button
                    key={starter.id}
                    type="button"
                    onClick={() => loadStarter(starter)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2.5 text-left transition",
                      active
                        ? "bg-[var(--clay-lilac)] text-[var(--clay-lilac-ink)] shadow-[inset_0_-2px_0_rgba(60,50,90,0.1)]"
                        : "hover:bg-muted",
                    )}
                  >
                    <span className="block text-sm font-extrabold">
                      {starter.name}
                    </span>
                    <span className="block text-[11px] font-semibold opacity-70">
                      {starter.blurb}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 border-t border-border/70 pt-4">
              <p className="text-xs font-semibold leading-relaxed text-muted-foreground">
                Python 3 runs locally with Pyodide. The first run downloads the
                runtime, so give it a moment.
              </p>
              <Link
                to="/learn"
                className="mt-4 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                All paths
              </Link>
            </div>
          </aside>

          <section className="clay p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="clay-tile tone-lilac grid size-9 place-items-center text-sm">
                  ⌨️
                </span>
                <div>
                  <p className="font-mono text-xs font-bold">playground.py</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Runs in a sandboxed worker · 8 second limit
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCode("");
                    setResult(null);
                  }}
                  className="rounded-full text-xs font-extrabold text-muted-foreground"
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCode(
                      STARTERS.find((starter) => starter.id === activeStarter)
                        ?.code ?? STARTERS[0].code,
                    );
                    setResult(null);
                  }}
                  className="rounded-full text-xs font-extrabold text-muted-foreground"
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl bg-[var(--clay-ink)] shadow-[inset_0_8px_20px_-12px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-[oklch(0.78_0.13_25)]" />
                <span className="size-2.5 rounded-full bg-[oklch(0.88_0.11_95)]" />
                <span className="size-2.5 rounded-full bg-[oklch(0.8_0.1_165)]" />
                <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Tab inserts 4 spaces
                </span>
              </div>
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Tab") return;
                  event.preventDefault();
                  const element = event.currentTarget;
                  const start = element.selectionStart;
                  const end = element.selectionEnd;
                  setCode(`${code.slice(0, start)}    ${code.slice(end)}`);
                  requestAnimationFrame(() => {
                    element.selectionStart = start + 4;
                    element.selectionEnd = start + 4;
                  });
                }}
                spellCheck={false}
                aria-label="Python code editor"
                rows={18}
                className="w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-[oklch(0.94_0.02_95)] outline-none"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                onClick={handleRun}
                disabled={running}
                className="clay-btn h-12 rounded-xl px-6 font-extrabold"
              >
                {running ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                {running ? "Running…" : "Run program"}
              </Button>
              <span className="text-xs font-bold text-muted-foreground">
                {running
                  ? "First run loads Python — this can take a moment."
                  : "Output appears below. Errors are safe to read and fix."}
              </span>
            </div>

            <div
              className={cn(
                "mt-5 rounded-2xl p-4",
                result?.error ? "bg-[var(--clay-peach)]" : "clay-inset",
              )}
            >
              <div className="flex items-center gap-2">
                <Terminal
                  className={cn(
                    "size-3.5",
                    result?.error
                      ? "text-[var(--clay-peach-ink)]"
                      : "text-muted-foreground",
                  )}
                />
                <p
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-widest",
                    result?.error
                      ? "text-[var(--clay-peach-ink)]"
                      : "text-muted-foreground",
                  )}
                >
                  Console
                </p>
              </div>
              <pre
                className={cn(
                  "mt-2 min-h-24 max-h-72 overflow-auto whitespace-pre-wrap font-mono text-xs leading-6",
                  result?.error
                    ? "text-[var(--clay-peach-ink)]"
                    : "text-foreground/85",
                )}
              >
                {result
                  ? (result.error ??
                    (result.output || "(program finished with no output)"))
                  : "Run your program to see the output here."}
              </pre>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
