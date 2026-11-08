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
  xp: number;
  minutes: number;
};

export type Unit = { name: string; lessons: Lesson[] };
