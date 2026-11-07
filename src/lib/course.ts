/**
 * Version 1 course content: Python basics only.
 * Every quest teaches one concept, shows a worked example, and explains
 * *why* the answer is right so a total beginner can learn while playing.
 */

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

export const LANGUAGE_TRACKS = [
  {
    id: "python",
    name: "Python",
    emoji: "🐍",
    tagline: "Start here",
    blurb:
      "The friendliest first language. Short lines, clear rules, and instant feedback.",
    status: "open" as const,
    tone: "tone-mint",
    concepts: ["print", "variables", "if / else", "loops", "functions", "lists"],
    quests: 14,
  },
  {
    id: "c",
    name: "C",
    emoji: "🧱",
    tagline: "Coming soon",
    blurb:
      "See how memory and the machine really work, one tiny building block at a time.",
    status: "soon" as const,
    tone: "tone-sky",
    concepts: ["syntax", "types", "pointers", "arrays"],
    quests: 0,
  },
  {
    id: "cpp",
    name: "C++",
    emoji: "⚙️",
    tagline: "Coming soon",
    blurb:
      "Powerful, fast, and big. We'll take it slowly with objects and structure.",
    status: "soon" as const,
    tone: "tone-peach",
    concepts: ["classes", "references", "STL", "templates"],
    quests: 0,
  },
  {
    id: "ai",
    name: "AI",
    emoji: "🤖",
    tagline: "Coming soon",
    blurb:
      "From prompts to models: understand the ideas behind modern AI by building them.",
    status: "soon" as const,
    tone: "tone-lilac",
    concepts: ["prompts", "datasets", "models", "agents"],
    quests: 0,
  },
];

export type LanguageTrack = (typeof LANGUAGE_TRACKS)[number];

