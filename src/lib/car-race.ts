/** The code lines the player builds by collecting falling pieces in Code Rally. */
export type RallyMission = {
  id: string;
  language: "Python" | "C" | "C++";
  tone: string;
  title: string;
  goal: string;
  tokens: string[];
  code: string;
  explanation: string;
  xp: number;
};

const XP_PER_MISSION = 30;

export const RALLY_MISSIONS: RallyMission[] = [
  {
    id: "rally-py-print",
    language: "Python",
    tone: "tone-mint",
    title: "Say hello",
    goal: "Collect the pieces in order to build a print call.",
    tokens: ["print(", '"Hello, clay!"', ")"],
    code: 'print("Hello, clay!")',
    explanation:
      "print() shows text on screen. The quotes mark the string, and the closing parenthesis finishes the call.",
    xp: XP_PER_MISSION,
  },
  {
    id: "rally-py-if",
    language: "Python",
    tone: "tone-mint",
    title: "Take the branch",
    goal: "Build a comparison that decides whether a score passes.",
    tokens: ["if score", ">= 60", ":"],
    code: "if score >= 60:",
    explanation:
      "if checks a condition. >= means “at least”, and the colon opens the indented block that runs when the score passes.",
    xp: XP_PER_MISSION,
  },
  {
    id: "rally-c-print",
    language: "C",
    tone: "tone-sky",
    title: "C hello",
    goal: "Build a complete printf statement, semicolon included.",
    tokens: ["printf(", '"Hi, C!\\n"', ");"],
    code: 'printf("Hi, C!\\n");',
    explanation:
      "printf writes formatted text. \\n starts a new line, and the semicolon tells C that the statement is finished.",
    xp: XP_PER_MISSION,
  },
  {
    id: "rally-c-loop",
    language: "C",
    tone: "tone-sky",
    title: "Count three times",
    goal: "Build the header of a C for loop.",
    tokens: ["for (int i = 0;", "i < 3;", "i++)"],
    code: "for (int i = 0; i < 3; i++)",
    explanation:
      "A C for loop has three parts: where i starts, how long it keeps going, and how it changes after every pass.",
    xp: XP_PER_MISSION,
  },
  {
    id: "rally-cpp-cout",
    language: "C++",
    tone: "tone-peach",
    title: "Stream a greeting",
    goal: "Build a std::cout line that prints and ends with a new line.",
    tokens: ["std::cout", '<< "Hi"', "<< std::endl;"],
    code: 'std::cout << "Hi" << std::endl;',
    explanation:
      "std::cout is the output stream. Each << sends a value into it, and std::endl ends the line.",
    xp: XP_PER_MISSION,
  },
  {
    id: "rally-cpp-vector",
    language: "C++",
    tone: "tone-peach",
    title: "Load the scores",
    goal: "Build a vector declaration with three starting scores.",
    tokens: ["std::vector<int>", "scores", "= {10, 20, 30};"],
    code: "std::vector<int> scores = {10, 20, 30};",
    explanation:
      "A std::vector is a resizable list. The type in angle brackets says what it stores, and the braces provide its first values.",
    xp: XP_PER_MISSION,
  },
];

export const RALLY_TOTAL_XP = RALLY_MISSIONS.reduce(
  (sum, mission) => sum + mission.xp,
  0,
);
