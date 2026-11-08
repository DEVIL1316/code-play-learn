import type { Lesson } from "@/lib/track-types";

/** C: seven quests from a first printf to pointers. */
export const C_LESSONS: Lesson[] = [
  {
    id: "c-hello",
    unit: "C foundations",
    title: "Hello, machine",
    icon: "🧱",
    summary: "Compile and print with printf()",
    explanation: [
      "C is a compiled language: your code is translated into a real program before it runs. Every C program starts at a function called main, and execution walks through it top to bottom.",
      "Statements end with a semicolon. Blocks of code live inside curly braces. The #include line borrows printf from the standard input/output library so you can show text.",
    ],
    example: {
      code: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, C!\\n");\n    return 0;\n}',
      output: "Hello, C!",
    },
    challenge: {
      kind: "choice",
      prompt: "What appears on the screen?",
      code: '#include <stdio.h>\n\nint main(void) {\n    printf("Hi, C!\\n");\n    return 0;\n}',
      options: ["printf", "Hi, C!", "Hi, C!\\n", "An error"],
      answer: 1,
      explanation:
        "printf writes the text between the quotes. The two characters \\n are a newline instruction, so they move the cursor down instead of appearing on screen.",
    },
    xp: 20,
    minutes: 3,
  },
  {
    id: "c-types",
    unit: "C foundations",
    title: "Types are promises",
    icon: "🔖",
    summary: "Store values with int, float and char",
    explanation: [
      "C needs to know what kind of value a variable holds before it runs. int is a whole number, float is a decimal number, and char is a single character.",
      "That type is a promise to the compiler about how much memory to reserve. Once a variable is declared with a type, you assign values to it with a single =.",
    ],
    example: {
      code: 'int lives = 3;\nfloat speed = 1.5;\nprintf("%d lives at %.1f", lives, speed);',
      output: "3 lives at 1.5",
    },
    challenge: {
      kind: "blank",
      prompt: "Which type fits a whole number?",
      code: "___ score = 10;\nprintf(\"%d\", score);",
      options: ["int", "float", "char", "string"],
      answer: 0,
      explanation:
        "int stores whole numbers, so it is the right promise for 10. float would allow decimals, char holds one character, and C has no built-in string type — it uses arrays of char instead.",
    },
    xp: 25,
    minutes: 3,
  },
  {
    id: "c-printf",
    unit: "C foundations",
    title: "Fill in the format",
    icon: "🖨️",
    summary: "Print values with placeholders",
    explanation: [
      "printf does not automatically know where values go. You leave a placeholder in the text, then pass the value after the string.",
      "%d is a placeholder for an int, %f for a float, and %c for a char. The values are matched up in order.",
    ],
    example: {
      code: 'int age = 9;\nprintf("Age: %d\\n", age);',
      output: "Age: 9",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: 'int score = 42;\nprintf("Score: %d", score);',
      options: ["Score: %d", "Score: score", "Score: 42", "42"],
      answer: 2,
      explanation:
        "%d says “put an int here”. printf replaces the placeholder with the value of score, so the output is “Score: 42”.",
    },
    xp: 25,
    minutes: 3,
  },
  {
    id: "c-if",
    unit: "Decisions & loops",
    title: "Braces make the block",
    icon: "🔀",
    summary: "Branch with if and else",
    explanation: [
      "An if statement runs the code inside its curly braces only when the condition is true. else runs when it is false.",
      "The condition sits in parentheses. C treats any non-zero number as true and 0 as false, but comparisons like > and == are the clearest way to write a condition.",
    ],
    example: {
      code: 'int x = 4;\nif (x > 5) {\n    printf("big");\n} else {\n    printf("small");\n}',
      output: "small",
    },
    challenge: {
      kind: "choice",
      prompt: "What does this program print?",
      code: 'int power = 8;\nif (power >= 10) {\n    printf("strong");\n} else {\n    printf("warming up");\n}',
      options: ["strong", "warming up", "strongwarming up", "An error"],
      answer: 1,
      explanation:
        "8 is not at least 10, so the if block is skipped and the else block runs. Exactly one of the two branches prints.",
    },
    xp: 30,
    minutes: 3,
  },
  {
    id: "c-for",
    unit: "Decisions & loops",
    title: "Count like a machine",
    icon: "🔁",
    summary: "Repeat with a classic for loop",
    explanation: [
      "A C for loop packs three things into its parentheses: where to start, how long to continue, and how to step forward.",
      "In for (int i = 0; i < 3; i++), i starts at 0, the loop runs while i is less than 3, and i++ adds one after each pass. That produces 0, 1 and 2.",
    ],
    example: {
      code: 'for (int i = 0; i < 3; i++) {\n    printf("%d", i);\n}',
      output: "012",
    },
    challenge: {
      kind: "choice",
      prompt: "What is the output?",
      code: 'for (int i = 1; i <= 3; i++) {\n    printf("%d", i);\n}',
      options: ["012", "1234", "123", "111"],
      answer: 2,
      explanation:
        "i begins at 1. Because the condition uses <=, the loop still runs when i is 3, then stops at 4. With no spaces in the format string, the digits print as 123.",
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "c-arrays",
    unit: "Memory & functions",
    title: "A row of boxes",
    icon: "📦",
    summary: "Store many values in an array",
    explanation: [
      "An array is a row of same-type values in memory. int nums[3] makes room for three ints, and the list in braces fills them in order.",
      "Indexes start at 0, so nums[0] is the first switch, nums[1] the second, and so on. C does not check whether your index fits — going past the end reads unknown memory.",
    ],
    example: {
      code: "int nums[3] = {4, 8, 15};\nprintf(\"%d\", nums[1]);",
      output: "8",
    },
    challenge: {
      kind: "blank",
      prompt: "Which index prints 15?",
      code: "int nums[3] = {4, 8, 15};\nprintf(\"%d\", nums[___]);",
      options: ["0", "2", "1", "3"],
      answer: 1,
      explanation:
        "Counting starts at 0, so 4 is at index 0, 8 at index 1, and 15 at index 2. Index 3 is outside the array — reading it would be a bug.",
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "c-pointers",
    unit: "Memory & functions",
    title: "Follow the address",
    icon: "🧭",
    summary: "Change a value through a pointer",
    explanation: [
      "Every variable lives at a memory address. & gives you an address, and a pointer is a variable that stores one. The star in int *n means “n is a pointer to an int”.",
      "Writing *n inside the function means “the value at that address”. Because the function receives the address of x, changing *n changes x itself — no copy involved.",
    ],
    example: {
      code: "void square(int *n) {\n    *n = *n * *n;\n}",
      output: "16",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: "void square(int *n) {\n    *n = *n * *n;\n}\n\nint main(void) {\n    int x = 4;\n    square(&x);\n    printf(\"%d\", x);\n    return 0;\n}",
      options: ["4", "8", "An error", "16"],
      answer: 3,
      explanation:
        "&x passes the address of x. Inside square, *n reads that address (4) and writes the result (16) back to the same spot. main then prints the changed x, which is 16.",
    },
    xp: 40,
    minutes: 6,
  },
];
