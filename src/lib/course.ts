/**
 * The full curriculum: four language paths, every quest with a lesson,
 * a worked example, and an explanation of why the answer is right.
 */
import { AI_LESSONS } from "@/lib/tracks/ai";
import { C_LESSONS } from "@/lib/tracks/c";
import { CPP_LESSONS } from "@/lib/tracks/cpp";
import type { Lesson, Unit } from "@/lib/track-types";

export type {
  ArcadeChallenge,
  Challenge,
  Lesson,
  Unit,
} from "@/lib/track-types";

export type LanguageTrack = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  blurb: string;
  tone: string;
  codeLabel: string;
  concepts: readonly string[];
  lessons: Lesson[];
  units: Unit[];
  totalXp: number;
};

export function groupUnits(lessons: Lesson[]): Unit[] {
  return lessons.reduce<Unit[]>((units, lesson) => {
    const last = units[units.length - 1];
    if (last && last.name === lesson.unit) {
      last.lessons.push(lesson);
    } else {
      units.push({ name: lesson.unit, lessons: [lesson] });
    }
    return units;
  }, []);
}

const TRACK_META = [
  {
    id: "python",
    name: "Python",
    emoji: "🐍",
    tagline: "Start here",
    blurb:
      "The friendliest first language. Short lines, clear rules, and instant feedback.",
    tone: "tone-mint",
    codeLabel: "main.py",
    concepts: ["print", "dicts", "loops", "functions", "classes"],
  },
  {
    id: "c",
    name: "C",
    emoji: "🧱",
    tagline: "See the machine",
    blurb:
      "See how memory and the machine really work, one tiny building block at a time.",
    tone: "tone-sky",
    codeLabel: "main.c",
    concepts: ["types", "printf", "loops", "arrays", "pointers"],
  },
  {
    id: "cpp",
    name: "C++",
    emoji: "⚙️",
    tagline: "Go powerful",
    blurb:
      "Powerful, fast, and structured. Learn streams, containers and your first class.",
    tone: "tone-peach",
    codeLabel: "main.cpp",
    concepts: ["std::cout", "vectors", "range-for", "classes"],
  },
  {
    id: "ai",
    name: "AI",
    emoji: "🤖",
    tagline: "Arcade range",
    blurb:
      "Learn how AI works by shooting the right target in a fast clay range. Aim, fire, understand.",
    tone: "tone-lilac",
    codeLabel: "ai_lab.py",
    concepts: ["datasets", "labels", "tokens", "prompts", "evaluation"],
  },
] as const;