export const PYTHON_LESSONS: Lesson[] = [
  {
    id: "print",
    unit: "Hello, Python",
    title: "Say it out loud",
    icon: "💬",
    summary: "Make the computer talk with print()",
    explanation: [
      "Python runs your instructions from top to bottom. The first instruction beginners learn is print(), which shows a message on the screen.",
      "The text you want to show goes inside the parentheses, wrapped in quotes. Quotes are not part of the message — they just tell Python “this is text”.",
    ],
    example: {
      code: 'print("Hello, ClayCode!")',
      output: "Hello, ClayCode!",
    },
    challenge: {
      kind: "choice",
      prompt: "What appears on the screen when this line runs?",
      code: 'print("I am learning")',
      options: [
        '"I am learning"',
        "I am learning",
        'print("I am learning")',
        "Nothing appears",
      ],
      answer: 1,
      explanation:
        "print() shows the text itself. The quotes only mark where the text starts and ends, so they do not appear in the output.",
    },
    xp: 20,
    minutes: 2,
  },
  {
    id: "comments",
    unit: "Hello, Python",
    title: "Invisible notes",
    icon: "📝",
    summary: "Leave messages for humans with #",
    explanation: [
      "A comment starts with #. Python ignores everything after it on that line, which makes comments perfect for notes to yourself or to other people.",
      "Programmers use comments to explain why code exists. Your program behaves exactly the same with or without them.",
    ],
    example: {
      code: '# Greet the player\nprint("Ready!")  # this note is ignored too',
      output: "Ready!",
    },
    challenge: {
      kind: "choice",
      prompt: "What does this program print?",
      code: 'print("start")\n# print("secret")\nprint("end")',
      options: ["start then end", "start, secret, then end", "secret", "Nothing"],
      answer: 0,
      explanation:
        "The middle line begins with #, so Python skips it entirely. Only the two real print() calls run, producing “start” then “end”.",
    },
    xp: 20,
    minutes: 2,
  },
  {
    id: "variables",
    unit: "Hello, Python",
    title: "Named boxes",
    icon: "📦",
    summary: "Store values in variables",
    explanation: [
      "A variable is a labelled box for a value. You create one by choosing a name and using a single equals sign to put something inside it.",
      "One = means “store this value”. Two == means “are these equal?” — mixing them up is a classic beginner bug, so keep them separate in your mind.",
    ],
    example: {
      code: 'score = 10\nplayer = "Ada"\nprint(player, score)',
      output: "Ada 10",
    },
    challenge: {
      kind: "blank",
      prompt: "Which symbol stores the text in the variable?",
      code: 'player ___ "Ada"\nprint(player)',
      options: ["=", "==", "#", ":"],
      answer: 0,
      explanation:
        "A single = assigns the value on the right to the name on the left. With ==, Python would compare them instead of storing anything.",
    },
    xp: 25,
    minutes: 3,
  },
  {
    id: "math",
    unit: "Numbers & text",
    title: "Clay calculator",
    icon: "➗",
    summary: "Do maths with + - * / and parentheses",
    explanation: [
      "Python is a very fast calculator. It understands +, -, * and /, and it follows the same order of operations you learned at school: multiplication before addition.",
      "Use parentheses when you want Python to work something out first. They are like pressing the important button first on a calculator.",
    ],
    example: {
      code: "print(3 + 4 * 2)\nprint((3 + 4) * 2)",
      output: "11\n14",
    },
    challenge: {
      kind: "choice",
      prompt: "What does this print?",
      code: "print((3 + 4) * 2)",
      options: ["11", "14", "34", "An error"],
      answer: 1,
      explanation:
        "Parentheses are solved first: 3 + 4 = 7. Then 7 * 2 = 14. Without the parentheses, 4 * 2 would happen first and you would get 11.",
    },
    xp: 20,
    minutes: 3,
  },
  {
    id: "fstrings",
    unit: "Numbers & text",
    title: "Mad-libs strings",
    icon: "🧵",
    summary: "Mix text and values with f-strings",
    explanation: [
      "Text inside quotes is called a string. An f-string starts with the letter f before the quote, and anything in curly braces gets replaced by its value.",
      "f-strings are the tidy way to build messages from variables instead of gluing bits of text together with +.",
    ],
    example: {
      code: 'name = "Ada"\nprint(f"Hi, {name}!")',
      output: "Hi, Ada!",
    },
    challenge: {
      kind: "choice",
      prompt: "What appears on screen?",
      code: 'snack = "clay"\nprint(f"I love {snack}")',
      options: ["I love clay", "I love {snack}", 'f"I love clay"', "An error"],
      answer: 0,
      explanation:
        "The curly braces inside an f-string are placeholders. Python swaps {snack} for the value stored in the variable, so the output is “I love clay”.",
    },
    xp: 25,
    minutes: 3,
  },
  {
    id: "string-powers",
    unit: "Numbers & text",
    title: "String superpowers",
    icon: "🔍",
    summary: "Count and pick characters",
    explanation: [
      "len() tells you how many characters a string has. Square brackets pick out a single character.",
      "Counting starts at 0, not 1. So the first character is at position 0, the second is at position 1, and so on. Programmers call this the index.",
    ],
    example: {
      code: 'word = "python"\nprint(len(word))\nprint(word[0])',
      output: "6\np",
    },
    challenge: {
      kind: "choice",
      prompt: "What is the output?",
      code: 'print("code"[1])',
      options: ["c", "o", "d", "An error"],
      answer: 1,
      explanation:
        'Index 0 is "c", so index 1 is "o". The number in the brackets is the position, and positions start counting at zero.',
    },
    xp: 25,
    minutes: 3,
  },
  {
    id: "booleans",
    unit: "Making choices",
    title: "True or false?",
    icon: "⚖️",
    summary: "Ask yes / no questions",
    explanation: [
      "A boolean is a value that is either True or False. Python uses comparison operators to produce them: > greater than, < less than, >= at least, <= at most, == equal, != not equal.",
      "Notice the capital T and F. True and False are proper Python values, not text in quotes.",
    ],
    example: {
      code: "print(5 > 3)\nprint(10 == 10)\nprint(2 != 2)",
      output: "True\nTrue\nFalse",
    },
    challenge: {
      kind: "choice",
      prompt: "What does this print?",
      code: "print(10 != 10)",
      options: ["True", "False", "10", "An error"],
      answer: 1,
      explanation:
        "!= asks “are these different?”. Both sides are 10, so they are not different. The answer is False.",
    },
    xp: 20,
    minutes: 3,
  },
  {
    id: "if-else",
    unit: "Making choices",
    title: "Fork in the road",
    icon: "🛤️",
    summary: "Choose a path with if / else",
    explanation: [
      "An if statement runs the indented block underneath only when its condition is True. The colon : at the end starts that block.",
      "else means “otherwise”. It catches every case where the if condition failed, so exactly one of the two paths runs.",
    ],
    example: {
      code: 'age = 14\nif age >= 13:\n    print("Teen")\nelse:\n    print("Kid")',
      output: "Teen",
    },
    challenge: {
      kind: "blank",
      prompt: "Which keyword catches the “otherwise” case?",
      code: 'score = 50\nif score >= 60:\n    print("Pass")\n___:\n    print("Try again")',
      options: ["else", "if", "elif", "then"],
      answer: 0,
      explanation:
        "else runs when the if condition is False. Here 50 is not at least 60, so the else branch prints “Try again”.",
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "indentation",
    unit: "Making choices",
    title: "Minding the gap",
    icon: "📐",
    summary: "Indentation decides what's inside a block",
    explanation: [
      "Python uses indentation instead of curly braces. Lines indented under an if statement belong to that block; lines at the left edge run no matter what.",
      "The community convention is four spaces. Mixed tabs and spaces are a common source of confusing errors, so pick spaces and stay consistent.",
    ],
    example: {
      code: 'if True:\n    print("inside")\nprint("outside")',
      output: "inside\noutside",
    },
    challenge: {
      kind: "choice",
      prompt: "What does this program print?",
      code: 'if 3 > 5:\n    print("A")\nprint("B")',
      options: ["B only", "A then B", "A only", "An error"],
      answer: 0,
      explanation:
        "3 > 5 is False, so the indented block is skipped. print(\"B\") is not indented, so it always runs. Only B appears.",
    },
    xp: 25,
    minutes: 4,
  },
  {
    id: "for-loops",
    unit: "Loops",
    title: "Loop-de-loop",
    icon: "🔁",
    summary: "Repeat work with for and range()",
    explanation: [
      "A for loop repeats its indented block once for each value it is given. range(3) produces 0, 1, 2 — three numbers, naturally starting at zero.",
      "The loop variable (here i) holds the current number. By the end of the loop, the block has run three times.",
    ],
    example: {
      code: "for i in range(3):\n    print(i)",
      output: "0\n1\n2",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: "for i in range(2):\n    print(i + 1)",
      options: ["0 then 1", "1 then 2", "2 then 3", "1 then 1"],
      answer: 1,
      explanation:
        "range(2) gives i the values 0 and 1. The loop adds 1 to each: 0 + 1 = 1, then 1 + 1 = 2. So the output is 1 then 2.",
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "while-loops",
    unit: "Loops",
    title: "Keep going",
    icon: "🌀",
    summary: "Repeat until a condition changes",
    explanation: [
      "A while loop repeats as long as its condition stays True. That means something inside the loop must eventually make the condition False.",
      "A loop that never changes its condition runs forever — the famous infinite loop. Always give the loop a way out.",
    ],
    example: {
      code: 'count = 3\nwhile count > 0:\n    print(count)\n    count = count - 1',
      output: "3\n2\n1",
    },
    challenge: {
      kind: "order",
      prompt: "Put the lines in order so the loop prints “hop” three times.",
      lines: [
        "count = 0",
        "while count < 3:",
        '    print("hop")',
        "    count = count + 1",
      ],
      explanation:
        "Start by creating the counter, then open the loop with the condition, then print and increase the counter. Increasing count is what lets the loop finish after three hops.",
    },
    xp: 35,
    minutes: 5,
  },
  {
    id: "functions",
    unit: "Functions & lists",
    title: "Reusable recipes",
    icon: "🍪",
    summary: "Package steps into a function",
    explanation: [
      "def creates a function: a named set of steps you can reuse. The parentheses hold inputs, called parameters.",
      "return sends a value back to whoever called the function. Defining a function does not run it — you have to call it by name.",
    ],
    example: {
      code: "def double(n):\n    return n * 2\n\nprint(double(5))",
      output: "10",
    },
    challenge: {
      kind: "blank",
      prompt: "Which keyword defines a function?",
      code: '___ greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Sam"))',
      options: ["def", "function", "fun", "define"],
      answer: 0,
      explanation:
        "Python uses def to define a function. Once greet is defined, calling greet(\"Sam\") runs it and returns “Hello, Sam!”.",
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "lists",
    unit: "Functions & lists",
    title: "Pockets full of things",
    icon: "🎒",
    summary: "Collect values in a list",
    explanation: [
      "A list stores many values in one place, using square brackets and commas. Lists keep their order, and you read items by index starting at 0.",
      "append() adds an item to the end, and len() tells you how many items are inside. Lists can grow and change as your program runs.",
    ],
    example: {
      code: 'fruits = ["apple", "banana", "cherry"]\nprint(fruits[1])\nfruits.append("date")\nprint(len(fruits))',
      output: "banana\n4",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: 'colors = ["red", "blue"]\ncolors.append("green")\nprint(colors[2])',
      options: ["green", "blue", "red", "An error"],
      answer: 0,
      explanation:
        'The list starts as ["red", "blue"]; append adds "green" at the end. Index 2 is the third item, so the output is green.',
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "final-boss",
    unit: "Functions & lists",
    title: "Final squish: mix it up",
    icon: "🏆",
    summary: "Combine a list with a loop",
    explanation: [
      "Real programs combine ideas. A for loop can walk through every item in a list, which is one of the most useful patterns in all of Python.",
      "The loop variable takes each value in turn, so the same two lines of code can handle a list of two items or two thousand.",
    ],
    example: {
      code: "scores = [10, 20, 30]\ntotal = 0\nfor score in scores:\n    total = total + score\nprint(total)",
      output: "60",
    },
    challenge: {
      kind: "order",
      prompt: "Arrange the code so it prints every pet in the list.",
      lines: [
        'pets = ["cat", "dog"]',
        "for pet in pets:",
        "    print(pet)",
      ],
      explanation:
        "Create the list first, then start the loop over it, then print the loop variable. The indented print runs once for cat and once for dog.",
    },
    xp: 40,
    minutes: 5,
  },
];

export const PYTHON_UNITS = PYTHON_LESSONS.reduce<
  { name: string; lessons: Lesson[] }[]
>((units, lesson) => {
  const last = units[units.length - 1];
  if (last && last.name === lesson.unit) {
    last.lessons.push(lesson);
  } else {
    units.push({ name: lesson.unit, lessons: [lesson] });
  }
  return units;
}, []);

export const PYTHON_TOTAL_XP = PYTHON_LESSONS.reduce(
  (sum, lesson) => sum + lesson.xp,
  0,
);

export function getLesson(index: number): Lesson {
  return PYTHON_LESSONS[Math.max(0, Math.min(index, PYTHON_LESSONS.length - 1))];
}
