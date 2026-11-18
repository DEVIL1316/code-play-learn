import { LANGUAGE_TRACKS } from "@/lib/course";
import type { Challenge } from "@/lib/track-types";

export type CarRound = {
  id: string;
  language: string;
  languageName: string;
  tone: string;
  title: string;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
  xp: number;
};

/** Review gates pulled from the three code paths. */
const PICKS = [
  { track: "python", lesson: "math" },
  { track: "python", lesson: "lists" },
  { track: "python", lesson: "return-values" },
  { track: "c", lesson: "c-hello" },
  { track: "c", lesson: "c-for" },
  { track: "c", lesson: "c-arrays" },
  { track: "cpp", lesson: "cpp-if" },
  { track: "cpp", lesson: "cpp-range-for" },
  { track: "cpp", lesson: "cpp-vector" },
] as const;

const XP_PER_GATE = 20;

function makeRound({
  track,
  lesson,
}: {
  track: string;
  lesson: string;
}): CarRound | null {
  const languageTrack = LANGUAGE_TRACKS.find((entry) => entry.id === track);
  const source = languageTrack?.lessons.find((entry) => entry.id === lesson);
  if (!languageTrack || !source) return null;

  const challenge: Challenge = source.challenge;
  if (challenge.kind !== "choice" && challenge.kind !== "blank") return null;

  return {
    id: source.id,
    language: track,
    languageName: languageTrack.name,
    tone: languageTrack.tone,
    title: source.title,
    prompt: challenge.prompt,
    code: challenge.code,
    options: challenge.options,
    answer: challenge.answer,
    explanation: challenge.explanation,
    xp: XP_PER_GATE,
  };
}

export const CAR_ROUNDS = PICKS.map(makeRound).filter(
  (round): round is CarRound => round !== null,
);

export const CAR_TOTAL_XP = CAR_ROUNDS.reduce(
  (sum, round) => sum + round.xp,
  0,
);

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type CarGate = { text: string; correct: boolean };

/** Three readable gates per round, always including the correct answer. */
export function buildGates(round: CarRound): CarGate[] {
  const correct = round.options[round.answer];
  const wrong = round.options.filter((_, index) => index !== round.answer);
  return shuffle([
    { text: correct, correct: true },
    ...shuffle(wrong)
      .slice(0, 2)
      .map((text) => ({ text, correct: false })),
  ]);
}