function makeTrack(
  meta: (typeof TRACK_META)[number],
  lessons: Lesson[],
): LanguageTrack {
  return {
    ...meta,
    lessons,
    units: groupUnits(lessons),
    totalXp: lessons.reduce((sum, lesson) => sum + lesson.xp, 0),
  };
}

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
  {
    id: "dicts",
    unit: "Real data",
    title: "Look it up",
    icon: "🗂️",
    summary: "Store values under named keys",
    explanation: [
      "A dictionary maps keys to values. Instead of remembering that an item sits at position 2, you use a name like “ada” and let Python find the value for you.",
      "Curly braces create the dictionary, a colon separates each key from its value, and square brackets with a key read it back. Keys are unique, so assigning to an existing key replaces its value.",
    ],
    example: {
      code: 'ages = {"ada": 36, "alan": 41}\nprint(ages["ada"])',
      output: "36",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: 'scores = {"sam": 10, "mia": 12}\nprint(scores["mia"])',
      options: ["10", "12", "mia", "An error"],
      answer: 1,
      explanation:
        'The key "mia" maps to 12, so square brackets with that key return 12. A dictionary is a lookup table: you ask by name instead of by position.',
    },
    xp: 30,
    minutes: 3,
  },
  {
    id: "counting",
    unit: "Real data",
    title: "Count the votes",
    icon: "🧮",
    summary: "Combine a loop with a counter",
    explanation: [
      "Counting is one of the most common jobs in programming. Start a number at zero, walk through a collection, and add one whenever an item matches.",
      "The counter lives outside the loop so it survives between passes. If you reset it inside the loop, every pass would erase the previous count.",
    ],
    example: {
      code: 'votes = ["yes", "no", "yes"]\ncount = 0\nfor vote in votes:\n    if vote == "yes":\n        count += 1\nprint(count)',
      output: "2",
    },
    challenge: {
      kind: "choice",
      prompt: "What does this print?",
      code: 'votes = ["yes", "no", "yes", "yes"]\ncount = 0\nfor vote in votes:\n    if vote == "yes":\n        count += 1\nprint(count)',
      options: ["4", "2", "3", "1"],
      answer: 2,
      explanation:
        "Three of the four votes are “yes”, so count is increased three times. count += 1 is shorthand for count = count + 1.",
    },
    xp: 35,
    minutes: 4,
  },
  {
    id: "return-values",
    unit: "Your own tools",
    title: "Send a value back",
    icon: "↩️",
    summary: "Use return instead of print inside functions",
    explanation: [
      "print displays something, but return hands a value back to the code that called the function. That returned value can be stored, added to, or passed onward.",
      "A function without return quietly gives back None. That is why a helper that prints is hard to reuse: the result disappears instead of travelling back to you.",
    ],
    example: {
      code: "def add(a, b):\n    return a + b\n\nresult = add(2, 3)\nprint(result)",
      output: "5",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: "def double(n):\n    return n * 2\n\nprint(double(7))",
      options: ["7", "None", "An error", "14"],
      answer: 3,
      explanation:
        "double(7) runs the function, which returns 7 * 2 = 14. print then shows that returned value. Replacing return with print here would make the outer print display None.",
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "defaults",
    unit: "Your own tools",
    title: "Optional ingredients",
    icon: "🍰",
    summary: "Give parameters default values",
    explanation: [
      "A parameter can have a default value: def power(base, exponent=2). If the caller leaves that argument out, Python uses the default.",
      "Two stars mean “to the power of” in Python, so 5 ** 2 is 25. Defaults make helpers convenient without forcing every caller to supply the same common value.",
    ],
    example: {
      code: "def power(base, exponent=2):\n    return base ** exponent\n\nprint(power(5))\nprint(power(5, 3))",
      output: "25\n125",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: "def greet(name, greeting=\"Hi\"):\n    return f\"{greeting}, {name}!\"\n\nprint(greet(\"Ada\"))",
      options: ["greeting, name!", "Hi, Ada!", "Hi, name!", "An error"],
      answer: 1,
      explanation:
        "Only the name argument is supplied, so greeting falls back to its default “Hi”. The f-string fills in both values, producing “Hi, Ada!”.",
    },
    xp: 35,
    minutes: 4,
  },
  {
    id: "scope",
    unit: "Your own tools",
    title: "Inside vs outside",
    icon: "🫧",
    summary: "Understand local and global names",
    explanation: [
      "Names created inside a function are local: they exist only while that function runs. A local variable with the same name as an outer one shadows it rather than changing it.",
      "That protection is useful. Functions can use short, clear names like total without accidentally rewriting the rest of your program. To change an outer name on purpose you would declare it global, but most of the time returning a value is cleaner.",
    ],
    example: {
      code: "total = 10\n\ndef bump():\n    total = 99\n    return total\n\nprint(bump())\nprint(total)",
      output: "99\n10",
    },
    challenge: {
      kind: "choice",
      prompt: "What does this print?",
      code: "score = 5\n\ndef bonus():\n    score = 50\n    return score\n\nprint(bonus())\nprint(score)",
      options: ["50 then 50", "5 then 5", "50 then 5", "An error"],
      answer: 2,
      explanation:
        "The global score is 5. Inside bonus, score = 50 creates a separate local variable, and the function returns that. The final print outside still sees the untouched global 5.",
    },
    xp: 35,
    minutes: 5,
  },
  {
    id: "comprehensions",
    unit: "Python power-ups",
    title: "Build a list in one line",
    icon: "✨",
    summary: "Transform a collection with a comprehension",
    explanation: [
      "A list comprehension builds a new list by describing each item: [n * n for n in range(4)]. It is the same idea as a loop with append, written in one readable line.",
      "Read it backwards in plain English: “for each n in range(4), put n * n in the list”. Once you are comfortable with loops, comprehensions make transforming data much shorter.",
    ],
    example: {
      code: "numbers = [1, 2, 3]\ndoubled = [n * 2 for n in numbers]\nprint(doubled)",
      output: "[2, 4, 6]",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: "squares = [n * n for n in range(4)]\nprint(squares)",
      options: ["[1, 4, 9, 16]", "[0, 1, 4, 9]", "[0, 1, 2, 3]", "An error"],
      answer: 1,
      explanation:
        "range(4) produces 0, 1, 2 and 3. Squaring each gives 0, 1, 4 and 9, collected into a list. The whole expression produces a new list rather than printing along the way.",
    },
    xp: 40,
    minutes: 4,
  },
  {
    id: "errors",
    unit: "Python power-ups",
    title: "Catch the wobble",
    icon: "🛟",
    summary: "Handle mistakes with try / except",
    explanation: [
      "Some errors cannot be prevented, such as a user typing letters where a number is expected. Without handling, the whole program stops with a traceback.",
      "try holds the risky code. If it raises an exception, Python jumps to the matching except block instead of crashing. Catch a specific error like ValueError so real bugs do not hide behind a friendly message.",
    ],
    example: {
      code: 'try:\n    number = int("42")\n    print(number)\nexcept ValueError:\n    print("Not a number")',
      output: "42",
    },
    challenge: {
      kind: "blank",
      prompt: "Which keyword handles the error?",
      code: 'try:\n    print(int("abc"))\n___ ValueError:\n    print("Not a number")',
      options: ["except", "catch", "error", "rescue"],
      answer: 0,
      explanation:
        "int(“abc”) cannot become a number, so Python raises ValueError. The except ValueError block catches exactly that kind of error and prints the friendly message instead of crashing.",
    },
    xp: 35,
    minutes: 4,
  },
  {
    id: "classes",
    unit: "Python power-ups",
    title: "Blueprints for objects",
    icon: "🏗️",
    summary: "Create your own type with a class",
    explanation: [
      "A class is a blueprint for objects that share data and behaviour. Creating a class does not make an object; calling the class does.",
      "__init__ is the constructor that runs when a new object is created. self refers to that particular object, so self.name = name stores a name on it. Dot notation then reads the stored value back.",
    ],
    example: {
      code: 'class Pet:\n    def __init__(self, name):\n        self.name = name\n\npet = Pet("Mochi")\nprint(pet.name)',
      output: "Mochi",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: 'class Pet:\n    def __init__(self, name):\n        self.name = name\n\npet = Pet("Mochi")\nprint(pet.name)',
      options: ["name", "Pet", "Mochi", "An error"],
      answer: 2,
      explanation:
        "Pet(“Mochi”) creates an object and passes “Mochi” into __init__, which stores it as self.name. pet.name reads that stored value, so the output is Mochi.",
    },
    xp: 45,
    minutes: 6,
  },
  {
    id: "fizzbuzz",
    unit: "Build it for real",
    title: "FizzBuzz, fully coded",
    icon: "🎮",
    summary: "Write a complete program from scratch",
    explanation: [
      "Time to write a whole program. FizzBuzz prints the numbers 1 to 15, but replaces multiples of 3 with Fizz, multiples of 5 with Buzz, and multiples of both with FizzBuzz.",
      "The % operator gives the remainder of a division. n % 3 == 0 means n divides evenly by 3. Check the both-case first, otherwise a multiple of 15 would stop at Fizz.",
    ],
    example: {
      code: 'for n in range(1, 16):\n    if n % 15 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)',
      output:
        "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
    },
    challenge: {
      kind: "code",
      prompt:
        "Write a full program that prints 1 to 15, one per line. Print Fizz for multiples of 3, Buzz for multiples of 5, and FizzBuzz for multiples of both.",
      starter:
        "# Print the numbers 1 to 15 with FizzBuzz rules.\nfor n in range(1, 16):\n    # your code here\n    pass",
      expectedOutput:
        "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
      explanation:
        "% gives the remainder. Testing n % 15 == 0 first catches every multiple of both 3 and 5, then the separate checks handle Fizz and Buzz. The final else prints the plain number.",
    },
    xp: 60,
    minutes: 8,
  },
  {
    id: "score-report",
    unit: "Build it for real",
    title: "Score report",
    icon: "📊",
    summary: "Loop, total, divide and format a report",
    explanation: [
      "This program turns a list of scores into a small report. Start total at 0, add each score inside a loop, then divide by len(scores) to get the average.",
      "In an f-string, {average:.1f} shows one digit after the decimal point. Without it, Python might print 20.0 anyway — but formatting makes the output predictable.",
    ],
    example: {
      code: 'scores = [10, 20, 30]\ntotal = 0\nfor score in scores:\n    total += score\naverage = total / len(scores)\nprint(f"Total: {total}")\nprint(f"Average: {average:.1f}")',
      output: "Total: 60\nAverage: 20.0",
    },
    challenge: {
      kind: "code",
      prompt:
        "Finish the program so it prints exactly “Total: 60”, then “Average: 20.0”.",
      starter:
        "scores = [10, 20, 30]\ntotal = 0\n\n# Add every score to total.\n\n# Print the total, then the average with one decimal.",
      expectedOutput: "Total: 60\nAverage: 20.0",
      explanation:
        "total += score adds each value in the list. Dividing total by len(scores) gives the average, and the f-string prints both lines exactly as requested.",
    },
    xp: 55,
    minutes: 7,
  },
];

export const PYTHON_UNITS = groupUnits(PYTHON_LESSONS);

export const PYTHON_TOTAL_XP = PYTHON_LESSONS.reduce(
  (sum, lesson) => sum + lesson.xp,
  0,
);

export const LANGUAGE_TRACKS: LanguageTrack[] = [
  makeTrack(TRACK_META[0], PYTHON_LESSONS),
  makeTrack(TRACK_META[1], C_LESSONS),
  makeTrack(TRACK_META[2], CPP_LESSONS),
  makeTrack(TRACK_META[3], AI_LESSONS),
];

export const TOTAL_QUESTS = LANGUAGE_TRACKS.reduce(
  (sum, track) => sum + track.lessons.length,
  0,
);

export const TOTAL_XP = LANGUAGE_TRACKS.reduce(
  (sum, track) => sum + track.totalXp,
  0,
);

export function getTrack(id: string | undefined): LanguageTrack | undefined {
  return LANGUAGE_TRACKS.find((track) => track.id === id);
}
