/** Every language the Code Lab and code quests can execute. */
export type CodeLanguageId =
  | "python"
  | "c"
  | "cpp"
  | "javascript"
  | "java"
  | "go";

/** Shared shape for every quest in every language path. */

export type Challenge =
  | {
      kind: "choice";
      prompt: string;
      code?: string;
      options: string[];
      answer: number;
      explanation: string;
    }
  | {
      kind: "blank";
      prompt: string;
      code: string;
      options: string[];
      answer: number;
      explanation: string;
    }
  | {
      kind: "order";
      prompt: string;
      lines: string[];
      explanation: string;
    }
  | {
      kind: "code";
      prompt: string;
      starter: string;
      expectedOutput: string;
      explanation: string;
      /** Defaults to the track's own language when omitted. */
      language?: CodeLanguageId;
    };

/** Optional arcade configuration so a lesson can be played as a shooting round. */
export type ArcadeChallenge = {
  instruction: string;
  targets: string[];
  answer: number;
};

export type Lesson = {
  id: string;
  unit: string;
  title: string;
  icon: string;
  summary: string;
  explanation: string[];
  example: { code: string; output: string };
  challenge: Challenge;
  arcade?: ArcadeChallenge;
  xp: number;
  minutes: number;
};

export type Unit = { name: string; lessons: Lesson[] };
